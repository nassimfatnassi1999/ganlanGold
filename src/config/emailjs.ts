import {
  DISABLED_EMAILJS_CONFIG,
  validateEmailJSConfig,
  type EmailJSConfig,
} from "./emailjs-schema";

let pending: Promise<EmailJSConfig> | undefined;

/** Fetch again on each submission so JSON-only deployments take effect in open pages. */
export function loadEmailJSConfig(): Promise<EmailJSConfig> {
  if (!pending) {
    pending = (async () => {
      const response = await fetch("/config/emailjs.json", {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Email configuration unavailable");
      const value: unknown = await response.json();
      if (!validateEmailJSConfig(value))
        throw new Error("Email configuration invalid");
      return value;
    })()
      .catch(() => ({ ...DISABLED_EMAILJS_CONFIG }))
      .finally(() => { pending = undefined; });
  }
  return pending;
}
