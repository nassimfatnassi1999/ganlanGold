import { PRODUCT_SPECS, type ProductId } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import type { PublicProduct, PublicRate } from "@/components/sections/PublicExperience";

function fallbackProducts(): PublicProduct[] {
  return PRODUCT_SPECS.map((product) => ({
    ...product,
    zhDescription: zh.products.descriptions[product.id],
    enDescription: en.products.descriptions[product.id],
  }));
}

export async function loadPublicProducts(): Promise<PublicProduct[]> {
  if (!process.env.DATABASE_URL) return fallbackProducts();
  try {
    const { getPublicProducts } = await import("@/lib/products/catalog");
    const rows = await getPublicProducts();
    if (rows.length !== 4) return fallbackProducts();
    return rows.map((row) => {
      const base = PRODUCT_SPECS.find((product) => product.id === row.id);
      if (!base) throw new Error("Unknown product identity");
      const translation = (locale: string) => row.translations.find((entry) => entry.locale === locale)?.description;
      return {
        ...base,
        referenceUsd: row.usdPrice.toFixed(2),
        imagePath: row.imagePath,
        professional: row.professional,
        zhDescription: translation("zh-CN") ?? zh.products.descriptions[row.id as ProductId],
        enDescription: translation("en") ?? en.products.descriptions[row.id as ProductId],
      };
    });
  } catch {
    return fallbackProducts();
  }
}

export async function loadPublicRate(): Promise<PublicRate> {
  if (!process.env.DATABASE_URL) return { status: "unavailable" };
  try {
    const { getCurrentRateState } = await import("@/lib/currency/service");
    const rate = await getCurrentRateState();
    return rate.status === "available"
      ? { status: "available", usdCny: rate.usdCny, referenceDate: rate.referenceDate, source: rate.source }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
