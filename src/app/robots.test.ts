import { describe, expect, it, vi } from "vitest";

describe("robots metadata", () => {
  it("allows the public site while excluding private and machine endpoints", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ganlan.example");
    vi.resetModules();
    const { default: robots } = await import("./robots");
    const result = robots();
    expect(result.rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }]);
    expect(result.sitemap).toBe("https://ganlan.example/sitemap.xml");
    vi.unstubAllEnvs();
  });
});
