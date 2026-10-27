"use client";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LeadFormState } from "./useLeadForm";

export function LeadFormFeedback({
  lead,
  kind,
}: {
  lead: LeadFormState;
  kind: "quote" | "visit";
}) {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  return (
    <>
      {lead.status === "validation" ? (
        <div className="form-summary" role="alert" tabIndex={-1}>
          <strong>{t.forms.errorTitle}</strong>
          <ul>
            {[...new Set(Object.values(lead.errors))].map((code) => (
              <li key={code}>{t.forms[code]}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {["failure", "cooldown", "busy", "unconfirmed", "disabled"].includes(lead.status) ? (
        <div className="form-summary" role="alert">
          {lead.status === "disabled"
            ? t.forms.emailUnavailable
            : lead.status === "cooldown"
            ? t.forms.cooldown
            : lead.status === "busy"
              ? t.forms.busy
              : lead.status === "unconfirmed"
                ? t.forms.unconfirmed
                : t.forms.sendError}
        </div>
      ) : null}
      {lead.status === "success" ? (
        <div className="lead-handoff" role="status">
          {t.forms.sent}
        </div>
      ) : null}
      {lead.handoff ? (
        <div className="lead-handoff" role="status">
          <p>
            {lead.status === "sending"
              ? t.forms.pendingAlternative
              : kind === "quote"
                ? t.forms.quoteNotSent
                : t.forms.visitNotSent}
          </p>
          <div className="lead-handoff-actions">
            <a
              className="button button--gold"
              href={lead.handoff.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {kind === "quote" ? t.forms.whatsappQuote : t.forms.whatsappVisit}
            </a>
            <button
              type="button"
              className="button button--outline"
              onClick={lead.copyPreparedMessage}
            >
              {lead.handoff.copied ? t.forms.copied : t.forms.copy}
            </button>
          </div>
          {lead.copyFailed ? <p role="alert">{t.forms.copyError}</p> : null}
          <pre className="lead-message-preview">{lead.handoff.message}</pre>
        </div>
      ) : null}
    </>
  );
}
