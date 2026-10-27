import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/generate-emailjs-config.mjs");
const names = [
  "PUBLIC_KEY",
  "SERVICE_ID",
  "QUOTE_TEMPLATE_ID",
  "VISIT_TEMPLATE_ID",
];
const envKey = (name: string) => `NEXT_PUBLIC_EMAILJS_${name}`;
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "ganlan-emailjs-"));
  await mkdir(join(root, "public"), { recursive: true });
  return root;
}
function generate(root: string, mode = "production", overrides = {}) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !key.startsWith("NEXT_PUBLIC_EMAILJS_") &&
        !["__NEXT_PROCESSED_ENV", "NODE_ENV"].includes(key),
    ),
  );
  return spawnSync(process.execPath, ["--import", "tsx", script, mode, root], {
    env: { ...env, ...overrides },
    encoding: "utf8",
  });
}
const values = (prefix: string) =>
  names.map((name) => `${envKey(name)}=${prefix}_${name}`).join("\n");

test("generator respects Next precedence and exposes exactly four identifiers", async () => {
  const root = await fixture();
  try {
    await writeFile(
      join(root, ".env"),
      `${values("base")}\nPRIVATE_EMAILJS_KEY=never-publish\nPROVIDER_PASSWORD=never-publish\nNEXT_PUBLIC_OTHER=never-publish`,
    );
    await writeFile(join(root, ".env.production"), values("production"));
    await writeFile(join(root, ".env.local"), values("local"));
    await writeFile(join(root, ".env.production.local"), values("priority"));
    const result = generate(root, "production", {
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "shell-key",
    });
    assert.equal(result.status, 0, result.stderr);
    const raw = await readFile(
      join(root, "public/config/emailjs.json"),
      "utf8",
    );
    assert.deepEqual(JSON.parse(raw), {
      publicKey: "shell-key",
      serviceId: "priority_SERVICE_ID",
      quoteTemplateId: "priority_QUOTE_TEMPLATE_ID",
      visitTemplateId: "priority_VISIT_TEMPLATE_ID",
    });
    assert.ok(!raw.includes("never-publish"));
    assert.ok(!result.stdout.includes("shell-key"));
  } finally {
    await rm(root, { recursive: true });
  }
});

test("production rejects missing, placeholder and identical template configuration and removes stale JSON", async () => {
  for (const value of [
    "",
    "YOUR_PUBLIC_KEY",
    "REPLACE_ME",
    "placeholder",
    "changeme",
    "   ",
  ]) {
    const root = await fixture();
    try {
      await mkdir(join(root, "public/config"));
      await writeFile(
        join(root, "public/config/emailjs.json"),
        '{"stale":true}',
      );
      await writeFile(join(root, ".env.local"), values("configured"));
      const result = generate(root, "production", {
        NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: value,
      });
      assert.notEqual(result.status, 0, value);
      assert.match(result.stderr, /NEXT_PUBLIC_EMAILJS_PUBLIC_KEY/);
      await assert.rejects(readFile(join(root, "public/config/emailjs.json")));
    } finally {
      await rm(root, { recursive: true });
    }
  }
  const root = await fixture();
  try {
    await writeFile(join(root, ".env.local"), values("configured"));
    assert.notEqual(
      generate(root, "production", {
        NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID: "same",
        NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID: "same",
      }).status,
      0,
    );
  } finally {
    await rm(root, { recursive: true });
  }
});

test("development writes a disabled contract for missing settings", async () => {
  const root = await fixture();
  try {
    const result = generate(root, "development");
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(
        await readFile(join(root, "public/config/emailjs.json"), "utf8"),
      ),
      {
        publicKey: "",
        serviceId: "",
        quoteTemplateId: "",
        visitTemplateId: "",
      },
    );
  } finally {
    await rm(root, { recursive: true });
  }
});
