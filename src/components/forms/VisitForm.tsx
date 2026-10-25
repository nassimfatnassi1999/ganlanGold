"use client";

import zh from "@/i18n/zh-CN.json";
import { TextAreaField, TextField } from "./FormField";
import { text, useLeadForm } from "./useLeadForm";

export function VisitForm() {
  const { state, submit, hydrated } = useLeadForm({
    endpoint: "/api/visits",
    validate(form) {
      const values = new FormData(form);
      const errors: string[] = [];
      for (const key of ["company", "contactPerson", "country", "preferredPeriod"]) {
        if (!text(values, key)) errors.push("请填写所有必填信息。 / Complete all required fields.");
      }
      const email = text(values, "email");
      const wechat = text(values, "wechat");
      if (!email && !wechat) errors.push("请提供电子邮箱或微信联系方式。 / Provide email or WeChat.");
      if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("请输入有效的电子邮箱。 / Enter a valid email.");
      if (values.get("consent") !== "on") errors.push("请确认隐私同意。 / Privacy consent is required.");
      const visitors = text(values, "visitors");
      if (visitors && (!Number.isInteger(Number(visitors)) || Number(visitors) < 1 || Number(visitors) > 50)) {
        errors.push("预计人数须为 1 至 50。 / Visitors must be between 1 and 50.");
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
      {state.status === "error" ? <div className="form-summary" role="alert"><strong>{zh.forms.errorTitle}</strong><ul>{state.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
      {state.status === "success" ? (
        <div className="form-success" role="status">
          <strong>{zh.visit.success} 申请编号：{state.result.requestId}</strong>
          <span lang="en">Request received. Your visit date is not confirmed.</span>
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
      <label className="consent-row"><input type="checkbox" name="consent" /><span>{zh.visit.consent} <a href="/privacy">{zh.forms.privacyLink}</a></span></label>
      <button className="button button--gold form-submit" type="submit" disabled={!hydrated || state.status === "submitting"}>
        {state.status === "submitting" ? zh.forms.sending : zh.visit.submit}
      </button>
    </form>
  );
}
