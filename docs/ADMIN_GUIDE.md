# Administrator guide

## Sign in and session behavior

Use `/admin/login`. There are no default credentials. Sessions use an opaque random cookie, are HTTP-only, `SameSite=Strict`, secure in production, idle-expire after 30 minutes, and absolutely expire after 8 hours. Sign out from the sidebar when finished, especially on shared devices.

Five failed login attempts within 15 minutes for the same network/email bucket trigger throttling. Operators must not share accounts or transmit passwords in chat or email.

## Dashboard

The overview shows quote and visit totals, new counts, the current USD/CNY state, and recent records. An unavailable rate is displayed as unavailable; it is never fabricated.

## Products

The Products screen permits only:

- positive USD reference price with two-decimal storage;
- approved Simplified Chinese description;
- approved English description.

Product ID, capacity, package identity, display order, and the global MOQ are not editable here. Saving writes an audit record. Re-running the seed does not overwrite an administrator-maintained price.

## Quote requests

Search by request ID, company, or country and filter by status. Open a request to review contact data, selected formats, quantity, snapshotted USD price, calculated litres, consent, notification result, and submitted time.

Available statuses are `NEW`, `CONTACTED`, `IN_NEGOTIATION`, `QUOTED`, and `CLOSED`. Internal notes are limited to 4,000 characters and never appear publicly. Status/note changes are audited.

The CSV export is authenticated and includes a UTF-8 BOM. Values beginning with spreadsheet formula prefixes are neutralized, but exported personal data must still be stored and shared only under approved policy.

## Visit requests

Search and filter as for quotes. Statuses are `NEW`, `CONTACTED`, `SCHEDULED`, `COMPLETED`, `CLOSED`, and `DECLINED`. A submitted form is only a request; communicate separately before moving it to `SCHEDULED`. Notes/status changes are audited.

## Exchange rates

The Rates screen shows the latest 100 refresh attempts, including failure state. “Refresh now” performs a server-side ECB fetch and records the result plus an audit event. A failed refresh retains the last valid rate as cache; investigate outbound network/DNS or ECB response errors without manually inventing a rate.

## Controlled settings

The allowlist contains only metadata descriptions and the three supplied contact channels. It does not permit overriding product identity, capacity, MOQ, conversion logic, or arbitrary page markup. Validate business approval before changing any public contact value.

## Operational escalation

- Authentication unavailable: check app/database health and rate-limit configuration.
- Form exists but email is absent: the database is authoritative; review notification status and SMTP logs.
- CNY unavailable: inspect Rates history and worker logs, then use the protected manual refresh.
- Suspected unauthorized change: preserve logs, revoke affected sessions/account access, and review `AuditLog` before remediation.
