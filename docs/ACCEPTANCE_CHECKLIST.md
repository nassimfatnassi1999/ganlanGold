# GANLAN GOLD V7 Acceptance Checklist

This file records technical acceptance evidence. External approvals remain separate from software verification.

## Business invariants

- [x] Exactly four formats render: 250 ml, 500 ml, 750 ml, and professional 5 L tin.
- [x] Initial USD prices are `$4.00`, `$7.30`, `$10.10`, and `$38.50`.
- [x] No individual product MOQ is rendered.
- [x] The public numeric MOQ appears once, in the dedicated post-products section.
- [x] The global policy is 7,500 litres and supports mixed 250/500/750 ml bottles.
- [x] Public CNY derives from validated ECB EUR/CNY and EUR/USD rates.
- [x] CNY is rounded upward; USD remains unchanged; EUR is never public.
- [x] Rate date and stale/unavailable state are visible and honest.
- [x] Gisèle is first; her telephone works; no Gisèle WeChat identity exists.
- [x] Lassad and Fouad have correct WhatsApp links and assigned official QR files.
- [x] Chinese is structurally and visually primary; English is secondary.
- [x] Export/Incoterm copy matches V7 and does not promise Chinese delivery.
- [x] No container illustration is advertised as validated capacity.
- [x] No unverified certification, regulatory, organic, health, or legal claim is public.

## Functional acceptance

- [x] Quote submission validates, persists, computes litres, records consent, deduplicates, and returns an identifier.
- [x] Visit submission validates, persists, records consent, and does not confirm a date.
- [x] Spam, rate-limit, request-size, output-encoding, and origin protections are verified.
- [x] SMTP is optional and its real delivery status is recorded accurately.
- [x] Admin setup has no default password; login/session/logout protections work.
- [x] Unauthorized access to all admin data/actions is rejected.
- [x] Product USD edits persist and are audited.
- [x] Quote/visit status and notes persist and are audited.
- [x] CSV export neutralizes spreadsheet formulas.
- [x] Manual and scheduled rate refreshes are protected and recorded.

## Experience and operations

- [x] Navigation/CTAs work; forms have labels, inline errors, focus management, and polished states.
- [ ] Layout passes 320, 375, 390, 430, 768, 1024, and 1440 px without horizontal overflow.
- [ ] Product labels and QR codes remain legible, uncropped, and undistorted.
- [ ] Reduced-motion mode preserves all content and interactions.
- [x] Metadata, canonical, robots, sitemap, structured data, and image alt text are present.
- [x] No Google-hosted font/map/CAPTCHA dependency is present.
- [ ] Typecheck, lint, unit, integration, e2e, and production build results are recorded below.
- [x] Docker/Compose/Caddy, migrations, persistence, backup, restore, deployment, and rollback are documented.

## Verification record

| Check | Command / evidence | Result |
|---|---|---|
| TypeScript | `npm run typecheck` on 25 Oct 2026 | Passed; final release rerun pending |
| ESLint | `npm run lint` on 25 Oct 2026 | Passed; final release rerun pending |
| Unit/integration | `TEST_DATABASE_URL=… npm test -- --run` | 43 files / 139 tests passed; final release rerun pending |
| Production build | `npm run build` | Passed; final release rerun pending |
| Playwright | public/forms/admin suites at desktop/mobile | Passed during implementation; final release rerun pending |
| Responsive screenshots | Desktop/mobile visual inspections | Partial; complete seven-width matrix pending |
| QR scan on WeChat device | External pre-launch action | Not verified |

## External launch blockers

Legal operator/privacy details, product/label/regulatory approvals, final image rights and high-resolution assets, QR account scans, production domain/hosting/SMTP, mainland-China prerequisites, and a verified off-host backup restore remain open in `LAUNCH_READINESS.md`. They are not software test failures and are not represented as complete.

