# GANLAN GOLD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the complete Chinese-first GANLAN GOLD public website, persisted lead workflows, ECB pricing, secure administration, tests, and self-hosted operations described by V7.

**Architecture:** A single Next.js App Router application performs server rendering, route handling, and protected administration. PostgreSQL/Prisma persists product, lead, session, exchange-rate, setting, and audit state; focused service interfaces isolate currency, notification, security, and CSV behavior for test-first development.

**Tech Stack:** Next.js 16.4, React 19.3, TypeScript strict, Tailwind CSS 4, Prisma 7.10/PostgreSQL 16, Zod, Decimal.js, bcryptjs, Nodemailer, fast-xml-parser, Vitest/Testing Library, Playwright, Docker Compose, Caddy.

**Spec:** `docs/superpowers/specs/2026-10-25-ganlan-gold-design.md` and `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`

## Global Constraints

- Simplified Chinese is primary; smaller English is secondary; `GANLAN GOLD` remains the approved visible brand.
- Public colors include deep olive `#173E2B`, premium gold `#DCC183`, and sand-toned ivory; no Google-hosted dependencies.
- Exactly four products with capacities 0.25, 0.5, 0.75, and 5 litres and initial USD prices 4.00, 7.30, 10.10, and 38.50.
- The numeric public MOQ `7,500` appears only in its dedicated section; no per-product MOQ or “1,000 bottles”.
- Public pages never expose EUR or promise container capacity, Chinese delivery, unavailable documents, certifications, approvals, or a Gisèle WeChat identity.
- Currency formula is `ceil(USD × EUR/CNY ÷ EUR/USD)` and keeps the USD input unchanged.
- All external secrets and deployment coordinates come from environment variables.
- Tests precede new business logic and must be observed failing for the intended reason.

## Review Focus

- Concurrent duplicate quote requests must resolve to one persisted request ID; Task 6 adds a database uniqueness/integration test.
- An ECB response missing either USD or CNY must never replace the last valid rate; Task 5 adds malformed/missing-currency tests.
- Reverse-proxy host/origin handling must reject cross-origin mutations while allowing the configured public origin; Task 6 adds origin tests.
- CSV fields beginning with `=`, `+`, `-`, `@`, tab, or carriage return must be neutralized without corrupting ordinary Unicode; Task 8 adds literal export tests.
- A stale/expired admin session must not authorize a server action even if middleware navigation was previously allowed; Task 7 tests action-level session verification.

---

### Task 1: Application foundation and asset mapping

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/i18n/zh-CN.json`, `src/i18n/en.json`
- Create: `public/images/{products,hero,brand,groves,qr}/...`
- Test: `src/i18n/catalog.test.ts`, `tests/assets.test.ts`

**Interfaces:**
- Produces: `translations.zh`, `translations.en`, semantic CSS tokens, stable public image paths.

- [ ] Write catalog/asset tests asserting required bilingual keys, exact product-label wording, and QR/product file mappings.
- [ ] Run `npm test -- src/i18n/catalog.test.ts tests/assets.test.ts` and observe missing-module/file failures.
- [ ] Add configuration, translations, three-layer tokens, and copied runtime assets; keep original inputs unchanged.
- [ ] Re-run focused tests and the full suite; record green output.
- [ ] Commit foundation and asset mapping.

### Task 2: PostgreSQL domain schema and deterministic seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma.config.ts`, `prisma/migrations/20261025000000_init/migration.sql`, `prisma/seed.ts`
- Create: `src/lib/db/client.ts`, `src/lib/products/catalog.ts`
- Test: `src/lib/products/catalog.test.ts`, `tests/integration/seed.test.ts`

**Interfaces:**
- Produces: `PRODUCT_SPECS`, `getPublicProducts()`, normalized Prisma models for AdminUser, AdminSession, Product, ProductTranslation, QuoteRequest/Item, VisitRequest, ExchangeRate, SiteSetting, AuditLog, RateLimitBucket.

- [ ] Write failing product invariant tests for count, IDs, capacities, USD precision, display order, and professional 5 L metadata.
- [ ] Run the focused unit test and observe missing catalog failure.
- [ ] Implement catalog/schema/migration/seed with protected capacities and stable IDs.
- [ ] Run Prisma validation, focused unit tests, and PostgreSQL integration seed test when Docker is available.
- [ ] Commit database foundation.

### Task 3: Quote and visit validation/domain services

**Files:**
- Create: `src/lib/leads/schemas.ts`, `src/lib/leads/volume.ts`, `src/lib/leads/fingerprint.ts`, `src/lib/leads/types.ts`
- Test: `src/lib/leads/{schemas,volume,fingerprint}.test.ts`

**Interfaces:**
- Produces: `quoteRequestSchema`, `visitRequestSchema`, `calculateRequestedLitres(items)`, `createSubmissionFingerprint(payload, secret)`.

- [ ] Write one failing test per validation/volume/fingerprint behavior, including multi-format counts, consent, bounds, contact alternatives, and deterministic privacy-preserving deduplication.
- [ ] Run focused tests and verify expected missing-symbol failures.
- [ ] Implement the minimal pure functions/schemas.
- [ ] Run focused and full suites; refactor only while green.
- [ ] Commit lead domain behavior.

### Task 4: Request security and notification boundary

**Files:**
- Create: `src/lib/security/origin.ts`, `src/lib/security/rate-limit.ts`, `src/lib/security/client-ip.ts`, `src/lib/email/mailer.ts`
- Test: `src/lib/security/{origin,rate-limit}.test.ts`, `src/lib/email/mailer.test.ts`

**Interfaces:**
- Produces: `assertSameOrigin(request, publicUrl)`, `consumeRateLimit(scope,key,policy)`, `sendLeadNotification(message): Promise<NotificationResult>`.

- [ ] Write failing tests for same-origin/proxy-host, missing/hostile origins, fixed-window limits, SMTP-unconfigured, and mail failure results.
- [ ] Observe failures, implement the database-backed limiter contract and injected mail transport, then turn tests green.
- [ ] Run the full suite and commit security/email boundaries.

### Task 5: ECB parsing, conversion, persistence, and fallback

**Files:**
- Create: `src/lib/currency/ecb.ts`, `src/lib/currency/calculate.ts`, `src/lib/currency/service.ts`, `src/app/api/cron/exchange-rates/route.ts`, `scripts/refresh-rates.ts`
- Test: `src/lib/currency/{ecb,calculate,service}.test.ts`, `src/app/api/cron/exchange-rates/route.test.ts`

**Interfaces:**
- Produces: `parseEcbDailyXml(xml)`, `calculateUsdCnyRate(rates)`, `calculateIndicativeCny(usd,rate)`, `refreshExchangeRate()`, `getCurrentRateState()`.

- [ ] Write failing fixed-fixture tests for actual ECB envelope structure, missing/malformed/negative rates, formula precision, exact and fractional ceiling, weekend dates, failure persistence, and last-valid fallback.
- [ ] Observe failures; implement pure parser/calculator followed by repository-backed refresh/state service.
- [ ] Add and test the secret-protected cron route and CLI wrapper.
- [ ] Run full suite and commit currency workflow.

### Task 6: Persisted public quote and visit endpoints

**Files:**
- Create: `src/lib/leads/service.ts`, `src/app/api/quotes/route.ts`, `src/app/api/visits/route.ts`
- Test: `src/lib/leads/service.test.ts`, `src/app/api/{quotes,visits}/route.test.ts`, `tests/integration/leads.test.ts`

**Interfaces:**
- Produces: `submitQuote(input,context)`, `submitVisit(input,context)`, JSON route responses with `requestId`, `duplicate`, and notification state.

- [ ] Write failing service/route tests for validation, honeypot, size/origin/rate limits, consent, deduplication, litres, persistence-before-email, and bounded bilingual errors.
- [ ] Implement minimal services/routes and make focused tests green.
- [ ] Run the database integration test for concurrent duplicate requests when PostgreSQL is available.
- [ ] Run the full suite and commit public workflows.

### Task 7: Admin provisioning, authentication, and authorization

**Files:**
- Create: `src/lib/auth/{password,session,dal,login-rate-limit}.ts`, `src/app/admin/login/*`, `src/app/admin/actions/auth.ts`, `scripts/init-admin.ts`
- Test: `src/lib/auth/{password,session,dal}.test.ts`, `tests/integration/auth.test.ts`

**Interfaces:**
- Produces: `createAdmin`, `authenticateAdmin`, `createSession`, `verifySession`, `requireAdmin`, `logout`.

- [ ] Write failing tests for password policy/hash verification, opaque hashed-at-rest sessions, cookie flags, expiry/revocation, login throttling, and action-level authorization.
- [ ] Implement and turn the focused tests green.
- [ ] Add initial-admin CLI that requires explicit environment inputs and refuses defaults/weak passwords.
- [ ] Run full suite and commit authentication.

### Task 8: Admin data services and CSV hardening

**Files:**
- Create: `src/lib/admin/{dashboard,products,quotes,visits,rates,settings,csv,audit}.ts`
- Test: `src/lib/admin/{products,quotes,visits,csv,audit}.test.ts`, `tests/integration/admin.test.ts`

**Interfaces:**
- Produces authenticated mutation/query functions, `serializeQuotesCsv(rows)`, and audit records.

- [ ] Write failing tests for price precision/positive bounds, immutable product identity/capacity/MOQ absence, status transitions, note length, settings allowlist, audit actor/before/after, and CSV injection characters.
- [ ] Implement services with `requireAdmin()` at every mutation boundary and make tests green.
- [ ] Run full suite and commit admin services.

### Task 9: Public website and forms

**Files:**
- Create: `src/components/{layout,sections,products,forms,ui}/*`, `src/app/page.tsx`, `src/app/{privacy,legal,terms}/page.tsx`
- Test: `src/components/**/*.test.tsx`, `tests/e2e/public.spec.ts`, `tests/e2e/forms.spec.ts`

**Interfaces:**
- Consumes: public product/rate state, translation catalog, quote/visit endpoints.
- Produces: complete public experience with real links/forms and legal routes.

- [ ] Write failing component/e2e tests for semantic headings, exact contact order/links, four product capacities, price states, single numeric MOQ occurrence, no public EUR/per-format MOQ, and form error/success behavior.
- [ ] Implement semantic sections and accessible client forms using design tokens and supplied assets.
- [ ] Run component tests, then Playwright at desktop/mobile widths, and fix failures test-first.
- [ ] Commit the public experience.

### Task 10: Administrative interface

**Files:**
- Create: `src/app/admin/(protected)/**`, `src/components/admin/**`, `src/app/admin/actions/**`, `src/app/admin/quotes/export/route.ts`
- Test: `tests/e2e/admin.spec.ts`, component tests for tables/forms.

**Interfaces:**
- Consumes: Task 7 auth and Task 8 admin services.
- Produces: dashboard, product/lead/visit/rate/settings screens and CSV download.

- [ ] Write failing protected-route and authenticated-flow tests.
- [ ] Implement server-rendered tables/forms, status/notes changes, manual rate refresh, and safe CSV response.
- [ ] Run focused and full browser tests; commit admin UI.

### Task 11: SEO, metadata, health, and security headers

**Files:**
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/api/health/route.ts`, `src/lib/seo/json-ld.ts`
- Modify: `src/app/layout.tsx`, `next.config.ts`
- Test: route/unit/e2e metadata and header tests.

**Interfaces:**
- Produces: Chinese-first metadata, canonical/OG, Organization/Product JSON-LD with only verified facts, crawler files, health response, and CSP/security headers.

- [ ] Write failing tests for metadata, sitemap routes, bounded health output, and required headers.
- [ ] Implement and make focused/full suites green.
- [ ] Commit SEO and security surface.

### Task 12: Docker and operational scripts

**Files:**
- Create: `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.dockerignore`, `.env.example`, `scripts/{entrypoint,backup,restore}.sh`
- Test: `tests/operations.test.ts`

**Interfaces:**
- Produces: standalone app image, PostgreSQL persistent volume, HTTPS-ready proxy, health checks, migration/seed startup, scheduled currency refresh, backup/restore entry points.

- [ ] Write failing operations tests that parse/execute safe dry-run behavior and verify required environment contracts.
- [ ] Add configuration/scripts and make tests green.
- [ ] Run `docker compose config`; run full stack only if Docker daemon is available.
- [ ] Commit operations configuration.

### Task 13: Documentation and launch governance

**Files:**
- Create: `README.md`, `docs/{DEPLOYMENT,ADMIN_GUIDE,SECURITY,MAINTENANCE,LAUNCH_READINESS}.md`
- Modify: `docs/{SPECIFICATION_AUDIT,ACCEPTANCE_CHECKLIST,IMPLEMENTATION_PLAN}.md`

**Interfaces:**
- Produces: exact local/admin/deployment/backup/rollback/test instructions and honest external prerequisites.

- [ ] Write the documentation from verified commands and current implementation only.
- [ ] Cross-check every V7 line against the audit/acceptance files and update statuses/evidence.
- [ ] Commit handover documentation.

### Task 14: Full verification and visual review

**Files:**
- Modify only files implicated by failing checks, always with a failing regression test first.

**Interfaces:**
- Produces: final evidence record and release candidate.

- [ ] Run formatting, TypeScript, ESLint, unit/integration, production build, and Playwright suites.
- [ ] Run the app, review browser console/network, keyboard flow, reduced motion, and screenshots at 320/375/390/430/768/1024/1440 px.
- [ ] Fix each discovered defect with a failing regression test, then rerun the complete suite.
- [ ] Update acceptance evidence, perform the verification-before-completion checklist, and commit the verified release candidate.

