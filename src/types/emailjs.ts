export const COMMON_EMAIL_KEYS = [
  "company",
  "country",
  "contact_name",
  "contact_email",
  "wechat_id",
  "contact_method",
  "message",
  "submission_date",
  "site_language",
  "privacy_consent",
] as const;
export const QUOTE_EMAIL_KEYS = [
  ...COMMON_EMAIL_KEYS,
  "products_summary",
  "quantity_250ml",
  "quantity_500ml",
  "quantity_750ml",
  "quantity_5l",
  "total_litres",
  "destination_port",
] as const;
export const VISIT_EMAIL_KEYS = [
  ...COMMON_EMAIL_KEYS,
  "preferred_visit_period",
  "visitor_count",
] as const;
export type QuoteEmailParams = Record<
  (typeof QUOTE_EMAIL_KEYS)[number],
  string
>;
export type GroveVisitEmailParams = Record<
  (typeof VISIT_EMAIL_KEYS)[number],
  string
>;
export type EmailParams = QuoteEmailParams | GroveVisitEmailParams;
export type LeadKind = "quote" | "visit";
