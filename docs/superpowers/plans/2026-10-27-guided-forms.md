# Guided Bilingual Forms Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make both existing forms easy to validate, correct and submit, with compact bilingual feedback.

**Architecture:** Extend the existing shared validator, hook, fields and feedback components. Keep uncontrolled text fields, the product selection state, runtime EmailJS configuration and exact template contracts. Share contact controls; show manual handoff only following a valid submission when needed, with a collapsed preview.

**Tech Stack:** Next.js static export, React, TypeScript, existing validation functions, EmailJS, Node tests and Playwright.

**Spec:** User attachment “GANLAN GOLD — SMART FORM VALIDATION & GUIDED USER EXPERIENCE”. The user explicitly requests direct implementation, verification, commit and production-branch push.

## Global Constraints

- Preserve premium green/gold styling, Chinese default, language persistence and unrelated website sections.
- No backend, API routes or heavy dependencies. Preserve Netlify and Alibaba OSS static hosting.
- Preserve exact EmailJS template variables and runtime `/config/emailjs.json` loading.
- Preserve global MOQ as an advisory referencing its dedicated section; never alter entered quantities.
- Never send real email in tests or report success without provider confirmation.

## Review Focus

- Preferred contact changes must update both requirement labels and dependent errors.
- Product checkboxes must be focus targets when selection is missing; quantities must survive deselection.
- Editing after a failed submission or language switch must never expose stale handoff data.
- Zero quantities are valid package counts, but aggregate requested volume must be positive.
- Reduced-motion scrolling and sticky navigation must leave the first error visible.

### Task 1: Validation contracts

Files: `src/lib/forms/lead.ts`, `tests/unit/emailjs-params.test.ts`.
- [x] Add failing tests for zero/mixed package counts, aggregate zero, contact-specific requirements and uncertain port.
- [x] Run the tests to confirm expected failures.
- [x] Extend the existing shared field schema and quote/visit validation; preserve limits and mapping contracts.
- [x] Run unit tests.

### Task 2: Guided fields and compact submission

Files: existing `src/components/forms/*`, new shared contact fields/focus utility as needed, `src/i18n/{en,zh-CN}.json`, `src/app/globals.css`, `tests/e2e/forms.spec.ts`.
- [x] Add failing browser tests for clean initial state, first-invalid focus, touched correction, error/value retention, conditional contact and collapsed fallback.
- [x] Run focused Playwright tests to confirm failures.
- [x] Implement touched/attempted validation, DOM-order focus and reduced-motion scrolling; associate localized inline errors and subtle borders.
- [x] Add port uncertainty, correct package validation/total, and persistent MOQ advisory.
- [x] Render one compact notification below the form, pending spinner, retry, and deferred manual actions with collapsible preview.
- [x] Update existing browser expectations to the new behavior; cover clipboard success/failure, stale handoff, language switching and all requested widths.
- [x] Run unit tests and all Playwright tests with provider network intercepted.

### Task 3: Verification and release

- [x] Inspect the forms in the running browser and Next.js runtime checks; audit form accessibility.
- [x] Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, `npm run build` and exported-site form tests.
- [x] Review scoped diff, secrets and Git state.
- Release: commit relevant source, tests, documentation and the rebuilt tracked `dist/` only.
- Release: push `main` without force and verify the deployed site; the Git record and final handoff record these final actions.

## Execution record

- Validation tests observed failing before implementing zero-count/positive-total validation, preferred-channel errors and localized uncertain-port mapping; all unit tests pass.
- Browser tests observed failing before implementing first-field focus, collapsed preview, retained quantities on reselect, touched email correction, product-group touch mapping, exact copied preview and accessible sending announcements. All now pass.
- One independent review identified touched-contact and product-group gaps; each was reproduced with a failing regression test and corrected.
- Final verification: 21 unit tests, 105 Playwright tests passed; 7 existing device-specific skips. TypeScript, ESLint, EmailJS template contracts and portable static build passed.
- No backend, package dependency, unrelated website section or real-email test was introduced. Runtime configuration remains the shipped disabled scaffold.
