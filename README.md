# GANLAN GOLD — Site vitrine B2B (édition statique Gandi)

**Projet mis à jour le 27 octobre 2026**, à partir du projet livré et du cahier des charges `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`.

Site premium destiné aux importateurs professionnels d'huile d'olive marocaine, avec **chinois simplifié par défaut et interface anglaise complète sélectionnable**. Le choix `中文 | EN` est mémorisé localement dans le navigateur. Le site est **statique**, sans base de données, Prisma, PostgreSQL, back-office, API applicative ni conversion de devises en temps réel.

## 1. Livraison

Deux versions se trouvent dans cette archive :

- **`dist/`** — export statique pour Gandi ou Netlify, sans processus Node.js sur le serveur. La livraison EmailJS actuelle est une **prévisualisation avec envoi désactivé**, marquée `EMAILJS_PREVIEW_ONLY.txt`, car les identifiants du compte ne sont pas fournis. Renseigner `.env.local`, puis exécuter `npm run build` avant une mise en production avec envoi actif.
- **`src/`, `public/`, `package.json`, `next.config.ts`** — code source Next.js/React/TypeScript permettant de modifier les contenus et de reconstruire la version statique.

Le panorama d'accueil utilise **la dernière image GANLAN GOLD sans titre à gauche**, avec quatre conditionnements, montagnes et oliveraies ; les titres chinois/anglais et boutons sont de vrais éléments HTML, non intégrés dans l'image.

Toutes les images publiées sont centralisées dans `public/images/`. Les versions produit dérivées des images officielles du PDF sont disponibles en WebP/AVIF ; les fichiers WebP qui ont servi de base sont conservés dans `docs/image-sources/`. Les QR codes officiels restent en PNG, sans modification.

## 2. Modifier les quatre prix après déploiement — sans build

**Fichier unique à modifier sur le site déployé : `config/prices.json`.** Dans la livraison locale, il se trouve ici : `dist/config/prices.json`.

```json
{
  "250ml": { "cny": 29, "usd": "4.00" },
  "500ml": { "cny": 49, "usd": "7.30" },
  "750ml": { "cny": 69, "usd": "10.10" },
  "5l": { "cny": 259, "usd": "38.50" }
}
```

Pour changer les tarifs après la mise en ligne :

1. Modifier `dist/config/prices.json` avec un éditeur de texte.
2. Envoyer uniquement ce fichier sur Gandi à l’emplacement `config/prices.json`, en remplaçant l’ancien.
3. Recharger la page. Le site ajoute automatiquement un paramètre anti-cache et `.htaccess` demande également à l’hébergement Apache/Gandi de ne pas conserver une ancienne version.

Il ne faut **ni relancer `npm run build`, ni retransférer tout `dist/`** pour une simple modification de prix.

Règles à respecter : conserver exactement les quatre références ; saisir `cny` comme entier positif ; conserver `usd` entre guillemets avec deux décimales. Si le fichier est absent ou invalide, le site affiche « prix temporairement indisponible » au lieu d’un ancien montant.

Les montants CNY et USD sont indépendants et aucune conversion n'est faite. Les prix restent indicatifs ; le devis final est confirmé en USD, habituellement pour 15 jours sauf indication contraire.

Lors d’une future reconstruction complète du code, `public/config/prices.json` est la copie source automatiquement placée dans `dist/config/prices.json`.

**Avant une future reconstruction complète :** si les prix ont été modifiés sur Gandi, téléchargez d’abord le fichier déployé `config/prices.json` et remplacez `public/config/prices.json` par cette version. La commande de build recrée entièrement `dist/` ; sans cette synchronisation, elle remettrait les valeurs présentes dans `public/config/prices.json`.

## 3. Développement et reconstruction (sur Mac)

Prérequis : Node.js moderne (20.9+ recommandé), npm et une connexion Internet **pour la première installation des dépendances**.

```bash
cd GANLAN_GOLD
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

Configurer d’abord les quatre identifiants publics EmailJS dans `.env.local` ([guide](docs/EMAILJS_SETUP.md)). Compilation pour Gandi après une modification du code, du design ou des textes :

```bash
npm run build
```

La commande utilise **Next.js static export** (`output: "export"`) puis copie les fichiers de `out/` dans **`dist/`**. Aucun serveur Node ni base de données ne sont requis pour servir ces fichiers. Cette compilation n’est pas nécessaire pour une simple modification de `prices.json`.

Optionnel, renseigner l'URL publique *avant* le build pour les métadonnées SEO :

```bash
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld npm run build
```

Ce domaine est un exemple : **n'utilisez pas une fausse URL en production**.

## 4. Déploiement Gandi

1. Dans Gandi, associer le domaine à un hébergement web prenant en charge les **fichiers HTML/CSS/JS statiques**, et activer **HTTPS**.
2. Envoyer **le contenu de `dist/`** (et non le dossier lui-même) dans le répertoire racine web du domaine — souvent `htdocs/`, `www/` ou un répertoire défini par l'offre Gandi.
3. Vérifier la présence à la racine de `index.html`, `static/site.css` ou de la feuille CSS exportée, `images/`, `privacy/`, `legal/` et `terms/`.
4. Tester `https://votre-domaine.tld/`, puis `.../privacy/`, `.../legal/`, `.../terms/`.
5. Tester sur smartphone, l'ouverture des QR codes WeChat, les liens téléphone et WhatsApp et le formulaire de devis.

**Ne transférez ni `node_modules/`, ni `.next/`, ni le code source, ni la spécification PDF sur le serveur public.** Seul `dist/` est nécessaire. Le ZIP contient les sources et la spécification pour la maintenance hors ligne.

## 5. Formulaires EmailJS et absence de backend

Les deux formulaires transmettent les demandes via le SDK navigateur officiel **EmailJS**, avec un service et deux modèles indépendants. Le site reste entièrement statique. Les destinataires autorisés sont définis dans EmailJS ; aucune adresse destinataire ne vient du formulaire.

Configurer les quatre identifiants publics dans `.env.local` en suivant [docs/EMAILJS_SETUP.md](docs/EMAILJS_SETUP.md). Les hooks `predev` et `prebuild` génèrent uniquement ces identifiants dans `public/config/emailjs.json`, copié automatiquement dans `dist/config/emailjs.json`. Le fichier `.env.local` lui-même n'est jamais publié. **Un build de production refuse les valeurs absentes ou les placeholders.** Sans compte configuré, `npm run build:preview` génère un export de prévisualisation avec envoi désactivé et un marqueur explicite ; il ne constitue pas une livraison de production configurée.

Le succès apparaît après acceptation par EmailJS ; une erreur conserve les champs et propose WhatsApp ou la copie du message pour WeChat. Le bouton de préparation manuelle reste disponible séparément. Les dates de visite ne sont jamais confirmées automatiquement. La notice de confidentialité explique désormais ce traitement externe.

Les deux modèles HTML complets, réglages et aperçus sont dans [emailjs-templates/](emailjs-templates/README.md). Tests : [docs/EMAILJS_TESTING.md](docs/EMAILJS_TESTING.md). Aucun envoi réel n'est effectué par les tests automatisés. La réception réelle et l'accessibilité depuis la Chine continentale doivent être vérifiées avec le compte et les réseaux concernés.

## 6. Fonctionnalités et respect du cahier des charges

| Fonctionnalité | Livraison |
|---|---|
| Landing page premium, responsive | Oui |
| Chinois par défaut / anglais commutable | Oui ; choix persistant, sans double contenu visible |
| Animations éditoriales au défilement | Oui ; désactivées avec `prefers-reduced-motion` |
| Hero panoramique Maroc avec les 4 produits | Oui ; titre HTML modifiable |
| Produits 250 ml / 500 ml / 750 ml / bidon 5 L | Oui |
| Prix CNY grands, USD petits ; aucun EUR public | Oui ; **fixes manuels** |
| MOQ **global de 7 500 L**, une section unique | Oui |
| Mélange de formats de bouteilles | Oui |
| Fouad + producteurs voisins ; traçabilité de lots | Oui |
| Invitation à la visite / formulaire | Oui ; EmailJS + alternatives WhatsApp/WeChat |
| Export, Incoterms FOB/FCA, exclusions, documents | Oui |
| Contacts Gisèle, Lassad, Fouad dans cet ordre | Oui |
| QR WeChat réels de Lassad et Fouad | Oui ; tests réels indispensables |
| Formulaire de devis | Oui ; EmailJS après configuration du compte |
| Pages confidentialité / mentions légales / conditions | Oui ; **textes à valider** |
| SEO chinois, métadonnées, responsive | Oui ; vérifier le domaine de production |
| Back-office, taux ECB, conversion automatique | **Supprimés sur instruction du client** |
| PostgreSQL, Prisma, API Node | **Non requis et retirés** |

Les valeurs initiales sont livrées dans `dist/config/prices.json` et peuvent être remplacées sans modifier le HTML du site.

## 7. Images et performances

Le site ne charge aucune image depuis la racine du dépôt : toutes les ressources visuelles d’exécution se trouvent sous `public/images/`.

- `public/images/hero/` : panorama sans texte fixe, formats WebP/AVIF, déclinaison desktop/mobile.
- `public/images/products/` : quatre photos de produit avec retouche non destructive de netteté et agrandissement Lanczos (environ 1,8× en pixels), versions WebP et AVIF. Les étiquettes ne sont pas redessinées ; les sources précédentes sont sauvegardées dans `docs/image-sources/`.
- `public/images/qr/` : QR officiels WeChat en PNG non redessinés.
- `public/images/groves/` : visuel vertical net des oliveraies marocaines pour la section Origine. Le nouveau fichier `moroccan-groves-sharp.webp` est un recadrage exact, non agrandi, du panorama approuvé, sans emballage ni texte, compressé à 177 Ko.
- `public/images/brand/` : motif SVG décoratif utilisé par l’interface.

Les photos produits extraites du PDF restent limitées par la résolution d'origine, **362×439 à 420×439 px**. Leur agrandissement améliore le confort d'affichage mais **ne restaure pas de véritables détails haute définition** ; des photos originales HD doivent les remplacer pour une publicité ou une impression grand format.

**Nouvelle animation olive → huile :** `public/interactive/olive-journey.js` et `.css` (copiés sous `dist/interactive/`). Cette illustration SVG autonome et légère montre des branches d'olivier, une bouteille stylisée qui s'incline et un filet d'huile pendant le défilement. Elle est désactivée pour les utilisateurs ayant activé « Réduire les animations ». Elle n'est ni une nouvelle affirmation commerciale ni une photographie de produit.

## 8. Avant mise en ligne commerciale : validations restantes

- **Prix réels, coûts, MOQ et conditions de vente** approuvés par le responsable commercial.
- **Étiquettes produits** et termes réglementaires chinois relus par un professionnel compétent et un locuteur natif.
- **Nom chinois provisoire** officiellement validé avant impression.
- Photographies de production et droits d'utilisation confirmés.
- Les QR codes testés avec un appareil et WeChat ; correspondance Lassad/Fouad confirmée.
- **Identité de l'entreprise, mentions légales, adresse et politique de confidentialité** complétées et relues par la société/le conseil juridique.
- Documents d'export applicables validés avec l'exportateur, le transitaire et les autorités compétentes.
- Configuration domaine, certificat HTTPS, sitemap et performances constatées sur réseau chinois testés.
- Test réel des deux parcours de contact sur desktop et mobile.

## 9. Vérifications historiques et nouvelle intégration EmailJS

Les résultats actuels de l’intégration sont dans [docs/EMAILJS_TESTING.md](docs/EMAILJS_TESTING.md). Les paragraphes suivants décrivent une livraison antérieure et ne constituent pas les résultats de cette intégration. Rapport historique : `docs/V7_COMPLIANCE_AUDIT.md`.

**Vérifications effectuées sur cette révision :** `npm run verify:static` (réussi), `node --check public/interactive/olive-journey.js` (réussi), comparaison de la structure statique (quatre produits, une section MOQ, liens internes, contacts, prix et fichiers d'images), empreintes SHA-256 des deux QR codes officiels, inspection des images dérivées et prévisualisation du SVG.

**Limitation vérifiable :** l'environnement de reconstruction n'avait pas accès aux dépendances complètes nécessaires au nouveau build Next.js ; une tentative `npm ci` a échoué à cause d'un paquet non présent dans le cache puis d'un accès réseau expiré. La sortie `dist/` est donc celle **déjà compilée et fournie par le client**, mise à jour directement avec les nouvelles images optimisées, feuilles CSS, scripts et liens. Le nouveau code source est inclus pour les prochaines reconstructions sur ton Mac, mais **je ne prétends pas avoir effectué un nouveau `npm run build` ou des tests Playwright complets** sur cette révision. L'accès Chromium aux pages locales a également été bloqué par l'environnement d'exécution.

Avant la mise en production, sur ton Mac, exécute :

```bash
npm ci
npm run typecheck
npm run lint
npm run test:e2e
NEXT_PUBLIC_SITE_URL=https://ton-vrai-domaine.tld npm run build
npm run verify:static
```

Attention : **`npm run build` régénère `dist/`**. Le fichier `src/app/layout.tsx` inclut désormais automatiquement les deux ressources d'animation, et `public/images/` contient les quatre nouveaux fichiers produits : ces améliorations seront conservées au prochain build.

Le déploiement des fichiers `dist/` fonctionne sur Gandi ou Netlify statique. EmailJS transmet les formulaires après configuration du compte ; les alternatives WhatsApp/WeChat sont conservées.

## 10. Licence et ressources

Code et ressources transmis pour l'usage du projet GANLAN GOLD, sous réserve des droits réels sur les photos, illustrations et marques. Aucune certification ou autorisation réglementaire n'est présumée acquise.
