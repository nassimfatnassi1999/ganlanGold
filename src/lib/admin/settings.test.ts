import { describe, expect, it } from "vitest";
import { settingUpdateSchema } from "./settings";

describe("site setting allowlist", () => {
  it("allows approved metadata and contact keys", () => {
    expect(settingUpdateSchema.safeParse({ key: "meta.description.zh-CN", value: "中文说明" }).success).toBe(true);
    expect(settingUpdateSchema.safeParse({ key: "contact.gisele.phone", value: "+86 134 2751 3756" }).success).toBe(true);
  });

  it.each(["policy.globalMoqLitres", "product.500ml.moq", "currency.usdCny.override", "contact.gisele.wechat"])(
    "rejects a policy or unapproved setting: %s",
    (key) => {
      expect(settingUpdateSchema.safeParse({ key, value: "1000" }).success).toBe(false);
    },
  );
});
