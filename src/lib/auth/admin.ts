import type { PrismaClient } from "@prisma/client";
import { checkLoginRateLimit } from "./login-rate-limit";
import { hashPassword, verifyPassword } from "./password";

async function defaultClient(): Promise<PrismaClient> {
  const { prisma } = await import("@/lib/db/client");
  return prisma;
}

export async function createAdmin(email: string, password: string, client?: PrismaClient) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("A valid administrator email is required");
  const passwordHash = await hashPassword(password);
  return (client ?? (await defaultClient())).adminUser.create({
    data: { email: normalizedEmail, passwordHash, role: "ADMIN", active: true },
    select: { id: true, email: true, role: true, active: true },
  });
}

type AuthenticateDependencies = Readonly<{
  client?: PrismaClient;
  rateLimitSecret?: string;
}>;

export async function authenticateAdmin(
  email: string,
  password: string,
  networkKey: string,
  dependencies: AuthenticateDependencies = {},
) {
  const normalizedEmail = email.trim().toLowerCase();
  const limit = await checkLoginRateLimit(networkKey, normalizedEmail, { secret: dependencies.rateLimitSecret });
  if (!limit.allowed) return null;

  const client = dependencies.client ?? (await defaultClient());
  const user = await client.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (!user?.active || !(await verifyPassword(password, user.passwordHash))) return null;
  await client.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { id: user.id, email: user.email, role: user.role, active: user.active };
}
