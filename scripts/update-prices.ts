/**
 * Met à jour les prix de manière sûre : `public/config/prices.json` (source) et `dist/config/prices.json`.
 *
 *   npx tsx scripts/update-prices.ts --250ml 16 --500ml 30 --750ml 43 --5l 220
 *   npx tsx scripts/update-prices.ts --750ml 45          (un seul produit)
 *   npx tsx scripts/update-prices.ts --refresh-rates     (recalcule seulement USD / EUR)
 *   npx tsx scripts/update-prices.ts --check             (vérifie le fichier sans rien écrire)
 *
 * Les montants USD / EUR de secours sont recalculés à partir du taux BCE du jour.
 * Le fichier n'est écrit que s'il passe la validation stricte : un fichier invalide n'est jamais publié.
 */
import { appendFile, readFile, writeFile, access } from "node:fs/promises";
import { PRODUCT_IDS, findPriceFileErrors } from "../src/lib/prices.ts";
import { EXCHANGE_RATES_URL, convertCny, parseExchangeRates, type ExchangeRates } from "../src/lib/exchangeRates.ts";

type ProductId = (typeof PRODUCT_IDS)[number];
type PriceFile = Record<ProductId, { cny: number; usd: string; eur: string }>;

const SOURCE = new URL("../public/config/prices.json", import.meta.url);
const DIST = new URL("../dist/config/prices.json", import.meta.url);

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const changes: Partial<Record<ProductId, number>> = {};
  let check = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") { check = true; continue; }
    if (arg === "--refresh-rates") continue;
    const id = PRODUCT_IDS.find((productId) => arg === `--${productId}`);
    if (!id) fail(`Option inconnue : ${arg}`);
    const raw = (argv[index + 1] ?? "").trim();
    index += 1;
    if (raw === "") continue; // champ laissé vide dans le formulaire GitHub : prix inchangé
    if (!/^[1-9]\d*$/.test(raw)) fail(`Prix ${id} invalide : "${raw}". Saisir un nombre entier de yuans, ex. 43.`);
    changes[id] = Number(raw);
  }
  return { changes, check };
}

async function fetchRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(EXCHANGE_RATES_URL, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseExchangeRates(await response.json());
  } catch (error) {
    console.warn(`! Taux BCE indisponible (${(error as Error).message}).`);
    return null;
  }
}

/** Taux implicite du fichier actuel (ex. usd / cny), utilisé seulement si la BCE est injoignable. */
function impliedRate(file: PriceFile, currency: "usd" | "eur"): number {
  const rates = PRODUCT_IDS.map((id) => Number(file[id][currency]) / file[id].cny);
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

function format(file: PriceFile): string {
  const lines = PRODUCT_IDS.map((id) => {
    const { cny, usd, eur } = file[id];
    return `  ${JSON.stringify(id)}: { "cny": ${cny}, "usd": ${JSON.stringify(usd)}, "eur": ${JSON.stringify(eur)} }`;
  });
  return `{\n${lines.join(",\n")}\n}\n`;
}

async function summary(text: string) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

const { changes, check } = parseArgs(process.argv.slice(2));

let current: unknown;
try {
  current = JSON.parse((await readFile(SOURCE, "utf8")).replace(/^﻿/, ""));
} catch (error) {
  fail(`public/config/prices.json illisible : ${(error as Error).message}`);
}
const currentErrors = findPriceFileErrors(current);

if (check) {
  if (currentErrors.length) fail(`Fichier de prix invalide :\n  - ${currentErrors.join("\n  - ")}`);
  console.log("✓ public/config/prices.json est valide.");
  process.exit(0);
}
if (currentErrors.length) fail(`Le fichier actuel est invalide, corrigez-le d'abord :\n  - ${currentErrors.join("\n  - ")}`);

const before = current as PriceFile;
const next = structuredClone(before);
for (const id of PRODUCT_IDS) if (changes[id] !== undefined) next[id].cny = changes[id];

const rates = await fetchRates();
const usdRate = rates?.usd ?? impliedRate(before, "usd");
const eurRate = rates?.eur ?? impliedRate(before, "eur");
for (const id of PRODUCT_IDS) {
  next[id].usd = convertCny(next[id].cny, usdRate);
  next[id].eur = convertCny(next[id].cny, eurRate);
}

const errors = findPriceFileErrors(next);
if (errors.length) fail(`Résultat invalide, rien n'a été écrit :\n  - ${errors.join("\n  - ")}`);

const output = format(next);
await writeFile(SOURCE, output);
try {
  await access(new URL("../dist/config/", import.meta.url));
  await writeFile(DIST, output);
} catch {
  // Pas de dossier dist/ (clone sans build) : seule la source est mise à jour.
}

await summary("### Prix GANLAN GOLD\n");
await summary(rates
  ? `Taux BCE du ${rates.date} : 1 CNY = ${rates.usd} USD = ${rates.eur} EUR\n`
  : "Taux BCE indisponible : USD / EUR recalculés avec le taux implicite de l'ancien fichier.\n");
await summary("| Produit | CNY | USD | EUR |\n|---|---|---|---|");
for (const id of PRODUCT_IDS) {
  const changed = before[id].cny !== next[id].cny ? ` (avant ${before[id].cny})` : "";
  await summary(`| ${id} | ${next[id].cny}${changed} | ${next[id].usd} | ${next[id].eur} |`);
}
