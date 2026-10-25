import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

const PUBLIC_ROUTES = ["/", "/privacy", "/legal", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return PUBLIC_ROUTES.map((path, index) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.4,
  }));
}
