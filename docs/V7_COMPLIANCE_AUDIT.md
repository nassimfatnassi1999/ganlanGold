# GANLAN GOLD — V7 compliance audit (27 October 2026)

Source: `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`, seven pages. The **approved client change** replaces page 3 §6 back-office/ECB conversion with four fixed CNY/USD indicative values manually editable in `public/config/prices.json` (and in deployed `dist/config/prices.json`). No database or server. The production quote is confirmed in USD for 15 days unless otherwise specified.

| V7 requirement | Implementation/status |
| --- | --- |
| Chinese first; English second | Chinese default, EN toggle; user-approved interaction replaces simultaneous bilingual labels |
| Moroccan panoramic hero, 4 formats | `public/images/hero/*`, HTML headline and CTA |
| Separate 250, 500, 750 ml and 5 L images | Four `public/images/products/` images; enhanced/upscaled from embedded PDF originals without rewriting labels |
| CNY prominent, USD secondary, no public EUR | Config-driven `config/prices.json` display; no conversion or ECB |
| Single MOQ 7,500 L after products | `#wholesale`; mixed 250/500/750 ml explicitly permitted; 5 L professional |
| Origin: Fouad + neighboring growers; lot traceability | `#origin` copy; does not claim exclusive single-farm provenance |
| Site visits and form | `#visit`; static WhatsApp/WeChat user handoff; not automatic receipt |
| Export formalities, FCA/FOB, docs and exclusions | `#export`, translation dictionaries |
| Gisèle, Lassad, Fouad in exact order | `#contact`, real click links, original official QR images |
| Quote request fields + consent | `#quote` includes company, contact, quantities, port, privacy consent |
| Anti-spam/HTTPS | Honeypot; HTTPS configured by Gandi host. Static forms do not submit to a server, so no server-side rate limiting |
| Legal/privacy pages, SEO and mobile | `/legal/`, `/privacy/`, `/terms/`, sitemap/robots, static build |
| High-quality imagery and natural movement | Responsive hero; non-destructive photographic enhancement and new decorative SVG olive-to-oil scroll motion |

## Documented deviations and constraints

1. Back-office and ECB service are intentionally removed; fixed indicative CNY/USD prices are updated manually with JSON.
2. Chinese/English language toggle replaces simultaneous subtitles on every section, as requested after V7.
3. A serverless static site cannot **receive** quote/visit requests: it prepares a message for explicit user transmission via WhatsApp or copied WeChat text. This is a limitation relative to V7's full submission requirement.
4. The PDF contains small (~340–420px wide) product originals. Upscaling/sharpening increases output pixel dimensions but does **not** create genuine photographic detail or certified label legibility. Obtain approved true-HD source photography before a professional print campaign.
5. QR code identity, commercial rates, label translation/regulatory claims, hosting domain, privacy notice and rights must be approved before live publication.
6. The olive/oil scroll animation is artistic illustration, not evidence of actual industrial production techniques, and does not introduce marketing claims.
