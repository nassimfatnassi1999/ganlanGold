import { describe, expect, it } from "vitest";
import zh from "./zh-CN.json";
import en from "./en.json";

describe("translation catalogs", () => {
  it("contains the required bilingual public sections", () => {
    const requiredKeys = ["nav", "hero", "products", "wholesale", "origin", "visit", "export", "contact", "quote", "footer"] as const;

    for (const key of requiredKeys) {
      expect(zh).toHaveProperty(key);
      expect(en).toHaveProperty(key);
    }
  });

  it("uses the exact required Chinese product label", () => {
    expect(zh.products.label).toBe("摩洛哥特级初榨橄榄油");
  });

  it("preserves the exact V7 MOQ copy in both languages", () => {
    expect(zh.wholesale.body).toBe(
      "最低订购量（MOQ）：7,500 升橄榄油。支持 250 毫升、500 毫升和 750 毫升混合订购。具体装柜方案以最终确认为准。",
    );
    expect(en.wholesale.body).toBe(
      "Minimum order quantity (MOQ): 7,500 litres of olive oil per order. Mixed 250 ml, 500 ml and 750 ml bottle sizes available. Loading plan subject to confirmation.",
    );
  });

  it("includes bilingual non-binding confirmations", () => {
    expect(zh.quote.success).toContain("询价编号");
    expect(en.quote.success).toContain("request reference");
    expect(zh.visit.success).toContain("尚未确认");
    expect(en.visit.success.toLowerCase()).toContain("no visit date is confirmed");
  });
});
