import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore, consumeRateLimit } from "./rate-limit";

describe("consumeRateLimit", () => {
  it("allows calls until the fixed-window limit is exhausted", async () => {
    const store = new MemoryRateLimitStore();
    const now = new Date("2026-10-25T10:00:20Z");
    const dependencies = { store, now, secret: "rate-limit-test-secret" };
    const policy = { limit: 2, windowMs: 60_000 };

    expect(await consumeRateLimit("quote", "203.0.113.4", policy, dependencies)).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    expect(await consumeRateLimit("quote", "203.0.113.4", policy, dependencies)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(await consumeRateLimit("quote", "203.0.113.4", policy, dependencies)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 40,
    });
  });

  it("isolates scopes and begins a new bucket in the next window", async () => {
    const store = new MemoryRateLimitStore();
    const policy = { limit: 1, windowMs: 60_000 };
    const base = { store, secret: "rate-limit-test-secret" };

    expect(
      (await consumeRateLimit("quote", "same-key", policy, { ...base, now: new Date("2026-10-25T10:00:59Z") })).allowed,
    ).toBe(true);
    expect(
      (await consumeRateLimit("visit", "same-key", policy, { ...base, now: new Date("2026-10-25T10:00:59Z") })).allowed,
    ).toBe(true);
    expect(
      (await consumeRateLimit("quote", "same-key", policy, { ...base, now: new Date("2026-10-25T10:01:00Z") })).allowed,
    ).toBe(true);
  });

  it("stores only a hash of the caller key", async () => {
    const store = new MemoryRateLimitStore();
    await consumeRateLimit("quote", "personal-network-address", { limit: 2, windowMs: 60_000 }, {
      store,
      now: new Date("2026-10-25T10:00:00Z"),
      secret: "rate-limit-test-secret",
    });
    expect(store.keys().join(" ")).not.toContain("personal-network-address");
  });
});
