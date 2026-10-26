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
import { loadPriceConfig, type PriceConfig } from "@/lib/prices";

type PriceState =
  | Readonly<{ status: "loading" }>
  | Readonly<{ status: "loaded"; prices: PriceConfig }>
  | Readonly<{ status: "unavailable" }>;

function capacityLabel(id: PublicProduct["id"]) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function ProductShowcase({ products }: { products: readonly PublicProduct[] }) {
  const [priceState, setPriceState] = useState<PriceState>({ status: "loading" });

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
                        <p className="price-usd"><TranslatedText zh={zh.products.referenceUsd} en={en.products.referenceUsd} /> · USD ${price.usd}</p>
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
      </div>
    </section>
  );
}
