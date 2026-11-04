/**
 * Règles d'en-têtes HTTP des fichiers envoyés sur COS (sans dépendance, testées par npm test).
 * EdgeOne doit être réglé sur « suivre l'origine » (遵循源站) pour les appliquer.
 */
import { extname } from "node:path";

export const CACHE = {
  immutable: "public, max-age=31536000, immutable",
  prices: "no-store, no-cache, must-revalidate, max-age=0",
  page: "no-cache",
  image: "public, max-age=604800",
};

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/** En-têtes HTTP de chaque objet, selon son chemin dans le bucket. */
export function headersFor(key) {
  const type = TYPES[extname(key).toLowerCase()] ?? "application/octet-stream";
  let cache = CACHE.page;
  if (key.startsWith("_next/static/")) cache = CACHE.immutable;
  else if (key.startsWith("config/")) cache = CACHE.prices;
  else if (type.startsWith("image/") || type.startsWith("font/")) cache = CACHE.image;
  return { ContentType: type, CacheControl: cache };
}

/** Les pages et données de navigation partent en dernier : elles ne pointent jamais vers un fichier pas encore envoyé. */
export function isPage(key) {
  return [".html", ".txt", ".xml"].includes(extname(key).toLowerCase()) || key.startsWith("config/");
}
