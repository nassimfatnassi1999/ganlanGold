import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateQuote,
  validateVisit,
  buildQuoteParams,
  buildVisitParams,
  totalLitres,
} from "../../src/lib/forms/lead.ts";
import { QUOTE_EMAIL_KEYS, VISIT_EMAIL_KEYS } from "../../src/types/emailjs.ts";

function form(extra: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({
    company: "采购商 Buyer",
    country: "China",
    contactPerson: "Lin",
    email: "buyer@example.com",
    contactMethod: "either",
    destinationPort: "Shanghai",
    preferredPeriod: "November 2026",
    consent: "on",
    "select-250ml": "on",
    "quantity-250ml": "30000",
    ...extra,
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}
const date = new Date("2026-10-27T12:00:00Z");
test("mixed package volumes are exact and selected invalid quantities cannot be silently dropped", () => {
  assert.equal(
    totalLitres([
      { productId: "250ml", quantity: 1 },
      { productId: "500ml", quantity: 2 },
      { productId: "750ml", quantity: 3 },
      { productId: "5l", quantity: 4 },
    ]),
    23.5,
  );
  for (const quantity of [
    "",
    "-1",
    "1.5",
    "1000001",
    "Infinity",
    "NaN",
    "1e2",
    "0x10",
  ]) {
    const result = validateQuote(
      form({ "select-5l": "on", "quantity-5l": quantity }),
    );
    assert.ok(result.errors["quantity-5l"]);
    assert.equal(result.data, undefined);
  }
});
test("quote mapping supplies every exact string parameter with localized optional fallbacks", () => {
  const result = validateQuote(
    form({
      email: "",
      wechat: "buyer-wechat",
      message: "Line 1\n<script>not HTML</script>",
    }),
  );
  assert.deepEqual(result.errors, {});
  const params = buildQuoteParams(result.data!, "zh-CN", date);
  assert.deepEqual(Object.keys(params).sort(), [...QUOTE_EMAIL_KEYS].sort());
  assert.ok(
    Object.values(params).every(
      (value) =>
        typeof value === "string" &&
        !["undefined", "null", "[object Object]"].includes(value),
    ),
  );
  assert.equal(params.contact_email, "未提供");
  assert.equal(params.quantity_250ml, "30000");
  assert.equal(params.quantity_5l, "0");
  assert.equal(params.total_litres, "7500.00");
  assert.match(params.products_summary, /250 ml: 30000/);
  assert.equal(params.message, "Line 1\n<script>not HTML</script>"); // Dashboard double braces escape once.
  assert.equal(params.site_language, "简体中文 (zh-CN)");
  assert.equal(params.submission_date, date.toISOString());
});
test("visit mapping handles optional fields and uses its independent contract", () => {
  const data = validateVisit(form()).data!;
  const params = buildVisitParams(data, "en", date);
  assert.deepEqual(Object.keys(params).sort(), [...VISIT_EMAIL_KEYS].sort());
  assert.equal(params.visitor_count, "Not provided");
  assert.equal(params.wechat_id, "Not provided");
  assert.equal(params.message, "Not provided");
  assert.equal(params.preferred_visit_period, "November 2026");
  assert.equal(params.privacy_consent, "Consented");
});
test("email, contact preferences, consent, required fields and length limits are validated", () => {
  for (const email of [
    "x",
    "a@@b.com",
    "a b@c.com",
    "x@y",
    "x@y.com\nBcc: bad@example.com",
  ])
    assert.ok(validateVisit(form({ email })).errors.email);
  assert.ok(validateVisit(form({ email: "", wechat: "" })).errors.email);
  assert.ok(
    validateVisit(form({ email: "", wechat: "wx", contactMethod: "email" }))
      .errors.email,
  );
  assert.ok(
    validateVisit(form({ wechat: "", contactMethod: "wechat" })).errors.wechat,
  );
  assert.ok(
    validateVisit(form({ contactMethod: "arbitrary" })).errors.contactMethod,
  );
  assert.ok(validateVisit(form({ consent: "" })).errors.consent);
  assert.ok(validateVisit(form({ company: "" })).errors.company);
  assert.ok(validateVisit(form({ message: "界".repeat(4001) })).errors.message);
  for (const visitors of ["0", "1.5", "51"])
    assert.ok(validateVisit(form({ visitors })).errors.visitors);
  assert.ok(validateVisit(form({ website: "spam.invalid" })).errors.website);
});
test("manual messages use readable localized labels rather than EmailJS contract keys", async () => {
  const { formatLeadMessage } = await import("../../src/lib/forms/lead.ts");
  const params = buildQuoteParams(validateQuote(form()).data!, "en", date);
  const message = formatLeadMessage("quote", params, "en");
  assert.match(message, /Contact person: Lin/);
  assert.match(message, /Total requested litres: 7500.00/);
  assert.ok(!message.includes("contact_name"));
  assert.match(formatLeadMessage("quote", params, "zh-CN"), /联系人: Lin/);
});

test("zero package counts are retained when another selected product makes total positive", () => {
  const result = validateQuote(form({ "select-5l": "on", "quantity-5l": "0" }));
  assert.deepEqual(result.errors, {});
  assert.equal(
    result.data?.products.find((p) => p.productId === "5l")?.quantity,
    0,
  );
  const zero = validateQuote(form({ "quantity-250ml": "0" }));
  assert.equal(zero.errors.products, "totalRequired");
  assert.equal(zero.data, undefined);
});
test("preferred contacts require their own field and accept international WeChat IDs", () => {
  for (const validate of [validateQuote, validateVisit]) {
    assert.equal(
      validate(
        form({ email: "", wechat: "采购 王 + 86", contactMethod: "email" }),
      ).errors.email,
      "emailRequired",
    );
    assert.equal(
      validate(form({ contactMethod: "wechat" })).errors.wechat,
      "wechatRequired",
    );
    assert.ok(
      validate(
        form({ email: "", wechat: "采购 王 + 86", contactMethod: "wechat" }),
      ).data,
    );
  }
});
test("uncertain port is explicit and mapped in the visitor language", () => {
  const result = validateQuote(
    form({ destinationPort: "", destinationUnknown: "on" }),
  );
  assert.deepEqual(result.errors, {});
  assert.equal(
    buildQuoteParams(result.data!, "en", date).destination_port,
    "Not sure yet",
  );
  assert.equal(
    buildQuoteParams(result.data!, "zh-CN", date).destination_port,
    "尚未确定",
  );
});

test("missing preferred contact does not invalidate the optional alternative", () => {
  for (const validate of [validateQuote, validateVisit]) {
    const email = validate(
      form({ email: "", wechat: "", contactMethod: "email" }),
    );
    assert.equal(email.errors.email, "emailRequired");
    assert.equal(email.errors.wechat, undefined);
    const wechat = validate(
      form({ email: "", wechat: "", contactMethod: "wechat" }),
    );
    assert.equal(wechat.errors.wechat, "wechatRequired");
    assert.equal(wechat.errors.email, undefined);
  }
});
