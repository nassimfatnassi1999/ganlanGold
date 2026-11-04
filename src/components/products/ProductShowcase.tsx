"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { BilingualHeading } from "@/components/ui/BilingualHeading";
import type { PublicProduct } from "@/components/sections/PublicExperience";
import { TranslatedText } from "@/i18n/TranslatedText";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { loadPriceConfig, type PriceConfig, type RuntimePrice } from "@/lib/prices";
import {
  convertCny,
  loadExchangeRates,
  readStoredExchangeRates,
  storeExchangeRates,
  type ExchangeRates,
} from "@/lib/exchangeRates";

type PriceState =
  | Readonly<{ status: "loading" }>
  | Readonly<{ status: "loaded"; prices: PriceConfig }>
  | Readonly<{ status: "unavailable" }>;

/** live = today's feed; cached = last valid feed in this browser; manual = values from prices.json. */
type RateState =
  | Readonly<{ status: "loading" }>
  | Readonly<{ status: "live"; rates: ExchangeRates }>
  | Readonly<{ status: "cached"; rates: ExchangeRates }>
  | Readonly<{ status: "manual" }>;

function equivalents(price: RuntimePrice, rateState: RateState) {
  if (rateState.status === "live" || rateState.status === "cached") {
    return { usd: convertCny(price.cny, rateState.rates.usd), eur: convertCny(price.cny, rateState.rates.eur) };
  }
  if (rateState.status === "manual") return { usd: price.usd, eur: price.eur };
  return null;
}

function RateNote({ rateState }: Readonly<{ rateState: RateState }>) {
  if (rateState.status === "live" || rateState.status === "cached") {
    const key = rateState.status === "live" ? "rateLive" : "rateCached";
    const date = rateState.rates.date;
    return (
      <p className="rate-date">
        <TranslatedText zh={zh.products[key].replace("{date}", date)} en={en.products[key].replace("{date}", date)} />
      </p>
    );
  }
  if (rateState.status === "manual") {
    return <p className="rate-date"><TranslatedText zh={zh.products.rateManual} en={en.products.rateManual} /></p>;
  }
  return null;
}

function capacityLabel(id: PublicProduct["id"]) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function ProductShowcase({ products }: { products: readonly PublicProduct[] }) {
  const [priceState, setPriceState] = useState<PriceState>({ status: "loading" });
  const [rateState, setRateState] = useState<RateState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    loadPriceConfig(controller.signal)
      .then((prices) => setPriceState({ status: "loaded", prices }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPriceState({ status: "unavailable" });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadExchangeRates(controller.signal)
      .then((rates) => {
        storeExchangeRates(rates);
        setRateState({ status: "live", rates });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        const stored = readStoredExchangeRates();
        setRateState(stored ? { status: "cached", rates: stored } : { status: "manual" });
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="products" className="section products-section" aria-labelledby="products-title">
      <div className="section-inner">
        <BilingualHeading
          id="products-title"
          eyebrow={zh.products.eyebrow}
          englishEyebrow={en.products.eyebrow}
          title={zh.products.title}
          english={en.products.title}
          align="center"
        />
        <p className="section-intro section-intro--center"><TranslatedText zh={zh.products.intro} en={en.products.intro} /></p>
        <div className="product-list">
          {products.map((product, index) => {
            const price = priceState.status === "loaded" ? priceState.prices[product.id] : null;
            const converted = price ? equivalents(price, rateState) : null;
            return (
              <ScrollReveal
                as="article"
                className={`product-row${index % 2 ? " product-row--reverse" : ""}`}
                direction={index % 2 ? "right" : "left"}
                key={product.id}
              >
                <div className={`product-visual${product.id === "5l" ? " product-visual--tin" : ""}`}>
                  <Image
                    src={product.imagePath}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 46vw, 580px"
                    loading="lazy"
                    alt={`${capacityLabel(product.id)} ${zh.products.label}`}
                  />
                </div>
                <div className="product-copy">
                  <p className="product-kicker">GANLAN GOLD · <TranslatedText zh={zh.products.label} en={en.products.label} /></p>
                  <h3>{capacityLabel(product.id)}</h3>
                  <p className="product-description"><TranslatedText zh={product.zhDescription} en={product.enDescription} /></p>
                  {product.professional ? <span className="product-badge"><TranslatedText zh={zh.products.professional} en={en.products.professional} /></span> : null}
                  <div className="price-block" aria-live="polite">
                    <p className="price-label"><TranslatedText zh={zh.products.indicative} en={en.products.indicative} /></p>
                    {price ? (
                      <>
                        <p className="price-cny">¥{price.cny}</p>
                        {converted ? (
                          <>
                            <p className="price-equivalents">
                              <span className="price-usd">≈ USD ${converted.usd}</span>
                              <span className="price-eur">≈ EUR €{converted.eur}</span>
                            </p>
                            <RateNote rateState={rateState} />
                          </>
                        ) : null}
                      </>
                    ) : (
                      <p className="price-unavailable">
                        <TranslatedText
                          zh={priceState.status === "loading" ? zh.products.priceLoading : zh.products.priceUnavailable}
                          en={priceState.status === "loading" ? en.products.priceLoading : en.products.priceUnavailable}
                        />
                      </p>
                    )}
                  </div>
                  <a className="text-link" href={`#quote`}>
                    <TranslatedText zh={zh.products.request} en={en.products.request} /><ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        <PricingTerms />
      </div>
    </section>
  );
}

/** Wholesale pricing terms: Chinese first with the English underneath; English only in EN mode. */
function PricingTerms() {
  return (
    <aside className="pricing-terms">
      <div className="pricing-terms__zh language-content--zh" lang="zh-CN">
        <h3 className="pricing-terms__title">{zh.products.terms.title}</h3>
        {zh.products.terms.paragraphs.map((text) => <p key={text}>{text}</p>)}
      </div>
      <div className="pricing-terms__en" lang="en">
        <p className="pricing-terms__title">{en.products.terms.title}</p>
        {en.products.terms.paragraphs.map((text) => <p key={text}>{text}</p>)}
      </div>
    </aside>
  );
}
