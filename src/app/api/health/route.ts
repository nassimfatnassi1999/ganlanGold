import { NextResponse } from "next/server";

type HealthDependencies = Readonly<{ checkDatabase: () => Promise<boolean> }>;

async function checkDatabase(): Promise<boolean> {
  const { prisma } = await import("@/lib/db/client");
  await Promise.race([
    prisma.$queryRaw`SELECT 1`,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Database health check timed out")), 2_000)),
  ]);
  return true;
}

export function createHealthHandler({ checkDatabase: check }: HealthDependencies) {
  return async function healthHandler() {
    try {
      if (!(await check())) throw new Error("Database is not reachable");
      return NextResponse.json(
        { status: "ok", database: "reachable" },
        { status: 200, headers: { "cache-control": "no-store" } },
      );
    } catch {
      return NextResponse.json(
        { status: "unavailable", database: "unreachable" },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
  };
}

export const GET = createHealthHandler({ checkDatabase });
