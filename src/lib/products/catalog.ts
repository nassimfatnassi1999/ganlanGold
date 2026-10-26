import { ASSET_PATHS } from "@/lib/assets";
export type ProductId = "250ml" | "500ml" | "750ml" | "5l";
export type ProductSpec = Readonly<{
  id: ProductId;
  slug: ProductId;
  capacityMl: number;
  capacityLitres: string;
  imagePath: string;
  displayOrder: number;
  professional: boolean;
  packageType: "bottle" | "tin";
}>;
export const PRODUCT_SPECS: readonly ProductSpec[] = ([
  { id: "250ml", capacityMl: 250, professional: false, packageType: "bottle" },
  { id: "500ml", capacityMl: 500, professional: false, packageType: "bottle" },
  { id: "750ml", capacityMl: 750, professional: false, packageType: "bottle" },
  { id: "5l", capacityMl: 5000, professional: true, packageType: "tin" },
] as const).map((p, index) => ({
  ...p,
  slug: p.id,
  capacityLitres: (p.capacityMl / 1000).toFixed(3),
  imagePath: `/${ASSET_PATHS.products[p.id]}`,
  displayOrder: index + 1,
}));
