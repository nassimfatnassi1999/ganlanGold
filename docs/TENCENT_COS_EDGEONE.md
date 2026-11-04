# Tencent Cloud COS + EdgeOne — mise en ligne et mise à jour des prix

Le site public `https://www.ganlangold.com` est servi ainsi :

```text
Visiteur ──► EdgeOne (CDN Tencent, cache) ──► COS Hong Kong (bucket ganlangold-website-1520548234)
```

## 1. Pourquoi « 价格暂不可用 / Price temporarily unavailable » s'affichait (diagnostic du 4 novembre 2026)

Constaté en direct sur `https://www.ganlangold.com/` :

| Requête | Réponse EdgeOne |
|---|---|
| `/` **sans** compression | nouvelle page (Last-Modified 04/11/2026 08:43) |
| `/` **avec** compression gzip (tous les navigateurs) | **ancienne page du 02/11/2026** (cache HIT) |
| `/config/prices.json?v=…` | nouveau fichier, 3 champs `cny`, `usd`, `eur` (valide) |

L'ancienne page charge l'ancien JavaScript, qui exigeait **exactement 2 champs** par produit (`cny`, `usd`).
Le nouveau `prices.json` en a 3 : l'ancien code le refuse et affiche « prix indisponible ».
Selon le nœud EdgeOne et la copie (compressée ou non) reçue, un PC voyait le bon prix et un autre non.

Le fichier de prix, la permission COS et le CORS n'étaient **pas** en cause : le site lit le fichier sur son propre domaine.

### Correction immédiate (2 minutes, sans code)

1. Console EdgeOne → site **ganlangold.com** → **Cache** / **缓存配置** → **Purge cache** / **清除缓存**.
2. Type **Hostname** (主机名), valeur `www.ganlangold.com`.
3. Méthode **Delete** / **直接删除** (et non « Invalidate / 标记过期 ») : cela supprime aussi les copies compressées.
4. Valider, attendre 1 à 5 minutes, puis recharger le site dans une fenêtre privée.

À refaire **après chaque envoi manuel de pages HTML** sur COS. Le workflow GitHub (section 4) le fait automatiquement.

## 2. Réglages durables à faire une fois dans EdgeOne

Dans **Rule engine / 规则引擎** (ou **Cache rules / 缓存规则**), les libellés exacts peuvent varier selon la version de la console :

| Condition | Cache des nœuds (节点缓存 TTL) | Cache navigateur (浏览器缓存 TTL) |
|---|---|---|
| Extension `html` **ou** `txt` **ou** `xml`, et le chemin `/` | Ne pas mettre en cache / 不缓存 (ou « suivre l'origine ») | Suivre l'origine / 遵循源站 |
| Chemin `/config/*` | Ne pas mettre en cache / 不缓存 | Ne pas mettre en cache |
| Chemin `/_next/static/*` | 365 jours | Suivre l'origine |
| Reste (images) | Suivre l'origine / 遵循源站 | Suivre l'origine |

Les fichiers `_next/static/*` ont un nom unique à chaque build ; ils peuvent être gardés longtemps.
Les pages HTML gardent toujours le même nom : elles ne doivent jamais rester en cache sans vérification.

Vérifier aussi que la clé de cache **conserve les paramètres de requête** (query string). Le site appelle
`/config/prices.json?v=<horodatage>` pour qu'aucun cache ne renvoie d'ancien prix.

Le script de déploiement (section 4) pose en plus ces en-têtes sur chaque fichier COS :

| Fichiers | `Cache-Control` |
|---|---|
| `*.html`, `*.txt`, `*.xml` | `no-cache` (revalidé à chaque visite) |
| `config/prices.json` | `no-store, no-cache, must-revalidate, max-age=0` |
| `_next/static/*` | `public, max-age=31536000, immutable` |
| images | `public, max-age=604800` (7 jours) |

Les fichiers `_headers` (Netlify) et `.htaccess` (Apache/Gandi) n'ont **aucun effet** sur COS ou EdgeOne.

## 3. Mettre à jour les prix chaque jour — trois méthodes

| Méthode | Pour qui | Fiabilité |
|---|---|---|
| **A. Formulaire GitHub** (recommandée) | Toute personne ayant accès au dépôt GitHub, même sur téléphone | Valeurs vérifiées avant publication, historique Git, cache vidé automatiquement |
| **B. Éditeur hors ligne + console COS** | Sans GitHub | Fichier toujours valide ; envoi manuel |
| C. Éditer `prices.json` à la main | Dépannage | Risque d'erreur de syntaxe (virgule, guillemet) |

### Méthode A — formulaire GitHub (après la configuration de la section 4)

1. GitHub → dépôt **ganlanGold** → onglet **Actions** → **Mettre à jour les prix** → **Run workflow**.
2. Saisir les nouveaux prix en CNY, en nombres entiers. Laisser vide un prix qui ne change pas.
3. **Run workflow**. Environ une minute plus tard, le site affiche les nouveaux prix.

Le workflow :

- refuse une valeur invalide (`43.5`, `abc`, vide partout…) sans rien publier ;
- recalcule USD et EUR de secours au taux BCE du jour ;
- enregistre `public/config/prices.json` et `dist/config/prices.json` dans Git (qui a changé quoi, quand) ;
- envoie `config/prices.json` sur COS et vide le cache EdgeOne de `/config/`.

Il tourne aussi seul du lundi au vendredi pour actualiser les montants USD/EUR de secours (affichés quand le
taux BCE en direct est inaccessible au visiteur, par exemple depuis certains réseaux en Chine continentale).

### Méthode B — éditeur hors ligne

1. Ouvrir `outils/editeur-prix.html` dans un navigateur (double-clic ; aucun serveur nécessaire).
2. Facultatif : charger le `prices.json` actuel téléchargé depuis COS.
3. Saisir les prix CNY → **Calculer USD / EUR au taux BCE du jour** → **Télécharger prices.json**.
4. Console COS → bucket `ganlangold-website-1520548234` → dossier `config/` → **Upload** → remplacer `prices.json`.
5. Remplacer aussi `public/config/prices.json` dans le dépôt Git, sinon le prochain build remettra les anciens prix.

Aucune purge n'est nécessaire pour le seul fichier de prix : le site le demande avec un paramètre unique à chaque visite.

### En ligne de commande (développeur)

```bash
npx tsx scripts/update-prices.ts --250ml 16 --500ml 30 --750ml 45 --5l 220
```

```bash
npx tsx scripts/update-prices.ts --check
```

## 4. Configurer le déploiement automatique GitHub → COS → EdgeOne

À faire une seule fois, par la personne qui administre le compte Tencent Cloud.

### 4.1 Créer une clé API limitée (CAM)

Ne jamais utiliser la clé du compte principal.

1. Console Tencent Cloud → **CAM** → **Users** → **Create user** → utilisateur « programmatic access » nommé `github-ganlan-deploy`.
2. Lui attacher une stratégie personnalisée (**Policies → Create custom policy → Create by policy syntax**) :

```json
{
  "version": "2.0",
  "statement": [
    {
      "effect": "allow",
      "action": ["name/cos:PutObject"],
      "resource": ["qcs::cos:ap-hongkong:uid/1520548234:ganlangold-website-1520548234/*"]
    },
    {
      "effect": "allow",
      "action": ["teo:CreatePurgeTask"],
      "resource": ["*"]
    }
  ]
}
```

3. Récupérer la **SecretId** et la **SecretKey** de cet utilisateur (affichées une seule fois).
4. Console EdgeOne → site ganlangold.com → noter l'**ID du site** (`zone-…`).

### 4.2 Ajouter les secrets dans GitHub

Dépôt → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** :

| Secret | Valeur |
|---|---|
| `TENCENT_SECRET_ID` | SecretId de `github-ganlan-deploy` |
| `TENCENT_SECRET_KEY` | SecretKey de `github-ganlan-deploy` |
| `COS_BUCKET` | `ganlangold-website-1520548234` |
| `COS_REGION` | `ap-hongkong` |
| `EDGEONE_ZONE_ID` | `zone-…` |

Variables facultatives (onglet **Variables**) :

| Variable | Défaut | Quand la changer |
|---|---|---|
| `SITE_URL` | `https://www.ganlangold.com` | autre domaine principal |
| `SITE_HOSTS` | `www.ganlangold.com` | plusieurs domaines servis par EdgeOne, séparés par des virgules |
| `EDGEONE_ENDPOINT` | `teo.tencentcloudapi.com` | si le vidage échoue sur un compte du site international, essayer `teo.intl.tencentcloudapi.com` |

### 4.3 Premier lancement

1. **Actions** → **Déployer le site** → **Run workflow**.
2. Le workflow installe, teste, construit, envoie `dist/` sur COS (ressources d'abord, pages ensuite) puis vide le cache EdgeOne de `www.ganlangold.com`.
3. Ensuite, chaque `git push` sur `main` redéploie automatiquement (sauf documentation seule).

Sans secrets, les workflows réussissent quand même, avec un avertissement : rien n'est publié.

Les anciens fichiers de COS ne sont jamais supprimés : une page encore ouverte chez un visiteur peut en avoir besoin.

## 5. Domaine sans « www »

`http://ganlangold.com` redirige bien vers `https://www.ganlangold.com` (redirection Gandi),
mais **`https://ganlangold.com` ne répond pas** (connexion coupée, constaté le 04/11/2026).
Un visiteur qui tape ou reçoit un lien `https://ganlangold.com` voit une erreur.

Deux corrections possibles :

- Gandi → domaine → **Redirections web** : activer HTTPS sur la redirection `ganlangold.com` → `https://www.ganlangold.com` si l'offre le propose ;
- ou ajouter `ganlangold.com` comme domaine accéléré dans EdgeOne (certificat gratuit), avec un enregistrement ALIAS chez Gandi et une règle de redirection 301 vers `www`.

## 6. Vérifier après une mise en ligne

```bash
curl -sI -H "Accept-Encoding: gzip, br" https://www.ganlangold.com/ | grep -iE "last-modified|eo-cache-status|cache-control"
```

`last-modified` doit correspondre au dernier déploiement. Puis ouvrir le site en navigation privée :
les quatre prix doivent s'afficher. En cas de doute, F12 → **Network** → filtre `prices` : statut 200 attendu.
