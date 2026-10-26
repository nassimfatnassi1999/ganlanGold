# GANLAN GOLD — Site vitrine B2B (édition statique Gandi)

**Projet corrigé le 25 octobre 2026**, à partir du projet livré et du cahier des charges `GANLAN_GOLD_Website_Developer_Specification_EN_V7.pdf`.

Site premium destiné aux importateurs professionnels d'huile d'olive marocaine, avec **chinois simplifié par défaut et interface anglaise complète sélectionnable**. Le choix `中文 | EN` est mémorisé localement dans le navigateur. Le site est **statique**, sans base de données, Prisma, PostgreSQL, back-office, API applicative ni conversion de devises en temps réel.

## 1. Livraison

Deux versions se trouvent dans cette archive :

- **`dist/`** — site statique *précompilé*, prêt à déposer à la racine de votre hébergement web **Gandi**. Fonctionne sans processus Node.js sur le serveur.
- **`src/`, `public/`, `package.json`, `next.config.ts`** — code source Next.js/React/TypeScript permettant de modifier les contenus et de reconstruire la version statique.

Le panorama d'accueil utilise **la dernière image GANLAN GOLD sans titre à gauche**, avec quatre conditionnements, montagnes et oliveraies ; les titres chinois/anglais et boutons sont de vrais éléments HTML, non intégrés dans l'image.

Toutes les images publiées sont centralisées dans `public/images/`. Les visuels produits et les QR codes issus de la spécification y sont conservés dans leurs formats web utiles ; les originaux de travail et leurs doublons ne font pas partie du projet nettoyé.

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

Compilation pour Gandi après une modification du code, du design ou des textes :

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

## 5. Formulaires et absence de backend

La spécification V7 demandait des formulaires de demande de devis et de visite. La version statique conserve les champs, la validation de base et le consentement, mais **ne peut pas envoyer, recevoir ou enregistrer des demandes sur un serveur sans backend, prestataire tiers ou adresse e-mail de réception**.

La solution mise en place évite de simuler un envoi :

- Le visiteur remplit et valide sa demande.
- Le site prépare un **message récapitulatif** (produits/quantités, port, société, contact, etc.).
- Le visiteur clique sur **WhatsApp** pour adresser sa demande à **Lassad** (devis) ou à **Fouad** (visite), ou **copie le texte** pour l'envoyer via WeChat.
- **Aucune demande n'est automatiquement reçue** par le site ; aucun identifiant de requête fictif n'est généré.

**Attention Chine continentale :** WhatsApp peut être inaccessible ; le QR code WeChat et la copie manuelle du message sont les alternatives prévues. Si le client souhaite ultérieurement un formulaire transmis automatiquement, il faut choisir une solution de réception (email/service de formulaire) et mettre à jour la notice de confidentialité.

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
| Invitation à la visite / formulaire | Oui ; transmission à effectuer via messagerie |
| Export, Incoterms FOB/FCA, exclusions, documents | Oui |
| Contacts Gisèle, Lassad, Fouad dans cet ordre | Oui |
| QR WeChat réels de Lassad et Fouad | Oui ; tests réels indispensables |
| Formulaire de devis | Oui ; **préparation du message, pas réception automatique** |
| Pages confidentialité / mentions légales / conditions | Oui ; **textes à valider** |
| SEO chinois, métadonnées, responsive | Oui ; vérifier le domaine de production |
| Back-office, taux ECB, conversion automatique | **Supprimés sur instruction du client** |
| PostgreSQL, Prisma, API Node | **Non requis et retirés** |

Les valeurs initiales sont livrées dans `dist/config/prices.json` et peuvent être remplacées sans modifier le HTML du site.

## 7. Images et performances

Le site ne charge aucune image depuis la racine du dépôt : toutes les ressources visuelles d’exécution se trouvent sous `public/images/`.

- `public/images/hero/` : panorama sans texte fixe, formats WebP/AVIF, déclinaison desktop/mobile.
- `public/images/products/` : quatre visuels de produits séparés en WebP.
- `public/images/qr/` : QR officiels WeChat en PNG non redessinés.
- `public/images/groves/` : visuel vertical net des oliveraies marocaines pour la section Origine. Le nouveau fichier `moroccan-groves-sharp.webp` est un recadrage exact, non agrandi, du panorama approuvé, sans emballage ni texte, compressé à 177 Ko.
- `public/images/brand/` : motif SVG décoratif utilisé par l’interface.

Les photos produits extraites du PDF restent limitées par la résolution d'origine. Une version HD validée doit les remplacer avant campagne commerciale de grande taille, si disponible.

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

## 9. Tests effectués dans l'environnement de préparation

Vérifications réussies le 26 octobre 2026 :

```bash
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

- 30 tests Playwright réussis ; 6 variantes volontairement ignorées quand la matrice desktop couvre déjà les mêmes préférences.
- Contrôle réel des largeurs `320`, `375`, `390`, `430`, `768`, `1024` et `1440` px, sans débordement horizontal ni image cassée.
- Contrôle du changement de langue, de sa persistance, des formulaires, des pages légales, du clavier et de `prefers-reduced-motion`.
- Export Next.js statique réussi pour `/`, `/privacy`, `/legal`, `/terms`, `/robots.txt` et `/sitemap.xml`.
- Validation de `dist/` : configuration runtime de 4 prix valide, aucune valeur monétaire figée dans le HTML, une seule section MOQ, contacts vérifiés et absence d'interface admin/base de données/taux automatique.
- Test fumée Chromium du site réellement servi depuis `dist/` à 390 px : chinois initial, bascule anglaise et largeur de document conformes.

## 10. Licence et ressources

Code et ressources transmis pour l'usage du projet GANLAN GOLD, sous réserve des droits réels sur les photos, illustrations et marques. Aucune certification ou autorisation réglementaire n'est présumée acquise.
