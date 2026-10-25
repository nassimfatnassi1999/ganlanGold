import { afterAll, beforeAll, describe, expect, it } from "vitest";

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("administrator authentication persistence", () => {
  let prisma: import("@prisma/client").PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const { createPrismaClient } = await import("../../src/lib/db/client");
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL!);
    await prisma.adminUser.deleteMany({ where: { email: "auth-integration@example.test" } });
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.adminUser.deleteMany({ where: { email: "auth-integration@example.test" } });
    await prisma.$disconnect();
  });

  it("creates and verifies an opaque persisted session", async () => {
    const [{ createAdmin }, { createSession, PrismaSessionRepository, verifySessionToken }] = await Promise.all([
      import("../../src/lib/auth/admin"),
      import("../../src/lib/auth/session"),
    ]);
    const admin = await createAdmin("auth-integration@example.test", "Maroc-Gold-2026!Safe", prisma);
    const repository = new PrismaSessionRepository(prisma);
    const { token } = await createSession(admin.id, { repository });
    expect(await verifySessionToken(token, { repository })).toMatchObject({ user: { email: admin.email } });
    expect(await prisma.adminSession.findFirst({ where: { userId: admin.id, tokenHash: token } })).toBeNull();
  });
});
