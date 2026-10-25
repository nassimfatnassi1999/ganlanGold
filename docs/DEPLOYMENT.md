# Deployment guide

## Deployment model

The Compose stack contains:

- `db`: persistent PostgreSQL 17
- `migrate`: one-shot Prisma migration and safe product seed
- `app`: non-root Next.js standalone runtime
- `rates`: immediate and then periodic ECB refresh worker
- `proxy`: Caddy HTTP/HTTPS reverse proxy
- `backup` and `restore`: opt-in `operations` profile tools

The database is not published on a host port. Caddy is the only public service.

## Server prerequisites

Use a maintained Linux VPS with Docker Engine and Compose, outbound HTTPS access to `www.ecb.europa.eu` and the configured SMTP host, persistent disk, working DNS, inbound TCP 80/443, and UDP 443 if HTTP/3 is desired. Size CPU, memory, storage, monitoring, and backup retention for actual traffic and legal retention policy.

## Configure

```bash
git clone <approved-repository-url> ganlan-gold
cd ganlan-gold
cp .env.example .env
chmod 600 .env
```

Replace all placeholders. For a public host:

```dotenv
NEXT_PUBLIC_SITE_URL=https://approved.example
SITE_ADDRESS=approved.example
```

The domain above is illustrative only. Use the approved production domain. `DATABASE_URL` must use the internal hostname `db`, and reserved characters in its password must be percent-encoded. Generate the three application secrets and cron secret independently; do not reuse the database or administrator password.

Validate without starting containers:

```bash
docker compose config --quiet
```

## First deployment

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 migrate app rates proxy
```

The app waits for a healthy database and a successful migration job. The proxy waits for the app health endpoint. Confirm:

```bash
curl --fail --silent https://approved.example/api/health
curl --fail --silent https://approved.example/robots.txt
curl --fail --silent https://approved.example/sitemap.xml
```

Expected health JSON is exactly `{"status":"ok","database":"reachable"}`. It intentionally exposes no version, host, SQL, or credential details.

## Create the first administrator

Export credentials only for the one command and remove them from shell history where operational policy requires:

```bash
export INITIAL_ADMIN_EMAIL='operator@example.com'
export INITIAL_ADMIN_PASSWORD='replace-with-a-unique-strong-password'
docker compose run --rm \
  -e INITIAL_ADMIN_EMAIL -e INITIAL_ADMIN_PASSWORD \
  migrate admin-init
unset INITIAL_ADMIN_EMAIL INITIAL_ADMIN_PASSWORD
```

The command refuses a second initial administrator. Account lifecycle changes beyond initial provisioning require an approved operational procedure.

## DNS and HTTPS

Point the approved A/AAAA records to the VPS, set `SITE_ADDRESS` to the hostname, and keep ports 80 and 443 reachable while Caddy obtains and renews certificates. Do not set a public hostname until DNS resolves correctly. For local Docker, keep `SITE_ADDRESS=http://localhost` and `NEXT_PUBLIC_SITE_URL=http://localhost`.

## Updates

Before every update:

1. Review the release diff and migration SQL.
2. Create and verify a database backup.
3. Record the current Git revision and image identifiers.
4. Run the complete verification suite in CI or staging.

Then deploy:

```bash
git fetch --all --tags
git checkout <approved-release-tag>
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 migrate app rates proxy
```

Prisma migrations are forward operations. Never assume application rollback also reverses schema changes.

## Backup

```bash
mkdir -p backups
chmod 700 backups
docker compose run --rm backup --dry-run
docker compose run --rm backup
ls -lh backups
```

The custom-format dump is written atomically and an existing file is never overwritten. Encrypt and copy backups off-host under the approved access/retention policy. A backup is not verified until restored into an isolated database and checked.

## Restore

Restore overwrites database objects and is intentionally gated. Confirm the selected file, take a fresh safety backup if possible, and stop writers:

```bash
docker compose stop app rates
docker compose run --rm restore --dry-run /backups/ganlan-gold-YYYYMMDDTHHMMSSZ.dump
docker compose run --rm restore --confirm-restore /backups/ganlan-gold-YYYYMMDDTHHMMSSZ.dump
docker compose up -d migrate app rates proxy
```

Check health, administrator access, four products, representative leads, audit history, and current/last-valid rate after restore.

## Rollback

If the schema remains compatible, check out the previous approved tag, rebuild, and restart `app`, `rates`, and `proxy`. If a migration is incompatible, stop all writers and restore the pre-deployment dump using the procedure above. Record the incident and do not delete the failed release evidence.

## Mainland China hosting boundary

If hosting or CDN delivery is planned from mainland China, legal entity eligibility, domain registration, ICP filing/licensing, public-security registration where applicable, cross-border data handling, content review, and provider-specific requirements must be confirmed with qualified local advisers and the selected provider. This repository does not claim any filing, licence, approval, or guaranteed mainland reachability.
