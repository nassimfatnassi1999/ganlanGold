# Bundled public EmailJS configuration implementation plan

**Goal:** Use one TypeScript source of truth for the four public identifiers, bundled in a static `dist/` deployment.
**Architecture:** Keep both forms and their shared send service. Replace the asynchronous runtime configuration loader with synchronous configuration validation. Migrate existing public identifiers without logging values; preserve templates, mappings, pricing, validation and abuse controls.
**Spec:** User-provided “GANLAN GOLD — HARDCODE PUBLIC EMAILJS CONFIGURATION INTO NEXT.JS”.
**Tech stack:** Existing Next.js 16 static export, TypeScript, official `@emailjs/browser`, Node tests and Playwright.

## Constraints and review focus

Only four public identifiers may be copied; no credentials are logged. Work in the requested current production branch and preserve the unrelated `next-env.d.ts` edit. No backend, runtime EmailJS JSON, generation script or EmailJS environment dependency remains. Changing identifiers requires rebuild and deployment. Missing/placeholder identifiers must preserve form values and expose localized manual contact. Requests are mocked; success means SDK acceptance, never verified inbox delivery. Keep shared lock and cooldown, including pending SDK calls after the UI timeout.

## Tasks

- [x] Replace generator/loader tests with static configuration tests: exact four keys, valid identifiers, missing/placeholder/duplicate templates rejected; ensure sends never fetch configuration. Retain service coverage for both template mappings, provider failures, duplicate sends and cooldown.
- [x] Add `EMAILJS_CONFIG` to `src/config/env.ts`; migrate exact existing public values silently. Replace `src/config/emailjs.ts` with `isEmailJSConfigured(config?: unknown): boolean`. Connect `sendLead` directly; delete unused schema, generator, JSON, npm lifecycle hooks and direct `@next/env` dependency. Preserve all unrelated settings.
- [x] Adapt Playwright tests to use synthetic identifiers by rewriting served JS only in the test harness, with placeholder variants and mocked provider requests. Assert no runtime configuration request and correct states for both forms/languages. Remove superseded runtime-edit expectations.
- [x] Update static verifier to check identifiers in client JS and absence of EmailJS JSON/loading. Update README, configuration/setup/testing/deployment guides and obsolete cache rule; preserve runtime pricing.
- [x] Run unit tests, typecheck, lint, e2e, and a build without EmailJS environment settings. Test exported `dist/` via a static file server. Review changes and private-credential exclusions, commit only relevant files, push normally to `main`, and inspect Netlify if accessible.
