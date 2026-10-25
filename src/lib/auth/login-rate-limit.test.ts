import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore } from "@/lib/security/rate-limit";
import { checkLoginRateLimit } from "./login-rate-limit";

describe("login rate limiting", () => {
  it("blocks the sixth attempt in a 15-minute window", async () => {
    const store = new MemoryRateLimitStore();
    const dependencies = { store, now: new Date("2026-10-25T10:00:00Z"), secret: "login-rate-secret-long" };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await checkLoginRateLimit("network", "admin@example.test", dependencies)).allowed).toBe(true);
    }
    expect((await checkLoginRateLimit("network", "admin@example.test", dependencies)).allowed).toBe(false);
  });
});
