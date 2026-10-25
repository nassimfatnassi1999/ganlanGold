import { describe, expect, it } from "vitest";
import { calculateRequestedLitres } from "./volume";

describe("calculateRequestedLitres", () => {
  it("converts package counts to litres across multiple formats", () => {
    const total = calculateRequestedLitres([
      { productId: "250ml", quantity: 5200 },
      { productId: "500ml", quantity: 7500 },
      { productId: "750ml", quantity: 3600 },
    ]);
    expect(total.toFixed(3)).toBe("7750.000");
  });

  it("keeps the 5 L tin capacity distinct from package count", () => {
    expect(calculateRequestedLitres([{ productId: "5l", quantity: 3 }]).toFixed(3)).toBe("15.000");
  });

  it("returns zero for no selected products", () => {
    expect(calculateRequestedLitres([]).toFixed(3)).toBe("0.000");
  });
});
