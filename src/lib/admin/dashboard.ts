import { requireAdmin } from "@/lib/auth/dal";

export async function getDashboardData() {
  await requireAdmin();
  const { prisma } = await import("@/lib/db/client");
  const [quoteCount, newQuoteCount, visitCount, newVisitCount, recentQuotes, recentVisits, currentRate] = await Promise.all([
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.visitRequest.count(),
    prisma.visitRequest.count({ where: { status: "NEW" } }),
    prisma.quoteRequest.findMany({ take: 5, orderBy: { submittedAt: "desc" } }),
    prisma.visitRequest.findMany({ take: 5, orderBy: { submittedAt: "desc" } }),
    prisma.exchangeRate.findFirst({ where: { status: "VALID" }, orderBy: { attemptedAt: "desc" } }),
  ]);
  return { quoteCount, newQuoteCount, visitCount, newVisitCount, recentQuotes, recentVisits, currentRate };
}
