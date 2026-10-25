import { ASSET_PATHS } from "@/lib/assets";

export type ProductId = "250ml" | "500ml" | "750ml" | "5l";

export type ProductSpec = Readonly<{
  id: ProductId;
  slug: ProductId;
  capacityMl: number;
  capacityLitres: string;
  referenceUsd: string;
  imagePath: string;
  displayOrder: number;
  professional: boolean;
  packageType: "bottle" | "tin";
}>;

export const PRODUCT_SPECS = [
  {
    id: "250ml",
    slug: "250ml",
    capacityMl: 250,
    capacityLitres: "0.250",
    referenceUsd: "4.00",
    imagePath: `/${ASSET_PATHS.products["250ml"]}`,
    displayOrder: 1,
    professional: false,
    packageType: "bottle",
  },
  {
    id: "500ml",
    slug: "500ml",
    capacityMl: 500,
    capacityLitres: "0.500",
    referenceUsd: "7.30",
    imagePath: `/${ASSET_PATHS.products["500ml"]}`,
    displayOrder: 2,
    professional: false,
    packageType: "bottle",
  },
  {
    id: "750ml",
    slug: "750ml",
    capacityMl: 750,
    capacityLitres: "0.750",
    referenceUsd: "10.10",
    imagePath: `/${ASSET_PATHS.products["750ml"]}`,
    displayOrder: 3,
    professional: false,
    packageType: "bottle",
  },
  {
    id: "5l",
    slug: "5l",
    capacityMl: 5000,
    capacityLitres: "5.000",
    referenceUsd: "38.50",
    imagePath: `/${ASSET_PATHS.products["5l"]}`,
    displayOrder: 4,
    professional: true,
    packageType: "tin",
  },
] as const satisfies readonly ProductSpec[];

export async function getPublicProducts() {
  const { prisma } = await import("@/lib/db/client");

  return prisma.product.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    include: { translations: true },
  });
}
