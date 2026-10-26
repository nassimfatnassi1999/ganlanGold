import { expect, test } from "@playwright/test";

test("quote form reports validation without a network request", async ({ page }) => {
  await page.goto("/#quote");
  await page.getByRole("button", { name: "准备询价信息" }).click();
  await expect(page.locator("#quote").getByRole("alert")).toContainText("请检查以下内容");
});

test("visit form reports validation without promising a date", async ({ page }) => {
  await page.goto("/#visit");
  await page.getByRole("button", { name: "准备考察申请" }).click();
  await expect(page.locator("#visit").getByRole("alert")).toContainText("请检查以下内容");
  await expect(page.locator("#visit")).toContainText("提交申请并不代表日期已获确认");
});

test("English form labels and validation do not duplicate Chinese", async ({ page }) => {
  await page.goto("/#quote");
  await page.getByRole("group", { name: "语言 / Language" }).getByRole("button", { name: "English" }).click();

  await expect(page.getByLabel("Company name")).toBeVisible();
  await page.getByRole("button", { name: "Prepare inquiry" }).click();
  const alert = page.locator("#quote").getByRole("alert");
  await expect(alert).toContainText("Please check the following");
  await expect(alert).toContainText("Complete all required fields.");
  await expect(alert).not.toContainText("请填写所有必填信息");
});
