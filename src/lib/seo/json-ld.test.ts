import { describe, expect, it } from "vitest";
import { buildSiteJsonLd, serializeJsonLd } from "./json-ld";

describe("GANLAN GOLD structured data", () => {
  it("contains only the four verified products and exact USD reference prices", () => {
    const graph = buildSiteJsonLd("https://ganlan.example")["@graph"];
    const products = graph.filter((entry) => entry["@type"] === "Product");

    expect(products).toHaveLength(4);
    expect(products.map((product) => product.size)).toEqual(["250 ml", "500 ml", "750 ml", "5 L"]);
    expect(products.map((product) => product.offers.price)).toEqual(["4.00", "7.30", "10.10", "38.50"]);
    expect(products.every((product) => product.offers.priceCurrency === "USD")).toBe(true);
    expect(products.every((product) => !("availability" in product.offers))).toBe(true);
  });

  it("publishes the three supplied contacts in their official order", () => {
    const organization = buildSiteJsonLd("https://ganlan.example")["@graph"][0];
    expect(organization.contactPoint.map((contact) => contact.name)).toEqual(["Gisèle", "Lassad", "Fouad"]);
    expect(organization.contactPoint.map((contact) => contact.telephone)).toEqual([
      "+86 134 2751 3756",
      "+33 6 34 14 26 32",
      "+40 724 815 229",
    ]);
  });

  it("escapes markup-sensitive characters when embedded in an HTML script", () => {
    expect(serializeJsonLd({ value: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
