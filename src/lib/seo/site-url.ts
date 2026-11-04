/**
 * Public origin used for canonical links, Open Graph, robots.txt and sitemap.xml.
 * Production domain by default, so a build without NEXT_PUBLIC_SITE_URL never
 * publishes "http://localhost:3000" links. Override it for another host (e.g. Netlify).
 */
export const DEFAULT_SITE_URL = "https://www.ganlangold.com";

export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  try {
    const url = new URL(value || DEFAULT_SITE_URL);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported site URL protocol");
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
