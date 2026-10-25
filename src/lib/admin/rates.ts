import { requireAdmin } from "@/lib/auth/dal";
import { PrismaExchangeRateRepository, refreshExchangeRate } from "@/lib/currency/service";
import { createAuditEntry, recordAudit } from "./audit";

export async function listExchangeRateHistory() {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  return prisma.exchangeRate.findMany({ take: 100, orderBy: { attemptedAt: "desc" } });
}

export async function refreshExchangeRateAsAdmin(ipHash?: string) {
  const session = await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  const result = await refreshExchangeRate({ repository: new PrismaExchangeRateRepository(prisma) });
  await recordAudit(
    prisma,
    createAuditEntry({
      actorId: session.user.id,
      action: "exchange-rate.refresh",
      entityType: "ExchangeRate",
      after: JSON.parse(JSON.stringify(result)),
      ipHash,
    }),
  );
  return result;
}
