# GANLAN GOLD Asset Inventory

Audit date: 25 October 2026

## Authoritative source

| Asset | Description | Status / use |
|---|---|---|
| `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf` | Seven-page approved English V7 developer specification dated 25 October 2026 | Business source of truth; retain unchanged |

## Original assets extracted from V7

| Asset | Dimensions | Intended use | Approval status |
|---|---:|---|---|
| `GANLAN_GOLD_website_assets/originals/product-250ml.jpeg` | 362×439 | 250 ml product visual | Provisional reference; replace with approved HD production photograph |
| `GANLAN_GOLD_website_assets/originals/product-500ml.jpeg` | 363×439 | 500 ml product visual | Provisional reference; replace with approved HD production photograph |
| `GANLAN_GOLD_website_assets/originals/product-750ml.jpeg` | 340×439 | 750 ml product visual | Provisional reference; replace with approved HD production photograph |
| `GANLAN_GOLD_website_assets/originals/product-5l.jpeg` | 420×439 | 5 L professional tin visual | Provisional reference; replace with approved HD production photograph |
| `GANLAN_GOLD_website_assets/originals/lassad-wechat.png` | 329×327 | Lassad WeChat QR | Official V7 extraction; do not recompress/crop; scan test required |
| `GANLAN_GOLD_website_assets/originals/fouad-wechat.png` | 434×419 | Fouad WeChat QR | Official V7 extraction; do not recompress/crop; scan test required |
| `GANLAN_GOLD_website_assets/originals/homepage-reference.jpeg` | 1536×1024 | Visual reference only | Must not be published: contains baked-in EUR/prices and unapproved claims |

Hashes and extraction provenance are recorded in `GANLAN_GOLD_website_assets/ASSET_MANIFEST.json`.

## Prepared web derivatives

| Directory / asset | Intended use | Notes |
|---|---|---|
| `GANLAN_GOLD_website_assets/optimized/product-*.avif` and `.webp` | Responsive product delivery | Same low-resolution V7 references in efficient formats |
| `GANLAN_GOLD_website_assets/optimized/*-2x-display-only.webp` | High-density display fallback | Interpolated only; does not add photographic detail |
| `GANLAN_GOLD_website_assets/optimized/*-wechat.png` | Public QR display | Byte-identical to official originals; PNG preferred |
| `GANLAN_GOLD_website_assets/new_premium/hero-products-desktop.*` | Desktop hero composition | Derived/provisional; has text-free left area and no embedded prices |
| `GANLAN_GOLD_website_assets/new_premium/hero-products-mobile.*` | Mobile hero composition | Derived/provisional; no embedded prices |
| `GANLAN_GOLD_website_assets/new_premium/olive-grove-atmosphere.webp` | Origin/visit background | Decorative, blurred derivative; not evidence of GANLAN GOLD-owned groves |
| `GANLAN_GOLD_website_assets/new_premium/olive-branch-gold.svg` | Decorative brand motif | Safe as decoration; no commercial claim |
| `GANLAN_GOLD_website_assets/new_premium/olive-pattern.svg` | Low-opacity surface texture | Safe as decoration |

## Additional root photographs

| Asset | Dimensions | Observed content | Decision |
|---|---:|---|---|
| `f46f3664-c4db-4fac-bc2c-2a391d208ba0.jpeg` | 1536×1024 | 250 ml bottle beside salad and olives | Provisional marketing visual; no verified source/licence metadata |
| `02319f2b-82a9-4a75-9335-c3f994f910a5.jpeg` | 1536×1024 | 500 ml bottle beside Chinese food | Provisional marketing visual; no verified source/licence metadata |
| `bb4062fe-e5f4-4443-9729-5951748ff11e.jpeg` | 1024×1536 | Portrait 500 ml bottle beside Chinese food | Provisional marketing visual; no verified source/licence metadata |
| `03899e22-d0d8-433c-84c2-5ffde8af77e8.jpeg` | 1536×1024 | Combined range banner with embedded USD/CNY/EUR and claims | Reference only; prohibited from public production use |

## Missing production inputs

- Approved high-resolution product photography for all four formats.
- Verified olive-grove and production-facility photography with usage rights.
- Approved logo/wordmark source files and any licensed local font files.
- Approved Chinese brand name and professionally reviewed Chinese product/regulatory copy.
- Final product-label artwork and label approval.
- Confirmed QR scanning on target WeChat devices.

Original inputs are not renamed, overwritten, or deleted. Runtime copies live under `public/images/` and retain a documented mapping to these sources.

