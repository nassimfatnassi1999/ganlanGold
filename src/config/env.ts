export const CONTACT_EMAIL = "contact@ganlangold.com";

/** Existing direct-message alternatives for the static EmailJS forms. */
export const CONTACT_WHATSAPP = {
  quote: "33634142632", // Lassad
  visit: "40724815229", // Fouad
} as const;

/** Public browser identifiers only. Changes require rebuilding and redeploying dist/. */
export const EMAILJS_CONFIG = {
  publicKey: "IgCjagh8mt8UbMHeM",
  serviceId: "service_yjtu5nk",
  quoteTemplateId: "template_40isd7q",
  visitTemplateId: "template_r59hktk",
} as const;
