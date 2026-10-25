import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { createAuditEntry, recordAudit } from "./audit";

const productIds = ["250ml", "500ml", "750ml", "5l"] as const;

export const productUpdateSchema = z
  .object({
    id: z.enum(productIds),
    usdPrice: z.string().regex(/^(?:0\.[0-9]{2}|[1-9][0-9]{0,3}\.[0-9]{2})$/).refine((value) => Number(value) > 0),
    zhDescription: z.string().trim().min(1).max(2_000),
    enDescription: z.string().trim().min(1).max(2_000),
  })
  .strict();

export async function listProductsForAdmin() {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  return prisma.product.findMany({ include: { translations: true }, orderBy: { displayOrder: "asc" } });
}

export async function updateProduct(input: unknown, ipHash?: string) {
  const session = await requireAdmin();
  const parsed = productUpdateSchema.parse(input);
  const { prisma } = await import("@/lib/db/client");

  return prisma.$transaction(async (tx) => {
    const before = await tx.product.findUniqueOrThrow({
      where: { id: parsed.id },
      include: { translations: true },
    });
    const [product] = await Promise.all([
      tx.product.update({ where: { id: parsed.id }, data: { usdPrice: parsed.usdPrice } }),
      tx.productTranslation.update({
        where: { productId_locale: { productId: parsed.id, locale: "zh-CN" } },
        data: { description: parsed.zhDescription, approvedAt: new Date() },
      }),
      tx.productTranslation.update({
        where: { productId_locale: { productId: parsed.id, locale: "en" } },
        data: { description: parsed.enDescription, approvedAt: new Date() },
      }),
    ]);
    await recordAudit(
      tx,
      createAuditEntry({
        actorId: session.user.id,
        action: "product.update",
        entityType: "Product",
        entityId: parsed.id,
        before: JSON.parse(JSON.stringify(before)),
        after: parsed,
        ipHash,
      }),
    );
    return product;
  });
}
