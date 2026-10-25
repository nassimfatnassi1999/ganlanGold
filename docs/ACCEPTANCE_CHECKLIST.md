# GANLAN GOLD V7 Acceptance Checklist

This file records technical acceptance evidence. External approvals remain separate from software verification.

## Business invariants

- [ ] Exactly four formats render: 250 ml, 500 ml, 750 ml, and professional 5 L tin.
- [ ] Initial USD prices are `$4.00`, `$7.30`, `$10.10`, and `$38.50`.
- [ ] No individual product MOQ is rendered.
- [ ] The public numeric MOQ appears once, in the dedicated post-products section.
- [ ] The global policy is 7,500 litres and supports mixed 250/500/750 ml bottles.
- [ ] Public CNY derives from validated ECB EUR/CNY and EUR/USD rates.
- [ ] CNY is rounded upward; USD remains unchanged; EUR is never public.
- [ ] Rate date and stale/unavailable state are visible and honest.
- [ ] Gisèle is first; her telephone works; no Gisèle WeChat identity exists.
- [ ] Lassad and Fouad have correct WhatsApp links and assigned official QR files.
- [ ] Chinese is structurally and visually primary; English is secondary.
- [ ] Export/Incoterm copy matches V7 and does not promise Chinese delivery.
- [ ] No container illustration is advertised as validated capacity.
- [ ] No unverified certification, regulatory, organic, health, or legal claim is public.

## Functional acceptance

- [ ] Quote submission validates, persists, computes litres, records consent, deduplicates, and returns an identifier.
- [ ] Visit submission validates, persists, records consent, and does not confirm a date.
- [ ] Spam, rate-limit, request-size, output-encoding, and origin protections are verified.
- [ ] SMTP is optional and its real delivery status is recorded accurately.
- [ ] Admin setup has no default password; login/session/logout protections work.
- [ ] Unauthorized access to all admin data/actions is rejected.
- [ ] Product USD edits persist and are audited.
- [ ] Quote/visit status and notes persist and are audited.
- [ ] CSV export neutralizes spreadsheet formulas.
- [ ] Manual and scheduled rate refreshes are protected and recorded.

## Experience and operations

- [ ] Navigation/CTAs work; forms have labels, inline errors, focus management, and polished states.
- [ ] Layout passes 320, 375, 390, 430, 768, 1024, and 1440 px without horizontal overflow.
- [ ] Product labels and QR codes remain legible, uncropped, and undistorted.
- [ ] Reduced-motion mode preserves all content and interactions.
- [ ] Metadata, canonical, robots, sitemap, structured data, and image alt text are present.
- [ ] No Google-hosted font/map/CAPTCHA dependency is present.
- [ ] Typecheck, lint, unit, integration, e2e, and production build results are recorded below.
- [ ] Docker/Compose/Caddy, migrations, persistence, backup, restore, deployment, and rollback are documented.

## Verification record

| Check | Command / evidence | Result |
|---|---|---|
| TypeScript | Pending | Not run |
| ESLint | Pending | Not run |
| Unit/integration | Pending | Not run |
| Production build | Pending | Not run |
| Playwright | Pending | Not run |
| Responsive screenshots | Pending | Not run |
| QR scan on WeChat device | External pre-launch action | Not verified |

