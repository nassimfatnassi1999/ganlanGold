# Déploiement statique — Netlify et Alibaba Cloud OSS Hong Kong

## Installation et build reproductible

Node.js 22 et npm ; les dépendances exactes sont dans `package-lock.json`.

```bash
npm ci
npm run dev
```

Le serveur local est normalement `http://localhost:3000`. Le site s'ouvre en chinois, avec un sélecteur anglais dont le choix est conservé dans le navigateur. Les identifiants publics EmailJS sont dans `src/config/env.ts` ; aucune variable EmailJS ni `.env.local` n’est nécessaire.

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
NEXT_PUBLIC_SITE_URL=https://ganlan.netlify.app npm run build
npm run verify:static
```

Utiliser l'origine HTTPS réellement déployée pour `NEXT_PUBLIC_SITE_URL` si le domaine change, puis reconstruire pour mettre à jour les liens SEO, `robots.txt` et `sitemap.xml`. Ce paramètre SEO est indépendant d'EmailJS.

`npm run build` utilise les quatre identifiants publics de `EMAILJS_CONFIG` dans `src/config/env.ts`, sans configuration EmailJS sur la plateforme. Les placeholders désactivent seulement l’envoi automatique. Toute modification de ces identifiants exige une reconstruction complète et un nouveau déploiement.

Next.js utilise `output: "export"`, `trailingSlash: true` et des images non optimisées par un serveur. `next build` génère `out/`, puis `scripts/copy-out-to-dist.mjs` remplace `dist/` et `scripts/check-dist.mjs` contrôle le résultat. Une configuration EmailJS incomplète reste valide pour une vitrine de production avec contact manuel.

```text
dist/
├── index.html
├── 404.html
├── _next/
├── images/
├── config/
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

Pousser sur la branche déclenche le pipeline si le dépôt est connecté. Vérifier le journal de déploiement, le commit réellement publié, puis `/`, `/privacy/`, `/legal/`, `/terms/`, `/config/prices.json` sur le domaine public. Le statut Git/push ne prouve pas que Netlify a déployé le nouveau commit.

Pour un téléversement manuel sans compilation, publier tout le contenu de `dist/` via le mécanisme de déploiement statique de Netlify. Voir [documentation Netlify](https://docs.netlify.com/frameworks/) et [adaptateur officiel et option de désactivation](https://github.com/opennextjs/opennextjs-netlify/blob/main/src/index.ts).

## Alibaba Cloud OSS — Hong Kong

Le même `dist/` est utilisable sans modification du JavaScript.

1. Créer/utiliser un bucket dans la région **China (Hong Kong)**, identifiant `oss-cn-hongkong`. Configurer l'accès public en lecture aux seuls objets du site ; ne pas rendre le bucket modifiable publiquement.
2. Activer l'hébergement de site statique : page d'accueil `index.html`, page d'erreur `404.html`, code d'erreur HTTP **404**.
3. Activer **Subfolder Homepage** et choisir la règle **Redirect** pour les sous-dossiers. Ainsi `/privacy/` sert `privacy/index.html` et `/privacy` redirige vers `/privacy/`. Même principe pour `/legal/` et `/terms/`. Sans cette option, OSS peut renvoyer l'accueil racine pour les sous-dossiers.
4. Téléverser **le contenu** de `dist/` à la racine du bucket, pas un dossier englobant `dist`. Conserver `_next/`, `images/`, `config/`, les sous-dossiers légaux et tous les fichiers exportés.
5. Associer un domaine personnalisé au bucket, configurer son DNS et HTTPS via l'offre OSS/CDN utilisée. La documentation OSS précise que l'accès HTML par le domaine natif du bucket peut provoquer un téléchargement ; vérifier le rendu avec le domaine personnalisé.
6. Vérifier les types MIME : HTML `text/html`, CSS `text/css`, JS `application/javascript`, JSON `application/json`, XML `application/xml`, WebP/AVIF/SVG/PNG selon l'image. Conserver l'encodage UTF-8 pour les contenus textuels chinois.
7. Sur `config/prices.json`, définir les métadonnées objet `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`. Si un CDN est utilisé, désactiver son cache sur `/config/*` et purger ces chemins après modification. `_headers` et `.htaccess` n'appliquent aucune règle sur OSS.
8. Garder le HTML revalidable ; les ressources hachées `_next/static/*` peuvent utiliser un cache long. Après un déploiement complet, vérifier les liens et vider le cache HTML/CDN si nécessaire.
9. Tester accueil, routes légales en accès direct, images/QR, prix, navigation mobile et langue. Tester les deux formulaires avec configuration et mocks ; vérifier les envois réels uniquement avec autorisation des destinataires. Tester l'accès sur les réseaux réellement utilisés par les acheteurs ; l'hébergement Hong Kong ne garantit pas l'accès aux services tiers.

Référence : [hébergement statique OSS, règles de sous-dossier et domaine personnalisé](https://www.alibabacloud.com/help/en/oss/user-guide/hosting-static-websites). Aucun compte OSS n'est configuré par ce dépôt ; ce guide décrit les réglages requis, pas un déploiement OSS déjà exécuté.

## Modifier EmailJS et les prix

EmailJS : modifier les quatre identifiants publics dans `src/config/env.ts`, exécuter `npm run build` et redéployer tout `dist/`, selon [EMAILJS_CONFIGURATION.md](EMAILJS_CONFIGURATION.md). Ne jamais modifier directement les fichiers JavaScript hachés.

Prix : la méthode recommandée (formulaire GitHub, éditeur hors ligne, Tencent COS + EdgeOne) est décrite dans [TENCENT_COS_EDGEONE.md](TENCENT_COS_EDGEONE.md). À défaut, modifier `dist/config/prices.json` et téléverser le même chemin. Conserver exactement les quatre références, avec `cny` entier positif et `usd` / `eur` chaînes décimales à deux chiffres :

```json
{
  "250ml": { "cny": 16, "usd": "2.35", "eur": "2.15" },
  "500ml": { "cny": 30, "usd": "4.40", "eur": "4.02" },
  "750ml": { "cny": 43, "usd": "6.30", "eur": "5.77" },
  "5l": { "cny": 220, "usd": "32.30", "eur": "29.50" }
}
```

Les équivalents USD et EUR sont convertis automatiquement depuis le CNY (taux BCE via `api.frankfurter.dev`) ; `usd` et `eur` ne servent que de repli si ce service est inaccessible. Tester l’affichage depuis les réseaux réellement utilisés par les acheteurs en Chine. Sur Netlify, republier un instantané complet de `dist/` modifié, sans rebuild ; sur OSS, remplacer seulement l’objet de prix JSON. Synchroniser les prix déployés vers `public/config/prices.json` avant la prochaine reconstruction afin de conserver ces modifications.

## Tester les fichiers exportés localement

Après le build, utiliser un simple serveur de fichiers local (`serve` est un outil de prévisualisation ; aucun processus Node.js n’est nécessaire sur OSS ou l’hébergement statique de production) :

```bash
cat > /tmp/ganlan-static-serve.json <<'JSON'
{"trailingSlash":true}
JSON
npx serve dist --config /tmp/ganlan-static-serve.json --listen 4173 --no-port-switching --no-clipboard
```

Dans un autre terminal :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:e2e -- --workers=1
```

Ces tests s’exécutent contre les fichiers exportés, sans `next dev`, backend ou appel réel à EmailJS. Vérifier aussi la page 404 sur l’hébergeur. Sur macOS, le serveur Python système 3.9 peut réinitialiser les connexions lors des chargements parallèles ; `serve` évite ce problème de prévisualisation.
