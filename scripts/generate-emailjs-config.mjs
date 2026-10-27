import nextEnv from "@next/env";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import {
  EMAILJS_ENV_KEYS,
  publicConfigFromEnv,
  validateEmailJSConfig,
  validIdentifier,
} from "../src/config/emailjs-schema.ts";

const mode = process.argv[2] ?? "production";
if (!["development", "production", "test"].includes(mode))
  throw new Error("Expected development, production or test");
const root = resolve(
  process.argv[3] ?? fileURLToPath(new URL("../", import.meta.url)),
);
process.env.NODE_ENV = mode;
nextEnv.loadEnvConfig(root, mode === "development");
const config = publicConfigFromEnv(process.env);
const target = join(root, "public/config/emailjs.json");
if (!validateEmailJSConfig(config)) {
  if (mode === "production") {
    await rm(target, { force: true });
    const missing = Object.entries(EMAILJS_ENV_KEYS)
      .filter(([key]) => !validIdentifier(config[key]))
      .map(([, name]) => name);
    console.error(
      `EmailJS production configuration incomplete: ${missing.join(", ") || "quote and visit Template IDs must differ"}. Set actual public identifiers in .env.local or the build environment. No values were printed.`,
    );
    process.exitCode = 1;
  } else {
    for (const key of Object.keys(config)) config[key] = "";
    console.warn(
      "EmailJS is disabled: configure the four public identifiers in .env.local, then restart/rebuild.",
    );
  }
}
if (!process.exitCode) {
  await mkdir(join(root, "public/config"), { recursive: true });
  await writeFile(target, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o644,
  });
  console.log(
    "Generated public/config/emailjs.json (only four public browser identifiers).",
  );
}
