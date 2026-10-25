import { describe, expect, it, vi } from "vitest";

describe("sitemap", () => {
  it("contains every crawlable route and no administration or API route", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ganlan.example");
    vi.resetModules();
    const { default: sitemap } = await import("./sitemap");
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      "https://ganlan.example/",
      "https://ganlan.example/privacy",
      "https://ganlan.example/legal",
      "https://ganlan.example/terms",
    ]);
    expect(urls.join(" ")).not.toMatch(/admin|api/);
    vi.unstubAllEnvs();
  });
});
