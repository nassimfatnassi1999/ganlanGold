# GANLAN GOLD Website Design

## Intent

Build the production-oriented GANLAN GOLD web presence described by the official V7 specification: a Chinese-first premium B2B olive-oil landing page, real inquiry workflows, persistent administration, daily ECB-derived CNY indications, and self-hostable deployment material. The primary user is a mainland-China importer, distributor, or professional buyer evaluating products and starting a commercial conversation.

## Goals

- Present exactly four product formats with editable USD reference prices and server-derived CNY indications.
- Make the 7,500-litre global policy clear once, without creating per-format MOQ claims.
- Convert quote and visit interest into persisted, manageable records.
- Give authorized staff a secure place to manage prices, leads, visits, rate status, and limited approved content.
- Deliver a fast, responsive, accessible experience that does not rely on services commonly blocked in mainland China.
- Keep external approvals and missing production facts visible rather than disguising them as complete.

## Non-goals

- Consumer checkout, online payment, inventory reservation, or automated binding quotations.
- A logistics calculator or guaranteed container-loading configuration.
- A full digital-asset-management system or arbitrary public page builder.
- Claims of certification, regulatory approval, organic status, medical benefit, or exclusive single-farm sourcing.

## Anti-goals

- A generic SaaS aesthetic, a decorative mock admin, fake submission success, or hardcoded currency values presented as live.
- Publishing EUR, per-product MOQs, invented WeChat identities, or static commercial terms inside imagery.
- Depending on Google Fonts, Google Maps, CAPTCHA, or client-side ECB requests.

## Constraints and verified inputs

- The official source is `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`, seven pages dated 25 October 2026.
- Mandatory brand colors are `#173E2B` and `#DCC183`; Chinese is primary and English is secondary.
- The Chinese brand name, Chinese/regulatory copy, product labels, commercial prices, legal data, production photography, and QR scanning still require external approval.
- Product and QR images were extracted from the PDF. They are traceable but provisional except for the QR assignments specified in V7.
- No application or Git history existed at discovery time.

## Approaches considered

### 1. Single full-stack Next.js application — selected

Next.js App Router serves the public site, admin screens, route handlers, and server actions. Prisma owns PostgreSQL persistence. This keeps one deployable artifact, supports server-rendered Chinese content, and is the simplest secure self-hosted topology for the scope.

### 2. Next.js frontend plus a separate API service

This provides a stricter runtime boundary but doubles deployment, authentication, schema, and operations work without a demonstrated scaling requirement. It was rejected as unnecessary complexity.

### 3. Headless CMS plus form/email integrations

This accelerates content editing but weakens self-hostability, complicates mainland-China reachability, and makes commercial invariants harder to protect. It was rejected in favor of a focused administrative interface.

## Architecture

- Next.js 16 App Router and React 19, TypeScript strict mode, Tailwind CSS 4, and semantic CSS variables.
- PostgreSQL with Prisma ORM 7.10, explicit migrations, deterministic product seed data, and normalized lead/rate/audit models.
- Public route handlers validate Zod payloads, verify request origin, enforce body limits, reject honeypots, rate-limit by privacy-preserving IP hash, fingerprint duplicate submissions, and persist before optional SMTP notification.
- Database-backed opaque admin sessions use high-entropy tokens, hashed-at-rest session keys, HTTP-only cookies, idle/absolute expiry, role checks at every action boundary, login throttling, and audit records.
- ECB XML is fetched only on the server, validated for dated USD/CNY rates, stored as immutable history, and resolved with last-known-valid fallback. `ceil(USD × EUR/CNY ÷ EUR/USD)` uses decimal arithmetic.
- Caddy provides an HTTPS-ready reverse proxy. Docker Compose runs the app, PostgreSQL, Caddy, and a protected scheduled refresh worker.

## Visual and interaction system

The chosen frontend anchor is **Organic editorial**. The specification's deep olive and premium gold sit on sand-toned ivory surfaces; locally available Chinese serif and system sans stacks avoid remote font dependencies. Soft 20–28 px radii, low-opacity grain, and spacious editorial compositions create material warmth without imitating a generic luxury shop.

The differentiator is a thin **gold traceability line**: a restrained route-like rule that visually connects origin, the alternating products, quality preparation, and Moroccan handover. It conveys a commercial story rather than becoming decoration.

The UI/UX dataset suggested liquid-glass styling and Google-hosted Cormorant/Montserrat. Those recommendations conflict with the official palette, mainland-China reliability, and the Organic anchor, so the PDF and task constraints take precedence. Motion is limited to opacity/translate reveals and state transitions, with no dependence on animation for comprehension and a complete reduced-motion mode.

## Public experience

The page flows from a sticky bilingual header into a composed product hero, then the four alternating products, the single global MOQ statement, origin, visit invitation/form, export-responsibility timeline, contacts, quotation form, and footer. Prices and conditions remain real HTML. The hero uses the supplied derived composition because it contains no baked-in prices; each use is documented as provisional.

Forms use visible bilingual labels, inline errors, a focusable error summary, loading states, preserved input on failure, explicit privacy consent, and non-binding inquiry language. Quote quantities are package counts, converted server-side to total litres using stable product capacities.

## Administration

`/admin` is protected except for login. The dashboard exposes real counts and ECB status. Dedicated screens support product USD/description edits, quote and visit detail/status/notes updates, CSV export with formula-injection neutralization, rate history/manual refresh, and a small settings surface for approved metadata/contact values. Policy-locked values such as capacities and public MOQ are not editable in ordinary content workflows.

## Error handling

- No valid rate: show CNY unavailable, retain USD, and explain that the final quotation is in USD.
- ECB failure after prior success: serve the last valid rate with its actual date and surface failure details only in admin.
- SMTP absent/failing: retain the lead, mark notification state, and show a successful inquiry receipt without claiming email delivery.
- Database or validation failure: return a bounded bilingual error, never echo secrets or raw database errors.
- Duplicate submission: return the existing request identifier without creating a second lead.

## Verification strategy

- Vitest unit tests for rates, rounding, product invariants, volume, schemas, authorization helpers, CSV hardening, request fingerprints, and origin/rate limiting behavior.
- PostgreSQL integration tests for persistence and admin mutations when Docker is available.
- Playwright tests for navigation, responsive rendering, public forms, protected admin routes, contact links, QR assignment, price hierarchy, and the single public numeric MOQ occurrence.
- Type checking, ESLint, production build, accessibility checks, browser console review, and screenshots at 320, 375, 390, 430, 768, 1024, and 1440 px.

## Builder calls

- Use Prisma 7.10 rather than the Prisma 8 release candidate visible during implementation; it is stable on the available Node 22 runtime.
- Use system/local font stacks until licensed local font files are supplied.
- Treat all supplied marketing photography as provisional. Keep original files untouched and publish optimized copies only.
- Run in place because the directory was not a Git repository at discovery time; initialize Git and commit milestones once the baseline documents exist.

