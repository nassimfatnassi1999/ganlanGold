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
  enabled: true,
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

const disabled = { enabled: false, publicKey: "", serviceId: "", quoteTemplateId: "", visitTemplateId: "" };

test("loader falls back disabled for HTTP, JSON, schema and network failures", async () => {
  for (const response of [
    new Response("no", { status: 404 }),
    new Response("{"),
    Response.json({}),
    Response.json({ ...config, enabled: "true" }),
    Response.json({ ...config, publicKey: "" }),
    Response.json({ ...config, publicKey: "YOUR_PUBLIC_KEY" }),
    Response.json({ ...config, quoteTemplateId: config.visitTemplateId }),
    Response.json({ ...config, privateKey: "should-not-be-here" }),
  ]) {
    const fetch = mock.method(globalThis, "fetch", async () => response);
    try { assert.deepEqual(await loadEmailJSConfig(), disabled); }
    finally { fetch.mock.restore(); }
  }
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
  try { assert.deepEqual(await loadEmailJSConfig(), disabled); }
  finally { fetch.mock.restore(); }
});

test("loader rereads runtime edits and shares only concurrent requests", async () => {
  let current = disabled;
  const fetch = mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options?.cache, "no-store");
    return Response.json(current);
  });
  try {
    assert.deepEqual(await loadEmailJSConfig(), disabled);
    current = config;
    assert.deepEqual(await loadEmailJSConfig(), config);
    current = { ...config, enabled: false };
    const results = await Promise.all([loadEmailJSConfig(), loadEmailJSConfig()]);
    assert.deepEqual(results, [current, current]);
    assert.equal(fetch.mock.callCount(), 3);
  } finally { fetch.mock.restore(); }
});

test("disabled config never invokes SDK and does not consume cooldown", async () => {
  let current = { ...config, enabled: false };
  const fetch = mock.method(globalThis, "fetch", async () => Response.json(current));
  const sdk = mock.method(emailjs, "send", async () => ({ status: 200, text: "OK" }));
  const clock = mock.method(Date, "now", () => 1);
  try {
    await assert.rejects(sendLead("quote", quote), (error: unknown) => error instanceof LeadSendError && error.reason === "disabled");
    assert.equal(sdk.mock.callCount(), 0);
    current = config;
    await sendLead("quote", quote);
    assert.equal(sdk.mock.callCount(), 1);
  } finally { fetch.mock.restore(); sdk.mock.restore(); clock.mock.restore(); }
});
test("service uses correct templates, prevents concurrent sends and enforces shared cooldown after failure", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => Response.json(config));
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
    fetch.mock.restore();
  }
});
