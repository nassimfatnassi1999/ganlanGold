import { expect, test } from "@playwright/test";

test("all protected administrator pages redirect anonymous visitors to login", async ({ page }) => {
  for (const route of ["/admin", "/admin/products", "/admin/quotes", "/admin/visits", "/admin/rates", "/admin/settings"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "管理员登录" })).toBeVisible();
  }
});

test("anonymous CSV export is rejected", async ({ request }) => {
  const response = await request.get("/admin/quotes/export");
  expect(response.status()).toBe(401);
});

test("an administrator can sign in and reach every management area", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One authenticated desktop journey covers the shared responsive application.");
  test.skip(!process.env.ADMIN_E2E_EMAIL || !process.env.ADMIN_E2E_PASSWORD, "Provide isolated test-admin credentials to run this flow.");

  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(process.env.ADMIN_E2E_EMAIL!);
  await page.getByLabel(/密码/).fill(process.env.ADMIN_E2E_PASSWORD!);
  await page.getByRole("button", { name: "登录 / Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "管理概览" })).toBeVisible();

  const destinations = [
    ["产品", "产品与美元价格"],
    ["询价", "商业询价"],
    ["考察", "考察申请"],
    ["汇率", "参考汇率"],
    ["设置", "网站设置"],
  ] as const;

  for (const [linkName, heading] of destinations) {
    await page.getByRole("link", { name: new RegExp(`^${linkName}`) }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
