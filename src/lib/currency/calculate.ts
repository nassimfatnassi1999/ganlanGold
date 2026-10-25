import Decimal from "decimal.js";

function positiveDecimal(value: Decimal.Value, name: string): Decimal {
  const decimal = new Decimal(value);
  if (!decimal.isFinite() || decimal.lte(0)) throw new Error(`${name} must be positive`);
  return decimal;
}

export function calculateUsdCnyRate(rates: { eurCny: Decimal.Value; eurUsd: Decimal.Value }): Decimal {
  return positiveDecimal(rates.eurCny, "EUR/CNY").dividedBy(positiveDecimal(rates.eurUsd, "EUR/USD"));
}

export function calculateIndicativeCny(usdPrice: Decimal.Value, usdCnyRate: Decimal.Value): number {
  const calculated = positiveDecimal(usdPrice, "USD price").times(positiveDecimal(usdCnyRate, "USD/CNY"));
  return calculated.ceil().toNumber();
}
