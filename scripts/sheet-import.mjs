/**
 * Importe les modifications du client depuis l'onglet « Produits » dans le
 * contenu Markdown du site, puis réécrit ce même onglet à jour.
 *
 * Usage :
 *   npm run sheet:import                              → lit suivi/suivi-produits.xlsx
 *   npm run sheet:import -- <chemin.xlsx>
 *   npm run sheet:import -- --remote                  → lit ET réécrit la feuille Google
 *   npm run sheet:import -- --dry-run                 → simule, n'écrit rien
 *   npm run sheet:import -- --no-check                → saute npm run check
 *
 * Modèle : une seule table fusionnée. Chaque ligne est comparée au site.
 *   - colonnes modifiables remplies et différentes → appliquées ;
 *   - colonne modifiable vidée                      → ignorée, signalée ;
 *   - colonne calculée touchée                      → ignorée, signalée ;
 *   - « Référence » vide                            → nouveau produit en brouillon.
 *
 * Garanties :
 *   - aucun produit n'est jamais supprimé ;
 *   - seules les cellules remplies d'une ligne de modification sont appliquées ;
 *   - un ajout arrive en brouillon (`draft: true`), invisible sur le site ;
 *   - le compteur `products:` de check-content.mjs est mis à jour automatiquement.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTS_DIR,
  bumpExpectedProducts,
  categorySlugs,
  categoryTitles,
  createDraftProduct,
  highlightPairs,
  highlightsLines,
  isSlug,
  listDirs,
  patchBlock,
  patchFrontmatter,
  readCatalog,
  readFrontmatter,
  scalar,
  slugify,
} from "./lib/content.mjs";
import { COMPUTED, EDITABLE, recapSpec, summarySpec } from "./lib/recap.mjs";
import {
  DONE_HEADERS,
  PRODUCT_HEADERS,
  REPORT_HEADERS,
  TABS,
  buildWorkbook,
  ensureTabs,
  installCliGuard,
  isBlankRow,
  matrixToObjects,
  mergeProducts,
  pushWorkbook,
  readRange,
  readWorkbook,
  saveWorkbook,
  stateRows,
} from "./lib/sheet.mjs";

installCliGuard();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PATH = join(ROOT, "suivi", "suivi-produits.xlsx");

/* Arguments --------------------------------------------------------------- */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positional = argv.filter((a) => !a.startsWith("--"));
const remote = flags.has("--remote");
const dryRun = flags.has("--dry-run");
const noCheck = flags.has("--no-check");
const file = positional[0] ?? DEFAULT_PATH;

/* Helpers ----------------------------------------------------------------- */

const text = (v) => (v === undefined || v === null ? "" : String(v).trim());
const blank = (v) => text(v) === "";
const fmtPrice = (n) =>
  n === null || n === undefined
    ? "Sur devis"
    : Number(n).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");

const TODAY = new Date().toISOString().slice(0, 10);

/** Libellés français des clés YAML manipulées. */
const LABELS = {
  title: "titre",
  category: "catégorie",
  brand: "marque",
  summary: "résumé",
  price: "prix",
  availability: "disponibilité",
  leadTime: "délai",
  featured: "en vedette",
};

const fmtVal = (key, v) => (key === "price" ? fmtPrice(v ?? null) : v === undefined || v === "" ? "(vide)" : String(v));

function normalize(str) {
  return text(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categories = categorySlugs();
/** « Récepteurs GNSS & RTK » → `gnss-gps` (libellé tapé par le client). */
const TITLE_TO_SLUG = new Map(
  Object.entries(categoryTitles()).map(([slug, title]) => [normalize(title), slug]),
);

function parseCategory(v) {
  if (blank(v)) return { skip: true };
  const raw = text(v);
  if (categories.includes(raw)) return { value: raw };
  const slug = normalize(raw);
  if (categories.includes(slug)) return { value: slug };
  const byTitle = TITLE_TO_SLUG.get(slug);
  if (byTitle) return { value: byTitle };
  return { error: `catégorie « ${raw} » inconnue (choix : ${categories.join(", ")})` };
}

function parsePrice(v) {
  if (blank(v)) return { skip: true };
  if (/sur[-\s]?devis/i.test(text(v))) return { value: null };
  const digits = text(v).replace(/[^\d]/g, "");
  if (!digits) return { error: `prix illisible « ${text(v)} »` };
  const n = Number(digits);
  if (!Number.isSafeInteger(n) || n <= 0) {
    return { error: `prix invalide « ${text(v)} » (entier en francs CFA attendu)` };
  }
  return { value: n };
}

function parseAvailability(v) {
  if (blank(v)) return { skip: true };
  const norm = normalize(v);
  if (norm === "en-boutique" || norm === "enboutique") return { value: "en-boutique" };
  if (norm === "sur-commande" || norm === "surcommande") return { value: "sur-commande" };
  return {
    error: `disponibilité inconnue « ${text(v)} » (attendu : En boutique ou Sur commande)`,
  };
}

function parseFeatured(v) {
  if (blank(v)) return { skip: true };
  const norm = normalize(v);
  if (["oui", "o", "true", "vrai", "1"].includes(norm)) return { value: true };
  if (["non", "n", "false", "faux", "0"].includes(norm)) return { value: false };
  return { error: `« en vedette » attend oui ou non (lu : « ${text(v)} »)` };
}

/**
 * Points forts au format d'affichage : `Libellé : valeur · Libellé : valeur`
 * (séparateur « · » ou « ; »). L'ancien format `valeur|libellé` reste lu.
 */
function parseHighlights(v) {
  if (blank(v)) return { skip: true };
  const items = text(v)
    .split(/\s*[·;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((s) => {
      const at = s.indexOf(" : ");
      if (at > 0) return { label: s.slice(0, at).trim(), value: s.slice(at + 3).trim() };
      const m = s.split(/[|=]/);
      if (m.length > 1) return { value: m[0].trim(), label: m.slice(1).join("=").trim() };
      return { value: s, label: "point fort" };
    });
  if (items.length < 3) {
    return {
      error: `3 points forts minimum (séparés par « · » au format Libellé : valeur), ${items.length} fourni(s)`,
    };
  }
  return { value: items };
}

function checkSummary(v) {
  const s = text(v);
  if (s.length < 20 || s.length > 160) {
    return { error: `résumé de ${s.length} caractères (attendu 20-160)` };
  }
  return { value: s };
}

function defaultSummary(title) {
  let s = `Fiche en cours de préparation pour ${title}. Caractéristiques détaillées à compléter avant publication.`;
  if (s.length > 160) s = `${title} — fiche produit en cours de préparation.`;
  if (s.length > 160) s = s.slice(0, 157) + "...";
  if (s.length < 20) s = `${title} : fiche produit en cours de préparation.`;
  return s;
}

/* Chargement ------------------------------------------------------------ */

async function loadSource() {
  if (remote) {
    await ensureTabs(); // même garde que sheet-pull : clé vérifiée avant tout écrit
    const pull = async (tab, headers, opts) => matrixToObjects(await readRange(tab, opts), headers);
    return {
      products: await pull(TABS.products, PRODUCT_HEADERS, { unformatted: true }),
      done: await pull(TABS.done, DONE_HEADERS),
      report: await pull(TABS.report, REPORT_HEADERS),
      write: (data) => pushWorkbook(data),
      label: "feuille Google",
    };
  }
  if (!existsSync(file)) {
    throw new Error(
      `classeur introuvable : ${file}\n` +
        "  → lance `npm run sheet:export` pour le générer, ou dépose le fichier téléchargé à cet endroit."
    );
  }
  const prev = await readWorkbook(file);
  return {
    products: prev.products,
    done: prev.done,
    report: prev.report,
    write: async (data) => {
      const wb = await buildWorkbook(data);
      mkdirSync(dirname(file), { recursive: true });
      await saveWorkbook(wb, file);
    },
    label: file,
  };
}

function runCheck() {
  try {
    const out = execFileSync(process.execPath, [join("scripts", "check-content.mjs")], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

/* Programme principal ----------------------------------------------------- */

const source = await loadSource();
const existing = new Set(listDirs(PRODUCTS_DIR));
const catalog = new Map(readCatalog().products.map((p) => [p.slug, p]));
/** Lignes telles que le client les voit aujourd'hui (colonnes calculées). */
const displayed = new Map(recapSpec().rows.map((r) => [r.Référence, r]));

const report = [];
const doneRows = [];
/** Résultat par ligne, indexé par slug — ou `#index` pour une ligne neuve. */
const status = new Map();
let created = 0;
let modified = 0;
let rejected = 0;

const say = (niveau, type, objet, message) => report.push({ Niveau: niveau, Type: type, Objet: objet, Message: message });
const mark = (key, state, message) => status.set(key, { Import: state, Message: message });

console.log(`\nImport depuis ${source.label} — ${source.products.length} ligne(s) lue(s)\n`);

for (let i = 0; i < source.products.length; i++) {
  const row = source.products[i];
  if (isBlankRow(row)) continue; // ligne entièrement vide

  let key = text(row.Référence) ? text(row.Référence) : `#${i}`;
  const ref = key === `#${i}` ? "" : key;
  const title = text(row.Produit);

  const errors = [];
  const attention = [];
  const detail = [];

  /* --- ligne existante : colonnes calculées et cellules vidées ----------- */
  const siteRow = ref ? displayed.get(ref) : undefined;
  if (ref && !siteRow) {
    errors.push(
      `référence « ${ref} » inconnue du site — laissez la cellule vide pour créer un produit`
    );
  }

  if (siteRow) {
    for (const h of COMPUTED) {
      if (h === "Référence" || h === "Import" || h === "Message") continue;
      if (text(row[h]) !== text(siteRow[h])) {
        attention.push(`colonne « ${h} » calculée par le site : modification ignorée`);
      }
    }
    for (const h of EDITABLE) {
      if (blank(row[h]) && !blank(siteRow[h])) {
        attention.push(`cellule « ${h} » vidée : aucun changement`);
      }
    }
  }

  /* --- validation commune ------------------------------------------------ */
  const category = parseCategory(row["Catégorie"]);
  if (category.error) errors.push(category.error);

  const price = parsePrice(row["Prix (FCFA)"]);
  if (price.error) errors.push(price.error);

  const availability = parseAvailability(row.Disponibilité);
  if (availability.error) errors.push(availability.error);

  const featured = parseFeatured(row["En vedette"]);
  if (featured.error) errors.push(featured.error);

  const summary = blank(row.Résumé) ? { skip: true } : checkSummary(row.Résumé);
  if (summary.error) errors.push(summary.error);

  const highlights = parseHighlights(row["Points forts"]);
  if (highlights.error) errors.push(highlights.error);

  const isAdd = !ref;
  const product = ref ? catalog.get(ref) : undefined;

  if (isAdd && !title) errors.push("produit obligatoire pour un ajout");
  if (isAdd && category.skip) errors.push("catégorie obligatoire pour un ajout");
  if (siteRow && !category.skip && product && category.value !== product.category) {
    attention.push("catégorie modifiable uniquement pour un nouvel produit : modif ignorée");
  }

  if (errors.length) {
    rejected++;
    mark(key, "ERREUR", errors.join(" · "));
    say("ERREUR", "Ligne refusée", ref || title || "(vide)", errors.join(" · "));
    continue;
  }

  for (const a of attention) say("ATTENTION", "Modification ignorée", ref || title, a);

  /* --- ajout ------------------------------------------------------------- */
  if (isAdd) {
    const slug = slugify(title);
    if (!slug || !isSlug(slug)) {
      mark(key, "ERREUR", "produit vide ou illisible : impossible d'en déduire une référence");
      say("ERREUR", "Ligne refusée", title, "produit vide ou illisible");
      rejected++;
      continue;
    }
    if (existing.has(slug)) {
      mark(key, "ERREUR", `le produit « ${slug} » existe déjà — renseignez sa colonne « Référence »`);
      say("ERREUR", "Ligne refusée", slug, "existe déjà — renseignez sa colonne Référence");
      rejected++;
      continue;
    }

    const fields = {
      slug,
      title,
      category: category.value,
      brand: text(row.Marque),
      summary: summary.value ?? defaultSummary(title),
      price: price.skip || price.value === null ? null : price.value,
      availability: availability.value ?? "sur-commande",
      leadTime: text(row.Délai) || "15 à 25 jours",
      highlights: highlights.value,
    };

    if (dryRun) {
      const msg = `sera créé en brouillon : ${slug} — ${fmtPrice(fields.price)}`;
      mark(key, "SIMULÉ", msg);
      say("OK", "Ajout (simulé)", slug, msg);
      continue;
    }

    try {
      const { created: files } = await createDraftProduct(fields);
      created++;
      existing.add(slug);
      // la ligne du client porte désormais la référence : elle ne sera pas doublée
      row.Référence = slug;
      key = slug;
      const msg = `${fields.title} — ${fmtPrice(fields.price)} — brouillon créé (${files.length} fichier(s))`;
      mark(key, "OK", msg);
      say("OK", "Ajout", slug, msg);
      doneRows.push({ Date: TODAY, Type: "Ajout", Objet: slug, Détail: msg, "Note client": "" });
    } catch (e) {
      mark(key, "ERREUR", e.message);
      say("ERREUR", "Échec de création", slug, e.message);
      rejected++;
    }
    continue;
  }

  /* --- modification ------------------------------------------------------ */
  const fileMd = join(PRODUCTS_DIR, ref, "index.md");
  if (!existsSync(fileMd)) {
    mark(key, "ERREUR", `fichier introuvable : src/content/products/${ref}/index.md`);
    say("ERREUR", "Échec de mise à jour", ref, "fichier introuvable");
    rejected++;
    continue;
  }
  const { raw } = readFrontmatter(fileMd);
  const updates = {};
  const cur = (k) => scalar(raw, k);

  const consider = (keyName, value) => {
    if (value === undefined) return; // cellule vide → pas de changement
    if (String(cur(keyName) ?? "") === String(value ?? "")) return;
    updates[keyName] = value;
  };

  consider("title", blank(row.Produit) ? undefined : text(row.Produit));
  consider("brand", blank(row.Marque) ? undefined : text(row.Marque));
  consider("summary", summary.value);
  if (!price.skip) consider("price", price.value);
  if (!availability.skip) consider("availability", availability.value);
  consider("leadTime", blank(row.Délai) ? undefined : text(row.Délai));
  if (!featured.skip) consider("featured", featured.value);

  const describe = () =>
    Object.keys(updates).map((k) => `${LABELS[k] ?? k} : ${fmtVal(k, cur(k))} → ${fmtVal(k, updates[k])}`);

  let blockChanged = false;
  if (!highlights.skip) {
    const before = highlightPairs(raw);
    blockChanged =
      before.length !== highlights.value.length ||
      before.some(
        (h, i) => h.value !== highlights.value[i].value || h.label !== highlights.value[i].label
      );
  }

  const changes = [
    ...describe(),
    ...(blockChanged ? ["points forts : modifiés"] : []),
    ...attention,
  ];

  if (!Object.keys(updates).length && !blockChanged && !attention.length) {
    mark(key, "AUCUN CHANGEMENT", "aucune cellule remplie ne diffère du site");
    continue;
  }

  if (!Object.keys(updates).length && !blockChanged) {
    // seules des colonnes calculées / cellules vidées ont été touchées
    mark(key, "AUCUN CHANGEMENT", changes.join(" · "));
    continue;
  }

  if (dryRun) {
    const msg = changes.join(" · ");
    mark(key, "SIMULÉ", msg);
    say("OK", "Modification (simulée)", ref, msg);
    continue;
  }

  try {
    patchFrontmatter(fileMd, updates);
    if (blockChanged) patchBlock(fileMd, "highlights", highlightsLines(highlights.value));
    modified++;
    const msg = changes.join(" · ");
    mark(key, "OK", msg);
    say("OK", "Modification", ref, msg);
    doneRows.push({ Date: TODAY, Type: "Modification", Objet: ref, Détail: msg, "Note client": "" });
  } catch (e) {
    mark(key, "ERREUR", e.message);
    say("ERREUR", "Échec de mise à jour", ref, e.message);
    rejected++;
  }
}

/* Produits du site absents de la feuille ---------------------------------- */

const sheetRefs = new Set(
  source.products.map((r) => text(r.Référence)).filter(Boolean)
);
for (const slug of displayed.keys()) {
  if (sheetRefs.has(slug)) continue;
  say(
    "ATTENTION",
    "Ligne absente",
    slug,
    "produit absent de l'onglet « Produits » : conservé, une ligne sera recréée"
  );
}

/* Compteurs de check-content.mjs ----------------------------------------- */

const totalProducts = listDirs(PRODUCTS_DIR).length;
if (!dryRun) {
  try {
    if (bumpExpectedProducts(totalProducts)) {
      say("INFO", "Compteur", "check-content.mjs", `products attendu → ${totalProducts}`);
    }
  } catch (e) {
    say("ATTENTION", "Compteur", "check-content.mjs", e.message);
  }
}

/* Contrôle de cohérence --------------------------------------------------- */

let checkOk = true;
if (!dryRun && !noCheck) {
  const res = runCheck();
  checkOk = res.ok;
  const lines = res.out.split(/\r?\n/).filter((l) => /^[✓✗]/.test(l.trim()));
  for (const l of lines.slice(-8)) {
    say(l.includes("✗") ? "ERREUR" : "INFO", "npm run check", "contenu", l.trim());
  }
  if (!res.ok) say("ERREUR", "npm run check", "build", "le contenu reste invalide — corrigez avant build");
}

/* Rapport ----------------------------------------------------------------- */

const data = {
  state: stateRows(),
  done: [...source.done, ...doneRows],
  report,
  categories,
  status,
  remoteProducts: source.products,
  products: mergeProducts(recapSpec().rows, source.products, status),
  summary: summarySpec().matrix,
  summaryMeta: summarySpec(),
};
if (!dryRun) await source.write(data);

const count = (n) => report.filter((r) => r.Niveau === n).length;

console.log("Rapport :");
for (const r of report) {
  const mark3 = r.Niveau === "ERREUR" ? "✗" : r.Niveau === "ATTENTION" ? "!" : r.Niveau === "OK" ? "✓" : "·";
  console.log(`  ${mark3} [${r.Niveau}] ${r.Type} — ${r.Objet} : ${r.Message}`);
}

console.log(
  `\n${created} ajout(s), ${modified} modification(s), ${rejected} ligne(s) refusée(s)` +
    `${dryRun ? " (simulation — rien n'a été écrit)" : ""}`
);
console.log(
  `${report.length ? "" : "aucun changement détecté — "}` +
    `colonne « Import » mise à jour : ${status.size} ligne(s)`
);
console.log(`Classeur mis à jour : ${dryRun ? "(simulation)" : remote ? "feuille Google" : file}`);

if (dryRun) process.exit(0);
if (!checkOk || count("ERREUR")) process.exit(1);
