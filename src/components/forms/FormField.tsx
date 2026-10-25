import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldProps = Readonly<{
  id: string;
  label: string;
  english: string;
  optional?: boolean;
  children?: ReactNode;
}>;

export function FieldLabel({ id, label, english, optional = false, children }: FieldProps) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label} <small lang="en">/ {english}{optional ? " · 选填" : ""}</small></span>
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
