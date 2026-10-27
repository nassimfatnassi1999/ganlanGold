import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import type { EmailParams, LeadKind } from "@/types/emailjs";
import type { Language } from "@/i18n/LanguageProvider";
import { PRODUCT_SPECS, type ProductId } from "@/lib/products/catalog";
import type { GroveVisitEmailParams, QuoteEmailParams } from "@/types/emailjs";

export const PACKAGE_ML = Object.fromEntries(
  PRODUCT_SPECS.map(({ id, capacityMl }) => [id, capacityMl]),
) as Record<ProductId, number>;
export const PRODUCT_IDS = Object.keys(PACKAGE_ML) as ProductId[];
export const FIELD_LIMITS: Record<string, number> = {
  company: 160,
  country: 100,
  contactPerson: 120,
  email: 254,
  wechat: 100,
  destinationPort: 160,
  preferredPeriod: 160,
  message: 4000,
};
export type ContactMethod = "email" | "wechat" | "either";
export type CommonLead = {
  company: string;
  country: string;
  contactPerson: string;
  email: string;
  wechat: string;
  contactMethod: ContactMethod;
  message: string;
  consent: true;
};
export type ProductQuantity = { productId: ProductId; quantity: number };
export type QuoteLead = CommonLead & {
  destinationPort: string;
  products: ProductQuantity[];
};
export type VisitLead = CommonLead & {
  preferredPeriod: string;
  visitors?: number;
};
export type ValidationCode =
  | "requiredFields"
  | "contactRequired"
  | "invalidEmail"
  | "contactPreference"
  | "consentRequired"
  | "visitorsRange"
  | "quantityRange"
  | "productRequired"
  | "tooLong"
  | "retry";
export type FieldErrors = Record<string, ValidationCode>;
export type Validation<T> = { data?: T; errors: FieldErrors };
export const formText = (form: FormData, name: string) =>
  typeof form.get(name) === "string"
    ? String(form.get(name)).trim().replace(/\r\n?/g, "\n")
    : "";
export const isValidEmail = (value: string) =>
  value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);

function common(form: FormData): { data: CommonLead; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const field = (name: string) => formText(form, name);
  for (const name of ["company", "country", "contactPerson"])
    if (!field(name)) errors[name] = "requiredFields";
  for (const [name, limit] of Object.entries(FIELD_LIMITS))
    if (field(name).length > limit) errors[name] = "tooLong";
  // Keep headers/short fields single-line; only the message allows multiline content.
  for (const name of Object.keys(FIELD_LIMITS).filter(
    (name) => name !== "message",
  ))
    if (/[\r\n\u0000-\u001f\u007f]/.test(field(name)))
      errors[name] = name === "email" ? "invalidEmail" : "retry";
  const email = field("email"),
    wechat = field("wechat"),
    preference = field("contactMethod");
  if (!email && !wechat) {
    errors.email = "contactRequired";
    errors.wechat = "contactRequired";
  }
  if (email && !isValidEmail(email)) errors.email = "invalidEmail";
  if (
    !["email", "wechat", "either"].includes(preference) ||
    (preference === "email" && !email) ||
    (preference === "wechat" && !wechat)
  )
    errors.contactMethod = "contactPreference";
  if (form.get("consent") !== "on") errors.consent = "consentRequired";
  if (field("website")) errors.website = "retry";
  return {
    errors,
    data: {
      company: field("company"),
      country: field("country"),
      contactPerson: field("contactPerson"),
      email,
      wechat,
      contactMethod: preference as ContactMethod,
      message: field("message"),
      consent: true,
    },
  };
}
export function validateQuote(form: FormData): Validation<QuoteLead> {
  const { data, errors } = common(form);
  const destinationPort = formText(form, "destinationPort");
  if (!destinationPort) errors.destinationPort = "requiredFields";
  const products: ProductQuantity[] = [];
  for (const productId of PRODUCT_IDS)
    if (form.get(`select-${productId}`) === "on") {
      const quantity = Number(formText(form, `quantity-${productId}`));
      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 1_000_000
      )
        errors[`quantity-${productId}`] = "quantityRange";
      else products.push({ productId, quantity });
    }
  if (!PRODUCT_IDS.some((id) => form.get(`select-${id}`) === "on"))
    errors.products = "productRequired";
  return {
    errors,
    data: Object.keys(errors).length
      ? undefined
      : { ...data, destinationPort, products },
  };
}
export function validateVisit(form: FormData): Validation<VisitLead> {
  const { data, errors } = common(form);
  const preferredPeriod = formText(form, "preferredPeriod"),
    visitors = formText(form, "visitors");
  if (!preferredPeriod) errors.preferredPeriod = "requiredFields";
  if (
    visitors &&
    (!Number.isSafeInteger(Number(visitors)) ||
      Number(visitors) < 1 ||
      Number(visitors) > 50)
  )
    errors.visitors = "visitorsRange";
  return {
    errors,
    data: Object.keys(errors).length
      ? undefined
      : {
          ...data,
          preferredPeriod,
          visitors: visitors ? Number(visitors) : undefined,
        },
  };
}
export const capacityLabel = (id: ProductId) =>
  id === "5l" ? "5 L" : id.replace("ml", " ml");
export const totalLitres = (products: ProductQuantity[]) =>
  products.reduce(
    (sum, item) => sum + item.quantity * PACKAGE_ML[item.productId],
    0,
  ) / 1000;
function commonParams(data: CommonLead, language: Language, now: Date) {
  const zh = language === "zh-CN",
    missing = zh ? "未提供" : "Not provided";
  return {
    company: data.company,
    country: data.country,
    contact_name: data.contactPerson,
    contact_email: data.email || missing,
    wechat_id: data.wechat || missing,
    contact_method: {
      email: zh ? "电子邮箱" : "Email",
      wechat: zh ? "微信" : "WeChat",
      either: zh ? "电子邮箱或微信" : "Email or WeChat",
    }[data.contactMethod],
    message: data.message || missing,
    submission_date: now.toISOString(),
    site_language: zh ? "简体中文 (zh-CN)" : "English (en)",
    privacy_consent: zh ? "已同意" : "Consented",
  };
}
export function buildQuoteParams(
  data: QuoteLead,
  language: Language,
  now = new Date(),
): QuoteEmailParams {
  const count = (id: ProductId) =>
    String(data.products.find((item) => item.productId === id)?.quantity ?? 0);
  return {
    ...commonParams(data, language, now),
    destination_port: data.destinationPort,
    products_summary: data.products
      .map(
        (item) =>
          `${capacityLabel(item.productId)}: ${item.quantity} ${language === "zh-CN" ? "件" : "packages"}`,
      )
      .join("\n"),
    quantity_250ml: count("250ml"),
    quantity_500ml: count("500ml"),
    quantity_750ml: count("750ml"),
    quantity_5l: count("5l"),
    total_litres: totalLitres(data.products).toFixed(2),
  };
}
export function buildVisitParams(
  data: VisitLead,
  language: Language,
  now = new Date(),
): GroveVisitEmailParams {
  return {
    ...commonParams(data, language, now),
    preferred_visit_period: data.preferredPeriod,
    visitor_count: data.visitors
      ? String(data.visitors)
      : language === "zh-CN"
        ? "未提供"
        : "Not provided",
  };
}

/** Readable manual alternative, kept separate from the dashboard parameter names. */
export function formatLeadMessage(
  kind: LeadKind,
  params: EmailParams,
  language: Language,
): string {
  const chinese = language === "zh-CN",
    t = chinese ? zh : en;
  const labels = t.forms.handoffLabels;
  const title =
    kind === "quote"
      ? chinese
        ? "GANLAN GOLD — 询价"
        : "GANLAN GOLD — Quotation request"
      : chinese
        ? "GANLAN GOLD — 产地考察"
        : "GANLAN GOLD — Olive grove visit request";
  const notice =
    kind === "quote"
      ? chinese
        ? "此申请不构成正式报价。最终商业报价以美元确认，除非另有说明，通常有效期为 15 天。"
        : "This request is not a formal quotation. Final commercial quotations are confirmed in USD, normally valid for 15 days unless stated otherwise."
      : chinese
        ? "考察日期及安排须另行确认。"
        : "Visit dates and arrangements require separate confirmation.";
  return [
    title,
    ...Object.entries(params).map(
      ([key, value]) => `${labels[key as keyof typeof labels]}: ${value}`,
    ),
    notice,
  ].join("\n");
}
