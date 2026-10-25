import { describe, expect, it, vi } from "vitest";
import {
  MemoryExchangeRateRepository,
  getCurrentRateState,
  refreshExchangeRate,
} from "./service";

const xml = `<?xml version="1.0"?><Envelope><Cube><Cube time="2026-10-23"><Cube currency="USD" rate="1.1193"/><Cube currency="CNY" rate="7.4660"/></Cube></Cube></Envelope>`;

describe("exchange-rate service", () => {
  it("persists a validated ECB rate with its actual Friday date on a weekend refresh", async () => {
    const repository = new MemoryExchangeRateRepository();
    const state = await refreshExchangeRate({
      repository,
      now: new Date("2026-10-25T09:00:00Z"),
      fetchXml: vi.fn().mockResolvedValue(xml),
    });
    expect(state).toMatchObject({
      status: "available",
      source: "fresh",
      referenceDate: "2026-10-23",
      eurUsd: "1.1193",
      eurCny: "7.4660",
    });
    expect(repository.attempts).toHaveLength(1);
    expect(repository.attempts[0]?.status).toBe("VALID");
  });

  it("records a failed attempt and returns the last valid stored rate", async () => {
    const repository = new MemoryExchangeRateRepository();
    await refreshExchangeRate({
      repository,
      now: new Date("2026-10-23T16:00:00Z"),
      fetchXml: vi.fn().mockResolvedValue(xml),
    });
    const state = await refreshExchangeRate({
      repository,
      now: new Date("2026-10-26T09:00:00Z"),
      fetchXml: vi.fn().mockRejectedValue(new Error("network secret detail")),
    });
    expect(state).toMatchObject({ status: "available", source: "cache", referenceDate: "2026-10-23" });
    expect(repository.attempts.at(-1)).toMatchObject({ status: "FAILED", errorCode: "fetch-failed" });
    expect(JSON.stringify(repository.attempts.at(-1))).not.toContain("secret detail");
  });

  it("reports unavailable when no valid rate has ever been stored", async () => {
    const repository = new MemoryExchangeRateRepository();
    const state = await refreshExchangeRate({
      repository,
      now: new Date("2026-10-25T09:00:00Z"),
      fetchXml: vi.fn().mockResolvedValue("<invalid/>"),
    });
    expect(state).toEqual({
      status: "unavailable",
      source: "none",
      lastAttemptAt: "2026-10-25T09:00:00.000Z",
      errorCode: "validation-failed",
    });
  });

  it("derives cached state when the latest persisted attempt failed", async () => {
    const repository = new MemoryExchangeRateRepository();
    await repository.recordValid({
      eurUsd: "1.10",
      eurCny: "7.40",
      usdCny: "6.72727273",
      referenceDate: "2026-10-23",
      attemptedAt: new Date("2026-10-23T16:00:00Z"),
    });
    await repository.recordFailure({
      errorCode: "fetch-failed",
      attemptedAt: new Date("2026-10-24T16:00:00Z"),
    });
    expect(await getCurrentRateState(repository)).toMatchObject({ status: "available", source: "cache" });
  });
});
