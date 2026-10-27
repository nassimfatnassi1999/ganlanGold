import nextEnv from "@next/env";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import {
  EMAILJS_ENV_KEYS,
  publicConfigFromEnv,
  validateEmailJSConfig,
} from "../src/config/emailjs-schema.ts";

const mode = process.argv[2] ?? "production";
if (!["development", "production", "test"].includes(mode))
  throw new Error("Expected development, production or test");
const root = resolve(
  process.argv[3] ?? fileURLToPath(new URL("../", import.meta.url)),
);
const target = join(root, "public/config/emailjs.json");
let supplied;
try {
  supplied = JSON.parse(await readFile(target, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT")
    console.warn("Invalid EmailJS runtime JSON; using optional environment settings or disabled defaults.");
}

// Preserve deliberate enabled/disabled JSON; only the empty shipped scaffold can be seeded.
const deliberate = validateEmailJSConfig(supplied) &&
  (supplied.enabled || Object.keys(EMAILJS_ENV_KEYS).some((key) => supplied[key] !== ""));
if (deliberate) {
  console.log("Preserved public/config/emailjs.json; runtime JSON takes precedence.");
} else {
  process.env.NODE_ENV = mode;
  nextEnv.loadEnvConfig(root, mode === "development");
  const config = publicConfigFromEnv(process.env);
  await mkdir(join(root, "public/config"), { recursive: true });
  await writeFile(target, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o644 });
  console.log(config.enabled
    ? "Generated EmailJS runtime JSON from four optional public identifiers."
    : "EmailJS disabled; the production showcase and manual contact forms remain available.");
}
