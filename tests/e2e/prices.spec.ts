import { expect, test, type Page } from "@playwright/test";

const alternatePrices = {
  "250ml": { cny: 31, usd: "4.20", eur: "3.90" },
  "500ml": { cny: 52, usd: "7.60", eur: "7.10" },
  "750ml": { cny: 73, usd: "10.80", eur: "9.95" },
  "5l": { cny: 271, usd: "40.25", eur: "37.40" },
};

const ecbRates = [
  { date: "2026-11-03", base: "CNY", quote: "EUR", rate: 0.13407 },
  { date: "2026-11-03", base: "CNY", quote: "USD", rate: 0.14987 },
];

const RATES_URL = "https://api.frankfurter.dev/**";

/** Every test controls the exchange-rate feed so results never depend on the real network. */
test.beforeEach(async ({ page }) => {
  await page.route(RATES_URL, (route) => route.fulfill({ json: ecbRates }));
});

async function expectPricesUnavailable(page: Page) {
  const messages = page.locator(".price-unavailable");
  // The loader retries twice before giving up.
  await expect(messages).toHaveCount(4, { timeout: 15_000 });
  await expect(messages).toContainText([
    "价格暂不可用",
    "价格暂不可用",
    "价格暂不可用",
    "价格暂不可用",
  ]);
  await expect(page.locator(".price-cny")).toHaveCount(0);
  await expect(page.locator(".price-usd")).toHaveCount(0);
  await expect(page.locator(".price-eur")).toHaveCount(0);
}

test("replaces every displayed price from the runtime JSON without rebuilding", async ({ page }) => {
  let requestedUrl = "";
  await page.route("**/config/prices.json*", async (route) => {
    requestedUrl = route.request().url();
    await route.fulfill({ json: alternatePrices });
  });

  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
  // USD and EUR are converted from CNY with the (mocked) ECB rates, not read from the file.
  await expect(page.locator(".price-usd")).toHaveText(["≈ USD $4.65", "≈ USD $7.79", "≈ USD $10.94", "≈ USD $40.61"]);
  await expect(page.locator(".price-eur")).toHaveText(["≈ EUR €4.16", "≈ EUR €6.97", "≈ EUR €9.79", "≈ EUR €36.33"]);
  expect(new URL(requestedUrl).searchParams.get("v")).toMatch(/^\d+$/);
});

test("shows the shipped wholesale prices with live USD and EUR equivalents", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥16", "¥30", "¥43", "¥220"]);
  await expect(page.locator(".price-usd")).toHaveText(["≈ USD $2.40", "≈ USD $4.50", "≈ USD $6.44", "≈ USD $32.97"]);
  await expect(page.locator(".price-eur")).toHaveText(["≈ EUR €2.15", "≈ EUR €4.02", "≈ EUR €5.77", "≈ EUR €29.50"]);
});

test("falls back to the manual USD and EUR values when the rate feed is unreachable", async ({ page }) => {
  await page.unroute(RATES_URL);
  await page.route(RATES_URL, (route) => route.abort());
  await page.route("**/config/prices.json*", (route) => route.fulfill({ json: alternatePrices }));

  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
  await expect(page.locator(".price-usd")).toHaveText(["≈ USD $4.20", "≈ USD $7.60", "≈ USD $10.80", "≈ USD $40.25"]);
  await expect(page.locator(".price-eur")).toHaveText(["≈ EUR €3.90", "≈ EUR €7.10", "≈ EUR €9.95", "≈ EUR €37.40"]);
});

test("keeps the last valid rate when the feed later fails", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".price-usd").first()).toHaveText("≈ USD $2.40");

  await page.unroute(RATES_URL);
  await page.route(RATES_URL, (route) => route.fulfill({ status: 503, body: "" }));
  await page.reload();

  // Still converted with the stored ECB rate (2.40), not the manual value (2.35).
  await expect(page.locator(".price-usd").first()).toHaveText("≈ USD $2.40");
});

test("ignores an invalid rate response and never shows a wrong conversion", async ({ page }) => {
  await page.unroute(RATES_URL);
  await page.route(RATES_URL, (route) => route.fulfill({ json: [{ date: "2026-11-03", base: "CNY", quote: "USD", rate: 7.2 }] }));

  await page.goto("/");

  await expect(page.locator(".price-usd").first()).toHaveText("≈ USD $2.35");
});

test("shows the wholesale terms in Chinese with English underneath, and English only in EN mode", async ({ page }) => {
  await page.goto("/");
  const terms = page.locator(".pricing-terms");

  await expect(terms.locator(".pricing-terms__zh")).toBeVisible();
  await expect(terms.locator(".pricing-terms__zh")).toContainText("最低订购量：7,500升，可混合不同瓶装规格。");
  await expect(terms.locator(".pricing-terms__en")).toBeVisible();
  await expect(terms.locator(".pricing-terms__en")).toContainText("Minimum order: 7,500 litres.");

  await page.locator("html").evaluate((html) => { html.dataset.language = "en"; });
  await expect(terms.locator(".pricing-terms__zh")).toBeHidden();
  await expect(terms.locator(".pricing-terms__en")).toBeVisible();
});

test("shows the products that are present when the price file is incomplete", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { "250ml": { cny: 31, usd: "4.20", eur: "3.90" } } });
  });

  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥31"]);
  await expect(page.locator(".price-unavailable")).toHaveCount(3, { timeout: 15_000 });
  await expect(page.locator(".price-unavailable").first()).toContainText("价格暂不可用");
});

test("ignores unknown keys so a newer price file never breaks an older cached page", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { updated: "2026-11-04", ...alternatePrices, promotional: { cny: 1, usd: "1.00", eur: "0.90" } } });
  });

  await page.goto("/");
  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
});

test("accepts hand-written variants: numbers as text, upper-case keys, missing EUR", async ({ page }) => {
  await page.unroute(RATES_URL);
  await page.route(RATES_URL, (route) => route.abort());
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({
      json: { ...alternatePrices, "250ML": { cny: "31", usd: 4.2 }, "250ml": undefined },
    });
  });

  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
  // Manual fallback: the 250 ml card shows USD only, since its EUR value is missing.
  await expect(page.locator(".product-row").first().locator(".price-usd")).toHaveText("≈ USD $4.20");
  await expect(page.locator(".product-row").first().locator(".price-eur")).toHaveCount(0);
  await expect(page.locator(".price-eur")).toHaveCount(3);
});

test("hides only the product whose CNY price is unusable", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { ...alternatePrices, "250ml": { cny: "abc", usd: "4.20", eur: "3.90" } } });
  });

  await page.goto("/");
  await expect(page.locator(".price-cny")).toHaveText(["¥52", "¥73", "¥271"]);
  await expect(page.locator(".product-row").first().locator(".price-unavailable")).toContainText("价格暂不可用");
});

test("fails closed when the runtime price JSON is malformed", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{" });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
});

test("fails closed when the runtime price request keeps failing", async ({ page }) => {
  let requests = 0;
  await page.route("**/config/prices.json*", async (route) => {
    requests += 1;
    await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
  expect(requests).toBe(3);
});

test("retries a failed price request and then shows the prices", async ({ page }) => {
  let requests = 0;
  await page.route("**/config/prices.json*", async (route) => {
    requests += 1;
    if (requests === 1) await route.fulfill({ status: 502, body: "Bad Gateway" });
    else await route.fulfill({ json: alternatePrices });
  });

  await page.goto("/");
  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
  expect(requests).toBe(2);
});
