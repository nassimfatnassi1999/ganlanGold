# GANLAN GOLD website

Production-oriented, Chinese-first B2B website for GANLAN GOLD Moroccan olive oil. The repository contains the public commercial site, PostgreSQL-backed quote and visit workflows, ECB-derived indicative CNY pricing, a protected administration area, tests, and self-hosted Docker/Caddy operations.

The authoritative business source is `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`. Unverified legal, regulatory, certification, and logistics claims are deliberately absent.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind/PostCSS and repository-owned CSS tokens
- Prisma 7 with PostgreSQL
- Zod validation, bcrypt password hashes, opaque server-side sessions
- Vitest, Testing Library, Playwright
- Docker Compose with PostgreSQL 17, standalone Node runtime, scheduled ECB refresh, and Caddy

## Features

- Chinese-first, English-secondary single-page commercial experience
- Exactly four product formats and source-approved USD reference prices
- Server-side ECB `EUR/CNY ÷ EUR/USD` calculation with mathematical ceiling for indicative CNY
- One global 7,500 L commercial MOQ, never a per-format MOQ
- Persisted, consent-bearing quote and origin-visit forms with deduplication and abuse controls
- Optional SMTP notifications that never replace database persistence
- Admin dashboard for products, leads, visits, rates, controlled settings, notes, status, audit records, and safe CSV export
- Chinese metadata, canonical/OG tags, JSON-LD, robots, sitemap, legal pages, health endpoint, and security headers
- Responsive local assets with no Google-hosted runtime dependency

## Repository map

```text
src/app/                 Next.js pages, route handlers, admin actions
src/components/          Public, form, product, layout, and admin UI
src/lib/                 Domain, database, currency, security, auth, SEO
src/i18n/                Structured Simplified Chinese and English copy
prisma/                  Schema, migration, deterministic initial seed
public/images/           Runtime web assets
scripts/                 Admin, rate, container, backup, restore tools
tests/                   Integration, E2E, asset, header, operations tests
docs/                    Audit, deployment, admin, security, maintenance
design-system/           Brand tokens and component guidance
```

## Requirements

- Node.js 22 and npm
- PostgreSQL 15 or newer for local development
- Playwright Chromium for browser tests
- Docker Engine with Compose for the container workflow

## Local setup

```bash
npm ci
cp .env.example .env.local
createdb ganlan_gold
```

Set `DATABASE_URL` in `.env.local` to the local database and replace every secret placeholder. For local non-Docker work, the database hostname is normally `localhost`, not `db`.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
INITIAL_ADMIN_EMAIL='operator@example.com' \
INITIAL_ADMIN_PASSWORD='replace-with-a-unique-strong-password' \
npm run admin:init
npm run dev
```

Open `http://localhost:3000`; the login is at `/admin/login`. `admin:init` refuses to create an account if any administrator already exists and provides no default credentials.

## Environment

`.env.example` is the complete deployment template. Required production values are:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `RATE_LIMIT_SECRET`
- `SUBMISSION_FINGERPRINT_SECRET`
- `PRIVACY_HASH_SECRET`
- `CRON_SECRET`
- PostgreSQL credentials for Compose

Use independent, randomly generated secrets. `TRUST_PROXY=true` is appropriate only behind the included trusted Caddy proxy. SMTP is optional; without a complete host, port, sender, and recipient configuration, submissions persist with `NOT_CONFIGURED` notification state.

## Products and currency

The seed creates 250 ml, 500 ml, 750 ml, and 5 L records. Later seed runs preserve administrator-maintained USD prices. Edit public USD prices and approved bilingual descriptions under `/admin/products`; capacity and product identity are intentionally immutable.

The refresh service fetches the ECB daily XML, validates EUR/USD and EUR/CNY, stores every valid or failed attempt, and derives:

```text
USD/CNY = EUR/CNY ÷ EUR/USD
indicative product CNY = ceil(reference USD × USD/CNY)
```

If a refresh fails, the last valid persisted rate remains visible as cached data. If no valid rate exists, the public site says the CNY reference is unavailable. Refresh manually under `/admin/rates`, run `npm run currency:refresh`, or use the scheduled Compose service.

## Lead handling

`POST /api/quotes` and `POST /api/visits` validate bounded JSON, same-origin requests, honeypot state, contact alternatives, explicit consent, and rate limits. Submissions receive opaque public request IDs and are persisted before optional notification delivery. Repeated identical payloads return the existing identifier. Quote rows snapshot product capacity and USD reference price at submission time.

Operators manage status and internal notes in the admin. CSV export is available from the quote screen and neutralizes spreadsheet-formula prefixes.

## Tests and verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Database integration tests run when `TEST_DATABASE_URL` is set:

```bash
TEST_DATABASE_URL='postgresql://user@localhost:5432/ganlan_gold_test' npm test
```

Install the browser once with `npx playwright install chromium`. The E2E admin sign-in journey additionally uses `ADMIN_E2E_EMAIL` and `ADMIN_E2E_PASSWORD`; it skips safely when they are absent.

## Production and operations

See [Deployment](docs/DEPLOYMENT.md), [Admin guide](docs/ADMIN_GUIDE.md), [Security](docs/SECURITY.md), [Maintenance](docs/MAINTENANCE.md), and [Launch readiness](docs/LAUNCH_READINESS.md).

The minimum Docker flow is:

```bash
cp .env.example .env
# Replace every placeholder, then:
docker compose config --quiet
docker compose build
docker compose up -d
docker compose ps
```

Do not publish until every blocker in `docs/LAUNCH_READINESS.md` is closed. In particular, legal operator details, asset rights, final label approval, target-device QR scans, domain/DNS, email deliverability, and any mainland-China regulatory prerequisites require external confirmation.
