import { NextResponse } from "next/server";
import { AuthorizationError, requireAdmin } from "@/lib/auth/dal";
import { serializeQuotesCsv } from "@/lib/admin/csv";

export async function GET() {
  try {
    await requireAdmin();
    const { prisma } = await import("@/lib/db/client");
    const quotes = await prisma.quoteRequest.findMany({ orderBy: { submittedAt: "desc" } });
    const csv = serializeQuotesCsv(quotes.map((quote) => ({
      requestId: quote.requestId,
      company: quote.company,
      country: quote.country,
      contact: [quote.contactPerson, quote.email, quote.wechat].filter(Boolean).join(" | "),
      destinationPort: quote.destinationPort,
      totalLitres: quote.totalLitres.toFixed(3),
      status: quote.status,
      submittedAt: quote.submittedAt,
      message: quote.message,
    })));
    return new NextResponse(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="ganlan-gold-quotes-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
  }
}
