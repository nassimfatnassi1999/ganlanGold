import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";

type FieldProps = Readonly<{
  id: string;
  label: string;
  english: string;
  optional?: boolean;
  children?: ReactNode;
}>;

export function FieldLabel({ id, label, english, optional = false, children }: FieldProps) {
  const { language } = useLanguage();
  const activeLabel = language === "zh-CN" ? label : english;
  const optionalLabel = language === "zh-CN" ? zh.forms.optional : en.forms.optional;
  return (
    <label className="form-field" htmlFor={id}>
      <span>{activeLabel}{optional ? <small> · {optionalLabel}</small> : null}</span>
      {children}
    </label>
  );
}

export function TextField({ id, label, english, optional, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return <FieldLabel id={id} label={label} english={english} optional={optional}><input id={id} {...props} /></FieldLabel>;
}

export function TextAreaField({ id, label, english, optional, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <FieldLabel id={id} label={label} english={english} optional={optional}><textarea id={id} {...props} /></FieldLabel>;
}
