import Decimal from "decimal.js";
import { XMLParser } from "fast-xml-parser";

export class EcbRateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EcbRateError";
  }
}

export type EcbDailyRates = Readonly<{
  referenceDate: string;
  eurUsd: string;
  eurCny: string;
}>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseAttributeValue: false,
  trimValues: true,
});

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function positiveDecimal(value: unknown, currency: string): string {
  if (typeof value !== "string") throw new EcbRateError(`Missing ${currency} rate`);
  try {
    const decimal = new Decimal(value);
    if (!decimal.isFinite() || decimal.lte(0)) throw new Error("non-positive");
    return value;
  } catch {
    throw new EcbRateError(`Invalid ${currency} rate`);
  }
}

export function parseEcbDailyXml(xml: string): EcbDailyRates {
  try {
    const parsed = parser.parse(xml) as {
      Envelope?: { Cube?: { Cube?: { time?: unknown; Cube?: unknown } } };
    };
    const day = parsed.Envelope?.Cube?.Cube;
    if (!day || !validIsoDate(day.time)) throw new EcbRateError("Invalid ECB reference date");

    const cubes = (Array.isArray(day.Cube) ? day.Cube : [day.Cube]).filter(
      (cube): cube is { currency?: unknown; rate?: unknown } => Boolean(cube && typeof cube === "object"),
    );
    const byCurrency = new Map(cubes.map((cube) => [cube.currency, cube.rate]));

    return {
      referenceDate: day.time,
      eurUsd: positiveDecimal(byCurrency.get("USD"), "USD"),
      eurCny: positiveDecimal(byCurrency.get("CNY"), "CNY"),
    };
  } catch (error) {
    if (error instanceof EcbRateError) throw error;
    throw new EcbRateError("Malformed ECB XML response");
  }
}
