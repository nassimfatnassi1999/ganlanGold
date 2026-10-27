import { validateEmailJSConfig, type EmailJSConfig } from "./emailjs-schema";

let pending: Promise<EmailJSConfig> | undefined;

/** One runtime source of truth; successful loads are reused until the page reloads. */
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
    })().catch((error: unknown) => {
      pending = undefined; // Retry a transient failure on the next explicit submission.
      throw error;
    });
  }
  return pending;
}
