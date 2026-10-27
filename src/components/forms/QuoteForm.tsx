"use client";
import { useState } from "react";
import type { ProductSpec } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  buildQuoteParams,
  capacityLabel,
  totalLitres,
  validateQuote,
} from "@/lib/forms/lead";
import { TextAreaField, TextField } from "./FormField";
import { LeadFormFeedback } from "./LeadFormFeedback";
import { LeadFormControls } from "./LeadFormControls";
import { useLeadForm } from "./useLeadForm";

export function QuoteForm({
  products,
}: {
  products: readonly Pick<ProductSpec, "id">[];
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [belowPolicy, setBelowPolicy] = useState(false);
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const lead = useLeadForm({
    kind: "quote",
    validate: (values) => {
      const result = validateQuote(values);
      setBelowPolicy(!!result.data && totalLitres(result.data.products) < 7500);
      return result;
    },
    params: buildQuoteParams,
    onSuccess: () => {
      setSelected({});
      setBelowPolicy(false);
    },
  });
  const error = (name: string) =>
    lead.errors[name] ? t.forms[lead.errors[name]] : undefined;
  return (
    <form
      className="lead-form"
      noValidate
      onSubmit={lead.submit}
      onChange={() => {
        lead.changed();
        setBelowPolicy(false);
      }}
      aria-busy={lead.status === "sending"}
    >
      <LeadFormFeedback lead={lead} kind="quote" />
      <fieldset
        className="lead-form-fields"
        disabled={lead.status === "sending"}
      >
        <div className="form-grid">
          <TextField
            id="quote-company"
            name="company"
            label="公司名称"
            english="Company name"
            autoComplete="organization"
            error={error("company")}
          />
          <TextField
            id="quote-country"
            name="country"
            label="国家或地区"
            english="Country or region"
            autoComplete="country-name"
            error={error("country")}
          />
          <TextField
            id="quote-person"
            name="contactPerson"
            label="联系人"
            english="Contact person"
            autoComplete="name"
            error={error("contactPerson")}
          />
          <TextField
            id="quote-email"
            name="email"
            type="email"
            label="电子邮箱"
            english="Email"
            autoComplete="email"
            error={error("email")}
          />
          <TextField
            id="quote-wechat"
            name="wechat"
            label="微信联系方式"
            english="WeChat contact"
            optional
            error={error("wechat")}
          />
          <TextField
            id="quote-port"
            name="destinationPort"
            label="目的港"
            english="Destination port"
            error={error("destinationPort")}
          />
        </div>
        <fieldset
          className="product-picker"
          aria-describedby={
            error("products") ? "quote-products-error" : undefined
          }
        >
          <legend>{t.quote.products}</legend>
          {error("products") ? (
            <p className="field-error" id="quote-products-error">
              {error("products")}
            </p>
          ) : null}
          <div className="product-picker-grid">
            {products.map((product) => {
              const label = capacityLabel(product.id),
                name = `quantity-${product.id}`,
                id = `quote-${name}`;
              return (
                <div
                  className={
                    selected[product.id]
                      ? "product-choice product-choice--selected"
                      : "product-choice"
                  }
                  key={product.id}
                >
                  <label>
                    <input
                      type="checkbox"
                      name={`select-${product.id}`}
                      aria-label={
                        language === "zh-CN"
                          ? `选择 ${label}`
                          : `Select ${label}`
                      }
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [product.id]: event.target.checked,
                        }))
                      }
                    />
                    <strong>{label}</strong>
                  </label>
                  <label className="quantity-label">
                    <span>{t.forms.quantity}</span>
                    <input
                      id={id}
                      type="number"
                      min="1"
                      max="1000000"
                      step="1"
                      name={name}
                      aria-label={
                        language === "zh-CN"
                          ? `${label} 包装数量`
                          : `${label} package quantity`
                      }
                      disabled={!selected[product.id]}
                      aria-invalid={!!error(name)}
                      aria-describedby={error(name) ? `${id}-error` : undefined}
                    />
                  </label>
                  {error(name) ? (
                    <small className="field-error" id={`${id}-error`}>
                      {error(name)}
                    </small>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
        {belowPolicy ? (
          <p className="form-dispatch-note">{t.quote.belowPolicy}</p>
        ) : null}
        <TextAreaField
          id="quote-message"
          name="message"
          label="补充说明"
          english="Additional message"
          optional
          rows={4}
          error={error("message")}
        />
        <LeadFormControls lead={lead} kind="quote" />
      </fieldset>
    </form>
  );
}
