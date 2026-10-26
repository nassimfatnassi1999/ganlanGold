# GANLAN GOLD Project Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Leave a clean, static-only Next.js project whose runtime images live under `public/images`, with no obsolete Docker, Caddy, Prisma, backend, admin, or Vitest residue.

**Architecture:** Preserve the current Next.js 16 static-export architecture, active source code, Playwright journeys, authoritative V7 PDF, and useful handoff documentation. Remove infrastructure and tests for the retired server architecture, remove redundant source photographs, keep only referenced runtime media in `public/images`, and regenerate the Gandi-ready `dist/` artifact from the cleaned source.

**Tech Stack:** Next.js 16.4.3, React 19.3, TypeScript 6, Playwright, static HTML/CSS/JS export

**Spec:** User-approved safe-cleanup scope from the 2026-10-26 conversation

## Global Constraints

- Preserve all existing user-owned static-site and UI redesign changes in the dirty worktree.
- Keep `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf` unchanged as the business source of truth.
- Keep every asset referenced by current source or CSS under `public/images`.
- Keep `dist/` as the regenerated Gandi deployment artifact, but ignore it in Git because it is derived output.
- Do not restore any previously deleted backend, admin, API, Docker, or asset-source files.

## Review Focus

- A runtime image removed by mistake must be caught by the production build and Playwright broken-image matrix.
- The static export must still contain the four legal/public routes, products, prices, contacts, and QR codes.
- Removing Prisma/Docker residue must leave no live configuration or test references to those systems.
- The cleanup must not overwrite the substantial pre-existing UI and localization edits.
- Generated caches may be recreated during verification but must not remain as project clutter after handoff.

---

### Task 1: Remove retired server architecture residue

**Files:**
- Delete: `.dockerignore`, `Caddyfile`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `prisma.config.ts`, `prisma/**`, `vitest.config.ts`
- Delete: `tests/integration/**`, `tests/operations.test.ts`, `tests/documentation.test.ts`, `tests/security-headers.test.ts`, `tests/assets.test.ts`, `tests/e2e/admin.spec.ts`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: the current static-only `package.json` and `next.config.ts`
- Produces: a source tree configured only for the active static application and Playwright suite

- [ ] **Step 1: Confirm each target is obsolete**

Run: `rg -n "prisma|Prisma|docker|Docker|Caddy|DATABASE_URL|POSTGRES" src package.json next.config.ts scripts tests tsconfig.json .env.example Dockerfile docker-compose.yml prisma.config.ts prisma`

Expected: references occur only in retired infrastructure/tests, the static validation's negative assertion, and documentation describing their removal.

- [ ] **Step 2: Remove the retired files and directories**

Delete only the exact paths listed in this task; preserve active Playwright tests under `tests/e2e/{public,forms,release}.spec.ts`.

- [ ] **Step 3: Simplify TypeScript exclusions**

Remove `prisma`, `prisma.config.ts`, and `vitest.config.ts` from `exclude`; retain `node_modules` and `tests` because the application typecheck intentionally covers production source.

- [ ] **Step 4: Verify no live server residue remains**

Run: `rg -n "prisma|Prisma|docker|Docker|Caddy|DATABASE_URL|POSTGRES" src package.json next.config.ts scripts tests tsconfig.json || true`

Expected: only the `scripts/check-dist.mjs` negative content check may mention Prisma.

### Task 2: Consolidate and document runtime media

**Files:**
- Delete: root-level `*.jpeg` files and both duplicate Mediterranean PNG files
- Delete: `public/images/brand/olive-branch-gold.svg`
- Modify: `src/lib/assets.ts`
- Modify: `docs/ASSET_INVENTORY.md`

**Interfaces:**
- Consumes: all image paths referenced from `src`, CSS, and social metadata
- Produces: one runtime media hierarchy under `public/images/{brand,groves,hero,products,qr}` with no dead catalog entry

- [ ] **Step 1: Reconfirm all runtime references**

Run: `rg -n "images/|ASSET_PATHS" src tests/e2e README.md docs`

Expected: all runtime paths resolve under `public/images`; the root photographs are not referenced by application code.

- [ ] **Step 2: Remove redundant root media and the unused branch SVG**

Delete the exact audited root photographs and `public/images/brand/olive-branch-gold.svg`; retain the specification PDF and every other file in `public/images`.

- [ ] **Step 3: Remove the dead `oliveBranch` mapping**

Delete only `ASSET_PATHS.brand.oliveBranch`; retain the CSS-used `olivePattern`, both grove assets, responsive hero variants, products, and QR codes.

- [ ] **Step 4: Rewrite the asset inventory around the final runtime tree**

Document the authoritative PDF, current `public/images` directories, runtime usage, and outstanding image-rights/HD-photo cautions without referencing deleted source directories or root photographs as present files.

### Task 3: Remove generated clutter and align handoff documentation

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Delete locally generated: `.DS_Store`, `.next/`, `out/`, `playwright-report/`, `test-results/`, `tsconfig.tsbuildinfo`

**Interfaces:**
- Consumes: the active build and Playwright scripts
- Produces: a clean repository layout with a reproducible but untracked `dist/` delivery folder

- [ ] **Step 1: Ignore the generated deployment folder**

Add `dist/` beside `.next/` and `out/` in `.gitignore`.

- [ ] **Step 2: Align the README with the cleaned project**

State that runtime media is centralized in `public/images`, remove claims that obsolete infrastructure files are present, and keep the current static build/deployment instructions.

- [ ] **Step 3: Remove generated local artifacts**

Delete only the exact generated paths listed above. They are reproducible and already ignored, except `dist/`, which will be ignored in Step 1.

### Task 4: Verify and regenerate the static delivery

**Files:**
- Regenerate: `dist/**`

**Interfaces:**
- Consumes: cleaned application source and public media
- Produces: verified Gandi-ready static output

- [ ] **Step 1: Verify dependency consistency**

Run: `npm install --package-lock-only --ignore-scripts`

Expected: exit 0 and no Prisma/Vitest/backend packages reintroduced.

- [ ] **Step 2: Run production checks**

Run: `npm run typecheck && npm run lint && npm run test:e2e && npm run build`

Expected: all commands exit 0; the active Playwright suite passes and static validation reports success.

- [ ] **Step 3: Confirm the final tree and references**

Run: `git status --short`, `find public/images -type f | sort`, and the residue search from Task 1.

Expected: no obsolete infrastructure/assets remain, all runtime images are centralized, and pre-existing user changes remain intact.

- [ ] **Step 4: Remove build caches while preserving delivery output**

Delete regenerated `.next/`, `out/`, `playwright-report/`, `test-results/`, and `tsconfig.tsbuildinfo`; retain `dist/` for Gandi upload.

