import { describe, expect, it } from "vitest";
import { serializeQuotesCsv } from "./csv";

describe("serializeQuotesCsv", () => {
  it("neutralizes every spreadsheet formula prefix and preserves Unicode", () => {
    const csv = serializeQuotesCsv([
      {
        requestId: "GGQ-1",
        company: "=HYPERLINK(\"https://bad\")",
        country: "+SUM(1,1)",
        contact: "-2+3",
        destinationPort: "@cmd",
        totalLitres: "7500.000",
        status: "NEW",
        submittedAt: new Date("2026-10-25T10:00:00Z"),
        message: "\tFORMULA\rNEXT 中文",
      },
    ]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+SUM");
    expect(csv).toContain("'-2+3");
    expect(csv).toContain("'@cmd");
    expect(csv).toContain("'\tFORMULA");
    expect(csv).toContain("中文");
  });

  it("quotes commas, quotes, and line breaks according to CSV rules", () => {
    const csv = serializeQuotesCsv([
      {
        requestId: "GGQ-1",
        company: "Atlas, Ltd",
        country: "China",
        contact: "Li \"Buyer\"",
        destinationPort: "Nansha",
        totalLitres: "7500.000",
        status: "NEW",
        submittedAt: new Date("2026-10-25T10:00:00Z"),
        message: "Line one\nLine two",
      },
    ]);
    expect(csv).toContain('"Atlas, Ltd"');
    expect(csv).toContain('"Li ""Buyer"""');
    expect(csv).toContain('"Line one\nLine two"');
  });
});
