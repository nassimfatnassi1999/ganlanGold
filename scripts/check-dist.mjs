import { validateEmailJSConfig } from "../src/config/emailjs-schema.ts";
/** Static export verification; shares the runtime EmailJS contract via tsx. */
import { readFile, access, readdir } from "node:fs/promises";
const dir = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", dir), "utf8");
const prices = JSON.parse(
  await readFile(new URL("config/prices.json", dir), "utf8"),
);
const productIds = ["250ml", "500ml", "750ml", "5l"];
function check(condition, message) {
  if (!condition) throw new Error(`Static validation failed: ${message}`);
  console.log(`✓ ${message}`);
}
for (const url of [
  "404.html",
  "_next/static",
  "robots.txt",
  "sitemap.xml",
  "privacy/index.html",
  "legal/index.html",
  "terms/index.html",
  "config/prices.json",
  "images/qr/lassad-wechat.png",
  "images/qr/fouad-wechat.png",
]) {
  await access(new URL(url, dir));
}
check(
  Object.keys(prices).length === productIds.length &&
    productIds.every((id) => {
      const price = prices[id];
      return (
        price &&
        Object.keys(price).length === 2 &&
        Number.isSafeInteger(price.cny) &&
        price.cny > 0 &&
        typeof price.usd === "string" &&
        /^(0|[1-9]\d*)\.\d{2}$/.test(price.usd)
      );
    }),
  "Editable runtime price configuration is valid",
);
check(
  (html.match(/class="price-block"/g) || []).length === 4,
  "Exactly four runtime price cards",
);
check(
  !html.includes('class="price-cny"') && !html.includes('class="price-usd"'),
  "No rendered price amounts compiled into page HTML",
);
check(
  !html.includes('"priceCurrency"') && !html.includes('"offers"'),
  "No monetary offers compiled into JSON-LD",
);
check(
  (html.match(/id="wholesale"/g) || []).length === 1,
  "Only one dedicated MOQ section",
);
check(html.includes("7,500"), "Global MOQ text present");
check(
  !html.includes('href="/admin"') && !html.includes("Prisma"),
  "No admin/database UI",
);
check(
  !html.includes("referenceDate") && !html.includes("参考汇率日期"),
  "No automatic FX rate output",
);
check(
  html.includes("Gisèle") && html.includes("Lassad") && html.includes("Fouad"),
  "All 3 verified contacts present",
);

const emailjs = JSON.parse(
  await readFile(new URL("config/emailjs.json", dir), "utf8"),
);
check(
  validateEmailJSConfig(emailjs),
  "Runtime EmailJS configuration is valid (enabled or safely disabled)",
);
const files = await readdir(dir, { recursive: true });
check(
  !files.some((file) =>
    file.split("/").some((part) => part === ".env" || part.startsWith(".env.")),
  ),
  "No environment files in static export",
);
check(
  !files.includes("EMAILJS_PREVIEW_ONLY.txt"),
  "Production showcase has no obsolete preview-only marker",
);

console.log("Static verification succeeded.");
