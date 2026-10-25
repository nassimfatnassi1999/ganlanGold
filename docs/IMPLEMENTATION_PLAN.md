# GANLAN GOLD Implementation Plan

This checklist is the delivery-level plan. The task-by-task TDD execution plan is in `docs/superpowers/plans/2026-10-25-ganlan-gold-implementation.md`.

## Discovery and governance

- [x] Inspect the directory and confirm there is no existing application or Git history.
- [x] Read all seven PDF pages, inspect every visual, and enumerate embedded images.
- [x] Inventory original, optimized, derived, reference-only, and missing production assets.
- [x] Record the design, architecture, commercial invariants, and external approval boundaries.
- [ ] Initialize Git and establish a clean application baseline.

## Foundation

- [ ] Initialize Next.js 16 / React 19 / strict TypeScript / Tailwind 4.
- [ ] Add three-layer brand/design tokens and structured `zh-CN` / `en` translations.
- [ ] Copy runtime image assets without modifying the original source pack.
- [ ] Configure Prisma 7.10, PostgreSQL schema, migration, and exactly four product seeds.

## Public experience

- [ ] Build the sticky bilingual navigation and premium product hero.
- [ ] Build four alternating product stories with server-derived pricing states.
- [ ] Place the numeric global MOQ exactly once in the dedicated section.
- [ ] Build origin, visit, export, contact, quote, and premium footer sections.
- [ ] Add responsive/reduced-motion behavior and accessible form feedback.
- [ ] Add Chinese-first privacy, legal, and commercial-information pages.

## Business workflows

- [ ] Persist validated quote requests/items with total-litres calculation, consent, deduplication, rate limiting, and optional email.
- [ ] Persist validated visit requests with non-confirming bilingual acknowledgement.
- [ ] Fetch, validate, store, refresh, and fall back across ECB rate history.
- [ ] Provide protected scheduled and manual currency refresh paths.

## Administration

- [ ] Implement secure initial-admin provisioning, login, sessions, logout, and access control.
- [ ] Build dashboard, product editing, quote/visit management, notes/statuses, CSV export, rates, and settings.
- [ ] Audit price, status, rate, and settings mutations.

## Operations and quality

- [ ] Add unit, integration, browser, accessibility, and business-invariant tests.
- [ ] Add Dockerfile, Compose, Caddy, health checks, backup/restore scripts, and scheduled refresh.
- [ ] Add README and deployment/admin/security/maintenance/launch-readiness guides.
- [ ] Run typecheck, lint, tests, production build, and browser checks at specified breakpoints.
- [ ] Update `SPECIFICATION_AUDIT.md` and `ACCEPTANCE_CHECKLIST.md` with evidence.

