/**
 * Live CNY → USD / EUR reference rates for the price cards.
 *
 * Rates are the official European Central Bank reference rates, served by the
 * free Frankfurter API (no key, CORS enabled, published once per working day).
 * The feed is optional: when it cannot be reached (for example from some
 * networks in mainland China), the page falls back to the last valid rate seen
 * by this browser, then to the manual USD/EUR values in `config/prices.json`.
 */

export const EXCHANGE_RATES_URL =
  "https://api.frankfurter.dev/v2/providers/ecb/rates?base=CNY&quotes=USD,EUR";

export const EXCHANGE_RATES_STORAGE_KEY = "ganlan-ecb-rates";

const REQUEST_TIMEOUT_MS = 6000;

/** Plausible bounds for one yuan in USD or EUR; anything outside is rejected as bad data. */
const MIN_RATE = 0.05;
const MAX_RATE = 0.5;

/** Amount of USD and EUR for one CNY, with the ECB publication date (YYYY-MM-DD). */
export type ExchangeRates = Readonly<{
  usd: number;
  eur: number;
  date: string;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= MIN_RATE && value <= MAX_RATE;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Parse the Frankfurter v2 response: `[{ date, base, quote, rate }, …]`. */
export function parseExchangeRates(value: unknown): ExchangeRates | null {
  if (!Array.isArray(value)) return null;

  let usd: number | undefined;
  let eur: number | undefined;
  let date: string | undefined;

  for (const row of value) {
    if (!isRecord(row) || row.base !== "CNY") continue;
    if (row.quote !== "USD" && row.quote !== "EUR") continue;
    if (!isRate(row.rate) || !isIsoDate(row.date)) return null;

    if (row.quote === "USD") usd = row.rate;
    else eur = row.rate;
    // Show the older date if the two quotes were ever published on different days.
    if (date === undefined || row.date < date) date = row.date;
  }

  if (usd === undefined || eur === undefined || date === undefined) return null;
  return { usd, eur, date };
}

/** Validate a previously stored rate object (same shape as ExchangeRates). */
export function parseStoredExchangeRates(value: unknown): ExchangeRates | null {
  if (!isRecord(value) || !isRate(value.usd) || !isRate(value.eur) || !isIsoDate(value.date)) return null;
  return { usd: value.usd, eur: value.eur, date: value.date };
}

/** Convert a whole-yuan price and format it with two decimals, e.g. 16 × 0.14987 → "2.40". */
export function convertCny(cny: number, rate: number): string {
  return (Math.round(cny * rate * 100) / 100).toFixed(2);
}

export async function loadExchangeRates(signal?: AbortSignal): Promise<ExchangeRates> {
  // A slow or blocked feed must never hold the price cards: give up after a few seconds.
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, REQUEST_TIMEOUT_MS);
  signal?.addEventListener("abort", abort, { once: true });

  try {
    const response = await fetch(EXCHANGE_RATES_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`Exchange-rate request failed (${response.status})`);

    const rates = parseExchangeRates(await response.json());
    if (!rates) throw new Error("Exchange-rate response is invalid");
    return rates;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export function readStoredExchangeRates(): ExchangeRates | null {
  try {
    const raw = window.localStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);
    return raw ? parseStoredExchangeRates(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function storeExchangeRates(rates: ExchangeRates): void {
  try {
    window.localStorage.setItem(EXCHANGE_RATES_STORAGE_KEY, JSON.stringify(rates));
  } catch {
    // Private browsing or blocked storage: the live rate still shows for this visit.
  }
}
