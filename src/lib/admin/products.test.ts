import { describe, expect, it } from "vitest";
import { productUpdateSchema } from "./products";

describe("product administration contract", () => {
  const valid = {
    id: "500ml",
    usdPrice: "7.35",
    zhDescription: "经审核的中文产品说明。",
    enDescription: "Approved English product description.",
  };

  it("accepts positive USD prices with exactly two decimal places", () => {
    expect(productUpdateSchema.parse(valid).usdPrice).toBe("7.35");
  });

  it.each(["0.00", "-1.00", "7.351", "10000.00", "USD 7.30"])("rejects an unsafe price value: %s", (usdPrice) => {
    expect(productUpdateSchema.safeParse({ ...valid, usdPrice }).success).toBe(false);
  });

  it("rejects identity, capacity, and MOQ fields from ordinary content editing", () => {
    for (const unexpected of [{ capacityMl: 999 }, { id: "1l" }, { moq: 1000 }]) {
      expect(productUpdateSchema.safeParse({ ...valid, ...unexpected }).success).toBe(false);
    }
  });
});
