# GANLAN GOLD UI Redesign Progress

Updated: 2026-10-26 (Africa/Tunis)

## Original architecture

- Next.js 16.4.3 App Router with React 19.3 and TypeScript 6.
- Static export through `output: "export"`; `npm run build` copies `out/` to `dist/` and validates the static artifact.
- One long public page assembled by `PublicExperience`, with reusable header, footer, forms, product showcase, and three legal routes.
- Shared JSON dictionaries now drive one interface tree; Chinese is the default and English is selected through persistent native client state.
- Fixed CNY/USD prices are loaded from editable runtime configuration at `config/prices.json`; forms prepare WhatsApp/WeChat messages without a backend.

## Implemented changes

- Added a Chinese-default, persistent `中文 | EN` language system that avoids hydration errors and updates the document language.
- Switched all essential interface, form, footer, and legal content through shared dictionaries without duplicating the page tree.
- Harmonized all four complete product photographs inside one limestone editorial card system; labels remain intact.
- Replaced the intrinsically blurred Origin asset with a dedicated sharp, product-free, non-upscaled crop of the approved Moroccan panorama.
- Added IntersectionObserver reveals, shallow product perspective, hero depth, and staggered timeline/card motion with reduced-motion fallbacks.
- Verified every required viewport width, production export, static preview, accessibility scan, and browser behavior.

## Completed tasks

- [x] Audited project structure, package scripts, active components, dictionaries, price configuration, static-export setup, and available imagery.
- [x] Read the V7 PDF and the current Next.js 16.4 documentation for client boundaries, hydration/flash prevention, images, and static exports.
- [x] Visually inspected desktop/mobile hero, all four product images, the grove asset, and root-level candidate images.
- [x] Selected unified full-photo editorial containers for products; background removal was rejected because it would risk label edges and is unnecessary.
- [x] Confirmed `public/images/groves/olive-grove-atmosphere.webp` is intrinsically blurred despite being 1600×800; selected a product-free left crop of the 1920×1080 hero panorama for Origin.
- [x] Native language system.
- [x] Complete interface translation.
- [x] Photography and motion redesign.
- [x] Release verification and documentation.

## Modified files

- `docs/superpowers/plans/2026-10-26-premium-ui-language-motion.md`
- `docs/UI_REDESIGN_PROGRESS.md`
- `design-system/ganlan-gold/MASTER.md`
- `README.md`
- `package.json`, `package-lock.json`, `tsconfig.json`
- `src/app/globals.css`, `src/app/layout.tsx`
- `src/app/{privacy,legal,terms}/page.tsx`
- `src/app/robots.ts`, `src/app/sitemap.ts`
- `src/components/forms/{FormField,QuoteForm,VisitForm,useLeadForm}.tsx`
- `src/components/layout/{LanguageSwitcher,LegalPage,SiteFooter,SiteHeader}.tsx`
- `src/components/products/ProductShowcase.tsx`
- `src/components/sections/PublicExperience.tsx`
- `src/components/ui/{BilingualHeading,ScrollReveal}.tsx`
- `src/i18n/LanguageProvider.tsx`, `src/i18n/TranslatedText.tsx`, `src/i18n/legal.ts`
- `src/i18n/zh-CN.json`, `src/i18n/en.json`
- `src/lib/assets.ts`
- `public/images/groves/moroccan-groves-sharp.webp`
- `scripts/check-dist.mjs`
- `tests/e2e/{public,forms,release}.spec.ts`

## Commands executed

- Project/source inspection with `rg`, `sed`, `git status`, and `git diff --stat`.
- Image dimension checks with `sips`; visual inspection of all relevant runtime and root-level images.
- `pdfinfo`, `pdfimages -list`, and `pdftotext` against the V7 specification.
- Local UI/UX design-system, motion, and Next.js stack searches.
- Read Next.js 16.4 local documentation under `node_modules/next/dist/docs/`.
- Test-first Playwright iterations for language state, localization, motion, image treatment, responsive layout, and reduced motion.
- `npm run typecheck`, `npm run lint`, `npm run test:e2e`, and `npm run build`.
- Chromium smoke test against a local server serving the generated `dist/` directory.

## Test results

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings.
- `npm run test:e2e`: 30 passed, 6 intentionally skipped duplicate device/preference runs.
- Required width matrix passed at 320, 375, 390, 430, 768, 1024, and 1440 px with no horizontal overflow or broken images.
- Browser accessibility scan: zero violations on desktop and mobile; one manual color-contrast review item where automated tooling cannot determine text over imagery/gradients.
- `npm run build`: passed; seven routes statically prerendered and `dist/` structural validation succeeded.
- Production artifact smoke test at 390 px: passed Chinese default, English switch, root `lang` update, and overflow checks.

## Known issues and rulings

- The worktree is already heavily modified on `main` by pre-existing static-site migration work. Those changes are user-owned and must not be reset, overwritten wholesale, or committed together with this redesign.
- The original dedicated grove asset remains an unsuitable blur placeholder. The replacement is an exact 768×1080 crop of the approved 1920×1080 hero panorama, not an invented or upscaled photograph; an independently licensed documentary grove photograph would add campaign variety if supplied later.
- The generic UI dataset suggested red restaurant styling and remote fonts; this was rejected because the V7 brand specification and local design master require deep olive, gold, warm limestone, and local/system Chinese fonts.

## Handoff status

Implementation and verification are complete. The deployable static artifact is `dist/`; upload its contents to the Gandi web root after final commercial, legal, QR-code, and image-rights approval.
