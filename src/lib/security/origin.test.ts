import { describe, expect, it } from "vitest";
import { RequestSecurityError, assertSameOrigin } from "./origin";

describe("assertSameOrigin", () => {
  it("accepts the configured public origin", () => {
    const request = new Request("http://app:3000/api/quotes", {
      method: "POST",
      headers: { origin: "https://ganlangold.example" },
    });
    expect(() => assertSameOrigin(request, "https://ganlangold.example")).not.toThrow();
  });

  it("accepts a reverse-proxy forwarded host and protocol", () => {
    const request = new Request("http://app:3000/api/quotes", {
      method: "POST",
      headers: {
        origin: "https://ganlangold.example",
        host: "app:3000",
        "x-forwarded-host": "ganlangold.example",
        "x-forwarded-proto": "https",
      },
    });
    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("rejects missing and cross-origin mutation origins", () => {
    const missing = new Request("https://ganlangold.example/api/quotes", { method: "POST" });
    const hostile = new Request("https://ganlangold.example/api/quotes", {
      method: "POST",
      headers: { origin: "https://hostile.example" },
    });
    expect(() => assertSameOrigin(missing, "https://ganlangold.example")).toThrow(RequestSecurityError);
    expect(() => assertSameOrigin(hostile, "https://ganlangold.example")).toThrow(RequestSecurityError);
  });
});
