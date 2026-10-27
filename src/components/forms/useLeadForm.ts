"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type FocusEvent,
} from "react";
import { useHydrated } from "@/components/ui/useHydrated";
import { CONTACT_WHATSAPP } from "@/config/env";
import { useLanguage, type Language } from "@/i18n/LanguageProvider";
import {
  formatLeadMessage,
  type FieldErrors,
  type Validation,
} from "@/lib/forms/lead";
import { sendLead, LeadSendError, LeadSendTimeout } from "@/services/emailjs";
import { formValues } from "./formValues";
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

/** DOM order matches both the mobile and desktop reading order. */
function focusFirstError(form: HTMLFormElement) {
  requestAnimationFrame(() => {
    const field = form.querySelector<HTMLElement>(
      "[aria-invalid='true']:not(:disabled)",
    );
    if (!field) return;
    field.focus({ preventScroll: true });
    const header =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      96;
    const target =
      field.closest(".form-field, .product-choice, .consent-row") ?? field;
    const top =
      target.getBoundingClientRect().top + window.scrollY - header - 24;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  });
}

export function useLeadForm<T>(options: {
  kind: LeadKind;
  validate: (values: FormData) => Validation<T>;
  params: (data: T, language: Language, now?: Date) => EmailParams;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [prepared, setPrepared] = useState<{ data: T; date: Date }>();
  const [copiedLanguage, setCopiedLanguage] = useState<Language>();
  const [copyFailed, setCopyFailed] = useState(false);
  const attempted = useRef(false);
  const touched = useRef(new Set<string>());
  const pointerActive = useRef(false);
  const revision = useRef(0);
  const busy = useRef(false);
  const hydrated = useHydrated();
  const { language } = useLanguage();
  const currentLanguage = useRef(language);
  useEffect(() => {
    currentLanguage.current = language;
  }, [language]);
  const params = prepared
    ? options.params(prepared.data, language, prepared.date)
    : undefined;
  const message = params
    ? formatLeadMessage(options.kind, params, language)
    : "";
  const handoff = params
    ? {
        message,
        whatsappUrl: `https://wa.me/${CONTACT_WHATSAPP[options.kind]}?text=${encodeURIComponent(message)}`,
        copied: copiedLanguage === language,
      }
    : undefined;

  function validate(form: HTMLFormElement) {
    attempted.current = true;
    const result = options.validate(formValues(form));
    setErrors(result.errors);
    setPrepared(undefined);
    setCopiedLanguage(undefined);
    setCopyFailed(false);
    revision.current++;
    if (!result.data) {
      setStatus("validation");
      focusFirstError(form);
    }
    return result.data;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = validate(form);
    if (!data) return;
    busy.current = true;
    setStatus("sending");
    const date = new Date();
    try {
      await sendLead(options.kind, options.params(data, language, date));
      form.reset();
      options.onSuccess?.();
      touched.current.clear();
      attempted.current = false;
      setErrors({});
      setStatus("success");
    } catch (error) {
      setPrepared({ data, date });
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
    const copyRevision = revision.current;
    try {
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(handoff.message);
      else {
        const active = document.activeElement;
        const input = document.createElement("textarea");
        input.value = handoff.message;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (active instanceof HTMLElement)
          active.focus({ preventScroll: true });
        if (!copied) throw new Error("Copy unavailable");
      }
      if (
        copyRevision !== revision.current ||
        currentLanguage.current !== language
      )
        return;
      setCopiedLanguage(language);
      setCopyFailed(false);
    } catch {
      if (
        copyRevision === revision.current &&
        currentLanguage.current === language
      )
        setCopyFailed(true);
    }
  }
  function visibleErrors(form: HTMLFormElement) {
    const result = options.validate(formValues(form));
    setErrors(
      Object.fromEntries(
        Object.entries(result.errors).filter(
          ([name]) => attempted.current || touched.current.has(name),
        ),
      ),
    );
    if (attempted.current)
      setStatus((current) =>
        ["idle", "ready", "validation"].includes(current)
          ? result.data
            ? "ready"
            : "validation"
          : current,
      );
  }
  function changed(event: FormEvent<HTMLFormElement>) {
    if (busy.current) return;
    revision.current++;
    setPrepared(undefined);
    setCopiedLanguage(undefined);
    setCopyFailed(false);
    setStatus("idle");
    visibleErrors(event.currentTarget);
  }
  function blurred(event: FocusEvent<HTMLFormElement>) {
    const target = event.target;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      )
    )
      return;
    if (target.name === "website" || busy.current) return;
    touched.current.add(target.name);
    if (
      target.name.startsWith("select-") ||
      target.name.startsWith("quantity-")
    )
      touched.current.add("products");
    if (target.name === "contactMethod") {
      touched.current.add("email");
      touched.current.add("wechat");
    }
    // A blur error can move a checkbox between pointer-down and click.
    // Its change (or the submit action) validates the same touched fields safely.
    const next = event.relatedTarget;
    if (
      pointerActive.current &&
      ((next instanceof HTMLInputElement && next.type === "checkbox") ||
        next instanceof HTMLButtonElement)
    ) {
      return;
    }
    visibleErrors(event.currentTarget);
  }
  return {
    status,
    errors,
    handoff,
    copyFailed,
    submit,
    hydrated,
    copyPreparedMessage,
    changed,
    blurred,
    pointerStarted: () => {
      pointerActive.current = true;
    },
    pointerEnded: () => {
      pointerActive.current = false;
    },
  };
}
export type LeadFormState = ReturnType<typeof useLeadForm>;
