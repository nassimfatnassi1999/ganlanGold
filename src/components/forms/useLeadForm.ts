"use client";

import { useRef, useState, type FormEvent } from "react";
import { useHydrated } from "@/components/ui/useHydrated";
import { CONTACT_WHATSAPP } from "@/config/env";
import { useLanguage, type Language } from "@/i18n/LanguageProvider";
import {
  formatLeadMessage,
  type FieldErrors,
  type Validation,
} from "@/lib/forms/lead";
import { sendLead, LeadSendError, LeadSendTimeout } from "@/services/emailjs";
import type { EmailParams, LeadKind } from "@/types/emailjs";

type Status =
  | "idle"
  | "validation"
  | "ready"
  | "sending"
  | "success"
  | "failure"
  | "cooldown"
  | "busy"
  | "disabled"
  | "unconfirmed";
type Handoff = { message: string; whatsappUrl: string; copied: boolean };
export function useLeadForm<T>(options: {
  kind: LeadKind;
  validate: (values: FormData) => Validation<T>;
  params: (data: T, language: Language) => EmailParams;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [handoff, setHandoff] = useState<Handoff>();
  const [copyFailed, setCopyFailed] = useState(false);
  const busy = useRef(false);
  const hydrated = useHydrated();
  const { language } = useLanguage();

  function validate(form: HTMLFormElement) {
    const result = options.validate(new FormData(form));
    setErrors(result.errors);
    if (!result.data) {
      setStatus("validation");
      setHandoff(undefined);
      // Let React render the field errors before focusing the summary.
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>(".form-summary")?.focus(),
      );
      return;
    }
    const params = options.params(result.data, language);
    const message = formatLeadMessage(options.kind, params, language);
    setHandoff({
      message,
      whatsappUrl: `https://wa.me/${CONTACT_WHATSAPP[options.kind]}?text=${encodeURIComponent(message)}`,
      copied: false,
    });
    setCopyFailed(false);
    return params;
  }
  function prepare(form: HTMLFormElement) {
    if (busy.current) return;
    if (validate(form)) setStatus("ready");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const params = validate(form);
    if (!params) return;
    busy.current = true;
    setStatus("sending");
    try {
      await sendLead(options.kind, params);
      form.reset();
      options.onSuccess?.();
      setHandoff(undefined);
      setErrors({});
      setStatus("success");
    } catch (error) {
      setStatus(
        error instanceof LeadSendTimeout
          ? "unconfirmed"
          : error instanceof LeadSendError
            ? error.reason
            : "failure",
      );
    } finally {
      busy.current = false;
    }
  }
  async function copyPreparedMessage() {
    if (!handoff) return;
    try {
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(handoff.message);
      else {
        const input = document.createElement("textarea");
        input.value = handoff.message;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      setHandoff((current) =>
        current ? { ...current, copied: true } : current,
      );
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }
  function changed() {
    if (busy.current) return;
    setHandoff(undefined);
    setCopyFailed(false);
    setStatus("idle");
    setErrors({});
  }
  return {
    status,
    errors,
    handoff,
    copyFailed,
    submit,
    prepare,
    hydrated,
    copyPreparedMessage,
    changed,
  };
}
export type LeadFormState = ReturnType<typeof useLeadForm>;
