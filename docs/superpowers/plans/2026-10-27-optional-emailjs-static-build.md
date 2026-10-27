# Optional EmailJS and portable static deployment

Implement the user's supplied deployment specification in the existing checkout. Preserve the design, commerce data, templates and unrelated files.

## Evidence and approach

Baseline `npm run build` exits 1 in `prebuild`: `generate-emailjs-config.mjs` explicitly rejects absent EmailJS settings. `check-dist.mjs` also rejects a disabled production config. The runtime loader throws on config errors and caches success until reload. Next's installed static-export guide confirms `output: export`, unoptimized images and `trailingSlash: true` are already appropriate; retain the `out/` → `dist/` pipeline.

The browser's only configuration source will be `/config/emailjs.json`, fetched without cache on each valid submission. Strict boolean `enabled` gates sending. Invalid/unavailable config becomes the disabled five-field contract. Only simultaneous config requests share a promise.

Generator precedence: preserve any deliberately supplied valid non-default public JSON (including an intentional disabled config); otherwise use a complete valid set of optional public environment values, following Next's environment-file precedence; otherwise write the disabled default. Invalid JSON is repaired. No private keys or environment files enter the export. A default JSON is committed so a fresh checkout builds without local settings.

## Tasks

1. Replace generator and loader regression tests: zero/malformed credentials succeed disabled; manual enabled/disabled JSON survives; private values are excluded; missing, malformed, incomplete, non-boolean, network-failed runtime JSON disables safely; later config edits are picked up.
2. Implement the shared schema, generator and loader. Add a disabled result to the sending service and localized feedback; retain validation, consent, cooldown, timeouts, input preservation and manual handoff. Test both forms, languages and mocked provider responses.
3. Accept enabled or disabled config in static validation; verify all static pages/resources. Add Netlify `npm run build` / `dist`, static adapter opt-out and runtime JSON cache headers. Keep the lockfile and source export model.
4. Update README and EmailJS documentation; add static deployment and optional runtime configuration guides, including OSS Hong Kong directory indexes, custom domain, HTTPS, JSON cache metadata and manual prices.
5. Run `npm ci`, unit tests, typecheck, lint, Playwright and a clean production build with all EmailJS variables unset and local env files excluded temporarily. Test the exported `dist/` with a plain static server, including deep links and runtime enabling without rebuilding. Inspect credentials/diff, obtain independent review, commit relevant changes, push main without force and inspect available deployment status.

## Review focus

- A missing config cannot block the build or crash the page.
- Deliberate JSON must survive empty environment values, and `enabled: false` must prevent provider calls even with identifiers present.
- Config changes must work in the same open browser page on a later submission.
- Provider failure must keep all fields; success requires provider acceptance; no real email in tests.
- OSS legal-page deep links must serve their own directory indexes; Netlify must publish plain static files.

## Access limitations

Netlify's site API returns HTTP 401 without authentication. GitHub currently exposes no commit check runs/status entries or deployment records. Record confirmed local results separately from remote deployment status.
