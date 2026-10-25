"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { useHydrated } from "@/components/ui/useHydrated";

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
  return (
    <header className="site-header">
      <a className="brand-lockup" href="#top" aria-label="GANLAN GOLD 首页">
        <span>GANLAN GOLD</span>
        <small>Moroccan Olive Oil</small>
      </a>
      <button
        className="menu-button"
        type="button"
        aria-label={zh.nav.menu}
        aria-expanded={open}
        aria-controls="site-navigation"
        disabled={!hydrated}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-navigation" className={open ? "site-nav site-nav--open" : "site-nav"} aria-label="主要导航">
        {links.map(([key, id]) => (
          <a key={key} href={`#${id}`} onClick={() => setOpen(false)}>
            <span>{zh.nav[key]}</span>
            <small lang="en">{en.nav[key]}</small>
          </a>
        ))}
        <a className="button button--gold nav-quote" href="#quote" onClick={() => setOpen(false)}>
          {zh.nav.quote}
          <small lang="en">{en.nav.quote}</small>
        </a>
      </nav>
    </header>
  );
}
