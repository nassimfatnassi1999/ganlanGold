import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { findPriceFileErrors, formatCny, parsePriceConfig } from "../../src/lib/prices.ts";
import { DEFAULT_SITE_URL, getSiteUrl } from "../../src/lib/seo/site-url.ts";
import { CACHE, headersFor, isPage } from "../../scripts/tencent/cache-rules.mjs";
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

test("the shipped price file passes the strict publishing check", async () => {
  const shipped = JSON.parse(await readFile(new URL("../../public/config/prices.json", import.meta.url), "utf8"));
  assert.deepEqual(findPriceFileErrors(shipped), []);
  assert.deepEqual(Object.keys(parsePriceConfig(shipped) ?? {}), ["250ml", "500ml", "750ml", "5l"]);
});

test("the browser reads a valid file unchanged", () => {
  assert.deepEqual(parsePriceConfig(validPrices), validPrices);
});

test("the browser reader tolerates formats written by newer or hand-edited files", () => {
  const prices = parsePriceConfig({
    updated: "2026-11-04",
    "250ml": { cny: 16, usd: 2.35, eur: "2.15", note: "promo" },
    "500ML": { cny: "30", usd: "4.4", eur: "4.02" },
    " 750 ml ": { cny: 43.5, usd: "6.30", eur: "5.77" },
    "5L": { cny: 220 },
  });
  assert.deepEqual(prices, {
    "250ml": { cny: 16, usd: "2.35", eur: "2.15" },
    "500ml": { cny: 30, usd: "4.40", eur: "4.02" },
    "750ml": { cny: 43.5, usd: "6.30", eur: "5.77" },
    "5l": { cny: 220, usd: null, eur: null },
  });
});

test("only the products with a usable CNY price are kept; a wrong amount is never guessed", () => {
  const prices = parsePriceConfig({
    ...validPrices,
    "250ml": { cny: 0, usd: "2.35", eur: "2.15" },
    "500ml": { cny: "abc", usd: "4.40", eur: "4.02" },
    "750ml": { cny: 43.555, usd: "6.30", eur: "5.77" },
  });
  assert.deepEqual(prices, { "5l": validPrices["5l"] });
  assert.deepEqual(parsePriceConfig({ ...validPrices, "250ml": { cny: 16, usd: "2,35", eur: -1 } })?.["250ml"], { cny: 16, usd: null, eur: null });
});

test("the browser reader rejects files with no usable product", () => {
  assert.equal(parsePriceConfig(null), null);
  assert.equal(parsePriceConfig([validPrices]), null);
  assert.equal(parsePriceConfig({}), null);
  assert.equal(parsePriceConfig({ "1l": { cny: 10 } }), null);
});

test("the strict publishing check lists every problem in French", () => {
  assert.deepEqual(findPriceFileErrors(validPrices), []);
  const errors = findPriceFileErrors({
    ...validPrices,
    "250ml": { cny: 16.5, usd: "2.35", eur: 2.15 },
    "500ml": { cny: 30, usd: "4.4", eur: "4.02", extra: 1 },
    promotional: { cny: 1 },
  });
  assert.equal(errors.length, 5);
  assert.ok(errors.some((error) => error.includes('"promotional"')));
  assert.ok(errors.some((error) => error.includes('"250ml".cny')));
  assert.ok(errors.some((error) => error.includes('"250ml".eur')));
  assert.ok(errors.some((error) => error.includes('"500ml".usd')));
  assert.ok(errors.some((error) => error.includes("extra")));
  assert.equal(findPriceFileErrors({ ...validPrices, "5l": undefined }).length, 1);
});

test("CNY prices are displayed without useless decimals", () => {
  assert.equal(formatCny(43), "43");
  assert.equal(formatCny(43.5), "43.50");
});

test("SEO links default to the production domain, never localhost", () => {
  assert.equal(getSiteUrl(undefined), DEFAULT_SITE_URL);
  assert.equal(getSiteUrl(""), "https://www.ganlangold.com");
  assert.equal(getSiteUrl("ftp://example.com"), DEFAULT_SITE_URL);
  assert.equal(getSiteUrl("https://ganlan.netlify.app/some/path"), "https://ganlan.netlify.app");
});

test("COS cache headers keep pages and prices fresh and hashed assets long-lived", () => {
  assert.deepEqual(headersFor("index.html"), { ContentType: "text/html; charset=utf-8", CacheControl: CACHE.page });
  assert.deepEqual(headersFor("privacy/__next._full.txt"), { ContentType: "text/plain; charset=utf-8", CacheControl: CACHE.page });
  assert.deepEqual(headersFor("config/prices.json"), { ContentType: "application/json; charset=utf-8", CacheControl: CACHE.prices });
  assert.equal(headersFor("_next/static/chunks/14r7kmwuxmx69.js").CacheControl, CACHE.immutable);
  assert.equal(headersFor("images/products/product-750ml.avif").ContentType, "image/avif");
  assert.equal(headersFor("images/products/product-750ml.avif").CacheControl, CACHE.image);
  assert.deepEqual(headersFor("media/liquid-gold.mp4"), { ContentType: "video/mp4", CacheControl: CACHE.image });
  assert.deepEqual(headersFor("media/grove-light.webm"), { ContentType: "video/webm", CacheControl: CACHE.image });
  assert.ok(isPage("index.html") && isPage("sitemap.xml") && isPage("config/prices.json"));
  assert.ok(!isPage("_next/static/chunks/a.js") && !isPage("images/qr/fouad-wechat.png"));
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
