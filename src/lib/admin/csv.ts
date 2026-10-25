export type QuoteCsvRow = Readonly<{
  requestId: string;
  company: string;
  country: string;
  contact: string;
  destinationPort: string;
  totalLitres: string;
  status: string;
  submittedAt: Date;
  message: string | null;
}>;

function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string): string {
  const safe = neutralizeFormula(value);
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function serializeQuotesCsv(rows: readonly QuoteCsvRow[]): string {
  const headings = [
    "requestId",
    "company",
    "country",
    "contact",
    "destinationPort",
    "totalLitres",
    "status",
    "submittedAt",
    "message",
  ];
  return [
    headings.join(","),
    ...rows.map((row) =>
      [
        row.requestId,
        row.company,
        row.country,
        row.contact,
        row.destinationPort,
        row.totalLitres,
        row.status,
        row.submittedAt.toISOString(),
        row.message ?? "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\r\n");
}
