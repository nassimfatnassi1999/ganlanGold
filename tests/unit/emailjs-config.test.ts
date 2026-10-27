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

test("generator respects Next precedence and exposes only enabled and four public identifiers", async () => {
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
      enabled: true,
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

const disabled = {
  enabled: false,
  publicKey: "",
  serviceId: "",
  quoteTemplateId: "",
  visitTemplateId: "",
};

test("production succeeds disabled for missing, incomplete, placeholder and identical credentials", async () => {
  for (const overrides of [
    {},
    { NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "only-key" },
    ...["", "YOUR_PUBLIC_KEY", "REPLACE_ME", "placeholder", "changeme", "   "].map(
      (value) => Object.fromEntries(names.map((name) => [envKey(name), value])),
    ),
    Object.fromEntries(names.map((name) => [envKey(name), "same"])),
  ]) {
    const root = await fixture();
    try {
      const result = generate(root, "production", overrides);
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(JSON.parse(await readFile(join(root, "public/config/emailjs.json"), "utf8")), disabled);
    } finally {
      await rm(root, { recursive: true });
    }
  }
});

test("deliberately supplied enabled or disabled runtime JSON takes priority over environment", async () => {
  for (const enabled of [true, false]) {
    const root = await fixture();
    const manual = { enabled, publicKey: "manual-key", serviceId: "manual-service", quoteTemplateId: "manual-quote", visitTemplateId: "manual-visit" };
    try {
      await mkdir(join(root, "public/config"));
      const raw = JSON.stringify(manual, null, 2) + "\n";
      await writeFile(join(root, "public/config/emailjs.json"), raw);
      for (const configured of [false, true]) {
        if (configured) await writeFile(join(root, ".env.local"), values("env"));
        const result = generate(root);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(await readFile(join(root, "public/config/emailjs.json"), "utf8"), raw);
      }
    } finally {
      await rm(root, { recursive: true });
    }
  }
});

test("default JSON can be seeded from complete optional env values", async () => {
  const root = await fixture();
  try {
    await mkdir(join(root, "public/config"));
    await writeFile(join(root, "public/config/emailjs.json"), JSON.stringify(disabled));
    await writeFile(join(root, ".env.local"), values("local"));
    assert.equal(generate(root).status, 0);
    const config = JSON.parse(await readFile(join(root, "public/config/emailjs.json"), "utf8"));
    assert.equal(config.enabled, true);
    assert.equal(config.serviceId, "local_SERVICE_ID");
  } finally { await rm(root, { recursive: true }); }
});

test("malformed and unsafe public configs are repaired to disabled without credentials", async () => {
  for (const raw of ["{", '{"enabled":"true"}', JSON.stringify({ ...disabled, privateKey: "never-publish" })]) {
    const root = await fixture();
    try {
      await mkdir(join(root, "public/config"));
      await writeFile(join(root, "public/config/emailjs.json"), raw);
      const result = generate(root);
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(JSON.parse(await readFile(join(root, "public/config/emailjs.json"), "utf8")), disabled);
    } finally { await rm(root, { recursive: true }); }
  }
});

test("development succeeds disabled without settings", async () => {
  const root = await fixture();
  try {
    assert.equal(generate(root, "development").status, 0);
    assert.deepEqual(JSON.parse(await readFile(join(root, "public/config/emailjs.json"), "utf8")), disabled);
  } finally { await rm(root, { recursive: true }); }
});
