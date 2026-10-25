"use client";

import { useState } from "react";
import type { ProductSpec } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import { TextAreaField, TextField } from "./FormField";
import { text, useLeadForm } from "./useLeadForm";

function capacityLabel(id: ProductSpec["id"]) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function QuoteForm({ products }: { products: readonly Pick<ProductSpec, "id">[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { state, submit, hydrated } = useLeadForm({
    endpoint: "/api/quotes",
    validate(form) {
      const values = new FormData(form);
      const errors: string[] = [];
      const required = ["company", "country", "contactPerson", "destinationPort"];
      for (const key of required) if (!text(values, key)) errors.push("请填写所有必填信息。 / Complete all required fields.");
      const email = text(values, "email");
      const wechat = text(values, "wechat");
      if (!email && !wechat) errors.push("请提供电子邮箱或微信联系方式。 / Provide email or WeChat.");
      if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("请输入有效的电子邮箱。 / Enter a valid email.");
      const choices = products
        .filter((product) => values.get(`select-${product.id}`) === "on")
        .map((product) => ({ productId: product.id, quantity: Number(values.get(`quantity-${product.id}`)) }))
        .filter((choice) => Number.isInteger(choice.quantity) && choice.quantity > 0);
      if (!choices.length) errors.push("请选择至少一种产品并填写包装数量。 / Select at least one product and quantity.");
      if (values.get("consent") !== "on") errors.push("请确认隐私同意。 / Privacy consent is required.");
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
          <strong>{zh.forms.errorTitle}</strong>
          <ul>{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}
      {state.status === "success" ? (
        <div className="form-success" role="status">
          <strong>{zh.quote.success} {state.result.requestId}</strong>
          <span lang="en">Your inquiry has been received. Keep this request reference.</span>
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
        <legend>{zh.quote.products}<small lang="en"> / Products and package quantities</small></legend>
        <div className="product-picker-grid">
          {products.map((product) => {
            const label = capacityLabel(product.id);
            return (
              <div className={selected[product.id] ? "product-choice product-choice--selected" : "product-choice"} key={product.id}>
                <label>
                  <input
                    type="checkbox"
                    name={`select-${product.id}`}
                    aria-label={`选择 ${label}`}
                    onChange={(event) => setSelected((current) => ({ ...current, [product.id]: event.target.checked }))}
                  />
                  <strong>{label}</strong>
                </label>
                <label className="quantity-label">
                  <span>{zh.quote.quantity}</span>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    step="1"
                    name={`quantity-${product.id}`}
                    aria-label={`${label} 包装数量`}
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
        <span>{zh.quote.consent} <a href="/privacy">{zh.forms.privacyLink}</a></span>
      </label>
      <button className="button button--gold form-submit" type="submit" disabled={!hydrated || state.status === "submitting"}>
        {state.status === "submitting" ? zh.forms.sending : zh.quote.submit}
      </button>
    </form>
  );
}
