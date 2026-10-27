"use client";
import { LoaderCircle } from "lucide-react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { FieldError } from "./FormField";
import type { LeadFormState } from "./useLeadForm";

export function LeadFormControls({
  lead,
  kind,
}: {
  lead: LeadFormState;
  kind: "quote" | "visit";
}) {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const consentError = lead.errors.consent
    ? t.forms[lead.errors.consent]
    : undefined;
  return (
    <>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent-row">
        <input
          type="checkbox"
          name="consent"
          aria-required="true"
          aria-invalid={!!consentError}
          aria-describedby={consentError ? `${kind}-consent-error` : undefined}
        />
        <span>
          {t[kind].consent} <a href="/privacy">{t.forms.privacyLink}</a>
        </span>
      </label>
      <FieldError id={`${kind}-consent-error`} error={consentError} />
      <button
        className="button button--gold form-submit"
        type="submit"
        disabled={!lead.hydrated || lead.status === "sending"}
      >
        {lead.status === "sending" ? (
          <>
            <LoaderCircle className="form-spinner" aria-hidden="true" />
            {t.forms.sending}
          </>
        ) : ["failure", "cooldown", "busy"].includes(lead.status) ? (
          t.forms.retryAction
        ) : (
          t[kind].submit
        )}
      </button>
    </>
  );
}
