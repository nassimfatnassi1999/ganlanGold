import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("lead persistence", () => {
  let prisma: import("@prisma/client").PrismaClient;
  let repository: import("../../src/lib/leads/service").PrismaLeadRepository;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const [{ createPrismaClient }, { PrismaLeadRepository }, { seedProducts }] = await Promise.all([
      import("../../src/lib/db/client"),
      import("../../src/lib/leads/service"),
      import("../../prisma/seed"),
    ]);
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL!);
    repository = new PrismaLeadRepository(prisma);
    await seedProducts(prisma);
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.quoteRequest.deleteMany({ where: { company: "Concurrent Integration Buyer" } });
    await prisma.$disconnect();
  });

  it("persists one request for concurrent duplicate submissions", async () => {
    const { submitQuote } = await import("../../src/lib/leads/service");
    const input = {
      company: "Concurrent Integration Buyer",
      country: "China",
      contactPerson: "Test Buyer",
      email: "integration@example.test",
      destinationPort: "Nansha",
      products: [{ productId: "500ml", quantity: 15000 }],
      consent: true,
      website: "",
    };
    const dependencies = {
      repository,
      notify: vi.fn().mockResolvedValue({ status: "not-configured" as const }),
      fingerprintSecret: "integration-fingerprint-secret",
      createRequestId: () => "GGQ-20261025-CONCURRENT",
    };
    const results = await Promise.all([
      submitQuote(input, { now: new Date("2026-10-25T10:00:00Z") }, dependencies),
      submitQuote(input, { now: new Date("2026-10-25T10:00:00Z") }, dependencies),
    ]);
    expect(new Set(results.map((result) => result.requestId))).toEqual(new Set(["GGQ-20261025-CONCURRENT"]));
    expect(await prisma.quoteRequest.count({ where: { company: input.company } })).toBe(1);
  });
});
