# GANLAN GOLD — Site vitrine B2B statique — Netlify / Alibaba Cloud OSS / Gandi

**Projet mis à jour le 27 octobre 2026**, à partir du projet livré et du cahier des charges `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`.

Site premium destiné aux importateurs professionnels d'huile d'olive marocaine, avec **chinois simplifié par défaut et interface anglaise complète sélectionnable**. Le choix `中文 | EN` est mémorisé localement dans le navigateur. Le site est **statique**, sans base de données, Prisma, PostgreSQL, back-office, API applicative ni conversion de devises en temps réel.

## 1. Livraison

Deux versions se trouvent dans cette archive :

- **`dist/`** — export statique de production pour Netlify, Alibaba Cloud OSS Hong Kong ou Gandi, sans processus Node.js sur le serveur. Les quatre identifiants publics EmailJS sont intégrés au JavaScript depuis `src/config/env.ts`. Si la configuration est incomplète, la vitrine et les formulaires avec contact manuel restent disponibles. Toute modification des identifiants exige un nouveau build et déploiement.
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

Optionnel, renseigner l'URL publique *avant* le build pour les métadonnées SEO :

```bash
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld npm run build
```

Ce domaine est un exemple : **n'utilisez pas une fausse URL en production**.

## 4. Déploiement Netlify, Alibaba Cloud OSS et Gandi

**Netlify** : le fichier `netlify.toml` définit `npm run build` et le dossier publié `dist`. Aucune variable EmailJS n'est requise. **Alibaba Cloud OSS Hong Kong** : téléverser le contenu de `dist/`, activer les index de sous-dossiers et configurer le cache des JSON. Les étapes complètes figurent dans [docs/STATIC_DEPLOYMENT.md](docs/STATIC_DEPLOYMENT.md).

1. Dans Gandi, associer le domaine à un hébergement web prenant en charge les **fichiers HTML/CSS/JS statiques**, et activer **HTTPS**.
2. Envoyer **le contenu de `dist/`** (et non le dossier lui-même) dans le répertoire racine web du domaine — souvent `htdocs/`, `www/` ou un répertoire défini par l'offre Gandi.
3. Vérifier la présence à la racine de `index.html`, `static/site.css` ou de la feuille CSS exportée, `images/`, `privacy/`, `legal/` et `terms/`.
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

## 9. Vérifier le projet

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run test:e2e
NEXT_PUBLIC_SITE_URL=https://ganlan.netlify.app npm run build
npm run verify:static
```

Les réponses EmailJS sont simulées dans les tests, sans envoi réel. Pour vérifier les fichiers exportés eux-mêmes, servir `dist/` avec un serveur statique et définir `PLAYWRIGHT_BASE_URL` : [instructions](docs/STATIC_DEPLOYMENT.md). Le build remplace `dist/` : synchroniser d'abord les JSON de configuration déployés vers `public/config/`.

Les anciens rapports datés dans `docs/` décrivent leurs propres révisions et ne constituent pas une preuve du statut actuel du déploiement Netlify ou de réception des emails.

## 10. Licence et ressources

Code et ressources transmis pour l'usage du projet GANLAN GOLD, sous réserve des droits réels sur les photos, illustrations et marques. Aucune certification ou autorisation réglementaire n'est présumée acquise.
