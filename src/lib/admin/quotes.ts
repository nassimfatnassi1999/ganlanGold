import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { createAuditEntry, recordAudit } from "./audit";

export const quoteStatuses = ["NEW", "CONTACTED", "IN_NEGOTIATION", "QUOTED", "CLOSED"] as const;
export const quoteUpdateSchema = z
  .object({
    requestId: z.string().trim().min(1).max(40),
    status: z.enum(quoteStatuses),
    internalNotes: z.string().trim().max(4_000),
  })
  .strict();

export async function listQuotes(options: { status?: (typeof quoteStatuses)[number]; query?: string } = {}) {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  const query = options.query?.trim();
  return prisma.quoteRequest.findMany({
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
    include: { items: { include: { product: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getQuote(requestId: string) {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  return prisma.quoteRequest.findUnique({
    where: { requestId },
    include: { items: { include: { product: true } } },
  });
}

export async function updateQuote(input: unknown, ipHash?: string) {
  const session = await requireAdmin();
  const parsed = quoteUpdateSchema.parse(input);
  const { prisma } = await import("@/lib/db/client");
  return prisma.$transaction(async (tx) => {
    const before = await tx.quoteRequest.findUniqueOrThrow({ where: { requestId: parsed.requestId } });
    const after = await tx.quoteRequest.update({
      where: { requestId: parsed.requestId },
      data: { status: parsed.status, internalNotes: parsed.internalNotes || null },
    });
    await recordAudit(
      tx,
      createAuditEntry({
        actorId: session.user.id,
        action: "quote.update",
        entityType: "QuoteRequest",
        entityId: parsed.requestId,
        before: JSON.parse(JSON.stringify(before)),
        after: JSON.parse(JSON.stringify(after)),
        ipHash,
      }),
    );
    return after;
  });
}
