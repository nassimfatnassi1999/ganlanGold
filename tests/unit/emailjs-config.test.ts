import { test } from "node:test";
import assert from "node:assert/strict";
import * as env from "../../src/config/env.ts";
import * as configModule from "../../src/config/emailjs.ts";

const configured = {
  publicKey: "unit-public",
  serviceId: "unit-service",
  quoteTemplateId: "unit-quote",
  visitTemplateId: "unit-visit",
};

test("central configuration contains exactly the four public browser identifiers", () => {
  assert.ok("EMAILJS_CONFIG" in env, "TypeScript public configuration must exist");
  assert.deepEqual(Object.keys(env.EMAILJS_CONFIG).sort(), Object.keys(configured).sort());
  assert.ok(Object.values(env.EMAILJS_CONFIG).every((value) => typeof value === "string"));
});

test("configuration readiness accepts four distinct valid public identifiers", () => {
  assert.ok("isEmailJSConfigured" in configModule, "Synchronous readiness check must exist");
  assert.equal(configModule.isEmailJSConfigured(configured), true);
});

test("missing, placeholder, malformed and duplicate template identifiers disable sending", () => {
  assert.ok("isEmailJSConfigured" in configModule, "Synchronous readiness check must exist");
  for (const value of [null, [], {}, { ...configured, privateKey: "never-publish" }])
    assert.equal(configModule.isEmailJSConfigured(value), false);
  for (const key of Object.keys(configured)) {
    for (const value of [undefined, "", "YOUR_PUBLIC_KEY", "YOUR_SERVICE_ID", "YOUR_QUOTE_TEMPLATE_ID", "YOUR_VISIT_TEMPLATE_ID", "REPLACE_ME", "placeholder", "changeme", "example", "undefined", "null", "   ", "bad/key", "x".repeat(201)])
      assert.equal(configModule.isEmailJSConfigured({ ...configured, [key]: value }), false);
  }
  assert.equal(configModule.isEmailJSConfigured({ ...configured, quoteTemplateId: configured.visitTemplateId }), false);
});
