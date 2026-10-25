import { describe, expect, it } from "vitest";
import { PRODUCT_SPECS } from "./catalog";

describe("PRODUCT_SPECS", () => {
  it("defines exactly the four V7 formats in display order", () => {
    expect(PRODUCT_SPECS.map(({ id, capacityMl, displayOrder }) => ({ id, capacityMl, displayOrder }))).toEqual([
      { id: "250ml", capacityMl: 250, displayOrder: 1 },
      { id: "500ml", capacityMl: 500, displayOrder: 2 },
      { id: "750ml", capacityMl: 750, displayOrder: 3 },
      { id: "5l", capacityMl: 5000, displayOrder: 4 },
    ]);
  });

  it("preserves V7 capacities and USD price precision as decimal strings", () => {
    expect(PRODUCT_SPECS.map(({ capacityLitres, referenceUsd }) => ({ capacityLitres, referenceUsd }))).toEqual([
      { capacityLitres: "0.250", referenceUsd: "4.00" },
      { capacityLitres: "0.500", referenceUsd: "7.30" },
      { capacityLitres: "0.750", referenceUsd: "10.10" },
      { capacityLitres: "5.000", referenceUsd: "38.50" },
    ]);
  });

  it("marks only the 5 L tin as a professional format", () => {
    expect(PRODUCT_SPECS.filter((product) => product.professional).map((product) => product.id)).toEqual(["5l"]);
    expect(PRODUCT_SPECS.find((product) => product.id === "5l")?.packageType).toBe("tin");
  });

  it("does not provide any product-level MOQ field", () => {
    for (const product of PRODUCT_SPECS) {
      expect(Object.keys(product).some((key) => key.toLowerCase().includes("moq"))).toBe(false);
    }
  });
});
