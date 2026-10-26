"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useHydrated } from "@/components/ui/useHydrated";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { TranslatedText } from "@/i18n/TranslatedText";
import { useLanguage } from "@/i18n/LanguageProvider";

const links = [
  ["products", "products"],
  ["origin", "origin"],
  ["visit", "visit"],
  ["export", "export"],
  ["contact", "contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const { language } = useLanguage();
  const t = language === "zh-CN" ? zh : en;
  return (
    <header className="site-header">
      <a className="brand-lockup" href="#top" aria-label={t.nav.home}>
        <span>GANLAN GOLD</span>
        <small>Moroccan Olive Oil</small>
      </a>
      <nav id="site-navigation" className={open ? "site-nav site-nav--open" : "site-nav"} aria-label={t.nav.main}>
        {links.map(([key, id]) => (
          <a key={key} href={`#${id}`} onClick={() => setOpen(false)}>
            <span><TranslatedText zh={zh.nav[key]} en={en.nav[key]} /></span>
          </a>
        ))}
        <a className="button button--gold nav-quote" href="#quote" onClick={() => setOpen(false)}>
          <TranslatedText zh={zh.nav.quote} en={en.nav.quote} />
        </a>
      </nav>
      <LanguageSwitcher />
      <button
        className="menu-button"
        type="button"
        aria-label={t.nav.menu}
        aria-expanded={open}
        aria-controls="site-navigation"
        disabled={!hydrated}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </header>
  );
}
