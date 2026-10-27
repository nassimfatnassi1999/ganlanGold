> Historical record of a superseded implementation. Current EmailJS configuration is bundled from TypeScript; follow [current configuration](EMAILJS_CONFIGURATION.md) and rebuild after identifier changes.

# Optional EmailJS / static export verification — 2026-10-27

Baseline commit: `a9510c0`. Environment: Node.js 22.22.3, npm 10.9.8, installed Next.js 16.4.3. Existing checkout was clean on `main` before work.

## Confirmed cause

The baseline `npm run build` failed in `prebuild` before Next.js compilation: `generate-emailjs-config.mjs` deliberately returned exit 1 for missing EmailJS values. The static verifier separately required configured EmailJS for production. The loader also threw on invalid configuration and cached successful values until reload. The generic Netlify exit-code message alone did not identify these causes; the local reproduction did.

Historical Netlify build logs could not be read: both the site endpoint and deploy-list endpoint returned HTTP 401 without Netlify authentication. At inspection, GitHub exposed no check-run, commit-status entry or deployment record. This report does not claim that old remote logs were inspected or that the new deployment succeeded remotely.

## Results

| Check | Result |
| --- | --- |
| `npm ci` | Passed using existing lockfile; no vulnerabilities reported |
| Regression tests before implementation | Failed for mandatory credentials, missing `enabled`, throwing loader and indefinitely reused config |
| `npm test` | 16 unit tests passed; both HTML templates and exact variable mappings validated |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test:e2e` against existing Next dev | 69 passed, 7 intentionally skipped by desktop/mobile applicability |
| Clean `npm run build` | Passed with every `NEXT_PUBLIC_EMAILJS_*` process variable removed and all actual local `.env*` files temporarily excluded; files restored afterward |
| `npm run verify:static` | Passed; valid disabled EmailJS, legal pages, 404, assets, prices, robots/sitemap; no exported environment files or obsolete preview marker |
| `PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:e2e -- --workers=1` | 69 passed, 7 intentionally skipped, against Python serving only `dist/` |
| Next dev runtime inspection | Compilation issues empty; config/session errors empty; hydrated React form inspected |
| Actual deployed-file simulation | Editing the served `dist/config/emailjs.json` activated a later submission in the same open page; SHA-256 of all `_next` files unchanged; provider mocked; disabled JSON restored |
| Plain static HTTP access | `/`, three legal routes, `404.html`, both config files, robots and sitemap returned 200 when requested as files |
| Preservation | No changes to product/hero/olive/QR image files, runtime prices, EmailJS HTML templates or dependency lockfile |
| Independent code review | No actionable findings; diff whitespace check passed |

The initial static-server run with five browser workers had six failures: form validation remained unhydrated, a price replacement remained unhydrated, English navigation encountered `ERR_SOCKET_NOT_CONNECTED`, one hero request failed, the extra-key price fallback remained unhydrated, and mobile navigation timed out. Trace console entries confirmed socket resets/disconnections while loading resources from the demonstration Python server. The same artifact passed the complete suite sequentially; no production code change was made to conceal these failures. The documentation uses `--workers=1` for this small local server.

No automated test sent real email. Actual EmailJS account delivery and an Alibaba Cloud OSS upload were not performed. Remote deployment confirmation must be reported separately from these local results.

## Production hydration follow-up

After commit `994532d` reached the public Netlify site, `/config/emailjs.json` returned the correct disabled config and no-store headers; the application bundle SHA-256 matched the tested local export. Both forms showed localized disabled feedback without SDK calls. Public smoke testing then exposed a separate existing production-only defect: Netlify's edge-injected newline/comment immediately after the charset metadata caused React error 418 and reset a saved English preference on a legal-page load. Removing the injected head markup in a controlled browser response removed the error; injecting the same markup into the local export reproduced it. Injecting only the trailing badge script did not reproduce it.

A regression test, `static host metadata comments preserve hydration and saved language`, failed on both desktop and mobile before the fix. Moving the unchanged early language initializer from `<head>` to the beginning of `<body>` prevents React's head hydration from trying to match an ordinary inline script past the host-inserted text node. The initializer still runs before visible content. No styling, content, business data or account-level Netlify settings were changed. The regression passes on both desktop and mobile after a clean build without EmailJS settings.

Final follow-up checks: `npm run typecheck`, `npm run lint`, `npm test` (16 passed plus template validation), clean zero-EmailJS `npm run build`, `npm run verify:static`, and the complete static-browser suite (71 passed, 7 device-specific skips) all passed after this layout fix. Independent follow-up review found no actionable issue.
