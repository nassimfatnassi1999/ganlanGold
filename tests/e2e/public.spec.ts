import { expect, test } from "@playwright/test";

test("public page exposes the complete Chinese-first journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeVisible();
  await expect(page.getByRole("region", { name: "产品系列" }).getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(page.getByRole("region", { name: "批发订购" })).toContainText("7,500");
  await expect(page.getByRole("region", { name: "联系我们" }).getByRole("heading", { level: 3 })).toHaveText([
    "Gisèle",
    "Lassad",
    "Fouad",
  ]);
  await page.getByRole("link", { name: /申请询价/ }).first().click();
  await expect(page.locator("#quote")).toBeInViewport();
  await expect(page.locator("body")).not.toContainText("EUR");
});

test("mobile navigation reaches every section without horizontal overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation applies only to the mobile project");
  await page.goto("/");
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page.getByRole("link", { name: /联系我们/ }).click();
  await expect(page.locator("#contact")).toBeInViewport();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});
