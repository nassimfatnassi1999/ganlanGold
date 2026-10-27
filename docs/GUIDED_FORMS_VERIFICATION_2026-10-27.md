# Guided bilingual forms — verification

Date: 2026-10-27

## Behavior

- Both existing forms use the shared field schema, validator, field errors, contact controls and submission hook. No dependency, backend or API route was added.
- Empty/touched validation is inline and localized. Submission focuses the first invalid control in DOM order and scrolls its label below the actual sticky header. Reduced motion uses immediate scrolling.
- Corrections retain unrelated errors and all values. Preferred Email or WeChat requires only that selected channel; either accepts either valid contact. An optional email is still checked when supplied.
- All four formats accept nonnegative integer package counts; the combined requested volume must be positive. Selection toggles retain counts. The global MOQ remains an advisory referring to the dedicated wholesale section and never changes quantities.
- Destination port supports an explicit “Not sure yet” checkbox. Its localized text uses the existing destination_port template variable.
- Initial forms have no notification or fallback panels. A valid submit loads runtime EmailJS config. Success follows a provider 2xx confirmation; timeout remains unconfirmed; service/configuration failures preserve values and expose manual alternatives.
- Sending disables duplicate attempts and shows a spinner. The live sending notification is outside the busy fieldset. Existing cross-form cooldown and in-flight timeout lock remain in place.
- WhatsApp requires an explicit click. WeChat copy confirms only successful writes. The full request preview is collapsed initially, stays synchronized with language, and disappears after edits. Preview and copied message share the original submission timestamp.
- Quote and grove-visit templates retain their exact 17- and 12-variable contracts.

## Checks

- `npm test`: 21 unit tests and both EmailJS template contracts pass.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- Production build: pass with `NEXT_PUBLIC_SITE_URL=https://ganlan.netlify.app` and all four EmailJS public environment identifiers explicitly blank. All exported routes are static; runtime EmailJS is safely disabled.
- `scripts/check-dist.mjs`: portable `dist/`, runtime JSON, legal routes, dedicated MOQ and absence of environment files verified.
- Playwright: 105 passed, 7 intentionally skipped by existing device filters (112 discovered), using `PLAYWRIGHT_BASE_URL=http://localhost:49174 npm run test:e2e`. Every provider request in form tests is intercepted; no real email was sent.
- Browser inspection covers clean and invalid quote/visit states at desktop and mobile sizes. Form tests cover 320, 375, 390, 430, 768, 1024 and 1440 px, both languages, labels/error associations, focus and overflow.
- axe-core 4.12.1: no violations in either form. The translucent visit form over a gradient requires manual contrast inspection; its existing cream surface and dark text remain readable.

## Test-host notes

The existing host-injected metadata test stalls hydration under `next dev` because Chrome blocks the development HMR WebSocket with `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`. It passes against the static export. An initial parallel run also collided with a separate Playwright process's artifact cleanup; subsequent full runs are isolated.

The export is served with `serve` configured with `{"trailingSlash":true}` to match Next.js and production URL behavior. Its default slash stripping causes the existing privacy URL assertion to fail even when the page renders correctly. No unrelated application code or test expectations were changed for these host differences.
