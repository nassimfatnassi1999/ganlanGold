import type { ProductId } from "@/lib/products/catalog";

export const PRODUCT_IDS = ["250ml", "500ml", "750ml", "5l"] as const satisfies readonly ProductId[];

/**
 * One product price from `config/prices.json`.
 * `cny` is the main price. `usd` and `eur` are manual reference equivalents,
 * shown only when live exchange rates cannot be loaded (null when missing).
 */
export type RuntimePrice = Readonly<{
  cny: number;
  usd: string | null;
  eur: string | null;
}>;

/** Products whose price could be read. A missing product shows "price unavailable" on its own card only. */
export type PriceConfig = Readonly<Partial<Record<ProductId, RuntimePrice>>>;

const AMOUNT_PATTERN = /^(0|[1-9]\d*)\.\d{2}$/;
const NUMBER_PATTERN = /^\d+(\.\d{1,2})?$/;

const ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];
const REQUEST_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** "750ML", " 750 ml", "5L" → "750ml", "5l". */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

/** Accept 6.3, "6.3" or "6.30" (max two decimals) and return a positive number, else null. */
function readAmount(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.round(value * 100) / 100 === value ? value : null;
  }
  if (typeof value === "string" && NUMBER_PATTERN.test(value.trim())) {
    const amount = Number(value.trim());
    return amount > 0 ? amount : null;
  }
  return null;
}

function readPrice(value: unknown): RuntimePrice | null {
  if (!isRecord(value)) return null;
  const cny = readAmount(value.cny);
  if (cny === null) return null;
  const usd = readAmount(value.usd);
  const eur = readAmount(value.eur);
  return { cny, usd: usd === null ? null : usd.toFixed(2), eur: eur === null ? null : eur.toFixed(2) };
}

/**
 * Lenient reader used by the browser.
 *
 * The page HTML and JavaScript can stay cached on a CDN or in a browser while the
 * price file changes every day. The reader therefore ignores unknown keys, accepts
 * numbers written as text, and keeps every product that is readable. Only a product
 * without a usable CNY price is treated as unavailable; a wrong amount is never shown.
 * Returns null when no product at all can be read.
 */
export function parsePriceConfig(value: unknown): PriceConfig | null {
  if (!isRecord(value)) return null;

  const prices: Partial<Record<ProductId, RuntimePrice>> = {};
  for (const [key, entry] of Object.entries(value)) {
    const id = PRODUCT_IDS.find((productId) => productId === normalizeKey(key));
    if (!id || prices[id]) continue;
    const price = readPrice(entry);
    if (price) prices[id] = price;
  }

  return Object.keys(prices).length > 0 ? prices : null;
}

/**
 * Strict check used before a price file is published (scripts, GitHub Actions, check-dist).
 * The published format stays exactly the one every deployed version of the site understands:
 * the four products, `cny` a positive whole number, `usd` / `eur` text with two decimals.
 * Returns a list of readable problems; an empty list means the file can be published.
 */
export function findPriceFileErrors(value: unknown): string[] {
  if (!isRecord(value)) return ["Le fichier doit contenir un objet JSON { … }."];

  const errors: string[] = [];
  for (const key of Object.keys(value)) {
    if (!(PRODUCT_IDS as readonly string[]).includes(key)) {
      errors.push(`Clé inconnue "${key}" : seules ${PRODUCT_IDS.map((id) => `"${id}"`).join(", ")} sont permises.`);
    }
  }

  for (const id of PRODUCT_IDS) {
    const price = value[id];
    if (!isRecord(price)) {
      errors.push(`"${id}" est absent ou n'est pas un objet { "cny": …, "usd": …, "eur": … }.`);
      continue;
    }
    const extra = Object.keys(price).filter((field) => !["cny", "usd", "eur"].includes(field));
    if (extra.length) errors.push(`"${id}" contient des champs inconnus : ${extra.join(", ")}.`);
    if (!Number.isSafeInteger(price.cny) || (price.cny as number) <= 0) {
      errors.push(`"${id}".cny doit être un nombre entier positif sans guillemets (ex. 43).`);
    }
    for (const currency of ["usd", "eur"] as const) {
      if (typeof price[currency] !== "string" || !AMOUNT_PATTERN.test(price[currency] as string)) {
        errors.push(`"${id}".${currency} doit être un texte avec deux décimales (ex. "6.30").`);
      }
    }
  }
  return errors;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

async function fetchPriceConfigOnce(signal?: AbortSignal): Promise<PriceConfig> {
  // A hanging network must not leave the cards on "loading" forever.
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, REQUEST_TIMEOUT_MS);
  signal?.addEventListener("abort", abort, { once: true });

  try {
    const url = new URL("/config/prices.json", window.location.origin);
    // A new query string on every visit: no CDN or browser can return an old copy.
    url.searchParams.set("v", Date.now().toString());

    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`Price configuration request failed (${response.status})`);

    const prices = parsePriceConfig(JSON.parse(await response.text()));
    if (!prices) throw new Error("Price configuration is invalid");
    return prices;
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) throw new Error("Price configuration request timed out");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

/** Load the price file, retrying twice on a network or server hiccup. */
export async function loadPriceConfig(signal?: AbortSignal): Promise<PriceConfig> {
  let lastError: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    if (attempt > 0) await wait(RETRY_DELAYS_MS[attempt - 1], signal);
    try {
      return await fetchPriceConfigOnce(signal);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

/** "¥43" for whole yuan, "¥43.50" otherwise. */
export function formatCny(cny: number): string {
  return Number.isInteger(cny) ? String(cny) : cny.toFixed(2);
}
