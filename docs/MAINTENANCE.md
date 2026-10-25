# Maintenance runbook

## Daily

- Check `/api/health`, container status, and proxy/app/database error alerts.
- Review new quote/visit records and notification failures.
- Confirm the ECB worker has a recent attempt; weekends/holidays may retain the latest reference date.
- Check disk and backup-job status.

## Weekly

- Review failed login/rate-limit patterns and unexpected admin audit events.
- Verify HTTPS certificate status and external page/form reachability from target regions.
- Check PostgreSQL growth, slow queries, and storage headroom.
- Copy encrypted backups off-host according to approved retention policy.

## Monthly and before releases

- Restore a backup into an isolated database and verify products, admin login, representative leads, audit rows, and rate history.
- Review npm and container-image advisories; apply upgrades first in staging.
- Run `npm run typecheck`, `npm run lint`, database-backed `npm test`, `npm run build`, and `npm run test:e2e`.
- Recheck mobile/desktop screenshots, keyboard navigation, reduced motion, console, CSP, robots, sitemap, metadata, and structured data.
- Confirm public copy, contacts, prices, labels, imagery approvals, and legal information remain current.

## Currency operations

The `rates` service refreshes immediately on startup and at `RATE_REFRESH_INTERVAL_SECONDS` (minimum 300; default 86,400). It logs a failure and continues; the application retains the last valid rate. Manual alternatives:

```bash
npm run currency:refresh
docker compose exec rates npm run currency:refresh
```

The protected web alternative is Admin → Rates → Refresh now.

## Database migrations

Review migration SQL and back up first. Production uses `prisma migrate deploy`, never `migrate dev`. The one-shot Compose `migrate` service applies migrations and seeds missing product identities. Seed reruns preserve maintained USD prices.

## Backups and restore tests

Use the commands in `DEPLOYMENT.md`. Keep at least one verified off-host encrypted copy under business-approved retention. Record backup time, application revision, database version, restore-test date, operator, and outcome. Never treat an untested dump as a recovery guarantee.

## Log and data hygiene

Do not log submitted form bodies, passwords, tokens, database URLs, or SMTP credentials. Restrict CSV and backup access. The application has no approved automatic personal-data purge; once policy is approved, implement deletion as a separately tested, audited change.

## Asset replacement

Replace runtime files only with approved, rights-cleared assets. Preserve aspect ratio and product-label legibility, regenerate WebP/AVIF derivatives, update `src/lib/assets.ts` if paths change, update `docs/ASSET_INVENTORY.md`, and rerun asset, visual, and browser tests. Never regenerate official QR codes; replace them only with verified source files and update the recorded hashes.
