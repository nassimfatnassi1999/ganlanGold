# Runtime Prices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all public prices editable through `dist/config/prices.json` after deployment, without rebuilding the site.

**Architecture:** Keep product identity and content in the static export, but fetch and validate the four prices in a client component from a cache-busted JSON file. Remove compiled prices from the product catalog and JSON-LD, and make invalid or missing runtime data fail closed with a bilingual unavailable message.

**Tech Stack:** Next.js 16.4.3 static export, React 19.3, TypeScript 6, Playwright

**Spec:** `docs/superpowers/specs/2026-10-26-runtime-prices-design.md`

## Global Constraints

- No server, database, Prisma, Docker, or third-party pricing service.
- `dist/config/prices.json` is the only deployed file that must change for a price update.
- No compiled fallback price may remain in page HTML or JSON-LD.
- Invalid or unavailable JSON must display a bilingual unavailable state.
- Existing product order, forms, translations, layout, and static deployment behavior must remain intact.

## Review Focus

- CDN/browser caching must not keep an old price after `prices.json` changes.
- A malformed or incomplete JSON file must never produce partial or misleading prices.
- Static HTML and JSON-LD must not retain stale monetary values.
- Client hydration must remain stable while prices move from loading to loaded state.
- The file copied into `dist/config/` must remain easy for a non-developer to edit safely.

---

### Task 1: Specify runtime price behavior with browser tests

**Files:**
- Create: `tests/e2e/prices.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `/config/prices.json`
- Produces: executable acceptance tests for live replacement and invalid-file fallback

- [ ] Add the price test file to `npm run test:e2e`.
- [ ] Write a test that intercepts `/config/prices.json*` with alternate values and expects all four cards to update.
- [ ] Write a test that serves incomplete/invalid data and expects four unavailable states with no compiled old prices.
- [ ] Run the new test and verify it fails against the current compiled-price implementation.

### Task 2: Implement validated client-side runtime pricing

**Files:**
- Create: `public/config/prices.json`
- Create: `src/lib/prices.ts`
- Modify: `src/lib/products/catalog.ts`
- Modify: `src/components/products/ProductShowcase.tsx`
- Modify: `src/i18n/zh-CN.json`
- Modify: `src/i18n/en.json`
- Modify: `src/lib/seo/json-ld.ts`
- Modify: `src/config/env.ts`

**Interfaces:**
- Consumes: four-entry JSON price configuration
- Produces: `PriceConfig`, `parsePriceConfig(value)`, `loadPriceConfig(signal)`, and safe runtime rendering

- [ ] Define strict types and validation for all four product IDs, positive integer CNY, and two-decimal USD strings.
- [ ] Fetch `/config/prices.json` with a timestamp query and `cache: "no-store"`.
- [ ] Remove price fields from static product specs and product JSON-LD offers.
- [ ] Render loading, loaded, and unavailable price states without hydration mismatch.
- [ ] Run the new Playwright tests and the complete typecheck/lint/E2E suite.

### Task 3: Validate the delivery artifact and document direct editing

**Files:**
- Modify: `scripts/check-dist.mjs`
- Modify: `README.md`
- Modify: `docs/CHANGEMENTS_V2.md`

**Interfaces:**
- Consumes: built `dist/config/prices.json`
- Produces: a verified, documented no-rebuild update workflow

- [ ] Make static validation parse and validate the runtime JSON while asserting that numeric prices are absent from `dist/index.html`.
- [ ] Replace the old source-edit/build price instructions with direct `dist/config/prices.json` instructions and a JSON example.
- [ ] Run `npm run build`, verify the file exists in `dist/config/`, and verify the complete suite.
- [ ] Remove generated caches while preserving the ready-to-upload `dist/` directory.

