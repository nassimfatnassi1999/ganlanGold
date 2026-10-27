"use client";
import { useState } from "react";
import type { ProductSpec } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  buildQuoteParams,
  capacityLabel,
  validateQuote,
  PRODUCT_IDS,
  PACKAGE_ML,
  formText,
  type ContactMethod,
} from "@/lib/forms/lead";
import { ContactFields } from "./ContactFields";
import { TextAreaField, TextField, FieldError } from "./FormField";
import { LeadFormFeedback } from "./LeadFormFeedback";
import { LeadFormControls } from "./LeadFormControls";
import { formValues } from "./formValues";
import { useLeadForm } from "./useLeadForm";

export function QuoteForm({
  products,
}: {
  products: readonly Pick<ProductSpec, "id">[];
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [volume, setVolume] = useState(0);
  const [method, setMethod] = useState<ContactMethod>("either");
  const [unknownPort, setUnknownPort] = useState(false);
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  const lead = useLeadForm({
    kind: "quote",
    validate: validateQuote,
    params: buildQuoteParams,
    onSuccess: () => {
      setSelected({});
      setVolume(0);
      setMethod("either");
      setUnknownPort(false);
    },
  });
  const error = (name: string) =>
    lead.errors[name] ? t.forms[lead.errors[name]] : undefined;
  return (
    <form
      className="lead-form"
      noValidate
      onSubmit={lead.submit}
      onBlur={lead.blurred}
      onPointerDownCapture={lead.pointerStarted}
      onPointerUpCapture={lead.pointerEnded}
      onPointerCancelCapture={lead.pointerEnded}
      onKeyDownCapture={lead.pointerEnded}
      onChange={(event) => {
        lead.changed(event);
        const values = formValues(event.currentTarget);
        const selectedProducts = PRODUCT_IDS.filter(
          (id) => values.get(`select-${id}`) === "on",
        );
        const counts = selectedProducts.map((id) => {
          const raw = formText(values, `quantity-${id}`);
          return /^\d+$/.test(raw) && Number(raw) <= 1_000_000
            ? Number(raw) * PACKAGE_ML[id]
            : NaN;
        });
        setVolume(counts.reduce((sum, count) => sum + count, 0) / 1000);
      }}
    >
      <fieldset
        className="lead-form-fields"
        aria-busy={lead.status === "sending"}
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
          <ContactFields
            kind="quote"
            lead={lead}
            method={method}
            onMethodChange={setMethod}
          />
          <div>
            <TextField
              id="quote-port"
              name="destinationPort"
              label="目的港"
              english="Destination port"
              error={error("destinationPort")}
              disabled={unknownPort}
              aria-required={!unknownPort}
            />
            <label className="port-option">
              <input
                type="checkbox"
                name="destinationUnknown"
                checked={unknownPort}
                onChange={(event) => setUnknownPort(event.target.checked)}
              />
              {t.forms.notSure}
            </label>
          </div>
        </div>
        <fieldset
          className="product-picker"
          aria-describedby={
            error("products") ? "quote-products-error" : undefined
          }
        >
          <legend>{t.quote.products}</legend>
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
                      aria-invalid={!!error("products")}
                      aria-describedby={
                        error("products") ? "quote-products-error" : undefined
                      }
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
                      min="0"
                      inputMode="numeric"
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
                  <FieldError id={`${id}-error`} error={error(name)} />
                </div>
              );
            })}
          </div>
          <FieldError id="quote-products-error" error={error("products")} />
        </fieldset>
        {Number.isFinite(volume) && volume > 0 ? (
          <p className="form-total">
            {t.forms.totalLitres}:{" "}
            {volume.toLocaleString(language, { maximumFractionDigits: 2 })}
          </p>
        ) : null}
        {Number.isFinite(volume) && volume > 0 && volume < 7500 ? (
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
      <LeadFormFeedback lead={lead} />
    </form>
  );
}
