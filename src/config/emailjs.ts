import { EMAILJS_CONFIG } from "./env";

function validIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    /^[A-Za-z0-9_-]+$/.test(value) &&
    !/your[_-]|placeholder|replace[_-]?me|change[_-]?me|example|^todo$|^undefined$|^null$/i.test(value)
  );
}

/** Incomplete or placeholder settings disable only automatic email submission. */
export function isEmailJSConfigured(value: unknown = EMAILJS_CONFIG): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const config = value as Record<string, unknown>;
  const keys = ["publicKey", "serviceId", "quoteTemplateId", "visitTemplateId"];
  return (
    Object.keys(config).length === keys.length &&
    keys.every((key) => validIdentifier(config[key])) &&
    config.quoteTemplateId !== config.visitTemplateId
  );
}
