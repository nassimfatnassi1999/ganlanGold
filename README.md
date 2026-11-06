# GANLAN GOLD — Site vitrine B2B statique — Netlify / Alibaba Cloud OSS / Gandi

**Projet mis à jour le 27 octobre 2026, puis le 6 novembre 2026 (expérience 3D au défilement, voir section 7 bis)**, à partir du projet livré et du cahier des charges `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`.

Site premium destiné aux importateurs professionnels d'huile d'olive marocaine, avec **chinois simplifié par défaut et interface anglaise complète sélectionnable**. Le choix `中文 | EN` est mémorisé localement dans le navigateur. Le site est **statique**, sans base de données, Prisma, PostgreSQL, back-office ni API applicative. Les équivalents USD et EUR sont calculés dans le navigateur à partir des taux de référence de la BCE (voir section 2).

## 1. Livraison

Deux versions se trouvent dans cette archive :

- **`dist/`** — export statique de production pour Netlify, Alibaba Cloud OSS Hong Kong ou Gandi, sans processus Node.js sur le serveur. Les quatre identifiants publics EmailJS sont intégrés au JavaScript depuis `src/config/env.ts`. Si la configuration est incomplète, la vitrine et les formulaires avec contact manuel restent disponibles. Toute modification des identifiants exige un nouveau build et déploiement.
- **`src/`, `public/`, `package.json`, `next.config.ts`** — code source Next.js/React/TypeScript permettant de modifier les contenus et de reconstruire la version statique.

Le panorama d'accueil utilise **la dernière image GANLAN GOLD sans titre à gauche**, avec quatre conditionnements, montagnes et oliveraies ; les titres chinois/anglais et boutons sont de vrais éléments HTML, non intégrés dans l'image.

Toutes les images publiées sont centralisées dans `public/images/`. Les versions produit dérivées des images officielles du PDF sont disponibles en WebP/AVIF ; les fichiers WebP qui ont servi de base sont conservés dans `docs/image-sources/`. Les QR codes officiels restent en PNG, sans modification.

## 2. Modifier les quatre prix — chaque jour, sans build

**Hébergement actuel : Tencent COS Hong Kong + CDN EdgeOne (`https://www.ganlangold.com`).** Guide complet, diagnostic de la panne « 价格暂不可用 » du 4 novembre 2026 et réglages du cache : [docs/TENCENT_COS_EDGEONE.md](docs/TENCENT_COS_EDGEONE.md).

Les prix sont lus par le navigateur dans **`config/prices.json`** à chaque visite (avec un paramètre anti-cache). Changer ce fichier suffit : aucun build n'est nécessaire.

```json
{
  "250ml": { "cny": 16, "usd": "2.35", "eur": "2.15" },
  "500ml": { "cny": 30, "usd": "4.40", "eur": "4.02" },
  "750ml": { "cny": 43, "usd": "6.30", "eur": "5.77" },
  "5l": { "cny": 220, "usd": "32.30", "eur": "29.50" }
}
```

Trois façons de le modifier, de la plus sûre à la moins sûre :

1. **Formulaire GitHub (recommandé, si `.github/workflows/update-prices.yml` est présent — il manque dans ce dépôt)** : onglet **Actions** → **Mettre à jour les prix** → **Run workflow** → saisir les prix CNY. Le workflow vérifie les valeurs, recalcule USD/EUR au taux BCE, enregistre le fichier dans Git, l'envoie sur COS et vide le cache EdgeOne. Configuration unique : [section 4 du guide Tencent](docs/TENCENT_COS_EDGEONE.md#4-configurer-le-déploiement-automatique-github--cos--edgeone).
2. **Éditeur hors ligne** : ouvrir `outils/editeur-prix.html` (double-clic), saisir les prix, télécharger `prices.json`, puis le déposer dans le dossier `config/` du bucket COS. Le fichier produit est toujours valide.
3. **Ligne de commande** : `npx tsx scripts/update-prices.ts --750ml 45` (vérifie, recalcule USD/EUR, écrit `public/config/prices.json` et `dist/config/prices.json`).

**Source unique : `public/config/prices.json` dans Git.** Les méthodes 1 et 3 la mettent à jour automatiquement. Avec la méthode 2, remplacer aussi ce fichier dans le dépôt, sinon le prochain build remettrait les anciens prix.

Règles du fichier publié (vérifiées par les outils, `npm run build` et `npx tsx scripts/update-prices.ts --check`) : les quatre références exactes ; `cny` nombre entier positif sans guillemets ; `usd` et `eur` entre guillemets avec deux décimales.

**Le navigateur, lui, est tolérant**, pour qu'une page ancienne restée en cache ne casse plus jamais l'affichage : champs ou clés inconnus ignorés, nombres écrits avec ou sans guillemets acceptés (`6.3` → `6.30`), clés `750ML` ou `5L` reconnues. Seul un produit sans prix CNY utilisable affiche « prix temporairement indisponible », sur sa propre carte uniquement ; aucun montant n'est jamais deviné. La requête est réessayée deux fois en cas de coupure réseau et abandonnée après 8 secondes par tentative.

**Le prix CNY est le prix principal** (prix de gros indicatifs export depuis le Maroc, négociables selon le volume). Sous chaque prix, le site affiche les équivalents USD et EUR :

1. **Conversion automatique** : le navigateur récupère les taux de référence quotidiens de la BCE (CNY→USD et CNY→EUR) via l'API gratuite Frankfurter (`api.frankfurter.dev`, sans clé).
2. **Dernier taux valide** : si le service ne répond pas, le dernier taux reçu par ce navigateur est réutilisé.
3. **Valeurs de secours** : sinon (par exemple si le service est inaccessible depuis certains réseaux en Chine continentale), le site affiche les montants `usd` et `eur` de `prices.json`. Le workflow GitHub les actualise chaque jour ouvré.

Le texte « 批发参考价格 · 根据订购数量可议价 » (offre en vrac, MOQ, exclusions) se modifie dans `src/i18n/zh-CN.json` et `src/i18n/en.json` (`products.terms`), puis nécessite un build.

## 3. Développement et reconstruction (sur Mac)

Prérequis : Node.js 22, npm et une connexion Internet **pour la première installation des dépendances**.

```bash
cd GANLAN_GOLD
npm ci
npm run dev
```

Ouvrir `http://localhost:3000`.

**Aucune configuration EmailJS n’est nécessaire.** Compilation après une modification du code, du design ou des textes :

```bash
npm run build
```

La commande utilise **Next.js static export** (`output: "export"`) puis copie les fichiers de `out/` dans **`dist/`**. Aucun serveur Node ni base de données ne sont requis pour servir ces fichiers. Cette compilation n’est pas nécessaire pour une simple modification de `prices.json`.

L'URL publique utilisée pour le SEO (balise canonique, `robots.txt`, `sitemap.xml`) est `https://www.ganlangold.com` par défaut. Pour un autre domaine, la renseigner *avant* le build :

```bash
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld npm run build
```

Ce domaine est un exemple : **n'utilisez pas une fausse URL en production**.

## 4. Déploiement Netlify, Alibaba Cloud OSS et Gandi

**Tencent COS + EdgeOne (hébergement actuel)** : déploiement automatique par GitHub Actions (`.github/workflows/deploy.yml` — **attention : le dossier `.github/` n'est pas présent dans ce dépôt ; le recréer avant d'utiliser cette méthode**) ou manuel, réglages du cache et purge : [docs/TENCENT_COS_EDGEONE.md](docs/TENCENT_COS_EDGEONE.md). Après tout envoi manuel de pages sur COS, **vider le cache EdgeOne** (Hostname, méthode Delete), sinon le CDN peut continuer à servir l'ancienne page.

**Netlify** : le fichier `netlify.toml` définit `npm run build` et le dossier publié `dist`. Aucune variable EmailJS n'est requise. **Alibaba Cloud OSS Hong Kong** : téléverser le contenu de `dist/`, activer les index de sous-dossiers et configurer le cache des JSON. Les étapes complètes figurent dans [docs/STATIC_DEPLOYMENT.md](docs/STATIC_DEPLOYMENT.md).

1. Dans Gandi, associer le domaine à un hébergement web prenant en charge les **fichiers HTML/CSS/JS statiques**, et activer **HTTPS**.
2. Envoyer **le contenu de `dist/`** (et non le dossier lui-même) dans le répertoire racine web du domaine — souvent `htdocs/`, `www/` ou un répertoire défini par l'offre Gandi.
3. Vérifier la présence à la racine de `index.html`, `_next/static/` (JavaScript et CSS exportés), `images/`, `media/` (vidéos), `config/`, `privacy/`, `legal/` et `terms/`.
4. Tester `https://votre-domaine.tld/`, puis `.../privacy/`, `.../legal/`, `.../terms/`.
5. Tester sur smartphone, l'ouverture des QR codes WeChat, les liens téléphone et WhatsApp et le formulaire de devis.

**Ne transférez ni `node_modules/`, ni `.next/`, ni le code source, ni la spécification PDF sur le serveur public.** Seul `dist/` est nécessaire. Le ZIP contient les sources et la spécification pour la maintenance hors ligne.

## 5. Formulaires EmailJS et absence de backend

Les deux formulaires transmettent les demandes via le SDK navigateur officiel **EmailJS**, avec un service et deux modèles indépendants. Le site reste entièrement statique. Les destinataires autorisés sont définis dans EmailJS ; aucune adresse destinataire ne vient du formulaire.

La source unique est la constante **`EMAILJS_CONFIG` dans `src/config/env.ts`** : `publicKey`, `serviceId`, `quoteTemplateId` et `visitTemplateId`. Modifier seulement ces quatre identifiants publics du compte ; conserver deux modèles distincts. Ils seront visibles dans le navigateur. Ne jamais ajouter de clé privée ou mot de passe fournisseur.

Après chaque changement, exécuter **`npm run build` puis redéployer tout `dist/`**. Le build inclut automatiquement les valeurs dans les fichiers JavaScript. EmailJS ne nécessite aucune variable d’environnement, aucun fichier JSON ni chargement de configuration à l’exécution. Les placeholders `YOUR_…` ou identifiants incomplets désactivent seulement l’envoi automatique : les champs sont conservés avec un message chinois/anglais et des alternatives WhatsApp/WeChat. Voir [EMAILJS_CONFIGURATION.md](docs/EMAILJS_CONFIGURATION.md).

Pour tester les deux formulaires sans email réel : `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, puis `npm run build`. Les tests simulent les réponses EmailJS et couvrent les deux langues, modèles, erreurs, placeholders et doublons. Pour tester `dist/` avec un simple serveur statique, suivre [EMAILJS_TESTING.md](docs/EMAILJS_TESTING.md). Un test réel nécessite l’accord du destinataire et une vérification indépendante de la réception.

Guide de déploiement et de cache : [STATIC_DEPLOYMENT.md](docs/STATIC_DEPLOYMENT.md). Réglages du compte et des modèles : [EMAILJS_SETUP.md](docs/EMAILJS_SETUP.md).
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
| Prix CNY grands, USD petits ; aucun EUR public | **Modifié à la demande du client (nov. 2026)** : CNY principal, équivalents USD et EUR en dessous |
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
| Back-office, taux ECB, conversion automatique | Back-office non requis ; **taux BCE et conversion automatique USD/EUR réintroduits à la demande du client (nov. 2026)**, avec repli manuel |
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

**Intermède branches d'olivier :** `src/components/sections/OliveScrollSection.tsx` (+ `useOliveScroll.ts`, `.module.css`) — trois branches détourées (`public/images/olives/`) et une goutte d'huile qui bougent pendant le défilement, entre « Origine » et « Visite ». Désactivé avec « Réduire les animations ». Ce n'est ni une affirmation commerciale ni une photographie de produit.

## 7 bis. Expérience 3D au défilement (6 novembre 2026)

Inspirée des animations « 3D scroll » (Dribbble) : le site raconte le passage **olive → goutte d'huile → bouteille** pendant le défilement. Tout est lié à la position de la page : en remontant, l'animation se rejoue à l'envers. **Toutes les photos produits existantes sont conservées sans modification** (mêmes fichiers `public/images/products/*`).

| Où | Effet | Fichiers |
|---|---|---|
| Accueil | Le panorama s'enfonce en profondeur, le titre bascule en 3D ; olives, feuilles et goutte rendues en 3D flottent à différentes profondeurs (flou de profondeur) | `PublicExperience.tsx`, `experience-3d.css` |
| **Nouvelle section « Le voyage d'une olive »** (`#journey`, après l'accueil) | Scène WebGL (three.js) fixée à l'écran sur 4 étapes : nuage d'olives → les olives se rassemblent en goutte dorée → la goutte se verse dans une bouteille 750 ml en 3D **portant la vraie étiquette** → la bouteille tourne avec des anneaux dorés. Textes chinois/anglais en HTML | `src/components/journey/OilJourney.tsx`, `journeyScene.ts`, `src/lib/three/models.ts` |
| Produits | Chaque photo devient une carte 3D qui pivote avec le défilement, reflet lumineux mobile, halo doré, olives 3D en orbite, grand chiffre de contenance en filigrane | `ProductShowcase.tsx` |
| Commande minimale (MOQ) | Vidéo en boucle « or liquide » (huile en macro) derrière le texte | `public/media/liquid-gold.*` |
| Origine | Photo inclinée en 3D, parallaxe intérieure, rameau 3D au premier plan | `PublicExperience.tsx` |
| Visite | Vidéo en boucle « lumière sur l'oliveraie » (rayons et pollen sur le panorama approuvé, sans emballage) | `public/media/grove-light.*` |
| Export | La ligne dorée de la frise se remplit comme un filet d'huile | `experience-3d.css` |
| Demande de devis | Olives et goutte 3D en parallaxe | `PublicExperience.tsx` |
| En-tête | Jauge dorée de progression de lecture | `experience-3d.css` |

**Moteur :** un seul écouteur de défilement passif (`src/components/motion/ScrollEffects.tsx`) écrit `--fx` sur les éléments `data-scroll-fx` ; le CSS transforme ce nombre en rotations 3D. Aucun détournement du défilement, aucune bibliothèque externe chargée depuis un CDN (important pour la Chine continentale) : three.js est inclus dans le build et **chargé seulement à l'approche de la section 3D** (≈ 145 Ko gzip).

**Accessibilité et performances :**
- « Réduire les animations » : pas de WebGL, pas de vidéo, une image fixe de la bouteille ; tous les textes restent lisibles.
- Sans JavaScript : les 4 textes et l'image fixe s'affichent.
- La scène 3D ne calcule que lorsqu'elle est visible et s'arrête dans un onglet en arrière-plan ; qualité réduite sur mobile.
- Les vidéos (`preload="none"`) ne se téléchargent qu'à l'approche de leur section, sont muettes, en pause hors écran et désactivées en mode « économie de données ». WebM + MP4 + image d'attente.
- Mention « 3D 示意动画，非产品照片 / 3D illustration, not a product photo » affichée sur la scène.

**Images et vidéos générées par code** (aucune banque d'images, aucun droit tiers) :
- `public/images/3d/` : olives (verte, tournante, mûre), feuilles, rameau, goutte d'huile, bouteille 750 ml — rendus three.js, WebP transparent, 5 à 30 Ko chacun.
- `public/images/3d/label-750ml.webp` : l'étiquette **officielle** extraite de `product-750ml.webp` et « déroulée » pour envelopper la bouteille 3D (`scripts/media/extract-label.py`).
- `public/media/liquid-gold.{webm,mp4}` (≈ 1,2–1,4 Mo, 8 s) et `grove-light.{webm,mp4}` (≈ 0,5–0,7 Mo, 10 s), boucles parfaites + posters.

**Régénérer les médias** (facultatif) : `python3 scripts/media/extract-label.py` puis `node scripts/media/render-media.mjs` (ou `… sprites`, `… liquid-gold`, `… grove-light`, `--preview` pour une seule image dans `scripts/media/preview/`). Nécessite Chromium de Playwright (`npx playwright install chromium`) et `ffmpeg` (libx264, libvpx-vp9, libwebp). Les réglages des scènes sont dans `scripts/media/scenes/`.

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

## 9. Vérifier le projet

```bash
npm ci
npx playwright install chromium   # une seule fois, pour les tests navigateur
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
npm run verify:static
npx tsx scripts/update-prices.ts --check
```

Les réponses EmailJS sont simulées dans les tests, sans envoi réel. Pour vérifier les fichiers exportés eux-mêmes, servir `dist/` avec un serveur statique et définir `PLAYWRIGHT_BASE_URL` : [instructions](docs/STATIC_DEPLOYMENT.md). Le build remplace `dist/` : synchroniser d'abord les JSON de configuration déployés vers `public/config/`.

Les anciens rapports datés dans `docs/` décrivent leurs propres révisions et ne constituent pas une preuve du statut actuel du déploiement Netlify ou de réception des emails.

## 10. Licence et ressources

Code et ressources transmis pour l'usage du projet GANLAN GOLD, sous réserve des droits réels sur les photos, illustrations et marques. Aucune certification ou autorisation réglementaire n'est présumée acquise.
