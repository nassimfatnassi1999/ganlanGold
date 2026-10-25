import { describe, expect, it, vi } from "vitest";
import { createHealthHandler } from "./route";

describe("health route", () => {
  it("returns a bounded successful response without implementation details", async () => {
    const response = await createHealthHandler({ checkDatabase: vi.fn().mockResolvedValue(true) })();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok", database: "reachable" });
  });

  it("returns a bounded 503 response and never leaks an underlying error", async () => {
    const response = await createHealthHandler({ checkDatabase: vi.fn().mockRejectedValue(new Error("password=secret")) })();
    expect(response.status).toBe(503);
    const text = await response.clone().text();
    expect(await response.json()).toEqual({ status: "unavailable", database: "unreachable" });
    expect(text).not.toContain("secret");
  });
});
