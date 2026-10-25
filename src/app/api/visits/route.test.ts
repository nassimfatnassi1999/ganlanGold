import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createVisitPostHandler } from "./route";

describe("visit route", () => {
  it("returns bounded validation errors without echoing the payload", async () => {
    const submit = vi.fn().mockRejectedValue(
      new ZodError([{ code: "custom", path: ["company"], message: "Required" }]),
    );
    const handler = createVisitPostHandler({
      submit,
      rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 2, retryAfterSeconds: 60 }),
      publicUrl: "https://ganlangold.example",
    });
    const response = await handler(
      new Request("https://ganlangold.example/api/visits", {
        method: "POST",
        headers: { origin: "https://ganlangold.example", "content-type": "application/json" },
        body: JSON.stringify({ private: "do-not-echo" }),
      }),
    );
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("请检查");
    expect(text).not.toContain("do-not-echo");
  });
});
