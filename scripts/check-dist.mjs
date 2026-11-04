import { EMAILJS_CONFIG } from "../src/config/env.ts";
import { isEmailJSConfigured } from "../src/config/emailjs.ts";
/** Verify the standalone static export and its bundled public EmailJS settings. */
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
        Object.keys(price).length === 3 &&
        Number.isSafeInteger(price.cny) &&
        price.cny > 0 &&
        ["usd", "eur"].every((currency) =>
          typeof price[currency] === "string" &&
          /^(0|[1-9]\d*)\.\d{2}$/.test(price[currency]))
      );
    }),
  "Editable runtime price configuration is valid",
);
check(
  (html.match(/class="price-block"/g) || []).length === 4,
  "Exactly four runtime price cards",
);
check(
  !html.includes('class="price-cny"') &&
    !html.includes('class="price-usd"') &&
    !html.includes('class="price-eur"'),
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
  html.includes('class="pricing-terms"') &&
    html.includes("批发参考价格 · 根据订购数量可议价") &&
    html.includes("Indicative wholesale export prices from Morocco"),
  "Bilingual wholesale pricing terms present",
);
check(
  html.includes("Gisèle") && html.includes("Lassad") && html.includes("Fouad"),
  "All 3 verified contacts present",
);

const files = await readdir(dir, { recursive: true });
check(!files.includes("config/emailjs.json"), "No EmailJS runtime JSON in static export");
const clientScripts = await Promise.all(
  files.filter((file) => file.startsWith("_next/static/") && file.endsWith(".js"))
    .map((file) => readFile(new URL(file, dir), "utf8")),
);
const clientJavaScript = clientScripts.join("\n");
check(
  !clientJavaScript.includes("/config/emailjs.json") &&
    !clientJavaScript.includes("NEXT_PUBLIC_EMAILJS_"),
  "Client JavaScript has no EmailJS runtime configuration or environment dependency",
);
check(
  Object.values(EMAILJS_CONFIG).every((value) =>
    clientJavaScript.includes(JSON.stringify(value))),
  "All four public EmailJS identifiers are bundled from TypeScript",
);
console.log(isEmailJSConfigured()
  ? "EmailJS public identifiers configured; provider delivery requires separate verification."
  : "EmailJS unavailable; manual contact remains supported.");
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
