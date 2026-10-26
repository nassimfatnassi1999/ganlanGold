# GANLAN GOLD — Inventaire des ressources visuelles

Audit mis à jour le 26 octobre 2026.

## Source métier conservée

`GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf` reste la source métier de référence. Ce document n’est pas publié par le site statique et doit être conservé avec les sources de maintenance.

## Ressources utilisées par le site

Toutes les images chargées à l’exécution sont centralisées dans `public/images/` :

| Dossier | Contenu | Utilisation |
|---|---|---|
| `public/images/hero/` | Panorama desktop et mobile en AVIF/WebP | Visuel principal et métadonnées sociales |
| `public/images/products/` | Quatre conditionnements en WebP | Cartes produits 250 ml, 500 ml, 750 ml et 5 L |
| `public/images/groves/` | Atmosphère horizontale et recadrage vertical net | Fonds Visite et section Origine |
| `public/images/qr/` | QR WeChat de Lassad et Fouad en PNG | Cartes de contact |
| `public/images/brand/` | Motif d’olives en SVG | Texture décorative |

Les chemins applicatifs sont regroupés dans `src/lib/assets.ts`. Les deux images employées directement depuis CSS sont `olive-pattern.svg` et `olive-grove-atmosphere.webp`.

## Fichiers volontairement absents

- Les photos originales et leurs doublons de travail ne sont pas conservés à la racine du projet ; seuls leurs dérivés réellement utilisés restent dans `public/images/`.
- L’ancienne bibliothèque `GANLAN_GOLD_website_assets/` n’est pas requise pour exécuter ou reconstruire le site.
- Le motif `olive-branch-gold.svg` a été supprimé car aucune page ni feuille de style ne le référençait.
- Le visuel de référence contenant des prix EUR et des allégations non validées n’est pas publié.

## Précautions avant campagne commerciale

- Confirmer les droits d’utilisation des photographies, illustrations, étiquettes et marques.
- Remplacer les photos produits par des versions haute définition approuvées si elles deviennent disponibles.
- Tester les deux QR codes sur les appareils WeChat ciblés avant publication.
- Faire valider le nom chinois, les étiquettes et les textes réglementaires avant impression ou diffusion commerciale.

