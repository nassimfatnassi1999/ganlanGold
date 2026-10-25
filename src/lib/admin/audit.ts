import { Prisma, type PrismaClient } from "@prisma/client";

export type AuditEntry = Readonly<{
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Prisma.InputJsonValue | null;
  after: Prisma.InputJsonValue | null;
  ipHash: string | null;
}>;

export function createAuditEntry(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  ipHash?: string | null;
}): AuditEntry {
  return {
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    ipHash: input.ipHash ?? null,
  };
}

export async function recordAudit(
  client: PrismaClient | Prisma.TransactionClient,
  entry: AuditEntry,
): Promise<void> {
  const data: Prisma.AuditLogUncheckedCreateInput = {
    ...entry,
    before: entry.before === null ? Prisma.DbNull : entry.before,
    after: entry.after === null ? Prisma.DbNull : entry.after,
  };
  await client.auditLog.create({ data });
}
