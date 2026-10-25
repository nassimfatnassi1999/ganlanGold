# GANLAN GOLD V7 specification audit

Source: `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`, all seven pages and embedded visuals, reviewed 25 October 2026.

Status meanings: **Implemented** is present in code and covered by the named evidence. **External** cannot be completed truthfully from the supplied files and remains a launch blocker.

## Brand, language, and public experience

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| Chinese-first, English-secondary, responsive long page | `src/app/page.tsx`, `src/i18n/*`, public components | component and Playwright heading/order assertions | Implemented |
| Deep olive `#173E2B`, gold `#DCC183`, ivory; premium Moroccan tone | three-layer tokens in `globals.css`; design-system docs/assets | token tests, responsive screenshots, visual inspection | Implemented |
| No Google fonts/maps/blocked dependency | system/local font stacks and repository images only | source/network inspection | Implemented |
| Sticky navigation, real anchor links, quote CTA, premium footer | `SiteHeader`, `PublicExperience`, `SiteFooter` | desktop/mobile Playwright navigation tests | Implemented |
| Hero presents GANLAN GOLD and all four formats without embedded commercial misinformation | text-free derived hero plus semantic copy | asset test, browser visual review | Implemented |
| Alternating editorial product layouts; 5 L visually substantial | `ProductShowcase`, responsive CSS | screenshot review at desktop/mobile | Implemented |
| Origin represents Fouad plus selected nearby growers, traceability, no exclusive-estate claim | Chinese/English origin copy | exact content review and negative-claim scan | Implemented |
| Visit invitation does not confirm a date | visit copy, form, acknowledgement | component/API tests | Implemented |
| Export preparation, Incoterm qualification, exclusions, applicable documents | export section and `/terms` | V7 copy cross-check | Implemented |
| Local responsive images, primary hero priority, below-fold lazy behavior, descriptive alt | `next/image`, `picture`, local WebP/AVIF/PNG/SVG | asset/component/browser inspection | Implemented |
| 320–1440+ layout, touch targets, reduced motion, no essential animation | responsive/reduced-motion CSS | automated/browser matrix completed in final verification | Implemented |

## Products and commercial rules

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| Exactly 250 ml, 500 ml, 750 ml, and professional 5 L | `PRODUCT_SPECS`, Prisma seed, product UI | catalog/seed/render invariant tests | Implemented |
| Initial USD references `$4.00`, `$7.30`, `$10.10`, `$38.50` with precision | catalog, migration, seed | unit and PostgreSQL integration tests | Implemented |
| USD smaller; derived CNY prominent; no public EUR | `ProductShowcase` and currency state | component and public-page negative scans | Implemented |
| No individual format MOQ and no “1,000 bottles” | no per-product MOQ field/UI | literal rendered-page tests | Implemented |
| Numeric 7,500 L MOQ appears once immediately after products | dedicated wholesale section | DOM order and occurrence-count tests | Implemented |
| Mixed 250/500/750 ml ordering and loading subject to final confirmation | approved wholesale copy | content test/review | Implemented |
| Inquiry is non-binding and quote validity is qualified | quote section, success state, `/terms` | component/e2e copy tests | Implemented |
| No claimed 20-foot capacity, China-warehouse delivery, issued documents, certification, medical/organic claim | public copy and legal boundaries | negative scans and manual audit | Implemented |

## Contacts and assets

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| Contact order Gisèle, Lassad, Fouad | contact data/UI and Organization JSON-LD | DOM and JSON-LD tests | Implemented |
| Gisèle `+86 134 2751 3756`; no invented WeChat | tel link only | link/absence tests | Implemented |
| Lassad WhatsApp `+33 6 34 14 26 32` and official QR | contact card, byte-preserved QR | href/hash/assignment tests | Implemented |
| Fouad WhatsApp `+40 724 815 229` and official QR | contact card, byte-preserved QR | href/hash/assignment tests | Implemented |
| Original/reference assets preserved and provisional derivatives identified | `GANLAN_GOLD_website_assets`, `public/images`, inventory | manifest/path/hash tests | Implemented |
| Final photo rights, high-resolution photography, labels, logo/fonts, Chinese brand approval | no verified inputs were supplied | `ASSET_INVENTORY.md`, `LAUNCH_READINESS.md` | External |
| Target-device WeChat scan confirms both QR destinations | software preserves supplied bytes but cannot establish account ownership | launch checklist requires recorded device scan | External |

## Forms, persistence, and currency

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| Quote fields, multi-format quantities, reliable litres, consent and identifier | schema, volume service, Prisma lead service, form | unit/route/PostgreSQL/Playwright tests | Implemented |
| Visit fields, consent, persistence, non-confirming identifier response | schema/service/form/API | unit/route/PostgreSQL/Playwright tests | Implemented |
| Persist before optional SMTP; record actual notification state | transactional repositories and mail adapter | service/integration tests | Implemented |
| Honeypot, strict validation, bounded bodies/errors, origin protection, rate limit, duplicate handling | schemas, HTTP/security services, unique fingerprint | unit/route/concurrent integration tests | Implemented |
| ECB daily EUR/CNY and EUR/USD; `USD/CNY = CNY ÷ USD` | parser/calculator/service | actual-envelope fixtures and formula tests | Implemented |
| Mathematical ceiling for public CNY | Decimal calculator | exact/fractional boundary tests | Implemented |
| Persist valid/failed attempts, reference date, last-valid fallback | `ExchangeRate` repository/service | service and database behavior tests | Implemented |
| Daily scheduled, protected cron, CLI and protected manual refresh | rates Compose worker, cron route, CLI, admin action | route/auth/operations tests | Implemented |

## Administration and data

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| No default admin; strong bcrypt password; secure opaque sessions; throttled login/logout | auth services, init CLI, login actions | unit, integration, authenticated/anonymous E2E | Implemented |
| Authorization at pages and every admin data/action boundary | page gate plus `requireAdmin()` services | DAL and anonymous route/browser tests | Implemented |
| Dashboard, products, quotes, visits, rates, controlled settings | `/admin/(protected)`, admin services/components | component/authenticated Playwright tests | Implemented |
| Notes/status updates, product edits, rate/settings changes are audited | transactional admin services and `AuditLog` | unit/PostgreSQL integration tests | Implemented |
| CSV neutralizes `=`, `+`, `-`, `@`, tab and carriage-return formulas | CSV serializer/export route | malicious-cell unit tests | Implemented |
| Normalized PostgreSQL schema, numeric precision, consent/timestamps/indexes | Prisma schema and initial migration | Prisma generation/migration/integration tests | Implemented |
| Seed always yields four identities but does not overwrite maintained prices later | idempotent seed update contract | seed integration preservation test | Implemented |

## SEO, legal, security, and operations

| V7 requirement | Implementation | Verification evidence | Status |
|---|---|---|---|
| Chinese metadata, canonical, Open Graph, language, Organization/Product JSON-LD | root metadata and SEO library | metadata/JSON-LD tests and runtime head inspection | Implemented |
| Robots and sitemap expose public routes, exclude admin/API | metadata routes | route tests and runtime output inspection | Implemented |
| Chinese-first privacy, legal, commercial pages without invented identifiers | `/privacy`, `/legal`, `/terms` | content review and linked-route E2E | Implemented |
| Security headers, secure configuration, health response | `next.config.ts`, `.env.example`, `/api/health` | header tests and dev/production response inspection | Implemented |
| Docker standalone app, PostgreSQL volume, migration gate, scheduled rates, Caddy | Dockerfile, Compose, Caddy | Compose-model validation; daemon build pending externally | Implemented |
| Safe backup/restore, deployment/update/rollback/admin/security/maintenance docs | scripts and handover docs | ShellCheck, syntax, dry-run and documentation audit | Implemented |
| Legal identity, privacy governance, production domain/host/SMTP, regulatory/import and mainland-China prerequisites | intentionally not fabricated | `LAUNCH_READINESS.md` | External |

## Authoritative negative constraints

The release must continue to reject or omit: per-product MOQs; “1,000 bottles”; public EUR; guaranteed container capacity; included international freight/insurance/China clearance/duty/tax/warehouse delivery; documents not confirmed available; unverified certifications, medical/nutrition/organic/composition claims, licences, identifiers, addresses, representatives, regulatory approvals, or privacy guarantees; a Gisèle WeChat identity; and an invented Chinese brand name.
