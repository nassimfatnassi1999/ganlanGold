# EmailJS facultatif — configuration après déploiement

Le site vitrine fonctionne en production sans compte EmailJS, sans variable EmailJS et sans serveur applicatif. Les formulaires gardent leur validation, le consentement, leurs champs et les alternatives WhatsApp/WeChat. Quand l'envoi automatique est indisponible, un message chinois/anglais l'indique, sans annoncer de succès ni effacer la demande. La copie du message préparé permet un envoi manuel.

## Source de configuration unique dans le navigateur

`public/config/emailjs.json` est copié dans `dist/config/emailjs.json` lors de `npm run build`. Le navigateur lit uniquement `/config/emailjs.json`, à chaque soumission valide, avec `cache: "no-store"` et un délai maximal de 10 secondes. Les requêtes simultanées partagent seulement leur chargement en cours ; aucune configuration n'est conservée indéfiniment en mémoire. Aucun identifiant EmailJS n'est intégré au bundle React depuis les variables d'environnement.

Configuration par défaut, prête pour la production :

```json
{
  "enabled": false,
  "publicKey": "",
  "serviceId": "",
  "quoteTemplateId": "",
  "visitTemplateId": ""
}
```

Un fichier absent, une erreur réseau, du JSON malformé, un champ supplémentaire, un `enabled` qui n'est pas un booléen ou des identifiants incomplets en mode activé donnent ce même repli désactivé. Le site reste accessible. `enabled: false` empêche toujours un appel au fournisseur, même lorsque les quatre identifiants sont présents.

## Activer plus tard sans reconstruire

1. Préparer le service EmailJS et les deux modèles existants : [réglages du compte](EMAILJS_SETUP.md), [templates et variables](../emailjs-templates/README.md). Conserver les destinataires dans le tableau de bord EmailJS et autoriser les origines réellement utilisées.
2. Remplacer seulement `dist/config/emailjs.json` par :

   ```json
   {
     "enabled": true,
     "publicKey": "MY_PUBLIC_KEY",
     "serviceId": "MY_SERVICE_ID",
     "quoteTemplateId": "MY_QUOTE_TEMPLATE_ID",
     "visitTemplateId": "MY_VISIT_TEMPLATE_ID"
   }
   ```

   Utiliser les véritables identifiants publics du compte ; les deux modèles doivent être distincts. Les cinq propriétés sont obligatoires. `enabled` est un booléen JSON, sans guillemets. Les identifiants acceptent lettres, chiffres, tirets et underscores, jusqu'à 200 caractères ; les placeholders `YOUR_…`, `example`, `placeholder`, etc. sont rejetés.
3. Sur Alibaba Cloud OSS, remplacer l'objet `config/emailjs.json`, avec `Content-Type: application/json` et `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`. Purger ce chemin dans un éventuel CDN. Aucun build ni envoi des autres fichiers n'est nécessaire.
4. Sur Netlify, publier un nouveau déploiement statique contenant le `dist/` complet et le JSON modifié. Un déploiement Netlify est un instantané immuable : ne déposer **pas seulement le JSON** dans un nouveau déploiement, au risque de supprimer les autres fichiers du site. Le bundle JavaScript reste identique et aucun rebuild n'est nécessaire. Les règles `_headers` incluses empêchent le cache des fichiers `/config/*`.
5. La prochaine soumission relit la configuration, même dans un onglet déjà ouvert. Tester les deux formulaires avec accord du destinataire, puis vérifier les demandes dans l'historique EmailJS et la boîte de réception. Le succès de l'interface confirme uniquement l'acceptation par EmailJS.

Pour désactiver immédiatement : modifier `enabled` à `false` et republier le JSON de la même manière. Les valeurs peuvent rester dans le fichier. Ne jamais y mettre de clé privée, mot de passe SMTP, jeton d'administration ou fichier `.env.local`.

## Variables locales facultatives et priorité

Le générateur `scripts/generate-emailjs-config.mjs` s'exécute via `predev` et `prebuild`. Il ne bloque jamais la compilation pour des identifiants absents, incomplets ou placeholders. Une erreur réelle de disque ou une erreur Next.js reste une erreur de build.

Ordre de priorité :

1. Un JSON public valide **activé**, ou **désactivé avec au moins un identifiant renseigné**, est considéré comme fourni délibérément : il reste intact et a priorité sur l'environnement, y compris sur des valeurs vides.
2. Le JSON par défaut (`enabled: false`, quatre chaînes vides), un fichier absent ou invalide peut être initialisé depuis quatre variables publiques complètes et valides. L'ordre Next est : environnement du processus, `.env.production.local` / `.env.development.local`, `.env.local`, `.env.production` / `.env.development`, `.env`. En mode test, `.env.local` est ignoré.
3. Sinon, le générateur écrit le JSON désactivé par défaut.

Un JSON entièrement vide est donc le fichier d'initialisation, pas une instruction prioritaire sur des variables valides. Pour imposer une désactivation malgré des variables encore configurées, garder les identifiants dans le JSON et mettre `enabled: false`, ou retirer les variables. Pour régénérer depuis de nouvelles variables après une première initialisation, remettre d'abord le JSON public à sa valeur par défaut. Il n'y a aucun repli sur l'environnement dans le navigateur.

`.env.example` contient les quatre variables vides :

```dotenv
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID=
```

Les copier dans `.env.local` uniquement si nécessaire, sans écraser des valeurs existantes. Le générateur publie uniquement `enabled` et ces quatre identifiants, jamais les autres variables ni les fichiers `.env*`. `.env.local` reste ignoré par Git.

Avant une reconstruction complète, récupérer le JSON actuellement déployé dans `public/config/emailjs.json`, et les prix dans `public/config/prices.json`. Le build remplace `dist/` par l'export des sources : une modification faite uniquement dans `dist/` ou sur l'hébergeur doit donc être resynchronisée.

## Vérification des formulaires

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
npm run verify:static
```

Les tests unitaires et Playwright couvrent le mode désactivé, les erreurs de configuration, les deux langues, les deux modèles et l'activation lors d'une soumission suivante. Les réponses du fournisseur sont simulées ; aucun email réel n'est envoyé. Les tests vérifient aussi le consentement, la conservation des champs en cas d'erreur, le verrou partagé contre les doublons, le délai de 30 secondes entre tentatives fournisseur et le succès après acceptation seulement. Un envoi qui reste en attente après 20 secondes est signalé comme non confirmé ; les données sont conservées et le verrou reste actif jusqu'à la résolution de la requête SDK.

Pour tester l'export seul, servir `dist/` avec un serveur statique et définir `PLAYWRIGHT_BASE_URL` avant `npm run test:e2e` ; voir [déploiement statique](STATIC_DEPLOYMENT.md). `build:preview` reste un alias de `build` pour compatibilité : une vitrine sans EmailJS est désormais une livraison de production valide.
