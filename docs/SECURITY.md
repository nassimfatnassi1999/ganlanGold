# Security model

## Trust boundaries

Public browsers may read public pages and submit bounded quote/visit JSON. Administrators authenticate to server actions and protected data services. PostgreSQL, SMTP, ECB, and the reverse proxy are separate trust boundaries. Caddy is the only intended public container.

## Implemented controls

- Zod strict schemas, length/range limits, integer quantities, explicit consent, and honeypot fields
- 32 KiB public request limit plus 256 KiB Server Action limit
- same-origin validation for public POST routes; built-in Next.js Server Action origin/host checks
- database-backed fixed-window rate limits with HMAC-hashed keys
- HMAC submission fingerprints and uniqueness constraints for idempotent duplicate handling
- optional HMAC network-address hashes; raw IP addresses are not required by the lead model
- Prisma parameterized access and transactional lead/audit mutations
- bcrypt administrator passwords with strength rules; no default account
- opaque random session tokens stored only as SHA-256 hashes
- HTTP-only, `SameSite=Strict`, production-secure session cookie; 30-minute idle and 8-hour absolute expiry
- authorization inside every admin query/mutation boundary plus page-level redirects
- audit records for product, lead, visit, rate, and setting changes
- CSV formula-injection neutralization
- bounded public errors and health output; secrets and stack traces are not returned
- CSP, frame denial, MIME sniff protection, referrer/permissions policies, COOP/CORP, and production HSTS
- non-root standalone application container and private database network

## Secrets

Never commit `.env`, database dumps, session tokens, SMTP credentials, or production logs containing personal data. Generate independent random values for all application secrets. Rotate a secret after suspected disclosure and understand the effect: session/database credential changes affect availability; HMAC key rotation changes rate-limit/fingerprint continuity.

`NEXT_PUBLIC_SITE_URL` and `TRUST_PROXY` are security inputs. Use the exact HTTPS origin. Enable proxy trust only behind a controlled proxy that replaces forwarding headers; never expose the app container directly while trusting arbitrary forwarding headers.

## CSP limitations

The production CSP denies external origins, frames, objects, and insecure requests. Next.js bootstrap scripts require `'unsafe-inline'`, and image/style behavior requires narrowly scoped data/blob/inline allowances. Development alone adds WebSocket and eval allowances for hot reload. Re-test CSP after adding any third-party service; do not broadly add wildcards.

## Personal data and retention

Quote/visit records contain business contact information, submitted needs, consent text/version/time, and optional pseudonymous network data. Access is limited to authenticated administrators at the application layer. No automated retention deletion is implemented because the lawful retention period and deletion authority have not been approved. Define those before production, document data-subject handling, secure exports/backups, and test deletion in staging before use.

## Dependency and incident practice

Review dependency advisories and base-image updates on a scheduled basis; test before upgrading. Centralize access/proxy/application/database logs with restricted access and a documented retention period. For an incident: contain access, preserve evidence, rotate affected credentials, assess personal data impact, restore from verified media if needed, and follow applicable notification duties determined by counsel.

## Reporting

A public vulnerability-reporting address has not been supplied. Add an approved security contact and process before launch; do not invent one in the website.
