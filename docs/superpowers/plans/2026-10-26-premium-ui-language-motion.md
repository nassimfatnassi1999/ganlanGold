# GANLAN GOLD Premium UI, Language, and Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing static GANLAN GOLD site with a native Chinese/English switcher, coherent product photography, a sharp origin presentation, and restrained scroll-driven depth while preserving all business content and static hosting.

**Architecture:** Keep the App Router page and existing section/component structure. Add a small client-side language provider plus a reusable translated-text primitive, a shared IntersectionObserver reveal component, and CSS-only perspective/hover states; all images and prices remain local/static. The server-rendered HTML stays Chinese-first, while a pre-paint `data-language` bootstrap restores `ganlan-language` without hydration errors or a visible language flash.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3, TypeScript 6, CSS/Tailwind import, Playwright 1.64, static export.

**Spec:** `/Users/nassimfatnassi/.codex/attachments/38a65168-3e25-4996-974b-7e3396d290ae/Pasted text.txt`

## Global Constraints

- Preserve the existing static-export architecture and Gandi-compatible `dist/`; no backend, database, CMS, exchange-rate API, or production Node server.
- Preserve the four fixed prices from `src/config/env.ts`: ¥29/$4.00, ¥49/$7.30, ¥69/$10.10, and ¥259/$38.50.
- Default to `zh-CN`; persist only `zh-CN` or `en` in `localStorage` key `ganlan-language`; keep Chinese-first static SEO.
- Preserve the product labels, dimensions, contacts, QR assets, MOQ 7,500 L, legal pages, and explicit WhatsApp/WeChat handoff behavior.
- Animate only transforms and opacity, reduce intensity on mobile, disable nonessential movement for `prefers-reduced-motion: reduce`, and prevent horizontal overflow.
- Use existing local assets; do not invent product packaging or make provenance claims for imagery.

## Review Focus

- First visit with empty/invalid storage must render Chinese, while a stored English preference must restore before paint and update `<html lang>`.
- Keyboard and touch users must operate both the desktop and mobile language controls, with current state announced.
- Animation setup must never leave content invisible when JavaScript, IntersectionObserver, or reduced-motion support is absent.
- The product and origin layouts must preserve full labels and remain free of horizontal overflow at 320–1440 px.
- Static export must retain all translated copy, legal routes, images, fixed prices, and messaging handoff functionality.

---

### Task 1: Native language system

**Files:**
- Create: `src/i18n/LanguageProvider.tsx`
- Create: `src/i18n/TranslatedText.tsx`
- Create: `src/components/layout/LanguageSwitcher.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/SiteHeader.tsx`
- Modify: `tests/e2e/public.spec.ts`

**Interfaces:**
- Produces: `Language = "zh-CN" | "en"`, `useLanguage()`, `<TranslatedText zh en />`, and `<LanguageSwitcher />`.
- Persists: `ganlan-language`; updates `document.documentElement.lang` and `data-language`.

- [x] Write Playwright tests for Chinese default, English switching, refresh persistence, document `lang`, accessible pressed state, and mobile-menu access.
- [x] Run the focused tests and confirm they fail because the switcher does not exist.
- [x] Implement the provider, pre-paint bootstrap, translated-text primitive, and header switcher.
- [x] Run the focused tests and confirm they pass.

### Task 2: Translate the complete interface

**Files:**
- Modify: `src/components/sections/PublicExperience.tsx`
- Modify: `src/components/products/ProductShowcase.tsx`
- Modify: `src/components/forms/FormField.tsx`
- Modify: `src/components/forms/QuoteForm.tsx`
- Modify: `src/components/forms/VisitForm.tsx`
- Modify: `src/components/forms/useLeadForm.ts`
- Modify: `src/components/layout/SiteFooter.tsx`
- Modify: `src/components/layout/LegalPage.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/legal/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/i18n/zh-CN.json`
- Modify: `src/i18n/en.json`
- Modify: `tests/e2e/forms.spec.ts`
- Modify: `tests/e2e/public.spec.ts`

**Interfaces:**
- Consumes: `useLanguage()` and `TranslatedText` from Task 1.
- Produces: one selected language across navigation, sections, forms, validation, legal content, and footer while keeping one reusable component tree.

- [x] Extend Playwright coverage for English section/form/legal copy and locale-specific validation.
- [x] Run the focused tests and confirm the mixed bilingual UI fails them.
- [x] Convert essential interface strings and form behavior to the selected dictionary.
- [x] Run the focused tests and confirm they pass.

### Task 3: Photography coherence and motion system

**Files:**
- Create: `src/components/ui/ScrollReveal.tsx`
- Modify: `src/components/products/ProductShowcase.tsx`
- Modify: `src/components/sections/PublicExperience.tsx`
- Modify: `src/lib/assets.ts`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/release.spec.ts`

**Interfaces:**
- Produces: `<ScrollReveal>` driven by one IntersectionObserver per component instance, final-state fallback, stagger delay CSS variable, and directional reveal variants.
- Uses: the existing 1920×1080 Moroccan hero source as a sharp left-side origin crop because the dedicated 1600×800 grove file is intrinsically blurred.

- [x] Add browser tests for reveal completion, reduced motion, stable image dimensions, sharp origin source/filter, hover-safe product cards, and the full viewport matrix.
- [x] Run focused tests and confirm they fail against the current blurred origin and non-animated product layout.
- [x] Implement hero entrance/parallax, product perspective reveals and unified photo cards, sharp origin crop, timeline/card staggers, responsive motion reductions, and reduced-motion fallbacks.
- [x] Run focused tests and confirm they pass.

### Task 4: Static release verification and documentation

**Files:**
- Modify: `docs/UI_REDESIGN_PROGRESS.md`
- Modify: `design-system/ganlan-gold/MASTER.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a documented, reproducible Gandi static build and an honest record of validation/limitations.

- [x] Run `npm run typecheck`, `npm run lint`, the applicable Playwright suite, and `npm run build`.
- [x] Preview `dist/`, inspect desktop/mobile screenshots, test persistence and legal routes, and check console/runtime errors.
- [x] Record commands, results, modified files, limitations, and exact next step in `docs/UI_REDESIGN_PROGRESS.md`.
- [x] Update README deployment/run notes and the design-system motion/language rules.

