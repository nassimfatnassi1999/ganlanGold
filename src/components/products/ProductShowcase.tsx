import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { calculateIndicativeCny } from "@/lib/currency/calculate";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { BilingualHeading } from "@/components/ui/BilingualHeading";
import type { PublicProduct, PublicRate } from "@/components/sections/PublicExperience";

function capacityLabel(id: PublicProduct["id"]) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function ProductShowcase({ products, rate }: { products: readonly PublicProduct[]; rate: PublicRate }) {
  return (
    <section id="products" className="section products-section" aria-label={zh.nav.products}>
      <div className="section-inner">
        <BilingualHeading
          eyebrow={zh.products.eyebrow}
          title={zh.products.title}
          english={en.products.subtitle}
          align="center"
        />
        <p className="section-intro section-intro--center">{zh.products.intro}</p>
        <div className="product-list">
          {products.map((product, index) => {
            const cny = rate.status === "available" ? calculateIndicativeCny(product.referenceUsd, rate.usdCny) : null;
            return (
              <article className={`product-row${index % 2 ? " product-row--reverse" : ""}`} key={product.id}>
                <div className={`product-visual${product.id === "5l" ? " product-visual--tin" : ""}`}>
                  <span className="product-index" aria-hidden="true">0{index + 1}</span>
                  <Image
                    src={product.imagePath}
                    width={product.id === "5l" ? 560 : 420}
                    height={540}
                    sizes="(max-width: 767px) 72vw, 38vw"
                    alt={`${capacityLabel(product.id)} ${zh.products.label}`}
                  />
                </div>
                <div className="product-copy">
                  <p className="product-kicker">GANLAN GOLD · {zh.products.label}</p>
                  <h3>{capacityLabel(product.id)}</h3>
                  <p className="product-description">{product.zhDescription}</p>
                  <p className="product-description product-description--en" lang="en">{product.enDescription}</p>
                  {product.professional ? <span className="product-badge">{zh.products.professional}</span> : null}
                  <div className="price-block">
                    {cny === null || rate.status !== "available" ? (
                      <p className="price-unavailable">{zh.products.rateUnavailable}<small lang="en">{en.products.rateUnavailable}</small></p>
                    ) : (
                      <>
                        <p className="price-label">{zh.products.indicative} <small lang="en">{en.products.indicative}</small></p>
                        <p className="price-cny">¥{cny}</p>
                        <p className="rate-date">{zh.products.rateDate}：{rate.referenceDate}</p>
                      </>
                    )}
                    <p className="price-usd">{zh.products.referenceUsd} · USD ${product.referenceUsd}</p>
                  </div>
                  <a className="text-link" href={`#quote`}>
                    {zh.products.request}<ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
