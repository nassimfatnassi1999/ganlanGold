const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  try {
    const url = new URL(value || LOCAL_SITE_URL);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported site URL protocol");
    return url.origin;
  } catch {
    return LOCAL_SITE_URL;
  }
}
