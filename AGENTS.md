## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Suivi des produits (tableau Google Sheets)

Le client ajoute et corrige les produits dans un classeur partagé ; un script
convertit ses lignes en fiches Markdown. Procédure complète (mise en place
Google, cycle de travail, dépannage) : `SUIVI-PRODUITS.md`.

- `npm run sheet:export` → génère `suivi/suivi-produits.xlsx`
- `npm run sheet:push` → génère le classeur, le pousse dans Google **et** applique la mise en forme
- `npm run sheet:simulate` → import en simulation (rien n'est écrit)
- `npm run sheet:import` → écrit les fichiers Markdown + le rapport
- `npm run sheet:import -- --remote` → lit et réécrit la feuille Google directement
- `npm run sheet:pull` → télécharge la feuille Google
- `npm run sheet:test` → vérifie clé, jeton, API et partage
- `npm run media:import` → importe les photos Drive et les vidéos YouTube
- `npm run media:import -- --remote` → lit et réécrit la feuille Google
- `npm run media:import -- --dry-run` → simulation, rien n'est écrit

6 onglets, dans cet ordre : `Lisez-moi` (mode d'emploi), `Synthèse` (KPI,
par catégorie, par marque, ce qui manque), `Produits` (tableau unique : 1
ligne = 1 produit, 23 colonnes — récap ET saisie client), `Déjà intégré`,
`Rapport import`, `État du site`. Les anciens onglets `Récap produits` et
`Vos ajouts` sont supprimés automatiquement (`LEGACY_TABS`).

**`Produits` = un seul tableau pour tout.** Le client n'y touche qu'aux
colonnes éditables (`EDITABLE` : Produit, Marque, Prix (FCFA),
Disponibilité, Délai, En vedette, Résumé, Points forts, Photos (Drive),
Vidéo (YouTube) ; plus `Catégorie` uniquement pour une ligne neuve,
`Référence` jamais) ; les colonnes calculées (`COMPUTED`, en gris +
protégées warning-only) sont réécrites par l'import à partir du site.

L'import (`sheet:import`) est un **diff champ par champ** : la cellule du
client prime si elle est remplie, sinon la valeur du site reste ; une
cellule **vidée** ne change rien (signalée `ATTENTION`) ; une colonne
calculée touchée est ignorée (`ATTENTION`). Chaque ligne reçoit `Import`
(`OK` / `ERREUR` / `SIMULÉ` / `AUCUN CHANGEMENT`) et `Message`. Ordre des
lignes = ordre du client ; `Référence` vide = nouveau produit (créé en
brouillon), sinon slug de la ligne à modifier ; les produits du site absents
du tableau sont réajoutés à la fin.

Le récap et la synthèse sont construits par `scripts/lib/recap.mjs`
(`RECAP_HEADERS` 23 colonnes, `EDITABLE` / `EDITABLE_ON_NEW` / `COMPUTED`),
la fusion par `mergeProducts()` dans `scripts/lib/sheet.mjs` (lecture seule
de `readCatalog()`). `sheet:push` écrit les valeurs puis envoie un
`batchUpdate` : en-têtes figés + gras, filtre automatique, largeurs de
colonnes, formats `FCFA` / `%`, colonnes calculées grises, plages protégées
warning-only, listes déroulantes (Catégorie, Disponibilité, En vedette).

Médias (`npm run media:import`, `scripts/media-import.mjs`) : le client colle
un lien de **dossier Drive** dans `Photos (Drive)` et une ou plusieurs URLs
YouTube dans `Vidéo (YouTube)`. Le script liste/télécharge via l'API Drive
(scope `drive.readonly`), convertit en WebP (1600 px max, qualité 82), écrit
`cover.webp` + `1.webp`…`7.webp` (8 images max), met à jour `cover`,
`gallery` et `youtube` dans le frontmatter, vérifie les vidéos via oEmbed,
puis réécrit la feuille. Le dossier doit être partagé avec le compte de
service ou en « Toute personne disposant du lien ». Première image
(ordre alphabétique) = couverture ; les fichiers `N.webp` obsolètes sont
supprimés, le reste n'est jamais touché.

Garanties de l'import : jamais de suppression ; seules les cellules
remplies sont appliquées ; un ajout arrive en brouillon (`draft: true`,
donc invisible sur le site) ; le compteur `products:` de
`scripts/check-content.mjs` est resynchronisé automatiquement.

