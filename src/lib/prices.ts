import type { ProductId } from "@/lib/products/catalog";

const PRODUCT_IDS = ["250ml", "500ml", "750ml", "5l"] as const satisfies readonly ProductId[];

export type RuntimePrice = Readonly<{
  cny: number;
  usd: string;
}>;

export type PriceConfig = Readonly<Record<ProductId, RuntimePrice>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePriceConfig(value: unknown): PriceConfig | null {
  if (!isRecord(value) || Object.keys(value).length !== PRODUCT_IDS.length) return null;

  for (const id of PRODUCT_IDS) {
    const price = value[id];
    if (!isRecord(price) || Object.keys(price).length !== 2) return null;
    if (!Number.isSafeInteger(price.cny) || (price.cny as number) <= 0) return null;
    if (typeof price.usd !== "string" || !/^(0|[1-9]\d*)\.\d{2}$/.test(price.usd)) return null;
  }

  return value as PriceConfig;
}

export async function loadPriceConfig(signal?: AbortSignal): Promise<PriceConfig> {
  const url = new URL("/config/prices.json", window.location.origin);
  url.searchParams.set("v", Date.now().toString());

  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Price configuration request failed (${response.status})`);

  const prices = parsePriceConfig(await response.json());
  if (!prices) throw new Error("Price configuration is invalid");
  return prices;
}
