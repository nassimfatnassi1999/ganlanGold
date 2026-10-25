import { describe, expect, it, vi } from "vitest";
import { createQuotePostHandler } from "./route";

const validBody = {
  company: "Atlas Import",
  country: "China",
  contactPerson: "Li Wei",
  email: "buyer@example.cn",
  wechat: "",
  destinationPort: "Nansha",
  products: [{ productId: "250ml", quantity: 30000 }],
  message: "",
  consent: true,
  website: "",
};

function request(body: unknown, origin = "https://ganlangold.example") {
  return new Request("https://ganlangold.example/api/quotes", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("quote route", () => {
  it("rejects hostile origins before invoking the service", async () => {
    const submit = vi.fn();
    const handler = createQuotePostHandler({
      submit,
      rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 1, retryAfterSeconds: 1 }),
      publicUrl: "https://ganlangold.example",
    });
    const response = await handler(request(validBody, "https://hostile.example"));
    expect(response.status).toBe(403);
    expect(submit).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads before parsing them", async () => {
    const submit = vi.fn();
    const handler = createQuotePostHandler({
      submit,
      rateLimit: vi.fn(),
      publicUrl: "https://ganlangold.example",
      maxBytes: 64,
    });
    const response = await handler(request(validBody));
    expect(response.status).toBe(413);
    expect(submit).not.toHaveBeenCalled();
  });

  it("returns a retry window when the caller is rate limited", async () => {
    const submit = vi.fn();
    const handler = createQuotePostHandler({
      submit,
      rateLimit: vi.fn().mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 42 }),
      publicUrl: "https://ganlangold.example",
    });
    const response = await handler(request(validBody));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("42");
    expect(submit).not.toHaveBeenCalled();
  });

  it("returns the persisted request contract", async () => {
    const submit = vi.fn().mockResolvedValue({ requestId: "GGQ-1", duplicate: false, notification: "not-configured" });
    const handler = createQuotePostHandler({
      submit,
      rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 2, retryAfterSeconds: 60 }),
      publicUrl: "https://ganlangold.example",
    });
    const response = await handler(request(validBody));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ requestId: "GGQ-1", duplicate: false, notification: "not-configured" });
  });
});
