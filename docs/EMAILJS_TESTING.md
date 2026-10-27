# EmailJS verification and delivery tests

Date: 27 October 2026. Automated checks use synthetic data and mocks; they never send real email.

## Repeatable commands

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
npm run verify:static
```

`npm test` uses Node's test runner through `tsx`, then the template contract validator. Unit tests stub the official SDK's `send` method and browser fetch responses. Playwright intercepts the SDK's EmailJS HTTP endpoint and returns synthetic success/failure responses; a default abort rule blocks any unmatched EmailJS provider request. Configuration IDs used in tests are explicit fixtures, not account IDs. All notification recipients remain dashboard-controlled.

The ordinary build is intentionally blocked until all four actual public identifiers are configured. To verify static compilation before account setup:

```bash
npm run build:preview
npx tsx scripts/check-dist.mjs --preview
cat > /tmp/ganlan-emailjs-serve.json <<'JSON'
{"trailingSlash":true}
JSON
npx serve dist --config /tmp/ganlan-emailjs-serve.json --listen 4175 --no-port-switching --no-clipboard --no-request-logging > /tmp/ganlan-emailjs-static-preview.log 2>&1
```

In another shell:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4175 PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report/static npm run test:e2e -- --output=test-results/static
```

When `PLAYWRIGHT_BASE_URL` is set, Playwright uses that existing static server and does not start `next dev`. The preview server configuration preserves `trailingSlash: true`, matching Next.js and the existing legal-route assertions. Use the Node static server shown above: the system Python 3.9 preview server reset asset connections under the full parallel suite. Keep verbose log output redirected to a file. Run dev and static suites sequentially, or use separate artifact/report directories; simultaneous default runs delete one another's Playwright trace files.

## Automated coverage

| Area | Assertions |
| --- | --- |
| Environment generation | Next-compatible shell/mode/local/base precedence, only four allowlisted public fields, no unrelated public/private sentinel values, production rejects missing/placeholders and identical templates, stale JSON removed, development disabled contract |
| Runtime loader | Missing response, malformed JSON, missing/extra fields and placeholder values reject; successful config reused; failed config retryable |
| Parameter contracts | Both independent HTML variable sets exactly match TypeScript keys, documented keys and actual mapped string objects; no undefined/null/object rendering |
| Quote mapping | Correct format quantities, unselected zeroes, mixed integer-millilitre calculations, human-readable product summaries, optional Chinese fallbacks |
| Visit mapping | Correct preferred period, optional visitor count/email/WeChat/message fallbacks, privacy and language |
| Validation | Required company/country/contact, email syntax, email-or-WeChat, matching contact preference, explicit consent, lengths, honeypot, selected quantity range, integer visitor count 1–50 |
| Submission | Correct service and template, confirmed acceptance only, both language success messages, reset after success, failure keeps fields and alternatives, sending disabled, synchronous duplicate guard, shared service cooldown, retry after cooldown |
| Timeout and editing | Unsettled SDK request reports unconfirmed delivery after 20 seconds, holds lock until underlying settlement, late result does not reset input; edits invalidate prepared messages |
| Existing site | Prices and runtime edits, default/persisted Chinese/English, navigation, mobile overflow, images, scrolling/reduced motion, contacts and legal routes |
| Static output | `dist/config/emailjs.json`, exact allowlisted contract, no `.env*`, unchanged global MOQ/price checks, no backend, preview marker prevents production verification |

## Visual template checks

Run `npm run preview:emailjs` to generate safe samples from the real parameter builders with a fixed UTC date. Open `emailjs-templates/previews/quote-request.html` and `grove-visit-request.html`. Browser screenshots are included alongside them. Both were checked at 390px with no horizontal overflow, literal hostile sample text and zero script elements, and at desktop width with a 640px content table. HTML includes an MSO wrapper for desktop Outlook; actual Outlook/Gmail/mobile client delivery remains a manual test.

## Manual account and production checklist

1. Follow `EMAILJS_SETUP.md`: authorize the provider, two templates, fixed business recipients/senders, distinct IDs and domain allowlist. Leave Reply-To blank for the email-or-WeChat workflow. Disable auto-replies.
2. Configure actual identifiers and run the ordinary production build. Confirm production static verification passes and the preview marker is absent.
3. On an authorized development origin, test a quote with each of the four formats, then a mixed 7,500-litre example: 10,000 × 250 ml plus 10,000 × 500 ml. Verify counts, summary, litres, port, line breaks and buyer contact details in the recipient inbox.
4. Send a visit request with a preferred period, visitor count and message. Confirm the visit template is used and no scheduled date is promised. Repeat with optional visitor count blank.
5. Test email-only, WeChat-only, and both contact methods in each site language. The email body must display localized missing-value labels; no malformed Reply-To header is configured.
6. Test consent errors, invalid email, mismatched preference, invalid quantities and selected-but-empty quantities. No send should occur. Test the honeypot with synthetic values.
7. Test duplicate clicking, network errors and offline/missing configuration. Failures retain all inputs and show contact alternatives. An uncertain timeout is not a confirmed failure; check for delivery before resending. Cooldown is shared by both forms in a page, not a server/account-wide quota.
8. Check the actual authorized production domain after deploying `dist/`: confirm real delivery of one quote and one visit in EmailJS history and the actual business inbox, including spam folders. SDK acceptance alone is not confirmation of inbox receipt.
9. Test real mobile clients and relevant mainland China networks. Confirm WeChat QR codes and manual copying remain available where EmailJS or WhatsApp is inaccessible.

No actual business sender, recipient, production domain or EmailJS account identifiers were supplied in this task. No real send or inbox delivery is claimed.

## Recorded results

Final command results are recorded below after verification. Early regression tests were observed failing before implementation. An intermediate pair of overlapping Playwright runs produced trace-file collisions; static preview requests also showed `ERR_SOCKET_NOT_CONNECTED` / `ERR_CONNECTION_RESET` for CSS, JavaScript and images from the system Python server. The default Node preview server also removed trailing slashes, so its preview-only configuration was aligned with the existing Next.js setting. Those harness problems were corrected with separate artifacts, sequential runs and the configured Node static server; final results use the corrected runs.

| Final verification | Result |
| --- | --- |
| `npm test` | 11 unit tests passed; both template contracts passed (17 quote / 12 visit variables) |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test:e2e -- --output=test-results/dev` | 51 passed, 7 existing device-specific skips; 0 failed |
| Full suite against final exported site, separate static output | 51 passed, 7 existing device-specific skips; 0 failed |
| `npm run build` with newly created local placeholders | Correctly refused in `prebuild`, naming all four missing actual public identifiers |
| `npm run build:preview` | Optimized static compilation/export passed; all routes static; `dist/` generated |
| `npx tsx scripts/check-dist.mjs --preview` | Passed: generated JSON present, disabled preview contract valid, no environment files, existing prices/MOQ/contacts checks preserved |
| `npm run verify:emailjs` | Passed |
| `git diff --check` | Passed |
| Next dev MCP | No compilation issues or configuration/session errors |
| Rendered email previews | 390px mobile without overflow or scripts; escaped hostile text; 640px desktop table |
| Export server provenance | `index.html`, `config/emailjs.json` and `EMAILJS_PREVIEW_ONLY.txt` fetched from the static test origin matched local final `dist/` byte-for-byte |
| Real email delivery | Not performed; actual account identifiers and authorized recipient/provider setup unavailable |

The final static test reused an existing local Node preview at port 4175 after verifying its responses against the final output. For a new preview instance, select an unused port and set `PLAYWRIGHT_BASE_URL` accordingly. Use `--no-port-switching` with `serve` so a busy port cannot silently send tests to a different instance.

Current `dist/` is explicitly marked as preview-only and has four empty public identifiers. It demonstrates static compatibility but must be rebuilt with actual configured account values for production email sending. Existing account/real delivery, email-client rendering and mainland China network checks remain manual.
