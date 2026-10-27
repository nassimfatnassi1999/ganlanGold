"use client";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LeadFormState } from "./useLeadForm";

export function LeadFormFeedback({ lead }: { lead: LeadFormState }) {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const notification = {
    idle: "",
    ready: "",
    validation: lead.errors.website ? t.forms.retry : t.forms.errorTitle,
    sending: t.forms.sending,
    success: t.forms.sent,
    disabled: t.forms.emailUnavailable,
    failure: t.forms.sendError,
    cooldown: t.forms.cooldown,
    busy: t.forms.busy,
    unconfirmed: t.forms.unconfirmed,
  }[lead.status];
  const alert = [
    "validation",
    "failure",
    "disabled",
    "cooldown",
    "busy",
    "unconfirmed",
  ].includes(lead.status);
  return (
    <>
      {notification ? (
        <p
          className={`form-notification${lead.status === "success" ? " form-notification--success" : ""}`}
          role={alert ? "alert" : "status"}
        >
          {notification}
        </p>
      ) : null}
      {lead.handoff ? (
        <div className="lead-handoff">
          <div className="lead-handoff-actions">
            <a
              className="button button--gold"
              href={lead.handoff.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.forms.openWhatsapp}
            </a>
            <button
              type="button"
              className="button button--outline"
              onClick={lead.copyPreparedMessage}
            >
              {lead.handoff.copied ? t.forms.copied : t.forms.copy}
            </button>
          </div>
          <p role="status" className="copy-status">
            {lead.handoff.copied
              ? t.forms.copied
              : lead.copyFailed
                ? t.forms.copyError
                : ""}
          </p>
          <details>
            <summary>{t.forms.preview}</summary>
            <pre className="lead-message-preview">{lead.handoff.message}</pre>
          </details>
        </div>
      ) : null}
    </>
  );
}
