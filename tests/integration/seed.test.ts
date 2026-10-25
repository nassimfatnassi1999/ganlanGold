import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);
const integration = hasDatabase ? describe : describe.skip;

integration("product seed", () => {
  let prisma: import("@prisma/client").PrismaClient;
  let seedProducts: typeof import("../../prisma/seed").seedProducts;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const [{ createPrismaClient }, seedModule] = await Promise.all([
      import("../../src/lib/db/client"),
      import("../../prisma/seed"),
    ]);
    seedProducts = seedModule.seedProducts;
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL!);
    await seedProducts(prisma);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it("upserts exactly four stable product records", async () => {
    const products = await prisma.product.findMany({ orderBy: { displayOrder: "asc" } });
    expect(products).toHaveLength(4);
    expect(products.map((product) => [product.id, product.capacityMl, product.usdPrice.toFixed(2)])).toEqual([
      ["250ml", 250, "4.00"],
      ["500ml", 500, "7.30"],
      ["750ml", 750, "10.10"],
      ["5l", 5000, "38.50"],
    ]);
  });

  it("does not overwrite a price maintained by an administrator on a later seed run", async () => {
    await prisma.product.update({ where: { id: "500ml" }, data: { usdPrice: "7.31" } });
    try {
      await seedProducts(prisma);
      expect((await prisma.product.findUniqueOrThrow({ where: { id: "500ml" } })).usdPrice.toFixed(2)).toBe("7.31");
    } finally {
      await prisma.product.update({ where: { id: "500ml" }, data: { usdPrice: "7.30" } });
    }
  });
});
