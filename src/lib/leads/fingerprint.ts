import { createHmac } from "node:crypto";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map(canonicalize);
    const sortableProducts = normalized.every(
      (item) => typeof item === "object" && item !== null && "productId" in item,
    );
    return sortableProducts
      ? [...normalized].sort((left, right) =>
          String((left as { productId: unknown }).productId).localeCompare(String((right as { productId: unknown }).productId)),
        )
      : normalized;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }

  return typeof value === "string" ? value.trim() : value;
}

export function createSubmissionFingerprint(payload: unknown, secret: string): string {
  if (secret.length < 6) throw new Error("A fingerprint secret is required");
  return createHmac("sha256", secret).update(JSON.stringify(canonicalize(payload))).digest("hex");
}
