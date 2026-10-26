"use client";

import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { TextAreaField, TextField } from "./FormField";
import { text, useLeadForm } from "./useLeadForm";

export function VisitForm() {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const { state, submit, hydrated, copyPreparedMessage } = useLeadForm<{
    company: string; contactPerson: string; country: string; email?: string; wechat?: string;
    preferredPeriod: string; visitors?: number; message?: string; consent: true; website: string;
  }>({
    kind: "visit",
    format(data) {
      return [
        language === "zh-CN" ? "GANLAN GOLD — 产地考察" : "GANLAN GOLD — Olive grove visit request",
        `Company: ${data.company}`,
        `Contact: ${data.contactPerson}`,
        `Country: ${data.country}`,
        `Email: ${data.email || "—"}`,
        `WeChat: ${data.wechat || "—"}`,
        `Preferred period: ${data.preferredPeriod}`,
        `Visitors: ${data.visitors || "Not specified"}`,
        `Message: ${data.message || "—"}`,
        language === "zh-CN" ? "考察日期须另行确认。" : "Visit date is subject to confirmation.",
      ].join("\n");
    },
    validate(form) {
      const values = new FormData(form);
      const errors: string[] = [];
      for (const key of ["company", "contactPerson", "country", "preferredPeriod"]) {
        if (!text(values, key)) errors.push(t.forms.requiredFields);
      }
      const email = text(values, "email");
      const wechat = text(values, "wechat");
      if (!email && !wechat) errors.push(t.forms.contactRequired);
      if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push(t.forms.invalidEmail);
      if (values.get("consent") !== "on") errors.push(t.forms.consentRequired);
      const visitors = text(values, "visitors");
      if (visitors && (!Number.isInteger(Number(visitors)) || Number(visitors) < 1 || Number(visitors) > 50)) {
        errors.push(t.forms.visitorsRange);
      }
      return {
        errors: [...new Set(errors)],
        data: errors.length
          ? undefined
          : {
              company: text(values, "company"),
              contactPerson: text(values, "contactPerson"),
              country: text(values, "country"),
              email: email || undefined,
              wechat: wechat || undefined,
              preferredPeriod: text(values, "preferredPeriod"),
              visitors: visitors ? Number(visitors) : undefined,
              message: text(values, "message") || undefined,
              consent: true as const,
              website: text(values, "website"),
            },
      };
    },
  });
  return (
    <form className="lead-form lead-form--dark" noValidate onSubmit={submit}>
      {state.status === "error" ? <div className="form-summary" role="alert"><strong>{t.forms.errorTitle}</strong><ul>{state.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
      {state.status === "ready" ? (
        <div className="lead-handoff" role="status">
          <strong>{t.visit.success}</strong>
          <p>{t.forms.visitNotSent}</p>
          <div className="lead-handoff-actions">
            <a className="button button--gold" href={state.whatsappUrl} target="_blank" rel="noopener noreferrer">{t.forms.whatsappVisit}</a>
            <button type="button" className="button button--outline" onClick={copyPreparedMessage}>{state.copied ? t.forms.copied : t.forms.copy}</button>
          </div>
          <pre className="lead-message-preview">{state.message}</pre>
        </div>
      ) : null}
      <div className="form-grid">
        <TextField id="visit-company" name="company" label="公司名称" english="Company" autoComplete="organization" />
        <TextField id="visit-person" name="contactPerson" label="联系人" english="Contact person" autoComplete="name" />
        <TextField id="visit-country" name="country" label="国家或地区" english="Country or region" autoComplete="country-name" />
        <TextField id="visit-email" name="email" type="email" label="电子邮箱" english="Email" autoComplete="email" />
        <TextField id="visit-wechat" name="wechat" label="微信联系方式" english="WeChat contact" optional />
        <TextField id="visit-period" name="preferredPeriod" label="期望考察日期或时间段" english="Preferred date or period" />
        <TextField id="visit-count" name="visitors" type="number" min="1" max="50" step="1" label="预计人数" english="Number of visitors" optional />
      </div>
      <TextAreaField id="visit-message" name="message" label="补充说明" english="Additional message" optional rows={4} />
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="consent-row"><input type="checkbox" name="consent" /><span>{t.visit.consent} <a href="/privacy">{t.forms.privacyLink}</a></span></label>
      <button className="button button--gold form-submit" type="submit" disabled={!hydrated}>
        {t.visit.submit}
      </button>
      <p className="form-dispatch-note">{t.forms.dispatchNote}</p>
    </form>
  );
}
