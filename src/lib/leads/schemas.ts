import { z } from "zod";
import { PRODUCT_SPECS } from "@/lib/products/catalog";

const productIds = PRODUCT_SPECS.map((product) => product.id) as ["250ml", "500ml", "750ml", "5l"];

const optionalTrimmedString = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().max(max).optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().toLowerCase();
  return trimmed === "" ? undefined : trimmed;
}, z.email().max(320).optional());

const commonContactFields = {
  company: z.string().trim().min(2).max(200),
  country: z.string().trim().min(2).max(120),
  contactPerson: z.string().trim().min(2).max(160),
  email: optionalEmail,
  wechat: optionalTrimmedString(160),
  consent: z.literal(true),
  website: z.literal("").optional().default(""),
};

const productSelectionSchema = z.object({
  productId: z.enum(productIds),
  quantity: z.number().int().min(1).max(1_000_000),
});

export const quoteRequestSchema = z
  .object({
    ...commonContactFields,
    destinationPort: z.string().trim().min(2).max(180),
    products: z.array(productSelectionSchema).min(1).max(PRODUCT_SPECS.length),
    message: optionalTrimmedString(4_000),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.email && !value.wechat) {
      context.addIssue({ code: "custom", path: ["email"], message: "Provide an email address or WeChat contact." });
    }

    const ids = value.products.map((product) => product.productId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", path: ["products"], message: "Each product format may appear only once." });
    }
  });

export const visitRequestSchema = z
  .object({
    ...commonContactFields,
    preferredPeriod: z.string().trim().min(2).max(180),
    visitors: z.number().int().min(1).max(50).optional(),
    message: optionalTrimmedString(4_000),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.email && !value.wechat) {
      context.addIssue({ code: "custom", path: ["email"], message: "Provide an email address or WeChat contact." });
    }
  });

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type ParsedQuoteRequest = z.output<typeof quoteRequestSchema>;
export type VisitRequestInput = z.input<typeof visitRequestSchema>;
export type ParsedVisitRequest = z.output<typeof visitRequestSchema>;
export type ProductSelection = z.output<typeof productSelectionSchema>;
