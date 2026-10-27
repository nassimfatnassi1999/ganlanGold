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
import { TranslatedText } from "@/i18n/TranslatedText";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { OliveScrollSection } from "@/components/sections/OliveScrollSection";

export type PublicProduct = ProductSpec & Readonly<{ zhDescription: string; enDescription: string }>;

const exportSteps = [
  [Sprout, zh.export.steps.source, en.export.steps.source],
  [PackageCheck, zh.export.steps.bottle, en.export.steps.bottle],
  [FileText, zh.export.steps.formalities, en.export.steps.formalities],
  [Globe2, zh.export.steps.handover, en.export.steps.handover],
] as const;

export function PublicExperience({ products }: { products: readonly PublicProduct[] }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section id="top" className="hero" aria-label="GANLAN GOLD">
          <picture className="hero-picture">
            <source media="(max-width: 767px)" type="image/avif" srcSet={`/${ASSET_PATHS.hero.mobileAvif}`} />
            <source media="(max-width: 767px)" type="image/webp" srcSet={`/${ASSET_PATHS.hero.mobileWebp}`} />
            <source type="image/avif" srcSet={`/${ASSET_PATHS.hero.desktopAvif}`} />
            <img src={`/${ASSET_PATHS.hero.desktopWebp}`} alt="" fetchPriority="high" width="1672" height="940" />
          </picture>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-eyebrow"><TranslatedText zh={zh.hero.eyebrow} en={en.hero.eyebrow} /></p>
            <p className="hero-brand">GANLAN GOLD</p>
            <h1><TranslatedText zh={zh.hero.title} en={en.hero.title} /></h1>
            <p className="hero-description"><TranslatedText zh={zh.hero.description} en={en.hero.description} /></p>
            <div className="hero-actions">
              <a className="button button--gold" href="#quote"><TranslatedText zh={zh.hero.quote} en={en.hero.quote} /><ArrowRight size={18} aria-hidden="true" /></a>
              <a className="button button--ghost" href="#products"><TranslatedText zh={zh.hero.explore} en={en.hero.explore} /></a>
            </div>
          </div>
          <div className="hero-note" aria-hidden="true"><span>01</span><i /><span>04</span></div>
        </section>

        <ProductShowcase products={products} />

        <section id="wholesale" className="section wholesale-section" aria-labelledby="wholesale-title">
          <div className="wholesale-ornament" aria-hidden="true" />
          <div className="wholesale-inner">
            <p className="section-eyebrow"><TranslatedText zh={zh.wholesale.eyebrow} en={en.wholesale.eyebrow} /></p>
            <h2 id="wholesale-title"><TranslatedText zh={zh.wholesale.title} en={en.wholesale.title} /></h2>
            <p className="wholesale-rule"><TranslatedText zh={zh.wholesale.body} en={en.wholesale.body} /></p>
            <p className="wholesale-note"><TranslatedText zh={zh.wholesale.note} en={en.wholesale.note} /></p>
          </div>
        </section>

        <section id="origin" className="section origin-section" aria-labelledby="origin-title">
          <div className="section-inner origin-grid">
            <ScrollReveal className="origin-image-wrap" direction="left">
              <Image
                src={`/${ASSET_PATHS.groves.origin}`}
                fill
                sizes="(max-width: 767px) 100vw, 48vw"
                alt="摩洛哥山地橄榄园 / Moroccan mountain olive groves"
                className="origin-image"
              />
              <div className="origin-stamp"><MapPin aria-hidden="true" /><span>Morocco</span></div>
            </ScrollReveal>
            <ScrollReveal className="origin-copy" direction="right" delay={90}>
              <BilingualHeading id="origin-title" eyebrow={zh.origin.eyebrow} englishEyebrow={en.origin.eyebrow} title={zh.origin.title} english={en.origin.title} />
              <p className="section-body"><TranslatedText zh={zh.origin.body} en={en.origin.body} /></p>
              <div className="trace-line">
                {zh.origin.steps.map((step, index) => <ScrollReveal key={step} delay={index * 70}><span>0{index + 1}</span><strong><TranslatedText zh={step} en={en.origin.steps[index]} /></strong></ScrollReveal>)}
              </div>
              <p className="editorial-note"><TranslatedText zh={zh.origin.note} en={en.origin.note} /></p>
            </ScrollReveal>
          </div>
        </section>

        <OliveScrollSection />

        <section id="visit" className="section visit-section" aria-labelledby="visit-title">
          <div className="section-inner">
            <div className="visit-intro">
              <BilingualHeading id="visit-title" eyebrow={zh.visit.eyebrow} englishEyebrow={en.visit.eyebrow} title={zh.visit.title} english={en.visit.title} light />
              <p><TranslatedText zh={zh.visit.body} en={en.visit.body} /></p>
            </div>
            <VisitForm />
          </div>
        </section>

        <section id="export" className="section export-section" aria-labelledby="export-title">
          <div className="section-inner">
            <BilingualHeading id="export-title" eyebrow={zh.export.eyebrow} englishEyebrow={en.export.eyebrow} title={zh.export.title} english={en.export.title} align="center" />
            <ol className="export-timeline">
              {exportSteps.map(([Icon, chinese, english], index) => (
                <ScrollReveal as="li" key={chinese} delay={index * 55}>
                  <span className="export-number">0{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <strong><TranslatedText zh={chinese} en={english} /></strong>
                </ScrollReveal>
              ))}
            </ol>
            <div className="commercial-notes">
              <ScrollReveal as="article"><h3><TranslatedText zh={zh.export.incotermTitle} en={en.export.incotermTitle} /></h3><p><TranslatedText zh={zh.export.incoterm} en={en.export.incoterm} /></p></ScrollReveal>
              <ScrollReveal as="article" delay={60}><h3><TranslatedText zh={zh.export.excludedTitle} en={en.export.excludedTitle} /></h3><p><TranslatedText zh={zh.export.excluded} en={en.export.excluded} /></p></ScrollReveal>
              <ScrollReveal as="article" delay={120}><h3><TranslatedText zh={zh.export.documentsTitle} en={en.export.documentsTitle} /></h3><p><TranslatedText zh={zh.export.documents} en={en.export.documents} /></p></ScrollReveal>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section" aria-labelledby="contact-title">
          <div className="section-inner">
            <BilingualHeading id="contact-title" eyebrow={zh.contact.eyebrow} englishEyebrow={en.contact.eyebrow} title={zh.contact.title} english={en.contact.title} align="center" />
            <div className="contact-grid">
              <ScrollReveal as="article" className="contact-card contact-card--primary">
                <span className="contact-number">01</span><h3>Gisèle</h3>
                <p><TranslatedText zh={zh.contact.giseleRole} en={en.contact.giseleRole} /></p>
                <a className="contact-link" href="tel:+8613427513756"><Phone size={18} aria-hidden="true" />+86 134 2751 3756</a>
              </ScrollReveal>
              <ScrollReveal as="article" className="contact-card" delay={60}>
                <span className="contact-number">02</span><h3>Lassad</h3>
                <p><TranslatedText zh={zh.contact.lassadRole} en={en.contact.lassadRole} /></p>
                <a className="contact-link" href="https://wa.me/33634142632"><Globe2 size={18} aria-hidden="true" />+33 6 34 14 26 32</a>
                <div className="qr-wrap"><Image src={`/${ASSET_PATHS.qr.lassad}`} width={164} height={164} alt="Lassad 微信二维码 / WeChat QR code" unoptimized /><small><TranslatedText zh={zh.contact.wechatQr} en={en.contact.wechatQr} /></small></div>
              </ScrollReveal>
              <ScrollReveal as="article" className="contact-card" delay={120}>
                <span className="contact-number">03</span><h3>Fouad</h3>
                <p><TranslatedText zh={zh.contact.fouadRole} en={en.contact.fouadRole} /></p>
                <a className="contact-link" href="https://wa.me/40724815229"><Globe2 size={18} aria-hidden="true" />+40 724 815 229</a>
                <div className="qr-wrap"><Image src={`/${ASSET_PATHS.qr.fouad}`} width={164} height={164} alt="Fouad 微信二维码 / WeChat QR code" unoptimized /><small><TranslatedText zh={zh.contact.wechatQr} en={en.contact.wechatQr} /></small></div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="quote" className="section quote-section" aria-labelledby="quote-title">
          <div className="section-inner quote-grid">
            <div className="quote-intro">
              <BilingualHeading id="quote-title" eyebrow={zh.quote.eyebrow} englishEyebrow={en.quote.eyebrow} title={zh.quote.title} english={en.quote.title} light />
              <p><TranslatedText zh={zh.quote.intro} en={en.quote.intro} /></p>
              <ul>
                {zh.quote.benefits.map((benefit, index) => <li key={benefit}><Check aria-hidden="true" /><TranslatedText zh={benefit} en={en.quote.benefits[index]} /></li>)}
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
