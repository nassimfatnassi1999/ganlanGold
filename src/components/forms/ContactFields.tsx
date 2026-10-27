"use client";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ContactMethod } from "@/lib/forms/lead";
import { FieldLabel, TextField } from "./FormField";
import type { LeadFormState } from "./useLeadForm";

export function ContactFields({
  kind,
  lead,
  method,
  onMethodChange,
}: {
  kind: "quote" | "visit";
  lead: LeadFormState;
  method: ContactMethod;
  onMethodChange: (method: ContactMethod) => void;
}) {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const error = (name: string) =>
    lead.errors[name] ? t.forms[lead.errors[name]] : undefined;
  return (
    <>
      <FieldLabel
        id={`${kind}-contact-method`}
        label="首选联系方式"
        english="Preferred contact method"
        error={error("contactMethod")}
      >
        <select
          id={`${kind}-contact-method`}
          name="contactMethod"
          value={method}
          onChange={(event) =>
            onMethodChange(event.target.value as ContactMethod)
          }
          aria-invalid={!!error("contactMethod")}
          aria-describedby={
            error("contactMethod") ? `${kind}-contact-method-error` : undefined
          }
        >
          <option value="either">{t.forms.methodEither}</option>
          <option value="email">{t.forms.methodEmail}</option>
          <option value="wechat">{t.forms.methodWechat}</option>
        </select>
      </FieldLabel>
      <TextField
        id={`${kind}-email`}
        name="email"
        type="email"
        inputMode="email"
        label="电子邮箱"
        english="Email"
        autoComplete="email"
        placeholder="name@company.com"
        optional={method !== "email"}
        aria-required={method === "email"}
        error={error("email")}
      />
      <TextField
        id={`${kind}-wechat`}
        name="wechat"
        label="微信联系方式"
        english="WeChat contact"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={t.forms.wechatPlaceholder}
        optional={method !== "wechat"}
        aria-required={method === "wechat"}
        error={error("wechat")}
      />
    </>
  );
}
