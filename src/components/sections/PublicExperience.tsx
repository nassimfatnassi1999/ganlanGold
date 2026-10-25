import Image from "next/image";
import { ArrowRight, Check, FileText, Globe2, MapPin, PackageCheck, Phone, Sprout } from "lucide-react";
import { ASSET_PATHS } from "@/lib/assets";
import type { ProductSpec } from "@/lib/products/catalog";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductShowcase } from "@/components/products/ProductShowcase";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { VisitForm } from "@/components/forms/VisitForm";
import { BilingualHeading } from "@/components/ui/BilingualHeading";

export type PublicProduct = ProductSpec & Readonly<{ zhDescription: string; enDescription: string }>;
export type PublicRate =
  | Readonly<{ status: "available"; usdCny: string; referenceDate: string; source: "fresh" | "cache" }>
  | Readonly<{ status: "unavailable" }>;

const exportSteps = [
  [Sprout, zh.export.steps.source, en.export.steps.source],
  [PackageCheck, zh.export.steps.bottle, en.export.steps.bottle],
  [FileText, zh.export.steps.formalities, en.export.steps.formalities],
  [Globe2, zh.export.steps.handover, en.export.steps.handover],
] as const;

export function PublicExperience({ products, rate }: { products: readonly PublicProduct[]; rate: PublicRate }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section id="top" className="hero" aria-label="GANLAN GOLD">
          <picture className="hero-picture">
            <source media="(max-width: 640px)" type="image/avif" srcSet={`/${ASSET_PATHS.hero.mobileAvif}`} />
            <source media="(max-width: 640px)" type="image/webp" srcSet={`/${ASSET_PATHS.hero.mobileWebp}`} />
            <source type="image/avif" srcSet={`/${ASSET_PATHS.hero.desktopAvif}`} />
            <img src={`/${ASSET_PATHS.hero.desktopWebp}`} alt="" fetchPriority="high" />
          </picture>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-eyebrow">{zh.hero.eyebrow}</p>
            <p className="hero-brand">GANLAN GOLD</p>
            <h1>{zh.hero.title}</h1>
            <p className="hero-english" lang="en">{en.hero.title}</p>
            <p className="hero-description">{zh.hero.description}</p>
            <p className="hero-description hero-description--en" lang="en">{en.hero.description}</p>
            <div className="hero-actions">
              <a className="button button--gold" href="#quote">{zh.hero.quote}<ArrowRight size={18} aria-hidden="true" /></a>
              <a className="button button--ghost" href="#products">{zh.hero.explore}<span lang="en">{en.hero.explore}</span></a>
            </div>
          </div>
          <div className="hero-note" aria-hidden="true"><span>01</span><i /><span>04</span></div>
        </section>

        <ProductShowcase products={products} rate={rate} />

        <section id="wholesale" className="section wholesale-section" aria-label={zh.nav.wholesale}>
          <div className="wholesale-ornament" aria-hidden="true" />
          <div className="wholesale-inner">
            <p className="section-eyebrow">{zh.wholesale.eyebrow}</p>
            <h2>{zh.wholesale.title}</h2>
            <p className="wholesale-rule">{zh.wholesale.body}</p>
            <p className="wholesale-rule wholesale-rule--en" lang="en">{en.wholesale.body}</p>
            <p className="wholesale-note">{zh.wholesale.note}<br /><span lang="en">{en.wholesale.note}</span></p>
          </div>
        </section>

        <section id="origin" className="section origin-section" aria-label={zh.nav.origin}>
          <div className="section-inner origin-grid">
            <div className="origin-image-wrap">
              <Image
                src={`/${ASSET_PATHS.groves.atmosphere}`}
                fill
                sizes="(max-width: 767px) 100vw, 48vw"
                alt="摩洛哥橄榄园氛围参考图"
                className="origin-image"
              />
              <div className="origin-stamp"><MapPin aria-hidden="true" /><span>Morocco</span></div>
            </div>
            <div className="origin-copy">
              <BilingualHeading eyebrow={zh.origin.eyebrow} title={zh.origin.title} english={en.origin.subtitle} />
              <p className="section-body">{zh.origin.body}</p>
              <p className="section-body section-body--en" lang="en">{en.origin.body}</p>
              <div className="trace-line">
                {[
                  ["01", "采购协调", "Sourcing"],
                  ["02", "批次追踪", "Traceability"],
                  ["03", "质量准备", "Quality control"],
                ].map(([number, cn, english]) => <div key={number}><span>{number}</span><strong>{cn}</strong><small lang="en">{english}</small></div>)}
              </div>
              <p className="editorial-note">{zh.origin.note}<br /><span lang="en">{en.origin.note}</span></p>
            </div>
          </div>
        </section>

        <section id="visit" className="section visit-section" aria-label={zh.nav.visit}>
          <div className="section-inner">
            <div className="visit-intro">
              <BilingualHeading eyebrow={zh.visit.eyebrow} title={zh.visit.title} english={en.visit.subtitle} light />
              <p>{zh.visit.body}</p>
              <p lang="en">{en.visit.body}</p>
            </div>
            <VisitForm />
          </div>
        </section>

        <section id="export" className="section export-section" aria-label={zh.nav.export}>
          <div className="section-inner">
            <BilingualHeading eyebrow={zh.export.eyebrow} title={zh.export.title} english={en.export.subtitle} align="center" />
            <ol className="export-timeline">
              {exportSteps.map(([Icon, chinese, english], index) => (
                <li key={chinese}>
                  <span className="export-number">0{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <strong>{chinese}</strong>
                  <small lang="en">{english}</small>
                </li>
              ))}
            </ol>
            <div className="commercial-notes">
              <article><h3>交货规则 <small lang="en">Incoterms</small></h3><p>{zh.export.incoterm}</p><p lang="en">{en.export.incoterm}</p></article>
              <article><h3>价格不包含 <small lang="en">Exclusions</small></h3><p>{zh.export.excluded}</p><p lang="en">{en.export.excluded}</p></article>
              <article><h3>商业文件 <small lang="en">Documents</small></h3><p>{zh.export.documents}</p><p lang="en">{en.export.documents}</p></article>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section" aria-label={zh.nav.contact}>
          <div className="section-inner">
            <BilingualHeading eyebrow={zh.contact.eyebrow} title={zh.contact.title} english={en.contact.subtitle} align="center" />
            <div className="contact-grid">
              <article className="contact-card contact-card--primary">
                <span className="contact-number">01</span><h3>Gisèle</h3>
                <p>{zh.contact.giseleRole}</p><p lang="en">{en.contact.giseleRole}</p>
                <a className="contact-link" href="tel:+8613427513756"><Phone size={18} aria-hidden="true" />+86 134 2751 3756</a>
              </article>
              <article className="contact-card">
                <span className="contact-number">02</span><h3>Lassad</h3>
                <p>{zh.contact.lassadRole}</p><p lang="en">{en.contact.lassadRole}</p>
                <a className="contact-link" href="https://wa.me/33634142632"><Globe2 size={18} aria-hidden="true" />+33 6 34 14 26 32</a>
                <div className="qr-wrap"><Image src={`/${ASSET_PATHS.qr.lassad}`} width={164} height={164} alt="Lassad 微信二维码" unoptimized /><small>{zh.contact.wechatQr} · WeChat</small></div>
              </article>
              <article className="contact-card">
                <span className="contact-number">03</span><h3>Fouad</h3>
                <p>{zh.contact.fouadRole}</p><p lang="en">{en.contact.fouadRole}</p>
                <a className="contact-link" href="https://wa.me/40724815229"><Globe2 size={18} aria-hidden="true" />+40 724 815 229</a>
                <div className="qr-wrap"><Image src={`/${ASSET_PATHS.qr.fouad}`} width={164} height={164} alt="Fouad 微信二维码" unoptimized /><small>{zh.contact.wechatQr} · WeChat</small></div>
              </article>
            </div>
          </div>
        </section>

        <section id="quote" className="section quote-section" aria-label={zh.nav.quote}>
          <div className="section-inner quote-grid">
            <div className="quote-intro">
              <BilingualHeading eyebrow={zh.quote.eyebrow} title={zh.quote.title} english={en.quote.subtitle} light />
              <p>{zh.quote.intro}</p><p lang="en">{en.quote.intro}</p>
              <ul>
                <li><Check aria-hidden="true" />多规格选择 <small lang="en">Multi-format selection</small></li>
                <li><Check aria-hidden="true" />美元最终确认 <small lang="en">Final confirmation in USD</small></li>
                <li><Check aria-hidden="true" />专人跟进 <small lang="en">Personal follow-up</small></li>
              </ul>
            </div>
            <QuoteForm products={products} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
