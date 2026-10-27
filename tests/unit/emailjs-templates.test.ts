import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { QUOTE_EMAIL_KEYS, VISIT_EMAIL_KEYS } from "../../src/types/emailjs.ts";
test("complete HTML templates and documented variables match the exact TypeScript contracts", async () => {
  const reference = await readFile(
    "emailjs-templates/VARIABLES_REFERENCE.md",
    "utf8",
  );
  for (const [file, keys] of [
    ["quote-request", QUOTE_EMAIL_KEYS],
    ["grove-visit-request", VISIT_EMAIL_KEYS],
  ] as const) {
    const html = await readFile(`emailjs-templates/${file}.html`, "utf8");
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /<meta charset="UTF-8"/);
    assert.match(html, /<\/html>/);
    assert.ok(!/\{\{\{|<script|<link|@import|base64|TODO/.test(html));
    assert.deepEqual(
      [
        ...new Set(
          [...html.matchAll(/\{\{([a-z0-9_]+)\}\}/g)].map((match) => match[1]),
        ),
      ].sort(),
      [...keys].sort(),
    );
    for (const key of keys) assert.ok(reference.includes(`\`${key}\``), key);
    assert.match(html, /white-space: pre-wrap/);
  }
});
