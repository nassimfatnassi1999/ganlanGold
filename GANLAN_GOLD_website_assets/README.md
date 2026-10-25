# GANLAN GOLD — Pack d’images pour site web

Ce pack provient du document `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf` (7 pages, 25 octobre 2026).

## Contenu

### `originals/` — EXTRACTION IDENTIQUE AU PDF
- `homepage-reference.jpeg` : bannière complète de la page 1. **Référence de design seulement** — contient prix EUR et CNY intégrés dans l’image, ainsi que des affirmations non revues. Ne pas la publier comme bannière finale.
- `product-250ml.jpeg`, `product-500ml.jpeg` : photos de la page 5.
- `product-750ml.jpeg`, `product-5l.jpeg` : photos de la page 6.
- `lassad-wechat.png`, `fouad-wechat.png` : QR codes officiels de la page 4, conservés sans altération.

### `optimized/` — POUR LE SITE
- `product-*.avif` et `product-*.webp` : mêmes photos, formats web rapides (AVIF et WebP, compression avec perte pour les photos uniquement). Toujours garder l’original pour comparaison.
- `product-*-2x-display-only.webp` : agrandissement interpolé 2× pour une mise en page haute densité. **Cela ne crée aucun détail photographique nouveau.**
- QR PNG originaux (préférés), et variantes WebP sans perte.
- `homepage-reference-only.webp` : **ne pas mettre en ligne**, mêmes prix statiques et texte que la référence.

### `new_premium/` — COMPOSITIONS ADDITIONNELLES
- `hero-products-desktop.webp` / `.avif` (1920 × 1080) : composition vert olive/or, photos originales en vignettes, moitié gauche libre pour H1 chinois + bouton HTML.
- `hero-products-mobile.webp` / `.avif` (900 × 1200) : composition verticale, zone supérieure libre pour texte HTML.
- `olive-grove-atmosphere.webp` : fond décoratif flouté dérivé du PDF, **pas une photo vérifiée des propres champs de GANLAN GOLD**.
- `olive-branch-gold.svg` : branche d’olivier dorée décorative scalable.
- `olive-pattern.svg` : texture vectorielle légère pour les sections.

### `PREVIEW.jpg`
Aperçu des quatre photos et deux QR codes (pas un visuel de production).

## Intégration Next.js / React

Placer les contenus de `optimized/` et `new_premium/` dans `public/images/`.

```tsx
import Image from 'next/image';

// Product photography: preserve aspect ratio, render texts and prices as HTML outside the image.
<Image
  src="/images/optimized/product-250ml.webp"
  alt="GANLAN GOLD 摩洛哥特级初榨橄榄油，250 毫升"
  width={362}
  height={439}
  sizes="(max-width: 640px) 82vw, 362px"
  loading="lazy"
/>

// Phone-specific art direction. Put ALL Chinese/English headings, prices and buttons in HTML.
<picture>
  <source media="(max-width: 767px)" srcSet="/images/new_premium/hero-products-mobile.avif" type="image/avif" />
  <source media="(max-width: 767px)" srcSet="/images/new_premium/hero-products-mobile.webp" type="image/webp" />
  <source srcSet="/images/new_premium/hero-products-desktop.avif" type="image/avif" />
  <img src="/images/new_premium/hero-products-desktop.webp" width="1920" height="1080" alt="" fetchPriority="high" />
</picture>
```

## Notes impératives sur la qualité
- Les quatre originaux du PDF sont **petits** (340–420 px de large). Leur conversion WebP/AVIF réduit le poids mais ne transforme pas les photos en véritables images de qualité studio 4K. Remplacer par les photos sources HD dès qu’elles sont disponibles.
- Le QR code doit être affiché net, sans flou, zoom déformant ni compression JPEG.
- Les prix CNY/USD et le MOQ global **doivent être du texte HTML dynamique** selon V7. Ne jamais utiliser `homepage-reference.jpeg` comme hero définitif.
- Les images de ce pack sont fidèles au PDF ou des compositions dérivées : **aucune nouvelle image photo-réaliste inventée** n’a été ajoutée.
- Tester les QR codes avec WeChat avant publication; l’extraction ne garantit pas l’accès au compte.
- La formulation chinoise, les étiquettes, et les visuels publicitaires requièrent validation avant lancement.

## Organisation et traçabilité
`ASSET_MANIFEST.json` donne pour chaque asset ses dimensions, son poids et SHA-256.
