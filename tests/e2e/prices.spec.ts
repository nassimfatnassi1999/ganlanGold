import { expect, test, type Page } from "@playwright/test";

const alternatePrices = {
  "250ml": { cny: 31, usd: "4.20" },
  "500ml": { cny: 52, usd: "7.60" },
  "750ml": { cny: 73, usd: "10.80" },
  "5l": { cny: 271, usd: "40.25" },
};

async function expectPricesUnavailable(page: Page) {
  const messages = page.locator(".price-unavailable");
  await expect(messages).toHaveCount(4);
  await expect(messages).toContainText([
    "价格暂不可用",
    "价格暂不可用",
    "价格暂不可用",
    "价格暂不可用",
  ]);
  await expect(page.locator(".price-cny")).toHaveCount(0);
  await expect(page.locator(".price-usd")).toHaveCount(0);
}

test("replaces every displayed price from the runtime JSON without rebuilding", async ({ page }) => {
  let requestedUrl = "";
  await page.route("**/config/prices.json*", async (route) => {
    requestedUrl = route.request().url();
    await route.fulfill({ json: alternatePrices });
  });

  await page.goto("/");

  await expect(page.locator(".price-cny")).toHaveText(["¥31", "¥52", "¥73", "¥271"]);
  await expect(page.locator(".price-usd")).toContainText(["$4.20", "$7.60", "$10.80", "$40.25"]);
  expect(new URL(requestedUrl).searchParams.get("v")).toMatch(/^\d+$/);
});

test("fails closed when the runtime price file is incomplete", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { "250ml": { cny: 1, usd: "1.00" } } });
  });

  await page.goto("/");

  await expectPricesUnavailable(page);
});

test("fails closed when the runtime price file has extra keys", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { ...alternatePrices, promotional: { cny: 1, usd: "1.00" } } });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
});

test("fails closed when a runtime price has the wrong type", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ json: { ...alternatePrices, "250ml": { cny: "31", usd: "4.20" } } });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
});

test("fails closed when the runtime price JSON is malformed", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{" });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
});

test("fails closed when the runtime price request fails", async ({ page }) => {
  await page.route("**/config/prices.json*", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
  });

  await page.goto("/");
  await expectPricesUnavailable(page);
});

