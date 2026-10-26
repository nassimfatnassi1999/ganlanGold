# Configuration dynamique des prix — conception

## Intention

Permettre au propriétaire de modifier les quatre tarifs après déploiement en éditant un seul fichier dans `dist/`, sans reconstruire le site Next.js.

## Objectifs

- Charger les tarifs depuis `/config/prices.json` à chaque ouverture de page.
- Copier ce fichier vers `dist/config/prices.json` lors du dernier build initial.
- Permettre ensuite de remplacer uniquement ce fichier sur Gandi.
- Ne jamais afficher silencieusement un ancien tarif si le fichier est absent ou invalide.
- Ne plus intégrer les montants dans le HTML ou les métadonnées JSON-LD générées au build.

## Non-objectifs

- Aucun back-office, serveur, base de données ou authentification.
- Aucun calcul de taux de change.
- Aucune publication automatique vers Gandi depuis ce dépôt.

## Approches considérées

1. **JSON runtime — retenu.** Un fichier lisible et validé est demandé par le navigateur avec cache désactivé. C’est la solution la plus simple à éditer et la moins susceptible d’exécuter du code accidentel.
2. **JavaScript runtime.** Un fichier définit une variable globale. Le chargement peut être légèrement plus direct, mais une erreur JavaScript peut interrompre son exécution et le format est moins sûr pour une simple saisie de tarifs.
3. **Service distant/back-office.** Offre une interface d’administration, mais réintroduit un serveur et contredit le choix d’un hébergement statique.

## Comportement retenu

`prices.json` contient exactement les clés `250ml`, `500ml`, `750ml` et `5l`. Chaque entrée contient un entier CNY positif et un USD sous forme de chaîne avec deux décimales. Le navigateur ajoute un paramètre anti-cache à la requête. Pendant le chargement, les cartes indiquent que les prix arrivent ; en cas d’erreur, elles affichent « prix temporairement indisponible » sans valeur de secours figée.

Les produits et descriptions restent pré-rendus. Seuls les montants sont chargés au runtime. Les offres tarifaires sont retirées du JSON-LD afin que les moteurs de recherche ne lisent jamais un ancien prix compilé.

## Exploitation

Une dernière exécution de `npm run build` installe ce fonctionnement et produit `dist/config/prices.json`. Ensuite, l’opérateur modifie ou remplace uniquement ce fichier sur l’hébergement. Les visiteurs voient les nouvelles valeurs au prochain chargement de page.

