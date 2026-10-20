# GeoTopo — suivi des produits (tableau Google Sheets)

Le client ajoute et corrige des produits dans **un seul classeur** partagé sur
Google Drive. Un script convertit ses lignes en fiches Markdown du site :
rien n'est publié sans ton passage, et rien n'est saisi deux fois.

```
le client corrige des cellules de l'onglet Produits
        ↓
npm run sheet:simulate      → diff champ par champ, rien n'est écrit
        ↓
npm run sheet:import        → fiches écrites + colonnes Import / Message
        ↓
tu relis, tu commites, tu deployes
        ↓
sheet:push                  → l'onglet Produits reflète l'état réel du site
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm run sheet:test` | Vérifie la clé, le jeton, les API et le partage de la feuille |
| `npm run sheet:export` | Génère `suivi/suivi-produits.xlsx` depuis le contenu du site |
| `npm run sheet:export -- --reset` | Même chose, en vidant les onglets de suivi |
| `npm run sheet:push` | Génère le classeur **et** le pousse dans la feuille Google |
| `npm run sheet:pull` | Télécharge la feuille Google vers `suivi/suivi-produits.xlsx` |
| `npm run sheet:simulate` | Import en simulation (`--dry-run`) : rien n'est écrit |
| `npm run sheet:import` | Importe le classeur local `suivi/suivi-produits.xlsx` |
| `npm run sheet:import -- --remote` | Importe **directement depuis** la feuille Google, puis la réécrit |
| `npm run media:import` | Importe les photos Drive et les vidéos YouTube déclarées dans la feuille |
| `npm run media:import -- --remote` | Lit et réécrit la feuille Google (médias) |
| `npm run media:import -- --dry-run` | Simulation des médias : rien n'est écrit |

Options utiles : `--no-check` (saute `npm run check`), `-- <chemin.xlsx>` (autre fichier).

`--remote` ne touche jamais au contenu du client à l'export : les onglets
`Déjà intégré` et `Rapport import` sont **lus sur Google d'abord** (leur
contenu prime sur le fichier local), et l'onglet `Produits` conserve les
cellules du client (`mergeProducts()`), sauf avec `--reset`.

## Les onglets

6 onglets, dans cet ordre : `Lisez-moi`, `Synthèse`, `Produits`,
`Déjà intégré`, `Rapport import`, `État du site`.

| Onglet | Ce qu'on y trouve | Qui le touche |
|---|---|---|
| `Lisez-moi` | mode d'emploi + sens des colonnes | nous |
| `Synthèse` | indicateurs clés (18 produits, prix moyen, complétude…), détail par catégorie, par marque, puis « ce qui manque encore » | nous → client |
| `Produits` | **tableau unique** : 1 ligne = 1 produit, 23 colonnes. Récap (statut, complétude %, à compléter…) **et** saisie client côte à côte | nous → client, qui ne remplit que les colonnes éditables |
| `Déjà intégré` | journal des lignes absorbées | nous |
| `Rapport import` | OK / ATTENTION / ERREUR du dernier import | nous |
| `État du site` | export technique (slug, commit, date) | nous |

Les anciens onglets `Récap produits` et `Vos ajouts` sont supprimés
automatiquement au prochain `sheet:push` (`LEGACY_TABS` dans `sheet.mjs`).

### Colonnes de `Produits` (23, `RECAP_HEADERS`)

**Éditables par le client** (`EDITABLE`) : `Produit`, `Marque`,
`Prix (FCFA)`, `Disponibilité` (liste déroulante), `Délai`, `En vedette`
(liste déroulante), `Résumé`, `Points forts` (3 à 6 items, un par ligne du
type `Libellé : valeur`, séparés par ` · `), `Photos (Drive)` et
`Vidéo (YouTube)` (voir « Photos et vidéos »).

- `Catégorie` (`EDITABLE_ON_NEW`) : liste déroulante des 6 titres
  français — modifiable **uniquement** sur une ligne neuve.
- `Référence` : **jamais modifiable** (c'est le slug auto). Ligne neuve =
  `Référence` vide.

**Calculées par nous** (`COMPUTED`, cellules grises + plages protégées
warning-only) : `Statut`, `Caractéristiques`, `Spécifications`, `Images`,
`Vidéo`, `Guide client`, `Dans un pack`, `Complétude`, `À compléter`,
`Référence`, `Import`, `Message`. Si le client les modifie, l'import les
ignore et signale `ATTENTION`.

**Complétude** = 8 critères : résumé, 3 points forts, 5 caractéristiques,
5 spécifications, vidéo, prix + délai, 4 images, guide client. La colonne
« À compléter » énonce les critères manquants — c'est la liste de courses
que le client peut nous envoyer.

Le classeur est mis en forme à chaque `sheet:push` : en-têtes figés et
gras, filtre automatique, largeurs de colonnes, prix en `FCFA`, scores en
`%`, colonnes calculées grises, plages protégées (warning), listes
déroulantes, onglets colorés.

## Photos et vidéos

Deux colonnes éditables ont été ajoutées au tableau :

| Colonne | Ce que le client y met | Ce que l'import en fait |
|---|---|---|
| `Photos (Drive)` | lien d'un **dossier Google Drive** (ou d'une image seule) | télécharge les images, les convertit en WebP, remplit `cover` + `gallery` |
| `Vidéo (YouTube)` | une ou plusieurs URLs YouTube (watch, youtu.be, Shorts), séparées par ` · ` | extrait les IDs, vérifie qu'elles existent, remplit `youtube` |

**Côté client :**

1. Créer un dossier Drive par produit (ou un sous-dossier dans un dossier
   « Photos produits »).
2. Y déposer les photos dans l'ordre : `01-...`, `02-...`, etc. La
   **première** (ordre alphabétique) devient la couverture, les suivantes
   la galerie.
3. Partager le dossier avec
   `prospection-machine@prospection-machine.iam.gserviceaccount.com`
   (accès **Lecteur** suffit) **ou** activer « Toute personne disposant du
   lien ».
4. Coller le lien du dossier dans `Photos (Drive)` et le lien YouTube dans
   `Vidéo (YouTube)`.

**Côté intégrateur :**

```sh
npm run media:import -- --dry-run     # liste ce qui serait importé
npm run media:import -- --remote      # télécharge, convertit, réécrit la feuille
```

Traitement automatique :

- images : rotation EXIF, redimensionnement **1600 px max** (jamais
  d'agrandissement), WebP qualité 82, métadonnées supprimées ;
- écriture de `cover.webp` puis `1.webp` à `7.webp` (**8 images max**) ;
- mise à jour de `cover`, `gallery` et `youtube` dans `index.md` ;
- les anciens `N.webp` qui ne font plus partie du lot sont supprimés ; les
  autres fichiers du dossier ne sont **jamais** touchés ;
- les vidéos sont vérifiées via l'API oEmbed de YouTube ; un lien mort est
  signalé et n'est pas publié ;
- la feuille est réécrite (`Images`, `Vidéo`, `À compléter` recalculés,
  `Import`/`Message` renseignés, historique `Déjà intégré`).

Un produit **sans `Référence`** (ligne neuve pas encore importée) est
ignoré : lancer d'abord `sheet:import`, puis `media:import`.

## Cycle de travail

1. **Une fois** : `npm run sheet:push` pour remplir la feuille Google
   partagée (état réel du site + notice d'utilisation pour le client).
2. Le client modifie directement l'onglet **`Produits`** : il ne touche
   qu'aux colonnes éditables ; une cellule **vidée** ne change rien.
3. Tu récupères : `npm run sheet:pull` (ou directement
   `npm run sheet:import -- --remote` pour tout faire d'un coup).
4. `npm run sheet:simulate` pour lire le diff sans rien changer.
5. `npm run sheet:import` : le diff est appliqué fiches par fiches, chaque
   ligne reçoit `Import` + `Message` dans le classeur, le compteur de
   `check-content.mjs` suit.
6. Si le client a rempli `Photos (Drive)` ou `Vidéo (YouTube)` :
   `npm run media:import -- --remote` (les images sont converties et les
   fiches mises à jour, la feuille est réécrite).
7. Tu relis `git diff`, tu completes les fiches en brouillon, tu commites.
8. `npm run sheet:push` renvoie l'état réel à la feuille Google (ordre des
   lignes du client conservé, produits du site absents réajoutés à la fin).

## Mise en place Google (état au 06/10/2026)

| Étape | État |
|---|---|
| 1. Projet Cloud Console | ✅ fait — projet `prospection-machine` |
| 2. API Sheets + Drive activées | ✅ fait |
| 3. Compte de service | ✅ `prospection-machine@prospection-machine.iam.gserviceaccount.com` |
| 4. Clé JSON générée | ✅ `D:\prospection-machine\Clé json cloud console\prospection-machine.json` |
| 5. Chemin stable dans `.env` | ✅ fait |
| 6. Feuille créée + partagée en Éditeur | ✅ faite — 6 onglets créés par `sheet:push` |
| 7. `GOOGLE_SHEETS_ID` dans `.env` | ✅ `1yak-VwnlEUso3nZ3-m7GKW_eRvBKcc54laVWi0DAloo` |

Feuille en cours : <https://docs.google.com/spreadsheets/d/1yak-VwnlEUso3nZ3-m7GKW_eRvBKcc54laVWi0DAloo/edit>

Vérification à chaque fois : `npm run sheet:test` doit afficher
`✓ accès Google opérationnel`.

### Procédure (si la clé doit être régénérée)

1. <https://console.cloud.google.com/> → sélecteur de projet → choisir le
   projet Cloud qui détient le compte de service.
2. Activer les API :
   - <https://console.cloud.google.com/apis/library/sheets.googleapis.com> → **ACTIVER**
   - <https://console.cloud.google.com/apis/library/drive.googleapis.com> → **ACTIVER**
3. <https://console.cloud.google.com/iam-admin/serviceaccounts> → **+ CRÉER UN
   COMPTE DE SERVICE** → nom au choix → **CRÉER ET CONTINUER** → rôle **laisser
   vide** → **TERMINE**. Le rôle IAM ne donne aucun accès au tableau : c'est le
   **partage de la feuille** (étape 6) qui autorise lecture et écriture.
4. Fiche du compte de service → onglet **CLÉS** → **+ AJOUTER UNE CLÉ** →
   **Créer une nouvelle clé** → type **JSON** → **CRÉER**.
5. Déplacer le fichier téléchargé **hors de `Téléchargements`** (purgé
   périodiquement — c'est ce qui a fait disparaître l'ancienne clé).
6. Créer la feuille : <https://sheets.new> → nom `Suivi produits - GéoTopo` →
   copier l'**ID** dans l'URL (`https://docs.google.com/spreadsheets/d/`**`ID`**`/edit`)
   → **PARTAGER** → coller le compte de service → accès **Éditeur** (Google
   signale « impossible d'envoyer l'invitation » : c'est normal, un compte de
   service n'a pas de boîte mail — ajoute quand même l'accès).
7. Renseigner `.env` :

```
GOOGLE_SERVICE_ACCOUNT_JSON=D:\prospection-machine\Clé json cloud console\prospection-machine.json
GOOGLE_SHEETS_ID=<l'ID de l'étape 6>
```

Puis `npm run sheet:test`.

### Sécurité

- `.env` est ignoré par git (`.gitignore:17`), tout comme `*.credentials.json`.
- **Ne jamais** déposer le JSON de clé dans le dépôt.
- Dans <https://console.cloud.google.com/iam-admin/keys>, révoque les clés
  orphelines après chaque régénération.


## Onglets du classeur

Voir « Les onglets » plus haut : `Lisez-moi`, `Synthèse`, `Produits`
(seul onglet client), `Déjà intégré`, `Rapport import`, `État du site`.

**Règle d'or : seules les cellules remplies sont appliquées.** Une cellule
vidée ne modifie rien (signalée `ATTENTION` dans `Message`). Les colonnes
calculées (grises, protégées) sont toujours réécrites depuis le site.

## Ce que l'import fait et ne fait pas

**Fait :**
- crée le dossier produit, le frontmatter conforme au schéma Zod, un texte de
  brouillon de 120-180 mots (exigé par `check-content.mjs`) et une couverture
  `cover.webp` de remplacement ;
- pose `draft: true` : le produit n'est **ni listé, ni généré** tant que tu ne
  l'as pas publié (`src/lib/catalog.ts:32`) ;
- met à jour le compteur `products:` de `scripts/check-content.mjs` ;
- lance `npm run check` et remonte ses lignes dans le rapport ;
- réécrit l'onglet `Produits` (colonnes calculées resynchronisées, colonnes
  `Import` / `Message` remplies), l'historique et le rapport ;
- importe les photos Drive et les vidéos YouTube (`media:import`) : WebP
  1600 px, `cover` + `gallery` + `youtube` mis à jour.

**Ne fait jamais :**
- supprimer un produit ;
- interpréter une cellule vide comme « mettre à jour » ;
- appliquer une modification d'une colonne calculée (grise) ;
- publier un brouillon.

## Dépannage

Lance d'abord `npm run sheet:test` : il localise l'étape cassée.

| Symptôme | Cause | Solution |
|---|---|---|
| `✗ GOOGLE_SHEETS_ID absent de .env` | étape 7 non faite | remplir `.env` |
| `clé du compte de service introuvable` | JSON purgé/déplacé | repositionner le fichier, corriger `.env` |
| `403 ... unregistered callers` | API non activée ou clé révoquée | étape 2 + régénérer la clé |
| `permission denied` / `403` en écriture | feuille non partagée avec le compte de service | étape 6, accès **Éditeur** |
| `catégorie « ... » inconnue` | le client a écrit une catégorie inexistante | corriger la ligne, relancer |
| `npm run check` échoue après un ajout | compteur non mis à jour | relancer `npm run sheet:import` (il resynchronise) |
| une ligne reste bloquée en `ERREUR` | son texte ne passe pas les validations | corriger la ligne côté client, relancer (elle reste dans `Produits` jusqu'à ce que ce soit bon) |
| `ATTENTION` « colonne calculée modifiée » | le client a touché une colonne grise | rien appliqué : la valeur du site a été conservée |
| `ATTENTION` « cellule vidée » | le client a effacé une cellule | aucun changement appliqué — s'il voulait effacer, il faut le faire côté fichier |
| `dossier ou fichier Drive introuvable` | dossier non partagé avec le compte de service | partager en **Lecteur** ou activer « Toute personne disposant du lien » |
| `aucune image dans le dossier Drive` | mauvais lien, dossier vide ou fichiers non image | vérifier le lien et les formats |
| `aucune image convertible` | photo HEIC ou fichier corrompu | exporter en JPG puis relancer |
| `vidéo(s) introuvable(s)` | lien YouTube privé ou supprimé | fournir une URL publique ou « non répertoriée » |
