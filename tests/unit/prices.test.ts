import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parsePriceConfig } from "../../src/lib/prices.ts";
import { convertCny, parseExchangeRates, parseStoredExchangeRates } from "../../src/lib/exchangeRates.ts";

const validPrices = {
  "250ml": { cny: 16, usd: "2.35", eur: "2.15" },
  "500ml": { cny: 30, usd: "4.40", eur: "4.02" },
  "750ml": { cny: 43, usd: "6.30", eur: "5.77" },
  "5l": { cny: 220, usd: "32.30", eur: "29.50" },
};

const ecbResponse = [
  { date: "2026-11-03", base: "CNY", quote: "EUR", rate: 0.13407 },
  { date: "2026-11-03", base: "CNY", quote: "USD", rate: 0.14987 },
];

test("the shipped price file is valid and holds the current wholesale prices", async () => {
  const shipped = JSON.parse(await readFile(new URL("../../public/config/prices.json", import.meta.url), "utf8"));
  assert.deepEqual(parsePriceConfig(shipped), validPrices);
});

test("price file requires cny, usd and eur for every product", () => {
  assert.ok(parsePriceConfig(validPrices));
  assert.equal(parsePriceConfig({ ...validPrices, "250ml": { cny: 16, usd: "2.35" } }), null);
  assert.equal(parsePriceConfig({ ...validPrices, "250ml": { cny: 16, usd: "2.35", eur: "2.1" } }), null);
  assert.equal(parsePriceConfig({ ...validPrices, "250ml": { cny: 16, usd: "2.35", eur: 2.15 } }), null);
  assert.equal(parsePriceConfig({ ...validPrices, "250ml": { cny: 16.5, usd: "2.35", eur: "2.15" } }), null);
});

test("ECB rates are read from the Frankfurter v2 response", () => {
  assert.deepEqual(parseExchangeRates(ecbResponse), { usd: 0.14987, eur: 0.13407, date: "2026-11-03" });
});

test("incomplete or implausible rate responses are rejected", () => {
  assert.equal(parseExchangeRates([ecbResponse[0]]), null);
  assert.equal(parseExchangeRates({ rates: { USD: 0.14987 } }), null);
  assert.equal(parseExchangeRates([{ ...ecbResponse[0], rate: 7.4 }, ecbResponse[1]]), null);
  assert.equal(parseExchangeRates([{ ...ecbResponse[0], date: "yesterday" }, ecbResponse[1]]), null);
});

test("the older date is shown when the two quotes differ", () => {
  const rates = parseExchangeRates([{ ...ecbResponse[0], date: "2026-11-02" }, ecbResponse[1]]);
  assert.equal(rates?.date, "2026-11-02");
});

test("stored rates must keep the same shape", () => {
  assert.deepEqual(parseStoredExchangeRates({ usd: 0.15, eur: 0.13, date: "2026-11-03" }), { usd: 0.15, eur: 0.13, date: "2026-11-03" });
  assert.equal(parseStoredExchangeRates({ usd: 0.15, date: "2026-11-03" }), null);
  assert.equal(parseStoredExchangeRates("0.15"), null);
});

test("CNY prices convert to two-decimal USD and EUR amounts", () => {
  assert.equal(convertCny(16, 0.14987), "2.40");
  assert.equal(convertCny(220, 0.14987), "32.97");
  assert.equal(convertCny(16, 0.13407), "2.15");
  assert.equal(convertCny(220, 0.13407), "29.50");
});
