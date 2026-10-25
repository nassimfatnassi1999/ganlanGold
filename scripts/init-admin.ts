import { createAdmin } from "../src/lib/auth/admin";
import { prisma } from "../src/lib/db/client";

const email = process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD. No default credentials are provided.");
  process.exitCode = 1;
} else {
  try {
    const existingCount = await prisma.adminUser.count();
    if (existingCount > 0) throw new Error("An administrator already exists; initial setup is disabled.");
    const admin = await createAdmin(email, password, prisma);
    console.log(`Administrator created for ${admin.email}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Administrator setup failed.");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
