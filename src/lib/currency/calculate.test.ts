import { describe, expect, it } from "vitest";
import { calculateIndicativeCny, calculateUsdCnyRate } from "./calculate";

describe("currency calculations", () => {
  it("derives USD/CNY by dividing EUR/CNY by EUR/USD with decimal precision", () => {
    expect(calculateUsdCnyRate({ eurCny: "7.4660", eurUsd: "1.1193" }).toFixed(8)).toBe("6.67024033");
  });

  it("rounds every fractional CNY result upward", () => {
    expect(calculateIndicativeCny("7.30", "6.72602739726")).toBe(50);
  });

  it("does not add a yuan when the result is already a whole number", () => {
    expect(calculateIndicativeCny("7.00", "7.00")).toBe(49);
  });

  it("does not mutate the USD input", () => {
    const usd = "10.10";
    calculateIndicativeCny(usd, "6.67");
    expect(usd).toBe("10.10");
  });

  it("rejects non-positive input rates and prices", () => {
    expect(() => calculateUsdCnyRate({ eurCny: "7", eurUsd: "0" })).toThrow();
    expect(() => calculateIndicativeCny("-1", "6.67")).toThrow();
  });
});
