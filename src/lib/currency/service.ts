import type { PrismaClient } from "@prisma/client";
import { calculateUsdCnyRate } from "./calculate";
import { EcbRateError, parseEcbDailyXml } from "./ecb";

export const ECB_DAILY_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

type ValidAttempt = Readonly<{
  status: "VALID";
  eurUsd: string;
  eurCny: string;
  usdCny: string;
  referenceDate: string;
  attemptedAt: Date;
}>;

type FailedAttempt = Readonly<{
  status: "FAILED";
  errorCode: "fetch-failed" | "validation-failed";
  attemptedAt: Date;
}>;

type Attempt = ValidAttempt | FailedAttempt;

export interface ExchangeRateRepository {
  recordValid(attempt: Omit<ValidAttempt, "status">): Promise<void>;
  recordFailure(attempt: Omit<FailedAttempt, "status">): Promise<void>;
  latestValid(): Promise<ValidAttempt | null>;
  latestAttempt(): Promise<Attempt | null>;
}

export class MemoryExchangeRateRepository implements ExchangeRateRepository {
  readonly attempts: Attempt[] = [];

  async recordValid(attempt: Omit<ValidAttempt, "status">): Promise<void> {
    this.attempts.push({ ...attempt, status: "VALID" });
  }

  async recordFailure(attempt: Omit<FailedAttempt, "status">): Promise<void> {
    this.attempts.push({ ...attempt, status: "FAILED" });
  }

  async latestValid(): Promise<ValidAttempt | null> {
    return [...this.attempts].reverse().find((attempt): attempt is ValidAttempt => attempt.status === "VALID") ?? null;
  }

  async latestAttempt(): Promise<Attempt | null> {
    return this.attempts.at(-1) ?? null;
  }
}

export class PrismaExchangeRateRepository implements ExchangeRateRepository {
  constructor(private readonly client: PrismaClient) {}

  async recordValid(attempt: Omit<ValidAttempt, "status">): Promise<void> {
    await this.client.exchangeRate.create({
      data: {
        status: "VALID",
        eurUsd: attempt.eurUsd,
        eurCny: attempt.eurCny,
        usdCny: attempt.usdCny,
        referenceDate: new Date(`${attempt.referenceDate}T00:00:00.000Z`),
        attemptedAt: attempt.attemptedAt,
      },
    });
  }

  async recordFailure(attempt: Omit<FailedAttempt, "status">): Promise<void> {
    await this.client.exchangeRate.create({
      data: {
        status: "FAILED",
        errorCode: attempt.errorCode,
        errorMessage: attempt.errorCode === "fetch-failed" ? "ECB retrieval failed" : "ECB response validation failed",
        attemptedAt: attempt.attemptedAt,
      },
    });
  }

  async latestValid(): Promise<ValidAttempt | null> {
    const row = await this.client.exchangeRate.findFirst({ where: { status: "VALID" }, orderBy: { attemptedAt: "desc" } });
    if (!row || !row.eurUsd || !row.eurCny || !row.usdCny || !row.referenceDate) return null;
    return {
      status: "VALID",
      eurUsd: row.eurUsd.toFixed(4),
      eurCny: row.eurCny.toFixed(4),
      usdCny: row.usdCny.toFixed(8),
      referenceDate: row.referenceDate.toISOString().slice(0, 10),
      attemptedAt: row.attemptedAt,
    };
  }

  async latestAttempt(): Promise<Attempt | null> {
    const row = await this.client.exchangeRate.findFirst({ orderBy: { attemptedAt: "desc" } });
    if (!row) return null;
    if (row.status === "FAILED") {
      return {
        status: "FAILED",
        errorCode: row.errorCode === "validation-failed" ? "validation-failed" : "fetch-failed",
        attemptedAt: row.attemptedAt,
      };
    }
    if (!row.eurUsd || !row.eurCny || !row.usdCny || !row.referenceDate) return null;
    return {
      status: "VALID",
      eurUsd: row.eurUsd.toFixed(4),
      eurCny: row.eurCny.toFixed(4),
      usdCny: row.usdCny.toFixed(8),
      referenceDate: row.referenceDate.toISOString().slice(0, 10),
      attemptedAt: row.attemptedAt,
    };
  }
}

export type RateState =
  | Readonly<{
      status: "available";
      source: "fresh" | "cache";
      eurUsd: string;
      eurCny: string;
      usdCny: string;
      referenceDate: string;
      lastAttemptAt: string;
      errorCode?: "fetch-failed" | "validation-failed";
    }>
  | Readonly<{
      status: "unavailable";
      source: "none";
      lastAttemptAt?: string;
      errorCode?: "fetch-failed" | "validation-failed";
    }>;

async function defaultRepository(): Promise<ExchangeRateRepository> {
  const { prisma } = await import("@/lib/db/client");
  return new PrismaExchangeRateRepository(prisma);
}

async function defaultFetchXml(): Promise<string> {
  const response = await fetch(ECB_DAILY_URL, {
    headers: { accept: "application/xml", "user-agent": "GANLAN-GOLD/1.0 exchange-rate-service" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`ECB returned ${response.status}`);
  return response.text();
}

export async function getCurrentRateState(
  repository?: ExchangeRateRepository,
  preferredSource?: "fresh" | "cache",
): Promise<RateState> {
  const store = repository ?? (await defaultRepository());
  const [valid, latest] = await Promise.all([store.latestValid(), store.latestAttempt()]);
  if (!valid) {
    return {
      status: "unavailable",
      source: "none",
      ...(latest ? { lastAttemptAt: latest.attemptedAt.toISOString() } : {}),
      ...(latest?.status === "FAILED" ? { errorCode: latest.errorCode } : {}),
    };
  }

  const source = preferredSource ?? (latest?.status === "FAILED" ? "cache" : "fresh");
  return {
    status: "available",
    source,
    eurUsd: valid.eurUsd,
    eurCny: valid.eurCny,
    usdCny: valid.usdCny,
    referenceDate: valid.referenceDate,
    lastAttemptAt: (latest ?? valid).attemptedAt.toISOString(),
    ...(latest?.status === "FAILED" ? { errorCode: latest.errorCode } : {}),
  };
}

type RefreshDependencies = Readonly<{
  repository?: ExchangeRateRepository;
  fetchXml?: () => Promise<string>;
  now?: Date;
}>;

export async function refreshExchangeRate(dependencies: RefreshDependencies = {}): Promise<RateState> {
  const repository = dependencies.repository ?? (await defaultRepository());
  const attemptedAt = dependencies.now ?? new Date();
  try {
    const xml = await (dependencies.fetchXml ?? defaultFetchXml)();
    const rates = parseEcbDailyXml(xml);
    const usdCny = calculateUsdCnyRate(rates).toFixed(8);
    await repository.recordValid({ ...rates, usdCny, attemptedAt });
    return getCurrentRateState(repository, "fresh");
  } catch (error) {
    const errorCode = error instanceof EcbRateError ? "validation-failed" : "fetch-failed";
    await repository.recordFailure({ errorCode, attemptedAt });
    return getCurrentRateState(repository, "cache");
  }
}
