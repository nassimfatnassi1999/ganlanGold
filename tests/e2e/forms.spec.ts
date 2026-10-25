import { expect, test } from "@playwright/test";

test("quote form reports validation without a network request", async ({ page }) => {
  await page.goto("/#quote");
  await page.getByRole("button", { name: "提交询价" }).click();
  await expect(page.locator("#quote").getByRole("alert")).toContainText("请检查以下内容");
});

test("visit form reports validation without promising a date", async ({ page }) => {
  await page.goto("/#visit");
  await page.getByRole("button", { name: "提交考察申请" }).click();
  await expect(page.locator("#visit").getByRole("alert")).toContainText("请检查以下内容");
  await expect(page.locator("#visit")).toContainText("提交申请并不代表日期已获确认");
});
