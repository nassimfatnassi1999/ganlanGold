import { createHmac } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

export type RateLimitPolicy = Readonly<{ limit: number; windowMs: number }>;
export type RateLimitDecision = Readonly<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>;
type IncrementInput = Readonly<{ scope: string; keyHash: string; windowStart: Date }>;

export interface RateLimitStore {
  increment(input: IncrementInput): Promise<number>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, number>();

  async increment(input: IncrementInput): Promise<number> {
    const key = `${input.scope}:${input.keyHash}:${input.windowStart.toISOString()}`;
    const next = (this.buckets.get(key) ?? 0) + 1;
    this.buckets.set(key, next);
    return next;
  }

  keys(): string[] {
    return [...this.buckets.keys()];
  }
}

export class PrismaRateLimitStore implements RateLimitStore {
  constructor(private readonly client: PrismaClient) {}

  async increment(input: IncrementInput): Promise<number> {
    const bucket = await this.client.rateLimitBucket.upsert({
      where: {
        scope_keyHash_windowStart: {
          scope: input.scope,
          keyHash: input.keyHash,
          windowStart: input.windowStart,
        },
      },
      create: { ...input, count: 1 },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    return bucket.count;
  }
}

type RateLimitDependencies = Readonly<{
  store?: RateLimitStore;
  now?: Date;
  secret?: string;
}>;

async function defaultStore(): Promise<RateLimitStore> {
  const { prisma } = await import("@/lib/db/client");
  return new PrismaRateLimitStore(prisma);
}

export async function consumeRateLimit(
  scope: string,
  key: string,
  policy: RateLimitPolicy,
  dependencies: RateLimitDependencies = {},
): Promise<RateLimitDecision> {
  if (!Number.isInteger(policy.limit) || policy.limit < 1 || !Number.isInteger(policy.windowMs) || policy.windowMs < 1) {
    throw new Error("Rate-limit policy values must be positive integers");
  }

  const secret = dependencies.secret ?? process.env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 16) throw new Error("RATE_LIMIT_SECRET must contain at least 16 characters");

  const now = dependencies.now ?? new Date();
  const startMs = Math.floor(now.getTime() / policy.windowMs) * policy.windowMs;
  const windowStart = new Date(startMs);
  const keyHash = createHmac("sha256", secret).update(key).digest("hex");
  const store = dependencies.store ?? (await defaultStore());
  const count = await store.increment({ scope, keyHash, windowStart });
  const retryAfterSeconds = Math.max(1, Math.ceil((startMs + policy.windowMs - now.getTime()) / 1000));

  return {
    allowed: count <= policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfterSeconds,
  };
}
