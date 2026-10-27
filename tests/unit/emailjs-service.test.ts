import { test, mock } from "node:test";
import assert from "node:assert/strict";
import emailjs from "@emailjs/browser";
import { loadEmailJSConfig } from "../../src/config/emailjs.ts";
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

test("loader rejects errors, malformed contracts, placeholders, extra keys; caches only successful loads", async () => {
  for (const response of [
    new Response("no", { status: 404 }),
    new Response("{"),
    Response.json({}),
    Response.json({ ...config, publicKey: "YOUR_PUBLIC_KEY" }),
    Response.json({ ...config, privateKey: "should-not-be-here" }),
  ]) {
    const fetch = mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(loadEmailJSConfig());
    fetch.mock.restore();
  }
  const fetch = mock.method(globalThis, "fetch", async () =>
    Response.json(config),
  );
  assert.deepEqual(await loadEmailJSConfig(), config);
  assert.deepEqual(await loadEmailJSConfig(), config);
  assert.equal(fetch.mock.callCount(), 1);
  fetch.mock.restore();
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
