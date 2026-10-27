"use client";
import { CircleAlert } from "lucide-react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { FIELD_LIMITS } from "@/lib/forms/lead";

type FieldProps = Readonly<{
  id: string;
  label: string;
  english: string;
  optional?: boolean;
  children?: ReactNode;
  error?: string;
}>;
export function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <small className="field-error" id={id} aria-live="polite">
      <CircleAlert aria-hidden="true" />
      {error}
    </small>
  ) : null;
}
export function FieldLabel({
  id,
  label,
  english,
  optional = false,
  children,
  error,
}: FieldProps) {
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  return (
    <label className="form-field" htmlFor={id}>
      <span>
        {language === "zh-CN" ? label : english}
        {optional ? <small> · {t.forms.optional}</small> : null}
      </span>
      {children}
      <FieldError id={`${id}-error`} error={error} />
    </label>
  );
}
export function TextField({
  id,
  label,
  english,
  optional,
  error,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldLabel {...{ id, label, english, optional, error }}>
      <input
        id={id}
        aria-required={!optional}
        maxLength={FIELD_LIMITS[props.name ?? ""]}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </FieldLabel>
  );
}
export function TextAreaField({
  id,
  label,
  english,
  optional,
  error,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldLabel {...{ id, label, english, optional, error }}>
      <textarea
        id={id}
        maxLength={4000}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </FieldLabel>
  );
}
