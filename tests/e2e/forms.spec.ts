import { expect, test, type Page } from "@playwright/test";
const config = {
  publicKey: "browser-fixture-public",
  serviceId: "browser-fixture-service",
  quoteTemplateId: "browser-fixture-quote",
  visitTemplateId: "browser-fixture-visit",
};
const endpoint = "https://api.emailjs.com/api/v1.0/email/send";
test.beforeEach(async ({ page }) => {
  // Every provider call is intercepted, even if a future test forgets to set a response.
  await page.route("https://api.emailjs.com/**", (route) => route.abort());
  await page.route("**/config/emailjs.json", (route) =>
    route.fulfill({ json: config }),
  );
});
async function fill(page: Page, kind: "quote" | "visit", email = true) {
  const form = page.locator(`#${kind} form`);
  await form.locator("[name=company]").fill("中国采购商 Buyer");
  await form.locator("[name=country]").fill("China");
  await form.locator("[name=contactPerson]").fill("Lin");
  await form
    .locator(email ? "[name=email]" : "[name=wechat]")
    .fill(email ? "buyer@example.com" : "buyer-wechat");
  if (kind === "quote") {
    await form.locator("[name=destinationPort]").fill("Shanghai");
    await form.locator("[name=select-250ml]").check();
    await form.locator("[name=quantity-250ml]").fill("30000");
  } else {
    await form.locator("[name=preferredPeriod]").fill("November 2026");
  }
  await form.locator("[name=consent]").check();
  return form;
}
test("quote and visit forms show localized inline validation without provider calls", async ({
  page,
}) => {
  let calls = 0;
  page.on("request", (request) => {
    if (request.url() === endpoint) calls++;
  });
  await page.goto("/#quote");
  await page.locator("#quote button[type=submit]").click();
  await expect(page.locator("#quote [role=alert]")).toContainText(
    "请检查以下内容",
  );
  await expect(page.locator("#quote-company")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#quote-company-error")).toContainText(
    "请填写所有必填信息",
  );
  await page.locator("#visit button[type=submit]").click();
  await expect(page.locator("#visit [role=alert]")).toContainText(
    "请检查以下内容",
  );
  await expect(page.locator("#visit")).toContainText(
    "提交申请并不代表日期已获确认",
  );
  await page
    .getByRole("group", { name: "语言 / Language" })
    .getByRole("button", { name: "English" })
    .click();
  await expect(page.locator("#quote [role=alert]")).toContainText(
    "Please check the following",
  );
  await expect(page.locator("#quote-company-error")).toHaveText(
    "Complete all required fields.",
  );
  expect(calls).toBe(0);
});
for (const language of ["zh-CN", "en"])
  for (const kind of ["quote", "visit"] as const) {
    test(`${kind} confirmed success in ${language} uses correct template and clears fields`, async ({
      page,
    }) => {
      let body: Record<string, unknown> = {};
      await page.route(endpoint, async (route) => {
        body = route.request().postDataJSON();
        await route.fulfill({ status: 200, body: "OK" });
      });
      await page.goto(`/#${kind}`);
      if (language === "en")
        await page
          .getByRole("group", { name: "语言 / Language" })
          .getByRole("button", { name: "English" })
          .click();
      const form = await fill(page, kind, kind === "quote");
      await form.locator("button[type=submit]").click();
      await expect(form.getByRole("status").first()).toContainText(
        language === "en"
          ? "Your request has been sent successfully"
          : "您的申请已成功发送",
      );
      await expect(form.locator("[name=company]")).toHaveValue("");
      expect(body.template_id).toBe(
        kind === "quote" ? config.quoteTemplateId : config.visitTemplateId,
      );
      expect(body.service_id).toBe(config.serviceId);
      const params = body.template_params as Record<string, string>;
      expect(params.site_language).toContain(language);
      expect(params).not.toHaveProperty("to_email");
      if (kind === "quote") {
        expect(params.total_litres).toBe("7500.00");
        await expect(form.locator("[name=quantity-250ml]")).toBeDisabled();
      } else {
        expect(params.contact_email).toBe(
          language === "en" ? "Not provided" : "未提供",
        );
        expect(params.visitor_count).toBe(params.contact_email);
      }
    });
  }
test("sending disables submit, rejects rapid duplicates, failure keeps values and alternatives, cooldown expires", async ({
  page,
}) => {
  await page.clock.install();
  let calls = 0;
  let finish: () => void = () => {};
  await page.route(endpoint, async (route) => {
    calls++;
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    await route.fulfill({
      status: calls === 1 ? 500 : 200,
      body: calls === 1 ? "Rejected" : "OK",
    });
  });
  await page.goto("/#quote");
  const form = await fill(page, "quote");
  await form.locator("button[type=submit]").click();
  await expect(form.locator("button[type=submit]")).toBeDisabled();
  await expect(form.locator("button[type=submit]")).toContainText("正在发送");
  await form.evaluate((element: HTMLFormElement) => element.requestSubmit());
  await expect.poll(() => calls).toBe(1);
  finish();
  await expect(form.getByRole("alert")).toContainText("发送失败");
  await expect(form.locator("[name=company]")).toHaveValue("中国采购商 Buyer");
  await expect(form.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
    "href",
    /^https:\/\/wa.me\/33634142632/,
  );
  await expect(
    form.getByRole("button", { name: "复制信息供微信发送" }),
  ).toBeVisible();
  await form.locator("button[type=submit]").click();
  await expect(form.getByRole("alert")).toContainText("30");
  expect(calls).toBe(1);
  await page.clock.fastForward(31000);
  await form.locator("button[type=submit]").click();
  await expect.poll(() => calls).toBe(2);
  finish();
  await expect(form.getByRole("status").first()).toContainText(
    "您的申请已成功发送",
  );
});
test("missing configuration never sends and keeps entered values; manual handoff still works", async ({
  page,
}) => {
  await page.route("**/config/emailjs.json", (route) =>
    route.fulfill({ body: "{malformed", contentType: "application/json" }),
  );
  let calls = 0;
  page.on("request", (request) => {
    if (request.url() === endpoint) calls++;
  });
  await page.goto("/#visit");
  await page
    .getByRole("group", { name: "语言 / Language" })
    .getByRole("button", { name: "English" })
    .click();
  const form = await fill(page, "visit", false);
  await form.locator("button[type=submit]").click();
  await expect(form.getByRole("alert")).toContainText(
    "Unable to send your request",
  );
  await expect(form.locator("[name=wechat]")).toHaveValue("buyer-wechat");
  await form
    .getByRole("button", { name: "Prepare WhatsApp / WeChat message" })
    .click();
  await expect(form.locator(".lead-message-preview")).toContainText(
    "November 2026",
  );
  expect(calls).toBe(0);
});
test("honeypot, invalid preference, selected invalid quantity and missing consent block sending", async ({
  page,
}) => {
  await page.goto("/#quote");
  const form = await fill(page, "quote", false);
  await form.locator("[name=contactMethod]").selectOption("email");
  await form.locator("[name=select-5l]").check();
  await form.locator("[name=quantity-5l]").fill("0");
  await form.locator("[name=consent]").uncheck();
  await form.locator("button[type=submit]").click();
  await expect(form.locator("[name=contactMethod]")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.locator("[name=quantity-5l]")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.locator("[name=consent]")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await form.locator("[name=website]").evaluate((el: HTMLInputElement) => {
    el.value = "spam";
  });
  await form.locator("button[type=submit]").click();
  await expect(form.getByRole("alert")).toContainText("未完成");
});
test("editing a prepared inquiry removes stale WhatsApp and copied data", async ({
  page,
}) => {
  await page.goto("/#quote");
  const form = await fill(page, "quote");
  await form.locator(".form-alternative").click();
  await expect(form.locator(".lead-message-preview")).toContainText("30000");
  await form.locator("[name=quantity-250ml]").fill("40000");
  await expect(form.locator(".lead-message-preview")).toHaveCount(0);
  await form.locator(".form-alternative").click();
  await expect(form.locator(".lead-message-preview")).toContainText("40000");
  await expect(form.locator(".lead-message-preview")).toContainText("10000.00");
});
test("a stalled provider times out without claiming failure or success and retains the lock until settlement", async ({
  page,
}) => {
  await page.clock.install();
  let finish: () => void = () => {},
    calls = 0;
  await page.route(endpoint, async (route) => {
    calls++;
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    await route.fulfill({ status: 200, body: "OK" });
  });
  await page.goto("/#visit");
  await page
    .getByRole("group", { name: "语言 / Language" })
    .getByRole("button", { name: "English" })
    .click();
  const form = await fill(page, "visit");
  await form.locator("button[type=submit]").click();
  await expect.poll(() => calls).toBe(1);
  await page.clock.fastForward(21000);
  await expect(form.getByRole("alert")).toContainText(
    "Unable to confirm delivery",
  );
  await expect(
    form.getByRole("button", { name: "Copy for WeChat" }),
  ).toBeVisible();
  await expect(form.locator("[name=company]")).toHaveValue("中国采购商 Buyer");
  await form.locator("button[type=submit]").click();
  await expect(form.getByRole("alert")).toContainText("still being sent");
  expect(calls).toBe(1);
  finish();
  await expect(form.locator("[name=company]")).toHaveValue("中国采购商 Buyer");
  await expect(form.getByRole("status")).not.toContainText(
    "Your request has been sent successfully",
  );
});
