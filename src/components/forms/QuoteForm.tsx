"use client";

import { useState } from "react";
import type { ProductSpec } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import { TextAreaField, TextField } from "./FormField";
import { text, useLeadForm } from "./useLeadForm";

function capacityLabel(id: ProductSpec["id"]) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function QuoteForm({ products }: { products: readonly Pick<ProductSpec, "id">[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const { state, submit, hydrated, copyPreparedMessage } = useLeadForm<{
    company: string; country: string; contactPerson: string; email?: string; wechat?: string;
    destinationPort: string; products: {productId: ProductSpec["id"]; quantity: number}[];
    message?: string; consent: true; website: string;
  }>({
    kind: "quote",
    format(data) {
      const lines = [
        language === "zh-CN" ? "GANLAN GOLD — 询价" : "GANLAN GOLD — Quotation request",
        `Company: ${data.company}`,
        `Country: ${data.country}`,
        `Contact: ${data.contactPerson}`,
        `Email: ${data.email || "—"}`,
        `WeChat: ${data.wechat || "—"}`,
        `Destination port: ${data.destinationPort}`,
        language === "zh-CN" ? "产品（包装数量）：" : "Products (package counts):",
        ...data.products.map((item) => `- ${capacityLabel(item.productId)}: ${item.quantity}`),
        `${language === "zh-CN" ? "橄榄油总容量" : "Total olive oil volume"}: ${data.products.reduce((sum, item) => sum + item.quantity * ({ "250ml": 0.25, "500ml": 0.5, "750ml": 0.75, "5l": 5 }[item.productId]), 0).toFixed(2)} L`,
        `Message: ${data.message || "—"}`,
        language === "zh-CN" ? "最终商业报价以美元确认，除非另有说明，通常有效期为 15 天。" : "Final commercial quotation is confirmed in USD (normally valid for 15 days unless stated otherwise).",
      ];
      return lines.join("\n");
    },
    validate(form) {
      const values = new FormData(form);
      const errors: string[] = [];
      const required = ["company", "country", "contactPerson", "destinationPort"];
      for (const key of required) if (!text(values, key)) errors.push(t.forms.requiredFields);
      const email = text(values, "email");
      const wechat = text(values, "wechat");
      if (!email && !wechat) errors.push(t.forms.contactRequired);
      if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push(t.forms.invalidEmail);
      const choices = products
        .filter((product) => values.get(`select-${product.id}`) === "on")
        .map((product) => ({ productId: product.id, quantity: Number(values.get(`quantity-${product.id}`)) }))
        .filter((choice) => Number.isInteger(choice.quantity) && choice.quantity > 0);
      if (!choices.length) errors.push(t.forms.productRequired);
      if (values.get("consent") !== "on") errors.push(t.forms.consentRequired);
      return {
        errors: [...new Set(errors)],
        data: errors.length
          ? undefined
          : {
              company: text(values, "company"),
              country: text(values, "country"),
              contactPerson: text(values, "contactPerson"),
              email: email || undefined,
              wechat: wechat || undefined,
              destinationPort: text(values, "destinationPort"),
              products: choices,
              message: text(values, "message") || undefined,
              consent: true as const,
              website: text(values, "website"),
            },
      };
    },
  });

  return (
    <form className="lead-form" noValidate onSubmit={submit}>
      {state.status === "error" ? (
        <div className="form-summary" role="alert" tabIndex={-1}>
          <strong>{t.forms.errorTitle}</strong>
          <ul>{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}
      {state.status === "ready" ? (
        <div className="lead-handoff" role="status">
          <strong>{t.quote.success}</strong>
          <p>{t.forms.quoteNotSent}</p>
          <div className="lead-handoff-actions">
            <a className="button button--gold" href={state.whatsappUrl} target="_blank" rel="noopener noreferrer">{t.forms.whatsappQuote}</a>
            <button type="button" className="button button--outline" onClick={copyPreparedMessage}>{state.copied ? t.forms.copied : t.forms.copy}</button>
          </div>
          <pre className="lead-message-preview">{state.message}</pre>
        </div>
      ) : null}
      <div className="form-grid">
        <TextField id="quote-company" name="company" label="公司名称" english="Company name" autoComplete="organization" />
        <TextField id="quote-country" name="country" label="国家或地区" english="Country or region" autoComplete="country-name" />
        <TextField id="quote-person" name="contactPerson" label="联系人" english="Contact person" autoComplete="name" />
        <TextField id="quote-email" name="email" type="email" label="电子邮箱" english="Email" autoComplete="email" />
        <TextField id="quote-wechat" name="wechat" label="微信联系方式" english="WeChat contact" optional />
        <TextField id="quote-port" name="destinationPort" label="目的港" english="Destination port" />
      </div>
      <fieldset className="product-picker">
        <legend>{t.quote.products}</legend>
        <div className="product-picker-grid">
          {products.map((product) => {
            const label = capacityLabel(product.id);
            return (
              <div className={selected[product.id] ? "product-choice product-choice--selected" : "product-choice"} key={product.id}>
                <label>
                  <input
                    type="checkbox"
                    name={`select-${product.id}`}
                    aria-label={language === "zh-CN" ? `选择 ${label}` : `Select ${label}`}
                    onChange={(event) => setSelected((current) => ({ ...current, [product.id]: event.target.checked }))}
                  />
                  <strong>{label}</strong>
                </label>
                <label className="quantity-label">
                  <span>{t.forms.quantity}</span>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    step="1"
                    name={`quantity-${product.id}`}
                    aria-label={language === "zh-CN" ? `${label} 包装数量` : `${label} package quantity`}
                    disabled={!selected[product.id]}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
      <TextAreaField id="quote-message" name="message" label="补充说明" english="Additional message" optional rows={4} />
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="consent-row">
        <input type="checkbox" name="consent" />
        <span>{t.quote.consent} <a href="/privacy">{t.forms.privacyLink}</a></span>
      </label>
      <button className="button button--gold form-submit" type="submit" disabled={!hydrated}>
        {t.quote.submit}
      </button>
      <p className="form-dispatch-note">{t.forms.dispatchNote}</p>
    </form>
  );
}
