# EmailJS setup for GANLAN GOLD

The two existing forms send through `@emailjs/browser` using `emailjs.send()`, one service and two independent templates. Next.js 16.4.3 exports ordinary static files into `out/`, then `dist/`. Netlify and Gandi need no Node.js process, database, API routes or SMTP credentials to serve the result. Node.js and npm are needed only for local development/builds.

## Account and templates

1. Create an account at [EmailJS](https://www.emailjs.com/), or use the authorized business account.
2. In **Email Services**, connect the intended provider and authorize the actual business sender. Verify the provider connection using EmailJS's service test.
3. Copy the service's **Service ID**.
4. Find the **Public Key** in Account. This browser identifier is public; do not copy a private key or provider password.
5. In **Email Templates**, create the quotation template, named **GANLAN GOLD — Quote Request**.
6. Switch its content editor to HTML/code and paste all of `emailjs-templates/quote-request.html`, including the document structure.
7. Set the subject to `GANLAN GOLD | 新的报价申请 / New Quote Request — {{company}}`. Configure the actual authorized business recipient directly in **To Email**. Set **From Name** to `GANLAN GOLD Website` and use the provider-authorized **From Email**. See `emailjs-templates/quote-request-settings.md`. Keep Reply-To blank: WeChat-only inquiries have no valid buyer email. Never put the localized missing-value label in a header. Do not accept a destination address from a form parameter.
8. Save and copy the quotation **Template ID**.
9. Create another template named **GANLAN GOLD — Grove Visit**.
10. Paste all of `emailjs-templates/grove-visit-request.html` into its HTML editor.
11. Set its subject to `GANLAN GOLD | 橄榄园参观申请 / Grove Visit Request — {{company}}`. Configure its authorized recipient and sender directly in the dashboard, following `emailjs-templates/grove-visit-request-settings.md`. Leave Reply-To blank for the mixed contact workflow. Disable auto-replies/linked confirmation templates: no visitor is promised a scheduled date.
12. Save and copy the distinct visit **Template ID**.
13. Copy the four public identifiers into `EMAILJS_CONFIG` in `src/config/env.ts`, using distinct quote and visit template IDs. See [EMAILJS_CONFIGURATION.md](EMAILJS_CONFIGURATION.md). Never add a private key, SMTP password or provider credentials.
14. Configure the exact authorized origins in the dashboard's Domains section, following the origin table below.
15. Run `npm ci` and `npm run dev`. Missing or placeholder identifiers disable automatic submission while retaining validated manual contact.
16. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e` and `npm run build`. Tests mock the provider and never send real emails. Builds succeed with placeholders.
17. Deploy all of `dist/` using [STATIC_DEPLOYMENT.md](STATIC_DEPLOYMENT.md). Any identifier change requires a fresh build and deployment.
18. With the recipient's permission, send one real quotation and one visit request from the authorized production origin. Verify the intended inbox, fields, Chinese text, provider history and spam folder. SDK acceptance does not establish inbox delivery or access from mainland China.

## Authorized origins

EmailJS's [Domains allowlist](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/) uses `scheme://hostname[:port]`. Enter one exact origin per entry, with no path, trailing slash or wildcard. Enable only origins actually used:

| Origin | When to authorize |
| --- | --- |
| `http://localhost:3000` | While testing with the local development server on port 3000 |
| `https://ganlan.netlify.app` | Existing Netlify production site |
| `https://ganlangold.com` | Only after this custom domain serves the site |
| `https://www.ganlangold.com` | Only if this separate origin also serves the site |

A redirect-only origin does not need permission if no form runs there. If a local port changes, authorize the exact used origin while testing, then remove it when no longer needed. Do not add an OSS bucket hostname or unused preview URLs speculatively.

## Bundled public configuration

Both forms call the official [`emailjs.send`](https://www.emailjs.com/docs/sdk/send/) with the shared service ID, their own template ID, existing string parameters and `{ publicKey: EMAILJS_CONFIG.publicKey }`. No configuration fetch occurs. The configuration module reads neither environment variables nor a runtime JSON file. These four values are public; all recipients remain fixed in the dashboard. See [EMAILJS_CONFIGURATION.md](EMAILJS_CONFIGURATION.md) for rebuild and placeholder behavior.

## Validation, commercial rules and abuse controls

Both forms require company, country, contact person, privacy consent, and at least one of email/WeChat. A supplied email must be valid even when WeChat is preferred. The preferred channel must have matching contact details. Quote submissions require a destination port, a selected format, and a whole package count from 1 to 1,000,000 for **every** selected format. Capacity is calculated in integer millilitres before converting to litres. Unselected quantities are ignored and sent as `0`. The existing global 7,500-litre commercial order policy remains informational for inquiries; there are no individual product MOQs. Optional visitor count must be an integer from 1 to 50. Text fields are length-limited; messages allow 4,000 characters.

The honeypot, validation, per-page shared submission lock and 30-second cooldown reduce accidental repeats and simple bots. Both successful and failed SDK attempts consume the cooldown. A configuration failure does not. These controls can be bypassed by a determined client and are **not equivalent to server-side abuse protection**. The SDK is documented at [one request per second](https://www.emailjs.com/docs/sdk/send/); this application allows at most one attempt every 30 seconds across both forms in the same page. Separate devices/tabs can still make requests; account-level limits remain authoritative.

In EmailJS, restrict origins, keep recipients fixed, enable appropriate account security/MFA, review usage/history and plan quotas, monitor provider limits, and use available account abuse controls. Avoid broad domain access and disable unused templates/services. No Google-dependent CAPTCHA is enabled. Any CAPTCHA/provider choice for mainland China requires testing on relevant networks and devices first. Retain WeChat QR codes and message copying when EmailJS or WhatsApp is unavailable; do not promise availability without actual regional testing.

All template values are strings, and user content is escaped by EmailJS's [double-brace substitution](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/). Do not change to triple braces. Messages use inline `white-space: pre-wrap` for readable line breaks without injecting HTML. Submission timestamps are ISO UTC values from the visitor device and are informational, not a server-verified audit trail.
