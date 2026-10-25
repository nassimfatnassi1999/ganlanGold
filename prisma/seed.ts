import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";
import { createPrismaClient } from "../src/lib/db/client";
import { PRODUCT_SPECS } from "../src/lib/products/catalog";
import zh from "../src/i18n/zh-CN.json" with { type: "json" };
import en from "../src/i18n/en.json" with { type: "json" };

export async function seedProducts(client: PrismaClient) {
  for (const product of PRODUCT_SPECS) {
    const zhDescription = zh.products.descriptions[product.id];
    const enDescription = en.products.descriptions[product.id];
    const capacityName = product.id === "5l" ? "5 L" : `${product.capacityMl} ml`;

    await client.product.upsert({
      where: { id: product.id },
      update: {
        imagePath: product.imagePath,
        displayOrder: product.displayOrder,
        professional: product.professional,
        active: true,
      },
      create: {
        id: product.id,
        slug: product.slug,
        capacityMl: product.capacityMl,
        capacityLitres: product.capacityLitres,
        usdPrice: product.referenceUsd,
        imagePath: product.imagePath,
        displayOrder: product.displayOrder,
        professional: product.professional,
        translations: {
          create: [
            {
              locale: "zh-CN",
              name: `${capacityName} ${zh.products.label}`,
              description: zhDescription,
              label: zh.products.label,
            },
            {
              locale: "en",
              name: `${capacityName} ${en.products.label}`,
              description: enDescription,
              label: en.products.label,
            },
          ],
        },
      },
    });
  }
}

async function main() {
  const client = createPrismaClient();
  try {
    await seedProducts(client);
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
