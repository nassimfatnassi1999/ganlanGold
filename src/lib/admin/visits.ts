import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { createAuditEntry, recordAudit } from "./audit";

export const visitStatuses = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED", "DECLINED"] as const;
export const visitUpdateSchema = z
  .object({
    requestId: z.string().trim().min(1).max(40),
    status: z.enum(visitStatuses),
    internalNotes: z.string().trim().max(4_000),
  })
  .strict();

export async function listVisits(options: { status?: (typeof visitStatuses)[number]; query?: string } = {}) {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  const query = options.query?.trim();
  return prisma.visitRequest.findMany({
    where: {
      ...(options.status ? { status: options.status } : {}),
      ...(query
        ? {
            OR: [
              { requestId: { contains: query, mode: "insensitive" as const } },
              { company: { contains: query, mode: "insensitive" as const } },
              { country: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getVisit(requestId: string) {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  return prisma.visitRequest.findUnique({ where: { requestId } });
}

export async function updateVisit(input: unknown, ipHash?: string) {
  const session = await requireAdmin();
  const parsed = visitUpdateSchema.parse(input);
  const { prisma } = await import("@/lib/db/client");
  return prisma.$transaction(async (tx) => {
    const before = await tx.visitRequest.findUniqueOrThrow({ where: { requestId: parsed.requestId } });
    const after = await tx.visitRequest.update({
      where: { requestId: parsed.requestId },
      data: { status: parsed.status, internalNotes: parsed.internalNotes || null },
    });
    await recordAudit(
      tx,
      createAuditEntry({
        actorId: session.user.id,
        action: "visit.update",
        entityType: "VisitRequest",
        entityId: parsed.requestId,
        before: JSON.parse(JSON.stringify(before)),
        after: JSON.parse(JSON.stringify(after)),
        ipHash,
      }),
    );
    return after;
  });
}
