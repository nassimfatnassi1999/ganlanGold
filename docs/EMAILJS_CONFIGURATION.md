# Public EmailJS configuration

The single source of truth is `EMAILJS_CONFIG` in `src/config/env.ts`:

```typescript
export const EMAILJS_CONFIG = {
  publicKey: "YOUR_PUBLIC_KEY",
  serviceId: "YOUR_SERVICE_ID",
  quoteTemplateId: "YOUR_QUOTE_TEMPLATE_ID",
  visitTemplateId: "YOUR_VISIT_TEMPLATE_ID",
} as const;
```

The example contains placeholders. The actual source uses existing public identifiers migrated locally; no new account values were invented. Replace these four public browser identifiers with the values from the authorized EmailJS account, using distinct template IDs. Never add private keys, provider passwords, SMTP or Gandi credentials. The browser can inspect all four identifiers.

After any change, run `npm run build` and redeploy **the complete `dist/`**. Existing open tabs use the previous bundle until reloaded. No EmailJS environment settings, runtime JSON, configuration generation or configuration fetch is used. Hosting platforms require no EmailJS settings and receive no environment files.

Missing, empty, malformed or placeholder identifiers disable only automatic email submission. The forms validate required fields first, preserve values and show a concise Chinese/English unavailable message with WhatsApp and copy-for-WeChat actions. The manual preparation button and WeChat QR codes remain available. Placeholders never prevent a production build.

Both forms share a request lock and a 30-second cooldown after every attempted provider call, including failures. There are no automatic retries. A pending request shows Sending; acceptance by EmailJS shows success. Failure preserves values. After 20 seconds without a result, delivery is unconfirmed: the UI stops waiting but retains the request lock until the SDK settles, avoiding duplicate emails. A later provider result never changes an already timed-out form.

Use the existing HTML templates and their variable mapping in `emailjs-templates/`. Recipient addresses are configured only in the dashboard. Configure the exact origins actually used, following [EMAILJS_SETUP.md](EMAILJS_SETUP.md#authorized-origins).

[Testing](EMAILJS_TESTING.md) covers mocked success, failures, placeholders, duplicates and both languages. [Static deployment](STATIC_DEPLOYMENT.md) covers Netlify and Alibaba OSS. Pricing remains independently editable in `config/prices.json`; retain deployed prices in `public/config/prices.json` before a rebuild.
