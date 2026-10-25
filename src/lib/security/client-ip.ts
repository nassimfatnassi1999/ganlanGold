import { createHmac } from "node:crypto";

export function getClientAddress(request: Request, trustProxy = process.env.TRUST_PROXY === "true"): string {
  if (!trustProxy) return "untrusted-proxy";
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function hashClientKey(value: string, secret: string): string {
  if (secret.length < 16) throw new Error("A client-key hashing secret of at least 16 characters is required");
  return createHmac("sha256", secret).update(value).digest("hex");
}
