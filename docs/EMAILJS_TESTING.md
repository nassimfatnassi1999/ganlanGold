# EmailJS verification

Automated tests use synthetic identifiers and mock all EmailJS requests; they never send real email.

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
npm run verify:static
```

Unit tests cover configuration validation, both template mappings, validation, SDK rejection, shared locks and cooldown. Playwright replaces the bundled public identifiers in served test JavaScript with synthetic values, without production test hooks. A default abort rule blocks unmatched provider requests. Tests verify both forms and languages, SDK acceptance, failed requests, preserved values, Sending state, duplicates, timeout, placeholders and manual alternatives. Each form test asserts that no runtime EmailJS configuration request occurs.

To test the exported site using a plain file server (Node.js here is only a local preview tool):

```bash
cat > /tmp/ganlan-static-serve.json <<'JSON'
{"trailingSlash":true}
JSON
npx serve dist --config /tmp/ganlan-static-serve.json --listen 4173 --no-port-switching --no-clipboard
```

In another terminal:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:e2e -- --workers=1
```

The static verifier checks all four TypeScript identifiers occur in generated client JavaScript, no runtime EmailJS JSON or environment files are exported, and runtime pricing and the legal routes remain present.

To manually check placeholder fallback, temporarily put the documented `YOUR_…` placeholders in `EMAILJS_CONFIG` in `src/config/env.ts`, rebuild and serve locally. Complete each form, consent and submit: no provider request, no success message, values retained, localized unavailable message, WhatsApp and copy-for-WeChat available. Restore the identifiers and rebuild before deployment. Automated browser tests simulate this scenario without modifying source files.

With the intended recipient's permission, check one real quote and one visit request on an authorized origin. Verify EmailJS history and the intended inbox, all fields, Chinese content and spam folders. UI success confirms provider acceptance only; inbox delivery, actual template/account configuration and access from mainland China need independent checks. Automated verification does not establish real delivery.
