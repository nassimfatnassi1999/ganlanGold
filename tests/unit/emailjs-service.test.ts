import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import emailjs from "@emailjs/browser";
import * as env from "../../src/config/env.ts";
import {
  sendLead,
  LeadSendError,
  SUBMISSION_COOLDOWN_MS,
} from "../../src/services/emailjs.ts";
import {
  validateQuote,
  buildQuoteParams,
  validateVisit,
  buildVisitParams,
} from "../../src/lib/forms/lead.ts";
const config = {
  publicKey: "unit-public",
  serviceId: "unit-service",
  quoteTemplateId: "unit-quote",
  visitTemplateId: "unit-visit",
};
const f = new FormData();
Object.entries({
  company: "Buyer",
  country: "China",
  contactPerson: "Lin",
  email: "buyer@example.com",
  contactMethod: "either",
  consent: "on",
  destinationPort: "Shanghai",
  preferredPeriod: "November",
  "select-5l": "on",
  "quantity-5l": "1500",
}).forEach(([k, v]) => f.set(k, v));
const quote = buildQuoteParams(validateQuote(f).data!, "en");
const visit = buildVisitParams(validateVisit(f).data!, "en");

const originalConfig = "EMAILJS_CONFIG" in env ? { ...env.EMAILJS_CONFIG } : {};
beforeEach(() => {
  assert.ok("EMAILJS_CONFIG" in env, "TypeScript configuration must exist");
  for (const [key, value] of Object.entries(config)) Reflect.set(env.EMAILJS_CONFIG, key, value);
  mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected configuration fetch"); });
});
afterEach(() => {
  if ("EMAILJS_CONFIG" in env)
    for (const [key, value] of Object.entries(originalConfig)) Reflect.set(env.EMAILJS_CONFIG, key, value);
  mock.restoreAll();
});

test("placeholder configuration never invokes SDK and does not consume cooldown", async () => {
  const sdk = mock.method(emailjs, "send", async () => ({ status: 200, text: "OK" }));
  mock.method(Date, "now", () => 1);
  for (const key of Object.keys(config)) {
    Reflect.set(env.EMAILJS_CONFIG, key, "YOUR_PUBLIC_KEY");
    await assert.rejects(sendLead("quote", quote), (error: unknown) =>
      error instanceof LeadSendError && error.reason === "disabled");
    Reflect.set(env.EMAILJS_CONFIG, key, config[key as keyof typeof config]);
  }
  assert.equal(sdk.mock.callCount(), 0);
  await sendLead("quote", quote);
  assert.equal(sdk.mock.callCount(), 1);
});
test("service uses correct templates, prevents concurrent sends and enforces shared cooldown after failure", async () => {
  let now = 100000;
  const clock = mock.method(Date, "now", () => now);
  let finish: (value: { status: number; text: string }) => void = () => {};
  const calls: unknown[][] = [];
  const sdk = mock.method(emailjs, "send", (...args: unknown[]) => {
    calls.push(args);
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  try {
    const first = sendLead("quote", quote);
    await assert.rejects(sendLead("visit", visit), LeadSendError);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(0, 3), [
      config.serviceId,
      config.quoteTemplateId,
      quote,
    ]);
    assert.equal(
      (calls[0][3] as { publicKey: string }).publicKey,
      config.publicKey,
    );
    finish({ status: 200, text: "OK" });
    await first;
    await assert.rejects(sendLead("visit", visit), LeadSendError);
    now += SUBMISSION_COOLDOWN_MS + 1;
    sdk.mock.mockImplementation(async (...args: unknown[]) => {
      calls.push(args);
      throw new Error("provider rejected");
    });
    await assert.rejects(sendLead("visit", visit), /provider rejected/);
    assert.equal(calls[1][1], config.visitTemplateId);
    await assert.rejects(sendLead("quote", quote), LeadSendError);
    now += SUBMISSION_COOLDOWN_MS + 1;
    sdk.mock.mockImplementation(async () => ({ status: 500, text: "failure" }));
    await assert.rejects(sendLead("quote", quote));
    now += SUBMISSION_COOLDOWN_MS + 1;
    await assert.rejects(
      sendLead("quote", { ...quote, company: undefined } as never),
    );
    assert.equal(calls.length, 2);
  } finally {
    sdk.mock.restore();
    clock.mock.restore();
  }
});

test("provider configuration rejection offers email-unavailable fallback instead of success", async () => {
  let now = 500000;
  const clock = mock.method(Date, "now", () => now);
  const sdk = mock.method(emailjs, "send", async () => {
    throw { status: 401, text: "Incorrect public key" };
  });
  try {
    for (const status of [400, 401, 403, 404]) {
      now += SUBMISSION_COOLDOWN_MS + 1;
      sdk.mock.mockImplementation(async () => {
        throw { status, text: "Configuration rejected" };
      });
      await assert.rejects(
        sendLead("quote", quote),
        (error: unknown) =>
          error instanceof LeadSendError && error.reason === "disabled",
      );
    }
  } finally {
    sdk.mock.restore();
    clock.mock.restore();
  }
});
