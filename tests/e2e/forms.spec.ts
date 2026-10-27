import { expect, test, type Page } from "@playwright/test";
import { EMAILJS_CONFIG } from "../../src/config/env";
const config = {
  publicKey: "browser-fixture-public",
  serviceId: "browser-fixture-service",
  quoteTemplateId: "browser-fixture-quote",
  visitTemplateId: "browser-fixture-visit",
};
const endpoint = "https://api.emailjs.com/api/v1.0/email/send";
// Replace public constants only in served test JavaScript; production has no test hooks.
async function useBundledConfig(page: Page, values = config) {
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    for (const key of Object.keys(values) as (keyof typeof config)[]) {
      if (EMAILJS_CONFIG[key])
        body = body.replaceAll(JSON.stringify(EMAILJS_CONFIG[key]), JSON.stringify(values[key]));
    }
    await route.fulfill({ response, body });
  });
}
async function usePlaceholderConfig(page: Page) {
  await useBundledConfig(page, { ...config, publicKey: "YOUR_PUBLIC_KEY" });
}
const configRequests = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  // Every provider call is intercepted, even if a test forgets to set a response.
  await page.route("https://api.emailjs.com/**", (route) => route.abort());
  await useBundledConfig(page);
  const requests: string[] = [];
  configRequests.set(page, requests);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/config/emailjs.json")
      requests.push(request.url());
  });
  await page.route("**/config/emailjs.json", (route) => route.abort());
});
test.afterEach(async ({ page }) => {
  expect(configRequests.get(page)).toEqual([]);
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
    "请修正标出的信息",
  );
  await expect(page.locator("#quote-company")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#quote-company-error")).toContainText(
    "请填写此项",
  );
  await page.locator("#visit button[type=submit]").click();
  await expect(page.locator("#visit [role=alert]")).toContainText(
    "请修正标出的信息",
  );
  await expect(page.locator("#visit")).toContainText(
    "提交申请并不代表日期已获确认",
  );
  await page
    .getByRole("group", { name: "语言 / Language" })
    .getByRole("button", { name: "English" })
    .click();
  await expect(page.locator("#quote [role=alert]")).toContainText(
    "Please correct the highlighted fields.",
  );
  await expect(page.locator("#quote-company-error")).toHaveText(
    "Please complete this field.",
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
      expect(body.user_id).toBe(config.publicKey);
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
  expect(
    await form
      .getByRole("status")
      .evaluate((el) => el.closest('[aria-busy="true"]') === null),
  ).toBe(true);
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
  await usePlaceholderConfig(page);
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
    "Automatic email submission is not currently available",
  );
  await expect(form.locator("[name=wechat]")).toHaveValue("buyer-wechat");
  await form.locator("summary").click();
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
  await form.locator("[name=quantity-5l]").fill("-1");
  await form.locator("[name=consent]").uncheck();
  await form.locator("button[type=submit]").click();
  await expect(form.locator("[name=email]")).toHaveAttribute(
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
  await usePlaceholderConfig(page);
  await page.goto("/#quote");
  const form = await fill(page, "quote");
  await form.locator("button[type=submit]").click();
  await expect(form.locator(".lead-message-preview")).toContainText("30000");
  await form.locator("[name=quantity-250ml]").fill("40000");
  await expect(form.locator(".lead-message-preview")).toHaveCount(0);
  await form.locator("button[type=submit]").click();
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
  await expect(form).not.toContainText(
    "Your request has been sent successfully",
  );
});

for (const language of ["zh-CN", "en"])
  for (const kind of ["quote", "visit"] as const) {
    test(`${kind} disabled in ${language} preserves input and provides manual contact without sending`, async ({
      page,
    }) => {
      await usePlaceholderConfig(page);
      let calls = 0;
      page.on("request", (request) => {
        if (request.url() === endpoint) calls++;
      });
      await page.goto(`/#${kind}`);
      if (language === "en")
        await page
          .getByRole("group", { name: "语言 / Language" })
          .getByRole("button", { name: "English" })
          .click();
      const form = await fill(page, kind);
      await form.locator("button[type=submit]").click();
      await expect(form.getByRole("alert")).toContainText(
        language === "en"
          ? "Automatic email submission is not currently available"
          : "自动邮件提交暂不可用",
      );
      await expect(form.locator("[name=company]")).toHaveValue(
        "中国采购商 Buyer",
      );
      await expect(form.locator("[name=consent]")).toBeChecked();
      await expect(
        form.getByRole("link", { name: /WhatsApp/ }),
      ).toHaveAttribute("href", /^https:\/\/wa.me\//);
      await expect(form.locator(".lead-message-preview")).toContainText(
        "中国采购商 Buyer",
      );
      await expect(
        form.getByRole("button", {
          name: language === "en" ? "Copy for WeChat" : "复制信息供微信发送",
        }),
      ).toBeVisible();
      expect(calls).toBe(0);
    });
  }

for (const language of ["zh-CN", "en"])
  for (const kind of ["quote", "visit"] as const)
    for (const status of [403, 500]) {
      test(`${kind} provider ${status} in ${language} keeps values and stops sending`, async ({ page }) => {
        let calls = 0;
        await page.route(endpoint, (route) => {
          calls++;
          return route.fulfill({ status, body: "Rejected" });
        });
        await page.goto(`/#${kind}`);
        if (language === "en")
          await page.getByRole("group", { name: "语言 / Language" })
            .getByRole("button", { name: "English" }).click();
        const form = await fill(page, kind);
        await form.locator("button[type=submit]").click();
        await expect(form.getByRole("alert")).toContainText(
          status === 403
            ? language === "en" ? "Automatic email submission is not currently available" : "自动邮件提交暂不可用"
            : language === "en" ? "Unable to send" : "发送失败",
        );
        await expect(form.locator("button[type=submit]")).toBeEnabled();
        await expect(form.locator("[name=company]")).toHaveValue("中国采购商 Buyer");
        await expect(form.getByRole("link", { name: /WhatsApp/ })).toBeVisible();
        expect(calls).toBe(1);
      });
    }

for (const kind of ["quote", "visit"] as const) {
  test(`${kind} guides first error and retains other errors while correcting touched fields`, async ({
    page,
  }) => {
    await page.goto(`/#${kind}`);
    const form = page.locator(`#${kind} form`);
    await expect(form.locator("[aria-invalid=true]")).toHaveCount(0);
    await expect(form.locator(".lead-handoff")).toHaveCount(0);
    await form.locator("button[type=submit]").click();
    await expect(form.locator("[name=company]")).toBeFocused();
    await form.locator("[name=company]").fill("采购 王 SARL");
    await expect(form.locator("[name=company]")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    await expect(form.locator("[name=email]")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await form.locator("[name=contactPerson]").fill("Lin");
    await expect(form.locator("[name=company]")).toHaveValue("采购 王 SARL");
    await form.locator("[name=email]").fill("invalid");
    await expect(form.locator(`#${kind}-email-error`)).toContainText("邮箱");
    await form.locator("[name=email]").fill("buyer@example.com");
    await expect(form.locator(`#${kind}-email-error`)).toHaveCount(0);
    await expect(form.locator(`#${kind}-wechat-error`)).toHaveCount(0);
  });
  test(`${kind} shows conditional contact errors on the field and corrects them without losing values`, async ({
    page,
  }) => {
    await page.goto(`/#${kind}`);
    const form = await fill(page, kind, false);
    await form.locator("[name=contactMethod]").selectOption("email");
    await form.locator("button[type=submit]").click();
    await expect(form.locator("[name=email]")).toBeFocused();
    await expect(form.locator("[name=email]")).toHaveAttribute(
      "aria-required",
      "true",
    );
    await form.locator("[name=contactMethod]").selectOption("wechat");
    await expect(form.locator("[name=email]")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    await expect(form.locator("[name=wechat]")).toHaveValue("buyer-wechat");
  });
}

test("fallback waits for a valid submit, keeps preview collapsed and copies current localized data", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await usePlaceholderConfig(page);
  await page.goto("/#quote");
  const form = page.locator("#quote form");
  await expect(form.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
  await form.locator("button[type=submit]").click();
  await expect(form.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
  await fill(page, "quote");
  await form.locator("button[type=submit]").click();
  await expect(form.locator(".lead-message-preview")).not.toBeVisible();
  await form.locator("summary").click();
  await expect(form.locator(".lead-message-preview")).toContainText(
    "中国采购商 Buyer",
  );
  await form.getByRole("button", { name: "复制信息供微信发送" }).click();
  await expect(form.getByRole("button", { name: "已复制" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "申请总容量（升）: 7500.00",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await form.locator(".lead-message-preview").textContent(),
  );
  await page
    .getByRole("group", { name: "语言 / Language" })
    .getByRole("button", { name: "English" })
    .click();
  await expect(form.locator(".lead-message-preview")).toContainText(
    "Total requested litres: 7500.00",
  );
  await expect(
    form.getByRole("button", { name: "Copy for WeChat" }),
  ).toBeVisible();
  await form.locator("[name=quantity-250ml]").fill("40000");
  await expect(form.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
});

test("touched fields validate on blur without jumping during typing", async ({
  page,
}) => {
  await page.goto("/#visit");
  const form = page.locator("#visit form");
  const email = form.locator("[name=email]");
  await email.fill("wrong");
  await expect(email).toHaveAttribute("aria-invalid", "false");
  await email.press("Tab");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator("[name=company]")).toHaveAttribute(
    "aria-invalid",
    "false",
  );
  await email.fill("buyer@example.com");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "false");
});

test("product selection, quantities, uncertain port and MOQ advisory retain exact entered counts", async ({
  page,
}) => {
  await usePlaceholderConfig(page);
  await page.goto("/#quote");
  const form = await fill(page, "quote");
  await form.locator("[name=select-250ml]").uncheck();
  await form.locator("button[type=submit]").click();
  await expect(form.locator("[name=select-250ml]")).toBeFocused();
  await expect(form.locator("#quote-products-error")).toContainText(
    "请至少选择一种产品",
  );
  await form.locator("[name=select-250ml]").check();
  await expect(form.locator(".form-total")).toContainText("7,500");
  await form.locator("[name=quantity-250ml]").fill("0");
  await form.locator("button[type=submit]").click();
  await expect(form.locator("#quote-products-error")).toContainText("大于零");
  for (const [id, value] of [
    ["250ml", "1"],
    ["500ml", "2"],
    ["750ml", "3"],
    ["5l", "4"],
  ]) {
    await form.locator(`[name=select-${id}]`).check();
    await form.locator(`[name=quantity-${id}]`).fill(value);
  }
  await form.locator("[name=destinationUnknown]").check();
  await form.locator("button[type=submit]").click();
  await expect(form.locator(".form-total")).toContainText("23.5");
  await expect(form.locator(".form-dispatch-note")).toContainText(
    "商业订购政策",
  );
  await expect(form.locator(".form-dispatch-note")).not.toContainText("7,500");
  await form.locator("summary").click();
  await expect(form.locator(".lead-message-preview")).toContainText(
    "申请总容量（升）: 23.50",
  );
  await expect(form.locator(".lead-message-preview")).toContainText(
    "目的港: 尚未确定",
  );
  const url = new URL(
    (await form.getByRole("link", { name: /WhatsApp/ }).getAttribute("href")) ??
      "",
  );
  expect(url.searchParams.get("text")).toContain("5 L: 4");
  await expect(form.locator("[name=quantity-250ml]")).toHaveValue("1");
});

test("clipboard rejection never reports copied and offers manual preview", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    }),
  );
  await usePlaceholderConfig(page);
  await page.goto("/#visit");
  const form = await fill(page, "visit", false);
  await form.locator("button[type=submit]").click();
  await form.getByRole("button", { name: "复制信息供微信发送" }).click();
  await expect(form.locator(".copy-status")).toContainText("无法复制");
  await expect(
    form.getByRole("button", { name: "已复制", exact: true }),
  ).toHaveCount(0);
  await form.locator("summary").click();
  await expect(form.locator(".lead-message-preview")).toBeVisible();
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`forms fit at ${width}px with visible focused errors and associated labels`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#quote");
    for (const kind of ["quote", "visit"]) {
      const form = page.locator(`#${kind} form`);
      await form.locator("button[type=submit]").click();
      await expect(form.locator("[name=company]")).toBeFocused();
      const position = await form.locator("[name=company]").evaluate((el) => ({
        top: (el.closest(".form-field") ?? el).getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
        headerBottom:
          document.querySelector(".site-header")?.getBoundingClientRect()
            .bottom ?? 0,
      }));
      expect(position.top).toBeGreaterThan(position.headerBottom);
      expect(position.bottom).toBeLessThan(900);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await form.evaluate((el) =>
          Array.from(
            el.querySelectorAll<
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >("input:not([name=website]),select,textarea"),
          ).every(
            (field) =>
              field.labels?.length &&
              (field.getAttribute("aria-invalid") !== "true" ||
                !!document.getElementById(
                  field.getAttribute("aria-describedby") ?? "",
                )),
          ),
        ),
      ).toBe(true);
      expect(
        await form.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await page
      .getByRole("group", { name: "语言 / Language" })
      .getByRole("button", { name: "English" })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("#quote-company-error")).toContainText(
      "Please complete this field",
    );
  });
}

test("a previously corrected touched email keeps validating on later edits", async ({
  page,
}) => {
  await page.goto("/#visit");
  const email = page.locator("#visit [name=email]");
  await email.fill("wrong");
  await email.press("Tab");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await email.fill("buyer@example.com");
  await expect(email).toHaveAttribute("aria-invalid", "false");
  await email.fill("wrong-again");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
});

test("product-group errors appear when a visitor leaves an interacted empty or zero-total selection", async ({
  page,
}) => {
  await page.goto("/#quote");
  const form = page.locator("#quote form");
  const select = form.locator("[name=select-250ml]");
  await select.check();
  await select.uncheck();
  await select.press("Tab");
  await expect(form.locator("#quote-products-error")).toContainText(
    "请至少选择一种产品",
  );
  await select.check();
  const quantity = form.locator("[name=quantity-250ml]");
  await quantity.fill("0");
  await quantity.press("Tab");
  await expect(form.locator("#quote-products-error")).toContainText("大于零");
  await quantity.fill("1");
  await expect(form.locator("#quote-products-error")).toHaveCount(0);
});
