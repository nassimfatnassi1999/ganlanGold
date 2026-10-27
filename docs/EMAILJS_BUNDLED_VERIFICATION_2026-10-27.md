# Bundled EmailJS verification — 27 October 2026

The four existing public identifiers were migrated exactly into `EMAILJS_CONFIG` in `src/config/env.ts` without logging their values. Only the public key, service ID and two distinct template IDs were copied. Private credentials were not introduced. Both existing HTML templates, parameter mappings and runtime pricing are unchanged.

The runtime JSON, loader/cache, schema, generator, lifecycle hooks and direct `@next/env` dependency were removed. The official browser SDK now reads the TypeScript constant; placeholders disable automatic sending with existing bilingual manual alternatives. Identifiers are bundled into client JavaScript. Every identifier change requires rebuilding and deploying the full `dist/`.

Local verification results:

- `npm run typecheck` and `npm run lint`: passed.
- `npm test`: 16 unit tests passed, plus both template contract checks.
- Full development e2e suite: 111 passed, 7 existing device-specific skips, zero failures.
- Full final static e2e suite against exported `dist/`: 111 passed, 7 existing device-specific skips, zero failures.
- Configured production build without any local environment file and without EmailJS process variables: passed. The unrelated production SEO origin was explicitly set to `https://ganlan.netlify.app`.
- Actual placeholder production build: passed without local environment files or EmailJS process variables. Both forms in both languages were tested against the exported files served by Python, without Next.js or Node.js serving the site: zero provider or configuration calls, values retained and manual fallback shown. Original public identifiers were then restored and production `dist/` rebuilt.
- Static verifier: all four identifiers found in client JavaScript; no EmailJS runtime JSON/fetch or environment dependency; no exported environment files; existing pricing, assets, routes and contacts passed.
- Next.js development MCP: no compilation issues, configuration errors or session errors. Browser validation and React form components verified.
- Independent code review: no actionable issues.

During verification, the system Python 3.9 server reset some parallel intercepted asset requests. The complete final static suite uses the plain `serve` file server instead. A separate existing host-injection browser test initially failed in development because Chromium blocked its local HMR WebSocket after intercepted HTML lost network address-space information. Granting local-network access inside that test fixed both device projects; no production behavior was changed.

All provider requests are mocked or blocked. Real email delivery, account/dashboard settings and Alibaba OSS upload were not verified. Git push and public Netlify deployment are reported separately after local checks.

The public Netlify homepage is reachable. The Netlify site API returned HTTP 401 and no Netlify authentication is available locally, so private build logs are unavailable. Public bundle verification can confirm deployment separately.
