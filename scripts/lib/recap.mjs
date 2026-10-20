/**
 * Récapitulatif catalogue destiné à la feuille Google (langage client).
 *
 * Deux vues sont produites :
 *   - `recapSpec()`   → le tableau « Produits » (1 ligne = 1 produit)
 *   - `summarySpec()` → l'onglet « Synthèse » (KPI, par catégorie, par marque,
 *                       ce qui manque encore)
 *
 * Elles ne lisent que readCatalog() : aucun état, aucune écriture disque.
 */

import { categoryMeta, readCatalog } from "./content.mjs";

const FCFA = '#,##0" FCFA"';
const PERCENT = '0"%"';

const DISPONIBILITE = {
  "en-boutique": "En boutique",
  "sur-commande": "Sur commande",
};

/**
 * Les 8 critères de complétude, en mots que le client comprend.
 * Seuls « images » et « guide client » varient réellement aujourd'hui : les
 * autres sont à 100 % sur le catalogue, et servent de garde-fou quand une
 * fiche est créée à la volée par l'import.
 */
const CHECKS = [
  { label: "résumé", ok: (p) => p.summary.trim().length >= 50 },
  { label: "points forts (3)", ok: (p) => p.highlights.length >= 3 },
  { label: "caractéristiques (5)", ok: (p) => p.featuresCount >= 5 },
  { label: "spécifications (5)", ok: (p) => p.specs >= 5 },
  { label: "vidéo", ok: (p) => p.video >= 1 },
  { label: "prix + délai", ok: (p) => p.price != null && Boolean(p.leadTime && p.availability) },
  { label: "images (4)", ok: (p) => p.images >= 4 },
  { label: "guide client", ok: (p) => p.guide },
];

export function completeness(product) {
  const missing = CHECKS.filter((c) => !c.ok(product)).map((c) => c.label);
  return {
    score: Math.round((100 * (CHECKS.length - missing.length)) / CHECKS.length),
    missing,
  };
}

export const RECAP_HEADERS = [
  "Catégorie",
  "Produit",
  "Marque",
  "Prix (FCFA)",
  "Disponibilité",
  "Délai",
  "En vedette",
  "Statut",
  "Résumé",
  "Points forts",
  "Photos (Drive)",
  "Vidéo (YouTube)",
  "Caractéristiques",
  "Spécifications",
  "Images",
  "Vidéo",
  "Guide client",
  "Dans un pack",
  "Complétude",
  "À compléter",
  "Référence",
  "Import",
  "Message",
];

/**
 * Colonnes que le client a le droit de modifier. Tout le reste est calculé
 * depuis le site : l'import l'ignore silencieusement (et le signale), la
 * mise en forme les grise.
 */
export const EDITABLE = new Set([
  "Produit",
  "Marque",
  "Prix (FCFA)",
  "Disponibilité",
  "Délai",
  "En vedette",
  "Résumé",
  "Points forts",
  "Photos (Drive)",
  "Vidéo (YouTube)",
]);

/** Colonnes éditables uniquement lors de la création d'un produit. */
export const EDITABLE_ON_NEW = new Set(["Catégorie"]);

/** Colonnes appartenant au site (calculées) : jamais appliquées par l'import. */
export const COMPUTED = new Set([
  "Statut",
  "Caractéristiques",
  "Spécifications",
  "Images",
  "Vidéo",
  "Guide client",
  "Dans un pack",
  "Complétude",
  "À compléter",
  "Référence",
  "Import",
  "Message",
]);

export const RECAP_WIDTHS = [
  175, 330, 130, 135, 135, 155, 95, 105, 430, 400, 260, 220, 130, 130, 85, 85,
  115, 230, 115, 300, 235, 130, 340,
];

export function recapSpec() {
  const { products } = readCatalog();
  const rows = products
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))
    .map((p) => {
      const { score, missing } = completeness(p);
      return {
        Catégorie: p.categoryTitle,
        Produit: p.title,
        Marque: p.brand,
        "Prix (FCFA)": p.price ?? "Sur devis",
        Disponibilité: DISPONIBILITE[p.availability] ?? p.availability,
        Délai: p.leadTime,
        "En vedette": p.featured ? "oui" : "non",
        Statut: p.draft ? "brouillon" : "publié",
        Résumé: p.summary,
        "Points forts": p.highlights.map((h) => `${h.label} : ${h.value}`).join(" · "),
        "Photos (Drive)": "",
        "Vidéo (YouTube)": "",
        Caractéristiques: p.featuresCount,
        Spécifications: p.specs,
        Images: p.images,
        Vidéo: p.video,
        "Guide client": p.guide ? "oui" : "non",
        "Dans un pack": p.packs.length ? p.packs.join(" · ") : "—",
        Complétude: score,
        "À compléter": missing.length ? missing.join(", ") : "complet",
        Référence: p.slug,
        Import: "",
        Message: "",
      };
    });

  return {
    headers: RECAP_HEADERS,
    rows,
    widths: RECAP_WIDTHS,
    priceCol: RECAP_HEADERS.indexOf("Prix (FCFA)"),
    statusCol: RECAP_HEADERS.indexOf("Statut"),
    scoreCol: RECAP_HEADERS.indexOf("Complétude"),
    missingCol: RECAP_HEADERS.indexOf("À compléter"),
    importCol: RECAP_HEADERS.indexOf("Import"),
  };
}

const pad = (n) => String(n);
const avg = (list) => (list.length ? Math.round(list.reduce((s, v) => s + v, 0) / list.length) : 0);

/**
 * Onglet « Synthèse » : matrice multi-blocs + indices des lignes à mettre en forme.
 * @returns {{matrix: any[][], titleRows: number[], headerRows: number[], formats: object[]}}
 */
export function summarySpec() {
  const { products } = readCatalog();
  const cats = categoryMeta();
  const priced = products.filter((p) => p.price != null);
  const scores = products.map((p) => completeness(p).score);
  const updatedAt = products.map((p) => p.updatedAt).filter(Boolean).sort().pop() ?? "—";

  const brands = new Map();
  for (const p of products) {
    if (!brands.has(p.brand)) brands.set(p.brand, []);
    brands.get(p.brand).push(p);
  }

  const matrix = [];
  const titleRows = [];
  const headerRows = [];
  const formats = [];
  const push = (...cells) => matrix.push(cells);

  const section = (label) => {
    push(label, "");
    titleRows.push(matrix.length - 1);
    push("");
  };

  /* Bloc 1 — indicateurs clés ------------------------------------------- */
  section("INDICATEURS CLÉS");
  push("Produits au total", products.length);
  push("En ligne", products.filter((p) => !p.draft).length);
  push("Brouillons (pas encore visibles)", products.filter((p) => p.draft).length);
  push("En vedette", products.filter((p) => p.featured).length);
  push("Catégories", cats.length);
  push("Marques", brands.size);
  push(
    "Prix moyen",
    priced.length ? avg(priced.map((p) => p.price)) : "—",
  );
  push(
    "Prix le plus bas → le plus haut",
    priced.length
      ? `${Math.min(...priced.map((p) => p.price))} → ${Math.max(
          ...priced.map((p) => p.price),
        )} FCFA`
      : "—",
  );
  push("Sans vidéo", products.filter((p) => p.video < 1).length);
  push("Sans images (4 minimum)", products.filter((p) => p.images < 4).length);
  push("Avec un guide client", products.filter((p) => p.guide).length);
  push("Dans un pack", products.filter((p) => p.packs.length).length);
  push("Images au total", products.reduce((s, p) => s + p.images, 0));
  push("Complétude moyenne", avg(scores));
  push("Produits complets (100 %)", scores.filter((s) => s === 100).length);
  push("À compléter encore", scores.filter((s) => s < 100).length);
  push("Dernière mise à jour du catalogue", updatedAt);
  formats.push(
    { startRow: matrix.length - 4, endRow: matrix.length - 3, startCol: 1, endCol: 2, numberFormat: PERCENT },
    { startRow: matrix.length - 11, endRow: matrix.length - 10, startCol: 1, endCol: 2, numberFormat: FCFA },
  );
  push("");

  /* Bloc 2 — par catégorie ---------------------------------------------- */
  section("PAR CATÉGORIE");
  headerRows.push(matrix.length);
  push(
    "Catégorie",
    "Produits",
    "En ligne",
    "Brouillons",
    "Prix mini",
    "Prix moyen",
    "Prix maxi",
    "Vedettes",
    "Sans vidéo",
    "Complétude",
  );
  const catStart = matrix.length;
  for (const c of cats) {
    const list = products.filter((p) => p.category === c.slug);
    const cp = list.filter((p) => p.price != null).map((p) => p.price);
    push(
      c.title,
      list.length,
      list.filter((p) => !p.draft).length,
      list.filter((p) => p.draft).length,
      cp.length ? Math.min(...cp) : "—",
      cp.length ? avg(cp) : "—",
      cp.length ? Math.max(...cp) : "—",
      list.filter((p) => p.featured).length,
      list.filter((p) => p.video < 1).length,
      list.length ? avg(list.map((p) => completeness(p).score)) : "—",
    );
  }
  headerRows.push(matrix.length);
  push(
    "TOTAL",
    products.length,
    products.filter((p) => !p.draft).length,
    products.filter((p) => p.draft).length,
    priced.length ? Math.min(...priced.map((p) => p.price)) : "—",
    priced.length ? avg(priced.map((p) => p.price)) : "—",
    priced.length ? Math.max(...priced.map((p) => p.price)) : "—",
    products.filter((p) => p.featured).length,
    products.filter((p) => p.video < 1).length,
    avg(scores),
  );
  formats.push(
    { startRow: catStart, endRow: matrix.length, startCol: 4, endCol: 7, numberFormat: FCFA },
    { startRow: catStart, endRow: matrix.length, startCol: 9, endCol: 10, numberFormat: PERCENT },
  );
  push("");

  /* Bloc 3 — par marque -------------------------------------------------- */
  section("PAR MARQUE");
  headerRows.push(matrix.length);
  push("Marque", "Produits", "Prix mini", "Prix moyen", "Prix maxi", "Complétude");
  const brandStart = matrix.length;
  const brandRows = [...brands.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  );
  for (const [brand, list] of brandRows) {
    const bp = list.filter((p) => p.price != null).map((p) => p.price);
    push(
      brand,
      list.length,
      bp.length ? Math.min(...bp) : "—",
      bp.length ? avg(bp) : "—",
      bp.length ? Math.max(...bp) : "—",
      avg(list.map((p) => completeness(p).score)),
    );
  }
  formats.push(
    { startRow: brandStart, endRow: matrix.length, startCol: 2, endCol: 5, numberFormat: FCFA },
    { startRow: brandStart, endRow: matrix.length, startCol: 5, endCol: 6, numberFormat: PERCENT },
  );
  push("");

  /* Bloc 4 — ce qui manque encore --------------------------------------- */
  section("CE QUI MANQUE ENCORE (à compléter côté site)");
  headerRows.push(matrix.length);
  push("Produit", "Catégorie", "Complétude", "À compléter");
  const incomplete = products
    .map((p) => ({ p, c: completeness(p) }))
    .filter((x) => x.c.missing.length)
    .sort((a, b) => a.c.score - b.c.score || a.p.title.localeCompare(b.p.title));
  const gapStart = matrix.length;
  if (!incomplete.length) {
    push("Tout est complet", "", "", "");
  } else {
    for (const { p, c } of incomplete) {
      push(p.title, p.categoryTitle, c.score, c.missing.join(", "));
    }
  }
  formats.push({
    startRow: gapStart,
    endRow: matrix.length,
    startCol: 2,
    endCol: 3,
    numberFormat: PERCENT,
  });

  return { matrix, titleRows, headerRows, formats };
}
