import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let sessionToken = "";
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (sessionToken ? { value: sessionToken } : undefined) }),
}));

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("authenticated administration", () => {
  let prisma: import("@prisma/client").PrismaClient;
  let originalPrice = "";
  let originalZh = "";
  let originalEn = "";
  let adminId = "";

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const [{ createPrismaClient }, { seedProducts }, { createAdmin }, { createSession, PrismaSessionRepository }] =
      await Promise.all([
        import("../../src/lib/db/client"),
        import("../../prisma/seed"),
        import("../../src/lib/auth/admin"),
        import("../../src/lib/auth/session"),
      ]);
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL!);
    await seedProducts(prisma);
    await prisma.adminUser.deleteMany({ where: { email: "admin-integration@example.test" } });
    const admin = await createAdmin("admin-integration@example.test", "Atlas-Gold-2026!Safe", prisma);
    adminId = admin.id;
    sessionToken = (await createSession(admin.id, { repository: new PrismaSessionRepository(prisma) })).token;

    const product = await prisma.product.findUniqueOrThrow({ where: { id: "500ml" }, include: { translations: true } });
    originalPrice = product.usdPrice.toFixed(2);
    originalZh = product.translations.find((translation) => translation.locale === "zh-CN")!.description;
    originalEn = product.translations.find((translation) => translation.locale === "en")!.description;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.product.update({ where: { id: "500ml" }, data: { usdPrice: originalPrice } });
    await prisma.productTranslation.update({
      where: { productId_locale: { productId: "500ml", locale: "zh-CN" } },
      data: { description: originalZh },
    });
    await prisma.productTranslation.update({
      where: { productId_locale: { productId: "500ml", locale: "en" } },
      data: { description: originalEn },
    });
    await prisma.auditLog.deleteMany({ where: { actorId: adminId } });
    await prisma.adminUser.deleteMany({ where: { id: adminId } });
    await prisma.$disconnect();
  });

  it("updates an allowed field and writes its audit event in the same operation", async () => {
    const { updateProduct } = await import("../../src/lib/admin/products");
    await updateProduct({
      id: "500ml",
      usdPrice: "7.35",
      zhDescription: "管理端集成测试说明。",
      enDescription: "Admin integration test description.",
    });
    expect((await prisma.product.findUniqueOrThrow({ where: { id: "500ml" } })).usdPrice.toFixed(2)).toBe("7.35");
    expect(await prisma.auditLog.findFirst({ where: { actorId: adminId, action: "product.update" } })).not.toBeNull();
  });
});
