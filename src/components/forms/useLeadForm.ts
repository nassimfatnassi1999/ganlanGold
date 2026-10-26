"use client";

import { useState, type FormEvent } from "react";
import { useHydrated } from "@/components/ui/useHydrated";
import { CONTACT_WHATSAPP } from "@/config/env";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";

type Handoff = { status: "ready"; message: string; whatsappUrl: string; copied: boolean };
type State = { status: "idle" } | { status: "error"; errors: string[] } | Handoff;

export function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** Static, privacy-respecting form: no API, no persistence, no false "received" state.
 * The user must choose to send the prepared message via their own WhatsApp/WeChat app.
 */
export function useLeadForm<T>(options: {
  kind: "quote" | "visit";
  validate: (form: HTMLFormElement) => { data?: T; errors: string[] };
  format: (validated: T) => string;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const hydrated = useHydrated();
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = options.validate(event.currentTarget);
    if (!validation.data || validation.errors.length) {
      setState({ status: "error", errors: validation.errors.length ? validation.errors : [t.forms.retry] });
      return;
    }
    const message = options.format(validation.data);
    const phone = CONTACT_WHATSAPP[options.kind];
    setState({ status: "ready", message, whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`, copied: false });
  }

  async function copyPreparedMessage() {
    if (state.status !== "ready") return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(state.message);
      } else {
        const input = document.createElement("textarea");
        input.value = state.message;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const success = document.execCommand("copy");
        input.remove();
        if (!success) throw new Error("copy unavailable");
      }
      setState((prev) => prev.status === "ready" ? { ...prev, copied: true } : prev);
    } catch {
      setState({ status: "error", errors: [t.forms.copyError] });
    }
  }

  return { state, submit, hydrated, copyPreparedMessage };
}
