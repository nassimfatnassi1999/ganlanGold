import { PublicExperience } from "@/components/sections/PublicExperience";
import { loadPublicProducts, loadPublicRate } from "@/lib/public-site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, rate] = await Promise.all([loadPublicProducts(), loadPublicRate()]);
  return <PublicExperience products={products} rate={rate} />;
}
