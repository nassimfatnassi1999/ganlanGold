"use client";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { FieldLabel } from "./FormField";
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
  const preferenceError = lead.errors.contactMethod
    ? t.forms[lead.errors.contactMethod]
    : undefined;
  const consentError = lead.errors.consent
    ? t.forms[lead.errors.consent]
    : undefined;
  return (
    <>
      <FieldLabel
        id={`${kind}-contact-method`}
        label="首选联系方式"
        english="Preferred contact method"
        error={preferenceError}
      >
        <select
          id={`${kind}-contact-method`}
          name="contactMethod"
          defaultValue="either"
          aria-invalid={!!preferenceError}
          aria-describedby={
            preferenceError ? `${kind}-contact-method-error` : undefined
          }
        >
          <option value="either">{t.forms.methodEither}</option>
          <option value="email">{t.forms.methodEmail}</option>
          <option value="wechat">{t.forms.methodWechat}</option>
        </select>
      </FieldLabel>
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
          aria-invalid={!!consentError}
          aria-describedby={consentError ? `${kind}-consent-error` : undefined}
        />
        <span>
          {t[kind].consent} <a href="/privacy">{t.forms.privacyLink}</a>
        </span>
      </label>
      {consentError ? (
        <p className="field-error" id={`${kind}-consent-error`}>
          {consentError}
        </p>
      ) : null}
      <button
        className="button button--gold form-submit"
        type="submit"
        disabled={!lead.hydrated || lead.status === "sending"}
      >
        {lead.status === "sending" ? t.forms.sending : t[kind].submit}
      </button>
      <button
        className="button button--outline form-alternative"
        type="button"
        disabled={!lead.hydrated || lead.status === "sending"}
        onClick={(event) => {
          if (event.currentTarget.form) lead.prepare(event.currentTarget.form);
        }}
      >
        {t.forms.prepare}
      </button>
      <p className="form-dispatch-note">{t.forms.dispatchNote}</p>
    </>
  );
}
