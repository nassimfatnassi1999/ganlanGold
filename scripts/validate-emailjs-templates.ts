import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { QUOTE_EMAIL_KEYS, VISIT_EMAIL_KEYS } from "../src/types/emailjs";
import {
  buildQuoteParams,
  buildVisitParams,
  validateQuote,
  validateVisit,
} from "../src/lib/forms/lead";

const form = new FormData();
Object.entries({
  company: "示例采购公司 / Sample Buyer",
  country: "China",
  contactPerson: "Lin — Sample Contact",
  email: "buyer@example.com",
  wechat: "sample-wechat",
  contactMethod: "either",
  consent: "on",
  destinationPort: "Shanghai",
  preferredPeriod: "November 2026 — dates to be agreed",
  visitors: "3",
  message:
    '第一行 / First line\nSecond line: <script>alert("escaped")</script> & safe text',
  "select-250ml": "on",
  "quantity-250ml": "10000",
  "select-500ml": "on",
  "quantity-500ml": "10000",
}).forEach(([key, value]) => form.set(key, value));
const date = new Date("2026-10-27T12:00:00Z");
const samples = {
  "quote-request": {
    keys: QUOTE_EMAIL_KEYS,
    params: buildQuoteParams(validateQuote(form).data!, "zh-CN", date),
  },
  "grove-visit-request": {
    keys: VISIT_EMAIL_KEYS,
    params: buildVisitParams(validateVisit(form).data!, "en", date),
  },
};
const reference = await readFile(
  "emailjs-templates/VARIABLES_REFERENCE.md",
  "utf8",
);
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
for (const [name, { keys, params }] of Object.entries(samples)) {
  const html = await readFile(`emailjs-templates/${name}.html`, "utf8");
  const variables = [
    ...new Set(
      [...html.matchAll(/\{\{([a-z0-9_]+)\}\}/g)].map((match) => match[1]),
    ),
  ];
  assert.deepEqual(
    variables.sort(),
    [...keys].sort(),
    `${name}: template variables`,
  );
  assert.deepEqual(
    Object.keys(params).sort(),
    [...keys].sort(),
    `${name}: generated parameters`,
  );
  assert.ok(
    Object.values(params).every(
      (value) =>
        typeof value === "string" &&
        value.length > 0 &&
        !["undefined", "null", "[object Object]"].includes(value),
    ),
  );
  assert.ok(!/\{\{\{|<script|<link|@import|base64|TODO/i.test(html));
  for (const key of keys)
    assert.ok(
      reference.includes(`\`${key}\``),
      `Undocumented variable: ${key}`,
    );
  const section =
    reference.split(`<!-- ${name} -->`)[1]?.split("<!-- end -->")[0] ?? "";
  assert.deepEqual(
    [...section.matchAll(/^\| `([a-z0-9_]+)`/gm)]
      .map((match) => match[1])
      .sort(),
    [...keys].sort(),
    `${name}: documented contract`,
  );
  if (process.argv.includes("--previews")) {
    await mkdir("emailjs-templates/previews", { recursive: true });
    const rendered = html.replace(/\{\{([a-z0-9_]+)\}\}/g, (_, key: string) =>
      escape((params as Record<string, string>)[key]),
    );
    await writeFile(`emailjs-templates/previews/${name}.html`, rendered);
  }
  console.log(
    `✓ ${name}: exact HTML, TypeScript, mapped string values and documented contract (${keys.length} variables)`,
  );
}
