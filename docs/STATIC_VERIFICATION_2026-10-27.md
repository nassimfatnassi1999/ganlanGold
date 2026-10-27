# Static verification — 27 October 2026

Passed: all major sections and their anchors exist; four product rows and dynamic price placeholders; fixed CNY/USD config values; single wholesale MOQ section; official QR hashes unchanged; all root HTML images, scripts and styles resolve in deployment; all extra animation scripts and assets are linked; the enhanced product files have larger pixel dimensions than preserved base WebP files; no public admin route.

Node tests: `node scripts/check-dist.mjs` and `node --check public/interactive/olive-journey.js` passed.

Not run: fresh `npm run build` and complete browser/Playwright tests because package install was unavailable and browser navigation to local URLs was blocked in this environment. The supplied previous build was modified in place for the Gandi package. Re-run fresh build and E2E on Mac before deployment.

Visual caveat: upscaling does not produce authentic HD source detail. Chinese labels and regulatory wording still require pre-launch approval.
