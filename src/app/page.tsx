import { PublicExperience } from "@/components/sections/PublicExperience";
import { PRODUCT_SPECS } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";

const products = PRODUCT_SPECS.map((product) => ({
  ...product,
  zhDescription: zh.products.descriptions[product.id],
  enDescription: en.products.descriptions[product.id],
}));

export default function HomePage() {
  return <PublicExperience products={products} />;
}
