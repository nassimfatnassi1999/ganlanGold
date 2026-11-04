# Modifications du 4 novembre 2026 — prix fiables et mise à jour quotidienne

## Ce qui ne marchait pas

Sur certains PC, les quatre cartes affichaient « 价格暂不可用 / Price temporarily unavailable ».

**Cause constatée en direct :** le CDN Tencent EdgeOne servait encore aux navigateurs une **copie compressée de l'ancienne page d'accueil (2 novembre)**.
Cette ancienne page charge l'ancien JavaScript, qui exigeait **exactement 2 champs** par produit (`cny`, `usd`).
Le nouveau `config/prices.json` (3 champs : `cny`, `usd`, `eur`) était donc refusé.
Selon le nœud EdgeOne et la copie reçue, un PC voyait les prix et un autre non.

Ce n'était ni la permission COS, ni le CORS, ni le format du JSON en ligne (il est valide).

**À faire tout de suite, même avant d'installer cette version :** console EdgeOne → Purge cache → type *Hostname* `www.ganlangold.com` → méthode *Delete*. Détails : [docs/TENCENT_COS_EDGEONE.md](docs/TENCENT_COS_EDGEONE.md).

Deux autres problèmes trouvés en ligne :

- la balise canonique, `robots.txt` et `sitemap.xml` pointaient vers `http://localhost:3000` (build fait sans URL de site) : mauvais pour le référencement Baidu/Google ;
- `https://ganlangold.com` (sans www) ne répond pas en HTTPS (seul `http://` redirige vers `www`).

## Fichiers modifiés

| Fichier | Modification | Pourquoi |
|---|---|---|
| `src/lib/prices.ts` | Lecture **tolérante** côté navigateur : clés/champs inconnus ignorés, nombres avec ou sans guillemets, `750ML`/`5L` reconnus, produit par produit. Délai de 8 s et 2 nouvelles tentatives. Nouvelle validation **stricte** `findPriceFileErrors` (messages en français) utilisée avant toute publication. | Une page ancienne en cache ne casse plus l'affichage quand le fichier de prix évolue. Une erreur sur un produit n'efface plus les trois autres. Une coupure réseau passagère ne montre plus « indisponible ». |
| `src/components/products/ProductShowcase.tsx` | Gère un prix manquant sur une seule carte ; affiche USD ou EUR seulement s'il existe ; un délai dépassé affiche « indisponible » au lieu de « chargement… » sans fin. Suppression de la fonction `RateNote`, devenue inutilisée depuis votre commit « remove converted ». | Robustesse ; code mort. |
| `src/lib/seo/site-url.ts` | Domaine par défaut : `https://www.ganlangold.com` (au lieu de `http://localhost:3000`). | Canonique, sitemap et robots corrects même si l'on oublie `NEXT_PUBLIC_SITE_URL`. |
| `scripts/check-dist.mjs` | Utilise la même validation stricte ; refuse un build contenant `localhost:3000`. | Une seule règle partout. |
| `tests/unit/prices.test.ts`, `tests/e2e/prices.spec.ts` | Tests adaptés et ajoutés : tolérance, produit par produit, nouvelle tentative, validation stricte, en-têtes de cache, URL du site. Retrait des vérifications de la ligne de taux supprimée. | Couvrir le nouveau comportement. |
| `README.md`, `docs/STATIC_DEPLOYMENT.md` | Section prix réécrite ; renvoi vers le guide Tencent. | Documentation à jour. |
| `dist/` | Reconstruit avec ce code (`npm run build`). | Prêt à envoyer sur COS. |

## Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `.github/workflows/update-prices.yml` | **Formulaire « Mettre à jour les prix »** dans l'onglet Actions de GitHub : saisir les prix CNY → vérification → USD/EUR au taux BCE → enregistrement Git → envoi sur COS → vidage du cache EdgeOne. Tourne aussi chaque jour ouvré pour actualiser USD/EUR de secours. |
| `.github/workflows/deploy.yml` | Déploiement automatique du site complet à chaque `git push` sur `main` : tests, build, envoi sur COS avec les bons en-têtes de cache, vidage EdgeOne. |
| `scripts/update-prices.ts` | Outil en ligne de commande utilisé par le formulaire : `npx tsx scripts/update-prices.ts --750ml 45`. N'écrit jamais un fichier invalide. |
| `scripts/tencent/deploy.mjs`, `cache-rules.mjs`, `package.json`, `package-lock.json` | Envoi sur COS (SDK officiels Tencent, versions figées) et vidage EdgeOne. Ressources d'abord, pages ensuite ; anciens fichiers conservés. Simulation : `node scripts/tencent/deploy.mjs site --dry-run` (après `npm ci --prefix scripts/tencent`). |
| `outils/editeur-prix.html` | Éditeur hors ligne (double-clic) : saisir les prix, calculer USD/EUR, télécharger un `prices.json` toujours valide. Méthode sans GitHub. Non publié sur le site. |
| `docs/TENCENT_COS_EDGEONE.md` | Diagnostic, purge immédiate, règles de cache EdgeOne, création de la clé API limitée, secrets GitHub, domaine sans www. |
| `MODIFICATIONS.md` | Ce fichier. |

Le format de `config/prices.json` **ne change pas** : le fichier actuellement en ligne reste valide pour l'ancienne et la nouvelle version du site.

## Mise en service, dans l'ordre

1. **Vider le cache EdgeOne** (Hostname `www.ganlangold.com`, méthode *Delete*). Cela suffit déjà à réparer l'affichage des prix.
2. Remplacer le contenu du dépôt GitHub par cette version (ou copier les fichiers), puis `git push`.
3. Envoyer le contenu de `dist/` à la racine du bucket COS (sans supprimer les anciens fichiers), puis **vider à nouveau le cache EdgeOne**.
   Ou, une fois la section 4 du guide faite : Actions → **Déployer le site** → Run workflow (envoi + purge automatiques).
4. Régler une fois les règles de cache EdgeOne (section 2 du guide) pour que les pages HTML ne restent plus en cache.
5. Ensuite, pour changer les prix : Actions → **Mettre à jour les prix** → Run workflow.

## Vérifications effectuées

- `npm test` : 30 tests réussis (dont 14 dans `tests/unit/prices.test.ts` : prix, taux, URL du site, en-têtes de cache).
- `npm run typecheck`, `npm run lint` : sans erreur.
- `npm run build` + `npm run verify:static` : réussis, canonique `https://www.ganlangold.com/`.
- Tests navigateur sur le `dist/` reconstruit : 125 réussis, 7 ignorés volontairement (prévus pour un seul format d'écran).
- Script de prix : prix valides acceptés, `3.5` et produit inconnu refusés, taux BCE réel récupéré.
- Éditeur hors ligne testé dans Chromium : saisie invalide bloquée, fichier téléchargé conforme à la validation stricte.
- Script COS/EdgeOne : simulation complète ; appels réels avec une fausse clé → réponses « clé inconnue » de COS et d'EdgeOne, donc requêtes bien formées.

**Non testé ici** (nécessite vos accès Tencent et GitHub) : un envoi réel sur COS, une purge EdgeOne réelle et l'exécution des workflows sur GitHub. Faire le premier lancement en surveillant l'onglet Actions.
