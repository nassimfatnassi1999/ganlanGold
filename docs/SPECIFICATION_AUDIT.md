# GANLAN GOLD V7 Specification Audit

Source: `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf` (seven pages, English V7, 25 October 2026).

Status key: **Verified input** means the requirement has been extracted and mapped. **Planned** becomes **Implemented** only after code and verification evidence exist.

| V7 requirement | Implementation location | Verification | Status |
|---|---|---|---|
| Chinese-first, English-secondary responsive long page | `src/app/page.tsx`, `src/i18n/*.json`, section components | Playwright heading/order checks at all target widths | Planned |
| Deep olive `#173E2B`, gold `#DCC183`, ivory; premium Moroccan identity | `src/app/globals.css`, design tokens, image assets | Token/contrast review and screenshots | Planned |
| Hero with brand, four formats, quote CTA | `Hero` section using supplied text-free composition | Visual/browser CTA test | Planned |
| Exactly four products: 250 ml, 500 ml, 750 ml, 5 L | product seed/data and `ProductStory` | Unit seed invariant + Playwright count/capacity test | Planned |
| Initial USD prices 4.00, 7.30, 10.10, 38.50 | Prisma seed and migration | Unit/integration seed assertions | Planned |
| Dynamic CNY prominent; USD smaller; no public EUR | currency service + product component | Unit formula tests + rendered text scan | Planned |
| Alternating product composition; 5 L substantially larger | product section CSS/layout | Breakpoint screenshots | Planned |
| No per-product MOQ / never “1,000 bottles” | content model disallows product MOQ | public-page invariant test | Planned |
| Numeric 7,500 L MOQ appears once, immediately after products | `WholesaleSection` only | rendered occurrence-count test | Planned |
| Exact Chinese and English MOQ wording | `src/i18n/zh-CN.json`, `en.json` | literal copy review + page test | Planned |
| Mixed 250/500/750 ml ordering; loading subject to confirmation | Wholesale and quote helper text | copy/page test | Planned |
| Origin reflects Fouad plus selected neighboring growers and lot traceability | `OriginSection` | content review, no exclusive-farm claim scan | Planned |
| Visit invitation and persisted request form | `VisitSection`, `/api/visits`, `VisitRequest` | validation and persistence integration/e2e | Planned |
| Export duties, Incoterm qualification, exclusions, applicable documents | `ExportServicesSection` | copy audit against V7 | Planned |
| Contact priority Gisèle, Lassad, Fouad | `ContactSection` | DOM-order test | Planned |
| Gisèle telephone; no invented WeChat | structured contact data | link and absence test | Planned |
| Correct Lassad/Fouad WhatsApp numbers and official QR files | contact data and `/public/images/qr` | href/hash/assignment tests + external scan pending | Planned |
| Quote fields, multi-format quantities, litres calculation, consent | quote schema/service/form | unit validation/volume + persistence e2e | Planned |
| Inquiry is non-binding | quote helper and confirmation copy | copy audit | Planned |
| Spam, rate limit, duplicate handling, size/origin protection | public route security helpers | unit and route tests | Planned |
| Persist before optional notification; configurable SMTP | quote/visit services and mail adapter | integration tests with configured/unconfigured adapter | Planned |
| ECB EUR/CNY and EUR/USD; `USD/CNY = CNY ÷ USD` | `src/lib/currency/*` | fixed-fixture parser/formula tests | Planned |
| CNY uses mathematical ceiling | currency calculator | test 49.10 → 50 and exact-boundary cases | Planned |
| Persist rate/date/status and fallback across restarts | `ExchangeRate` model/service | database integration tests | Planned |
| Daily refresh and protected manual refresh | cron route/worker and admin action | route authorization + Compose inspection | Planned |
| Admin secure login, hashing, HTTP-only sessions, CSRF/origin, throttling | `src/lib/auth/*`, middleware/DAL, actions | unit/integration/browser unauthorized tests | Planned |
| Dashboard, products, quotes, visits, rates, CSV, settings, audit | `/admin/*`, admin services | authenticated browser/integration tests | Planned |
| CSV formula-injection safety | CSV serializer | unit tests for `=`, `+`, `-`, `@`, tabs/CR | Planned |
| Normalized PostgreSQL models and indexes | `prisma/schema.prisma`, migration | Prisma validation and integration checks | Planned |
| Chinese SEO, canonical, robots, sitemap, structured data | metadata, `robots.ts`, `sitemap.ts`, JSON-LD | build/output inspection | Planned |
| No blocked Google dependencies; optimized/lazy images | local fonts/assets, `next/image` | network request audit and browser tests | Planned |
| Chinese-first privacy/legal/commercial pages without invented facts | `/privacy`, `/legal`, `/terms` | content/placeholder review | Planned |
| Responsive 320–1440+, touch, no overflow, reduced motion | global/section styles | Playwright screenshots and CSS media test | Planned |
| Docker, HTTPS-ready proxy, migrations, storage, backups, rollback docs | Docker/Caddy/scripts/docs | Compose config and script dry-run checks | Planned |
| Complete documentation and launch prerequisites | `README.md`, `docs/*.md` | documentation audit | Planned |

## Authoritative negative constraints

The implementation must not publicly claim or expose: individual MOQs; “1,000 bottles”; EUR prices; guaranteed 20-foot loading capacity; delivery to a Chinese warehouse; issued documents before confirmation; unverified certifications, organic/medical/composition claims, licenses, legal identifiers, or regulatory approvals; a WeChat identity for Gisèle; or an approved Chinese brand name.

