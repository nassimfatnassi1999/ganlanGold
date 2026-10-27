# Déploiement statique — Netlify et Alibaba Cloud OSS Hong Kong

## Installation et build reproductible

Node.js 22 et npm ; les dépendances exactes sont dans `package-lock.json`.

```bash
npm ci
npm run dev
```

Le serveur local est normalement `http://localhost:3000`. Le site s'ouvre en chinois, avec un sélecteur anglais dont le choix est conservé dans le navigateur. EmailJS est désactivé par défaut ; aucune variable ni `.env.local` n'est nécessaire.

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
NEXT_PUBLIC_SITE_URL=https://ganlan.netlify.app npm run build
npm run verify:static
```

Utiliser l'origine HTTPS réellement déployée pour `NEXT_PUBLIC_SITE_URL` si le domaine change, puis reconstruire pour mettre à jour les liens SEO, `robots.txt` et `sitemap.xml`. Ce paramètre SEO est indépendant d'EmailJS.

Pour reproduire le build sans EmailJS, partir d'un checkout neuf avec le JSON par défaut et aucun fichier `.env*` local, puis :

```bash
env -u NEXT_PUBLIC_EMAILJS_PUBLIC_KEY \
    -u NEXT_PUBLIC_EMAILJS_SERVICE_ID \
    -u NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID \
    -u NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID \
    npm run build
```

Si des fichiers `.env.local` ou `.env.production*` contiennent ces valeurs, les écarter temporairement et les restaurer après le test : `env -u` seul n'empêche pas Next de les relire.

Next.js utilise `output: "export"`, `trailingSlash: true` et des images non optimisées par un serveur. `next build` génère `out/`, puis `scripts/copy-out-to-dist.mjs` remplace `dist/` et `scripts/check-dist.mjs` contrôle le résultat. Une configuration EmailJS désactivée est valide en production.

```text
dist/
├── index.html
├── 404.html
├── _next/
├── images/
├── config/
│   ├── emailjs.json
│   └── prices.json
├── privacy/index.html
├── legal/index.html
├── terms/index.html
├── robots.txt
├── sitemap.xml
├── _headers
└── .htaccess
```

Les fichiers Next supplémentaires (`index.txt`, etc.) font partie de l'export et doivent aussi être conservés. Aucune fonction Netlify, API applicative, base de données, session serveur ou exécution Node n'est nécessaire pour servir ce dossier. Les hébergeurs autres que Netlify/Apache ignorent `_headers` / `.htaccess` ; les règles de cache doivent y être configurées séparément.

## Netlify

Le dépôt contient `netlify.toml` :

- Branche de production existante : `main`.
- Build command : `npm run build`.
- Publish directory : `dist`.
- Node : `22`.
- `NETLIFY_NEXT_PLUGIN_SKIP=true` : exporter des fichiers statiques, sans adaptateur serveur.
- `NEXT_PUBLIC_SITE_URL=https://ganlan.netlify.app` en contexte production ; ajuster si le domaine public change.

Conserver le lockfile dans Git. Aucune variable EmailJS n'est obligatoire dans les réglages Netlify et aucun `.env.local` n'est attendu. Ne pas ajouter de redirection SPA globale `/* /index.html 200` : les routes légales possèdent leurs propres fichiers HTML. `public/_headers`, copié dans `dist/_headers`, définit le cache des JSON pour les builds Git et les publications manuelles.

Pousser sur la branche déclenche le pipeline si le dépôt est connecté. Vérifier le journal de déploiement, le commit réellement publié, puis `/`, `/privacy/`, `/legal/`, `/terms/`, `/config/prices.json` et `/config/emailjs.json` sur le domaine public. Le statut Git/push ne prouve pas que Netlify a déployé le nouveau commit.

Pour un téléversement manuel sans compilation, publier tout le contenu de `dist/` via le mécanisme de déploiement statique de Netlify. Voir [documentation Netlify](https://docs.netlify.com/frameworks/) et [adaptateur officiel et option de désactivation](https://github.com/opennextjs/opennextjs-netlify/blob/main/src/index.ts).

## Alibaba Cloud OSS — Hong Kong

Le même `dist/` est utilisable sans modification du JavaScript.

1. Créer/utiliser un bucket dans la région **China (Hong Kong)**, identifiant `oss-cn-hongkong`. Configurer l'accès public en lecture aux seuls objets du site ; ne pas rendre le bucket modifiable publiquement.
2. Activer l'hébergement de site statique : page d'accueil `index.html`, page d'erreur `404.html`, code d'erreur HTTP **404**.
3. Activer **Subfolder Homepage** et choisir la règle **Redirect** pour les sous-dossiers. Ainsi `/privacy/` sert `privacy/index.html` et `/privacy` redirige vers `/privacy/`. Même principe pour `/legal/` et `/terms/`. Sans cette option, OSS peut renvoyer l'accueil racine pour les sous-dossiers.
4. Téléverser **le contenu** de `dist/` à la racine du bucket, pas un dossier englobant `dist`. Conserver `_next/`, `images/`, `config/`, les sous-dossiers légaux et tous les fichiers exportés.
5. Associer un domaine personnalisé au bucket, configurer son DNS et HTTPS via l'offre OSS/CDN utilisée. La documentation OSS précise que l'accès HTML par le domaine natif du bucket peut provoquer un téléchargement ; vérifier le rendu avec le domaine personnalisé.
6. Vérifier les types MIME : HTML `text/html`, CSS `text/css`, JS `application/javascript`, JSON `application/json`, XML `application/xml`, WebP/AVIF/SVG/PNG selon l'image. Conserver l'encodage UTF-8 pour les contenus textuels chinois.
7. Sur `config/emailjs.json` **et** `config/prices.json`, définir les métadonnées objet `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`. Si un CDN est utilisé, désactiver son cache sur `/config/*` et purger ces chemins après modification. `_headers` et `.htaccess` n'appliquent aucune règle sur OSS.
8. Garder le HTML revalidable ; les ressources hachées `_next/static/*` peuvent utiliser un cache long. Après un déploiement complet, vérifier les liens et vider le cache HTML/CDN si nécessaire.
9. Tester accueil, routes légales en accès direct, images/QR, prix, navigation mobile et langue. Tester le formulaire désactivé, puis les deux modèles après configuration avec autorisation des destinataires. Tester l'accès sur les réseaux réellement utilisés par les acheteurs ; l'hébergement Hong Kong ne garantit pas l'accès aux services tiers.

Référence : [hébergement statique OSS, règles de sous-dossier et domaine personnalisé](https://www.alibabacloud.com/help/en/oss/user-guide/hosting-static-websites). Aucun compte OSS n'est configuré par ce dépôt ; ce guide décrit les réglages requis, pas un déploiement OSS déjà exécuté.

## Modifier EmailJS ou les prix sans build

EmailJS : remplacer l'objet `config/emailjs.json` selon [EMAILJS_OPTIONAL_CONFIGURATION.md](EMAILJS_OPTIONAL_CONFIGURATION.md). Une prochaine soumission relit le fichier.

Prix : modifier `dist/config/prices.json` et téléverser le même chemin. Conserver exactement les quatre références, avec `cny` entier positif et `usd` chaîne décimale à deux chiffres :

```json
{
  "250ml": { "cny": 29, "usd": "4.00" },
  "500ml": { "cny": 49, "usd": "7.30" },
  "750ml": { "cny": 69, "usd": "10.10" },
  "5l": { "cny": 259, "usd": "38.50" }
}
```

Les devises restent indépendantes et manuelles. Sur Netlify, republier un instantané complet de `dist/` modifié, sans rebuild ; sur OSS, remplacer seulement les objets JSON. Synchroniser les fichiers déployés vers `public/config/` avant la prochaine reconstruction afin de conserver ces modifications.

## Tester les fichiers exportés localement

Après le build, utiliser par exemple Python 3 comme simple serveur de fichiers :

```bash
python3 -m http.server 4173 --directory dist
```

Dans un autre terminal :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:e2e -- --workers=1
```

Le mode séquentiel évite de saturer la petite file de connexions du serveur Python de démonstration. Ces tests s'exécutent alors contre des fichiers statiques, sans `next dev`, backend ou appel réel à EmailJS. Une réponse 404 en production doit aussi être vérifiée sur l'hébergeur ; le serveur de développement Python n'utilise pas automatiquement le fichier `404.html` personnalisé.
