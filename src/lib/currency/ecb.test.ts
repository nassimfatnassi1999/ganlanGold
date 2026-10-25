import { describe, expect, it } from "vitest";
import { EcbRateError, parseEcbDailyXml } from "./ecb";

const actualEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
  <gesmes:subject>Reference rates</gesmes:subject>
  <Cube><Cube time='2026-10-23'>
    <Cube currency='USD' rate='1.1193'/>
    <Cube currency='CNY' rate='7.4660'/>
  </Cube></Cube>
</gesmes:Envelope>`;

describe("parseEcbDailyXml", () => {
  it("parses the dated USD and CNY rates from the actual ECB envelope shape", () => {
    expect(parseEcbDailyXml(actualEnvelope)).toEqual({
      referenceDate: "2026-10-23",
      eurUsd: "1.1193",
      eurCny: "7.4660",
    });
  });

  it("rejects a response missing either required currency", () => {
    expect(() => parseEcbDailyXml(actualEnvelope.replace("<Cube currency='CNY' rate='7.4660'/>", ""))).toThrow(EcbRateError);
  });

  it.each(["0", "-1.2", "not-a-rate"])("rejects an invalid rate value: %s", (invalidRate) => {
    expect(() => parseEcbDailyXml(actualEnvelope.replace("1.1193", invalidRate))).toThrow(EcbRateError);
  });

  it("rejects malformed XML and invalid reference dates", () => {
    expect(() => parseEcbDailyXml("<not-ecb>broken")).toThrow(EcbRateError);
    expect(() => parseEcbDailyXml(actualEnvelope.replace("2026-10-23", "23/10/2026"))).toThrow(EcbRateError);
  });
});
