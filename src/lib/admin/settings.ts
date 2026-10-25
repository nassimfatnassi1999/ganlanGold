import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { createAuditEntry, recordAudit } from "./audit";

export const editableSettingKeys = [
  "meta.description.zh-CN",
  "meta.description.en",
  "contact.gisele.phone",
  "contact.lassad.whatsapp",
  "contact.fouad.whatsapp",
] as const;

export const settingUpdateSchema = z
  .object({ key: z.enum(editableSettingKeys), value: z.string().trim().min(1).max(2_000) })
  .strict();

export async function listEditableSettings() {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  return prisma.siteSetting.findMany({ where: { key: { in: [...editableSettingKeys] } }, orderBy: { key: "asc" } });
}

export async function updateSetting(input: unknown, ipHash?: string) {
  const session = await requireAdmin();
  const parsed = settingUpdateSchema.parse(input);
  const { prisma } = await import("@/lib/db/client");
  return prisma.$transaction(async (tx) => {
    const before = await tx.siteSetting.findUnique({ where: { key: parsed.key } });
    if (before?.locked) throw new Error("This setting is locked");
    const after = await tx.siteSetting.upsert({
      where: { key: parsed.key },
      create: { key: parsed.key, value: parsed.value, updatedById: session.user.id },
      update: { value: parsed.value, updatedById: session.user.id },
    });
    await recordAudit(
      tx,
      createAuditEntry({
        actorId: session.user.id,
        action: "setting.update",
        entityType: "SiteSetting",
        entityId: parsed.key,
        before: before ? JSON.parse(JSON.stringify(before)) : null,
        after: JSON.parse(JSON.stringify(after)),
        ipHash,
      }),
    );
    return after;
  });
}
