import emailjs from "@emailjs/browser";
import { loadEmailJSConfig } from "@/config/emailjs";
import {
  QUOTE_EMAIL_KEYS,
  VISIT_EMAIL_KEYS,
  type EmailParams,
  type LeadKind,
} from "@/types/emailjs";

export const SUBMISSION_COOLDOWN_MS = 30_000;
export const SEND_WAIT_MS = 20_000;
let inFlight = false;
let nextAllowed = 0;
export class LeadSendError extends Error {
  constructor(public readonly reason: "busy" | "cooldown" | "disabled") {
    super("Submission unavailable");
  }
}
export class LeadSendTimeout extends Error {}

/** Shared across both forms: one request at a time and at least 30 seconds between attempts. */
export async function sendLead(
  kind: LeadKind,
  params: EmailParams,
): Promise<void> {
  const keys = kind === "quote" ? QUOTE_EMAIL_KEYS : VISIT_EMAIL_KEYS;
  if (
    Object.keys(params).length !== keys.length ||
    !keys.every(
      (key) => typeof (params as Record<string, unknown>)[key] === "string",
    )
  )
    throw new Error("Invalid email parameters");
  if (inFlight) throw new LeadSendError("busy");
  if (Date.now() < nextAllowed) throw new LeadSendError("cooldown");
  inFlight = true;
  let releaseOnExit = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const config = await loadEmailJSConfig();
    if (!config.enabled) throw new LeadSendError("disabled");
    nextAllowed = Date.now() + SUBMISSION_COOLDOWN_MS;
    const request = emailjs.send(
      config.serviceId,
      kind === "quote" ? config.quoteTemplateId : config.visitTemplateId,
      params,
      { publicKey: config.publicKey },
    );
    try {
      const response = await Promise.race([
        request,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new LeadSendTimeout("Delivery unconfirmed")),
            SEND_WAIT_MS,
          );
        }),
      ]);
      if (response.status < 200 || response.status >= 300) throw response;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        [400, 401, 403, 404].includes(Number(error.status))
      )
        throw new LeadSendError("disabled");
      if (error instanceof LeadSendTimeout) {
        // The browser SDK cannot abort a send. Keep its lock until it settles,
        // but stop waiting in the UI; a late result must not reset edited fields.
        releaseOnExit = false;
        void request.then(
          () => {
            inFlight = false;
          },
          () => {
            inFlight = false;
          },
        );
      }
      throw error;
    }
  } finally {
    if (timer) clearTimeout(timer);
    if (releaseOnExit) inFlight = false;
  }
}
