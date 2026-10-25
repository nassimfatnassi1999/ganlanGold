import { describe, expect, it, vi } from "vitest";
import { createCronHandler } from "./route";

describe("exchange-rate cron route", () => {
  it("rejects a missing or incorrect bearer secret", async () => {
    const refresh = vi.fn();
    const handler = createCronHandler({ refresh, secret: "cron-secret-long-enough" });
    const response = await handler(new Request("https://example.test/api/cron/exchange-rates"));
    expect(response.status).toBe(401);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("runs a refresh for the exact protected bearer secret", async () => {
    const refresh = vi.fn().mockResolvedValue({
      status: "available",
      source: "fresh",
      referenceDate: "2026-10-23",
      usdCny: "6.67024033",
      eurUsd: "1.1193",
      eurCny: "7.4660",
      lastAttemptAt: "2026-10-25T09:00:00.000Z",
    });
    const handler = createCronHandler({ refresh, secret: "cron-secret-long-enough" });
    const response = await handler(
      new Request("https://example.test/api/cron/exchange-rates", {
        headers: { authorization: "Bearer cron-secret-long-enough" },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "available", referenceDate: "2026-10-23" });
    expect(refresh).toHaveBeenCalledOnce();
  });
});
