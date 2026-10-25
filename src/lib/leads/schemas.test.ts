import { describe, expect, it } from "vitest";
import { quoteRequestSchema, visitRequestSchema } from "./schemas";

const validQuote = {
  company: "  Guangzhou Imports Ltd  ",
  country: "China",
  contactPerson: "Li Wei",
  email: "BUYER@EXAMPLE.CN",
  wechat: "",
  destinationPort: "Nansha, Guangzhou",
  products: [
    { productId: "250ml", quantity: 5200 },
    { productId: "500ml", quantity: 7500 },
  ],
  message: "Please confirm an applicable Incoterm.",
  consent: true,
  website: "",
};

describe("quoteRequestSchema", () => {
  it("normalizes a valid multi-format inquiry", () => {
    const result = quoteRequestSchema.parse(validQuote);
    expect(result.company).toBe("Guangzhou Imports Ltd");
    expect(result.email).toBe("buyer@example.cn");
    expect(result.wechat).toBeUndefined();
    expect(result.products).toEqual([
      { productId: "250ml", quantity: 5200 },
      { productId: "500ml", quantity: 7500 },
    ]);
  });

  it("requires at least email or WeChat", () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, email: "", wechat: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "email")).toBe(true);
  });

  it("requires explicit privacy consent", () => {
    const result = quoteRequestSchema.safeParse({ ...validQuote, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate formats", () => {
    const duplicate = quoteRequestSchema.safeParse({
      ...validQuote,
      products: [
        { productId: "250ml", quantity: 1 },
        { productId: "250ml", quantity: 2 },
      ],
    });
    expect(duplicate.success).toBe(false);
    expect(duplicate.error?.issues.map((issue) => issue.path.join("."))).toContain("products");
  });

  it("rejects non-integer package counts", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      products: [{ productId: "250ml", quantity: 2.5 }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain("products.0.quantity");
  });

  it("rejects unknown formats, empty selections, and a filled honeypot", () => {
    expect(quoteRequestSchema.safeParse({ ...validQuote, products: [] }).success).toBe(false);
    expect(
      quoteRequestSchema.safeParse({
        ...validQuote,
        products: [{ productId: "1l", quantity: 1 }],
      }).success,
    ).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...validQuote, website: "spam.example" }).success).toBe(false);
  });
});

describe("visitRequestSchema", () => {
  const visit = {
    company: "Beijing Distribution",
    contactPerson: "Chen Yu",
    country: "China",
    email: "",
    wechat: "chen-yu-business",
    preferredPeriod: "March 2027",
    visitors: 3,
    message: "We would like to understand the production process.",
    consent: true,
    website: "",
  };

  it("accepts WeChat as the only contact method", () => {
    expect(visitRequestSchema.parse(visit).wechat).toBe("chen-yu-business");
  });

  it("rejects visitor counts outside 1 to 50", () => {
    expect(visitRequestSchema.safeParse({ ...visit, visitors: 0 }).success).toBe(false);
    expect(visitRequestSchema.safeParse({ ...visit, visitors: 51 }).success).toBe(false);
  });

  it("does not accept a visit date without consent", () => {
    expect(visitRequestSchema.safeParse({ ...visit, consent: false }).success).toBe(false);
  });
});
