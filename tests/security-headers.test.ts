import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("application security headers", () => {
  it("applies a restrictive browser policy to every route", async () => {
    const entries = await nextConfig.headers!();
    const global = entries.find((entry) => entry.source === "/(.*)");
    const headers = Object.fromEntries(global!.headers.map(({ key, value }) => [key.toLowerCase(), value]));

    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});
