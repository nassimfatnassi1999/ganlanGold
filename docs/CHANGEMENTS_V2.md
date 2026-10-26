# GANLAN GOLD — Journal des changements (version statique)

Les changements ci-dessous ont été appliqués au projet fourni par le client le 25 octobre 2026.

## Architecture

- Suppression de Prisma, PostgreSQL, routes API, back-office, authentification, services de taux BCE/ECB, tâches planifiées, scripts DB/Docker.
- Next.js conservé comme outil **de build statique** ; la version hébergée est un ensemble de fichiers HTML, CSS, JS et images.
- `next.config.ts` : `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`.
- `public/config/prices.json` : copie source utilisée lors des builds ; après déploiement, `dist/config/prices.json` devient la source opérationnelle des quatre tarifs CNY et USD et reste modifiable sans rebuild.
- `npm run build` : export Next.js + copie dans `dist/` par `scripts/copy-out-to-dist.mjs`.

## Interface

- Barre de navigation, boutons, palette et sections existantes préservés.
- Visuel principal remplacé par le paysage panoramique GANLAN GOLD sans titre incrusté, avec version mobile.
- Prix CNY et USD chargés depuis le JSON runtime, sans conversion ni référence aux taux du jour.
- Section globale unique 7 500 L maintenue, sans MOQ individuel.
- Pages légales adaptées au stockage **absent** et à la prise de contact par messagerie.

## Formulaires

- Aucun POST vers un serveur et aucune confirmation fictive « reçu ».
- Validation des champs et consentement ; génération d'un texte de contact et ouverture WhatsApp / copie pour WeChat.
- Les données ne sont pas sauvegardées par le site.

## Documentation

- `README.md` : édition directe des prix runtime, déploiement Gandi, limitations, conformité V7 et éléments à valider.
- `docs/CHANGEMENTS_V2.md` : présent journal.

## Écarts approuvés ou conséquences du choix statique

- Les sections 6 (taux ECB et prix USD via back-office) et 9 (administration USD) de V7 sont remplacées **sur instruction explicite du client** par des tarifs manuels dans `dist/config/prices.json`.
- Les demandes de devis et de visite restent préparables, mais ne sont **pas soumises automatiquement** faute de backend ou fournisseur de réception. Les visiteurs transmettent eux-mêmes les messages via WhatsApp ou WeChat. Une réception automatique nécessiterait une intégration supplémentaire.
