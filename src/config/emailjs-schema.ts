export const EMAILJS_ENV_KEYS = {
  publicKey: "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY",
  serviceId: "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
  quoteTemplateId: "NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID",
  visitTemplateId: "NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID",
} as const;

export type EmailJSConfig = Record<keyof typeof EMAILJS_ENV_KEYS, string> & {
  enabled: boolean;
};

export const DISABLED_EMAILJS_CONFIG: Readonly<EmailJSConfig> = Object.freeze({
  enabled: false,
  publicKey: "",
  serviceId: "",
  quoteTemplateId: "",
  visitTemplateId: "",
});

export function validIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    /^[A-Za-z0-9_-]+$/.test(value) &&
    !/your[_-]|placeholder|replace[_-]?me|change[_-]?me|example|^todo$|^undefined$|^null$/i.test(
      value,
    )
  );
}

export function validateEmailJSConfig(value: unknown): value is EmailJSConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const config = value as Record<string, unknown>;
  const keys = Object.keys(EMAILJS_ENV_KEYS);
  return (
    Object.keys(config).length === keys.length + 1 &&
    typeof config.enabled === "boolean" &&
    keys.every((key) => config[key] === "" || validIdentifier(config[key])) &&
    (!config.enabled ||
      (keys.every((key) => validIdentifier(config[key])) &&
        config.quoteTemplateId !== config.visitTemplateId))
  );
}

export function publicConfigFromEnv(
  env: Record<string, string | undefined>,
): EmailJSConfig {
  const config = { enabled: true, ...Object.fromEntries(
    Object.entries(EMAILJS_ENV_KEYS).map(([key, name]) => [
      key,
      env[name]?.trim() ?? "",
    ]),
  ) } as EmailJSConfig;
  return validateEmailJSConfig(config) ? config : { ...DISABLED_EMAILJS_CONFIG };
}
