import { consumeRateLimit, type RateLimitStore } from "@/lib/security/rate-limit";

type LoginLimitDependencies = Readonly<{ store?: RateLimitStore; now?: Date; secret?: string }>;

export function checkLoginRateLimit(networkKey: string, email: string, dependencies: LoginLimitDependencies = {}) {
  return consumeRateLimit("admin-login", `${networkKey}:${email.trim().toLowerCase()}`, { limit: 5, windowMs: 15 * 60_000 }, dependencies);
}
