import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

describe("root metadata", () => {
  it("is Chinese-first with canonical and social metadata", () => {
    expect(metadata.title).toContain("摩洛哥特级初榨橄榄油");
    expect(metadata.alternates).toMatchObject({ canonical: "/", languages: { "zh-CN": "/" } });
    expect(metadata.openGraph).toMatchObject({ locale: "zh_CN", type: "website", siteName: "GANLAN GOLD" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
