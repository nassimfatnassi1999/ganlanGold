# GANLAN GOLD Design System Master

> The official V7 specification and `docs/brand-guidelines.md` override generic dataset recommendations. Page files under `pages/` may refine layout but may not weaken commercial or brand constraints.

**Project:** GANLAN GOLD  
**Direction:** Organic editorial for premium Chinese B2B trade  
**Design dials:** variance 6/10 · motion 3/10 · density 2/10

## Experience principles

1. Chinese is the default reading language; visitors can switch the complete interface to English without duplicated bilingual blocks.
2. Real products, rates, dates, contacts, and workflow states replace decorative filler.
3. Editorial warmth supports commercial precision; all obligations and exclusions stay legible.
4. The experience works without motion, remote fonts, Google services, or client-side currency calls.

## Three-layer tokens

### Primitive

| Token | Value |
|---|---|
| `--olive-950` | `#0D281C` |
| `--olive-900` | `#173E2B` |
| `--olive-700` | `#315D45` |
| `--olive-600` | `#546C5D` |
| `--gold-500` | `#C9A95F` |
| `--gold-400` | `#DCC183` |
| `--sand-050` | `#F7F1E6` |
| `--sand-100` | `#E8DCC7` |
| `--sand-200` | `#D8C9AD` |
| `--ink-900` | `#17251D` |
| `--red-700` | `#9B2C2C` |

Spacing uses a 4 px base: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Radii are `12, 20, 28, 999` px. Shadows are warm and low-opacity; outlines and borders carry most structure.

### Semantic

- `--color-background`: light sand; `--color-surface`: lighter sand.
- `--color-foreground`: ink; `--color-muted-foreground`: muted olive.
- `--color-primary`: deep olive; `--color-on-primary`: light sand.
- `--color-accent`: premium gold; `--color-on-accent`: olive 950.
- `--color-border`: sand 200; `--color-danger`: red 700.
- `--space-section`: fluid 80–144 px; `--space-gutter`: fluid 20–64 px.

### Component

- Buttons: 48 px minimum height, 999 px radius, gold primary or bordered light secondary, explicit focus ring.
- Inputs: 48 px minimum height, 12 px radius, visible label, helper/error association, no placeholder-only labels.
- Cards: 20–28 px radius, fine border, little or no shadow, no generic dashboard lift effect on public content.
- Prices: tabular figures; CNY dominant; reference USD smaller; rate date adjacent; unavailable/stale state textual.
- Images: stable aspect ratios, no label crop, no stretching; 5 L visual occupies materially more area than bottles.

## Typography

- Display: `"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif`.
- Body/UI: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif`.
- No remote font imports. Base body size is 16 px with 1.65 line height; short display headings use balanced wrapping only as progressive enhancement.

## Layout and signature motif

- Max content width: 1280 px; prose measure: 44–72 characters depending on language and viewport.
- Public page: immersive hero, alternating product stories, one dedicated MOQ chapter, then provenance, visit, export, contact, and quote conversion.
- Signature: a 1 px gold traceability line with small circular waypoints; it visually connects sourcing, products, preparation, and Moroccan handover without becoming a timeline claim.
- Sticky header reserves scroll margin and never obscures focused elements.

## Motion

- Use restrained opacity, directional translation, and shallow perspective for section and product reveals; content remains present in the server-rendered HTML.
- The hero may use a subtle CSS scroll-linked depth shift on larger screens. Disable it on mobile and never use autoplay, scroll locking, or correctness that depends on `animationend`.
- `prefers-reduced-motion: reduce` removes nonessential motion and preserves complete final content.

## Language state

- Supported locales are `zh-CN` and `en`; `zh-CN` is the first-visit default.
- The `中文 | EN` switcher persists the choice in `localStorage` under `ganlan-language` and keeps the root `lang` attribute synchronized.
- A small pre-paint script applies a valid stored choice before hydration, preventing a wrong-language flash; invalid values fall back to Chinese.
- Shared dictionaries and one component tree are mandatory. Do not fork the page or show both translations at once.

## Accessibility and interaction

- Normal text contrast ≥4.5:1; large/non-text contrast ≥3:1.
- Visible focus on every control; DOM order equals reading order; 44×44 px minimum targets.
- Forms use a focusable error summary plus linked inline errors; success/error messages use appropriate live regions.
- Decorative SVGs are hidden from assistive technology; meaningful images have specific bilingual alt text.
- No hover-only action, emoji icon, or unlabeled icon control.

## Anti-patterns

- Google-hosted fonts/maps/CAPTCHA, excessive glass/blur, generic SaaS tiles, fake testimonials/metrics, and themed control labels.
- Per-product MOQ, public EUR, embedded price imagery, invented Chinese brand or WeChat identities, or unsupported quality/health claims.
- Low-contrast gold body text, cropped QR codes, fixed-width mobile layouts, and animation-hidden SEO content.

## Required review widths

`320`, `375`, `390`, `430`, `768`, `1024`, and `1440` px, plus reduced-motion and keyboard-only flows.

