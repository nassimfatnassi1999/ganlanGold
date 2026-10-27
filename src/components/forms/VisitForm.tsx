"use client";
import { useState } from "react";
import type { ContactMethod } from "@/lib/forms/lead";
import { ContactFields } from "./ContactFields";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { buildVisitParams, validateVisit } from "@/lib/forms/lead";
import { TextAreaField, TextField } from "./FormField";
import { LeadFormFeedback } from "./LeadFormFeedback";
import { LeadFormControls } from "./LeadFormControls";
import { useLeadForm } from "./useLeadForm";

export function VisitForm() {
  const [method, setMethod] = useState<ContactMethod>("either");
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const lead = useLeadForm({
    kind: "visit",
    validate: validateVisit,
    params: buildVisitParams,
    onSuccess: () => setMethod("either"),
  });
  const error = (name: string) =>
    lead.errors[name] ? t.forms[lead.errors[name]] : undefined;
  return (
    <form
      className="lead-form lead-form--dark"
      noValidate
      onSubmit={lead.submit}
      onChange={lead.changed}
      onBlur={lead.blurred}
      onPointerDownCapture={lead.pointerStarted}
      onPointerUpCapture={lead.pointerEnded}
      onPointerCancelCapture={lead.pointerEnded}
      onKeyDownCapture={lead.pointerEnded}
    >
      <fieldset
        className="lead-form-fields"
        aria-busy={lead.status === "sending"}
        disabled={lead.status === "sending"}
      >
        <div className="form-grid">
          <TextField
            id="visit-company"
            name="company"
            label="公司名称"
            english="Company"
            autoComplete="organization"
            error={error("company")}
          />
          <TextField
            id="visit-person"
            name="contactPerson"
            label="联系人"
            english="Contact person"
            autoComplete="name"
            error={error("contactPerson")}
          />
          <TextField
            id="visit-country"
            name="country"
            label="国家或地区"
            english="Country or region"
            autoComplete="country-name"
            error={error("country")}
          />
          <ContactFields
            kind="visit"
            lead={lead}
            method={method}
            onMethodChange={setMethod}
          />
          <TextField
            id="visit-period"
            name="preferredPeriod"
            label="期望考察日期或时间段"
            english="Preferred date or period"
            error={error("preferredPeriod")}
          />
          <TextField
            id="visit-count"
            name="visitors"
            type="number"
            inputMode="numeric"
            min="1"
            max="50"
            step="1"
            label="预计人数"
            english="Number of visitors"
            optional
            error={error("visitors")}
          />
        </div>
        <TextAreaField
          id="visit-message"
          name="message"
          label="补充说明"
          english="Additional message"
          optional
          rows={4}
          error={error("message")}
        />
        <LeadFormControls lead={lead} kind="visit" />
      </fieldset>
      <LeadFormFeedback lead={lead} />
    </form>
  );
}
