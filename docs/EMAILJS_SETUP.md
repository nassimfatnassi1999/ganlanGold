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
13. Set these four actual values in the project-root `.env.local` (created with placeholders if it was absent):

    ```dotenv
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
    NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID=YOUR_QUOTE_TEMPLATE_ID
    NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID=YOUR_VISIT_TEMPLATE_ID
    ```

    Replace all placeholders; do not invent IDs. Existing values are never overwritten by the generator. `.env.local` is gitignored. For CI, set the four public values in the hosting build environment instead. No private EmailJS key is used.
14. Configure the EmailJS **Domains** allowlist with exact authorized origins. Development: `http://localhost:3000` (add an explicit alternative origin/port only if used). Production: the actual HTTPS origin of the deployed GANLAN GOLD domain, plus its `www` origin if served and the actual Netlify origin if used. **No verified production domain is supplied in this repository, so the owner must supply it.** Copy the origin from the browser address bar, excluding paths and fragments; do not whitelist a made-up domain or `*`. See the [official origin format](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/).
15. Run `npm install`, then `npm run dev`, and open the URL reported by Next. `predev` generates `public/config/emailjs.json`. Missing settings produce a disabled config and friendly submission errors, while manual contact options continue working. After changing environment values, stop/restart the development server so the hook runs again.
16. Test the quotation and visit forms independently, in Chinese and English, using the matrix in `EMAILJS_TESTING.md`. Automated tests mock EmailJS; real account tests are a separate manual step.
17. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, and `npm run build`. `prebuild` uses production environment precedence and fails before export if any identifier is missing, malformed, a placeholder, or if template IDs are identical. It cannot verify account ownership/existence or inbox delivery. Set the real `NEXT_PUBLIC_SITE_URL` before the build as usual for SEO.
18. Check `dist/config/emailjs.json`. It must contain exactly `publicKey`, `serviceId`, `quoteTemplateId`, `visitTemplateId`, all nonempty strings. Run `npm run verify:static`. `.env.local` must never appear in `dist/`. The build allowlists only those four identifiers even if unrelated secrets exist in local environment files.
19. Deploy **only the contents of `dist/`** to the Netlify publish directory or the Gandi web root. Netlify build command: `npm run build`; publish directory: `dist`. Set its build environment variables before building. Gandi can serve the files directly over HTTPS. Do not upload the source tree, `.env*`, `node_modules` or `.next`. A folder produced by `npm run build:preview` is marked `EMAILJS_PREVIEW_ONLY.txt` and must not be used as the production release.
20. On the actual authorized production origin, send one real quotation and one visit inquiry with permission, confirm the intended team inbox receives each, and check all fields, subjects and Chinese text. Check EmailJS history/provider delivery status and spam folders. EmailJS acceptance in the UI is not proof of inbox delivery. This implementation session does not claim real delivery without that confirmation.

## One runtime configuration contract

`scripts/generate-emailjs-config.mjs` runs through `tsx` and uses Next's official `@next/env` loader from the project root. Precedence is: shell environment, `.env.production.local` / `.env.development.local`, `.env.local`, `.env.production` / `.env.development`, `.env`. In test mode `.env.local` is skipped, matching Next.js. Values are trimmed, validated and allowlisted into `public/config/emailjs.json`; static export copies it into `dist/config/emailjs.json`. No raw environment file is published. Invalid production settings remove any stale generated public JSON and exit with the missing variable **names**, never values.

The browser fetches `/config/emailjs.json` on the first valid submission with `cache: no-store`, validates the complete shape, and shares the successful promise between forms until reload. Failed loads are retried on a later explicit submission. There are no compiled EmailJS environment-value fallbacks or second configuration source. A 10-second fetch timeout prevents configuration loading from hanging indefinitely. A send that has not settled after 20 seconds reports delivery as unconfirmed, preserves the input and exposes manual alternatives. Because the SDK cannot abort a send, the shared service lock stays held until the original request settles. A late result does not clear fields or claim success after the timeout. Check with the team before resending an unconfirmed request.

Changing `.env.local` and running `npm run build` regenerates the deployed configuration. To change Template IDs, update the existing dashboard template or create a new template, set the corresponding local/build variable and rebuild. Both IDs must remain distinct.

Because config is fetched at runtime, you may also replace just the deployed `config/emailjs.json` with the exact validated four-key shape. It contains public browser IDs only. Purge any hosting/CDN cache for that path and reload open pages because a successful config is cached in memory. Synchronize `.env.local` or the build environment afterward: a later build regenerates the file and otherwise reverts the manual deployment change. Never upload `.env.local`. Hosting changes to prices still follow the existing independent `config/prices.json` workflow.

## Preview without an EmailJS account

`npm run build` intentionally fails with placeholders. To review a static export before account setup, run `npm run build:preview`. It generates development-mode config, exports the same frontend, and verifies either a valid contract or the safely disabled four-empty-string contract. `dist/EMAILJS_PREVIEW_ONLY.txt` marks this artifact; `npm run verify:static` rejects disabled configuration/preview markers for production. This is a visual/testing preview, not a configured email deployment. No fabricated account IDs are needed.

## Validation, commercial rules and abuse controls

Both forms require company, country, contact person, privacy consent, and at least one of email/WeChat. A supplied email must be valid even when WeChat is preferred. The preferred channel must have matching contact details. Quote submissions require a destination port, a selected format, and a whole package count from 1 to 1,000,000 for **every** selected format. Capacity is calculated in integer millilitres before converting to litres. Unselected quantities are ignored and sent as `0`. The existing global 7,500-litre commercial order policy remains informational for inquiries; there are no individual product MOQs. Optional visitor count must be an integer from 1 to 50. Text fields are length-limited; messages allow 4,000 characters.

The honeypot, validation, per-page shared submission lock and 30-second cooldown reduce accidental repeats and simple bots. Both successful and failed SDK attempts consume the cooldown. A configuration failure does not. These controls can be bypassed by a determined client and are **not equivalent to server-side abuse protection**. The SDK is documented at [one request per second](https://www.emailjs.com/docs/sdk/send/); this application allows at most one attempt every 30 seconds across both forms in the same page. Separate devices/tabs can still make requests; account-level limits remain authoritative.

In EmailJS, restrict origins, keep recipients fixed, enable appropriate account security/MFA, review usage/history and plan quotas, monitor provider limits, and use available account abuse controls. Avoid broad domain access and disable unused templates/services. No Google-dependent CAPTCHA is enabled. Any CAPTCHA/provider choice for mainland China requires testing on relevant networks and devices first. Retain WeChat QR codes and message copying when EmailJS or WhatsApp is unavailable; do not promise availability without actual regional testing.

All template values are strings, and user content is escaped by EmailJS's [double-brace substitution](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/). Do not change to triple braces. Messages use inline `white-space: pre-wrap` for readable line breaks without injecting HTML. Submission timestamps are ISO UTC values from the visitor device and are informational, not a server-verified audit trail.
