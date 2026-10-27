import { expect, test } from "@playwright/test";

test("public page exposes the complete Chinese-first journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeVisible();
  await expect(page.getByRole("region", { name: "为不同专业渠道而备" }).getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(page.getByRole("region", { name: "统一的商业起订政策" })).toContainText("7,500");
  await expect(page.getByRole("region", { name: "从广州到摩洛哥，直接开始沟通" }).getByRole("heading", { level: 3 })).toHaveText([
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

test("language switcher defaults to Chinese and restores an English preference", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("ganlan-language"));
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeVisible();

  const language = page.getByRole("group", { name: "语言 / Language" });
  await expect(language.getByRole("button", { name: "中文" })).toHaveAttribute("aria-pressed", "true");
  await expect(language.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "false");

  await language.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "A Natural Gift from Morocco" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ganlan-language"))).toBe("en");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "A Natural Gift from Morocco" })).toBeVisible();
  await expect(language.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
});

test("language switcher remains visible and usable on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile language access applies only to the mobile project");
  await page.goto("/");

  const language = page.getByRole("group", { name: "语言 / Language" });
  await expect(language).toBeVisible();
  await language.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "A Natural Gift from Morocco" })).toBeVisible();
});

test("English selection controls navigation, sections, footer, and legal pages", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("group", { name: "语言 / Language" }).getByRole("button", { name: "English" }).click();
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();

  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("region", { name: "From olive groves to traceable lots" }).getByRole("heading", { name: "From olive groves to traceable lots" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacy Policy" })).toBeVisible();

  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByText("Information we collect", { exact: true })).toBeVisible();
});

test("static host metadata comments preserve hydration and saved language", async ({ page, context }) => {
  // Intercepted HTML loses its network address space in Chromium. Allow the
  // local dev HMR connection so this host-injection test can hydrate in dev too.
  await context.grantPermissions(["local-network-access"]);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("ganlan-language", "en"));
  await page.route("**/*", async (route) => {
    if (!route.request().isNavigationRequest()) return route.continue();
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /(<meta charset="utf-8"\s*\/?>)/i,
      "$1\n<!-- Metadata comment inserted by static host -->",
    );
    await route.fulfill({ response, body });
  });
  await page.goto("/privacy/");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/");
  await expect(page.locator("#quote button[type=submit]")).toBeEnabled();
  await expect(page.getByRole("heading", { level: 1, name: "A Natural Gift from Morocco" })).toBeVisible();
  expect(errors).toEqual([]);
});
