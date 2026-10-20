/**
 * Classeur de suivi (ExcelJS) + accès à Google Sheets (compte de service).
 *
 * Onglets du classeur (dans cet ordre) :
 *   Lisez-moi           consignes pour le client
 *   Synthèse            KPI, catalogue par catégorie / marque, ce qui manque
 *   Produits            tableau fusionné : 1 ligne = 1 produit, le client y
 *                       édite ses colonnes blanches, le reste est calculé
 *   Déjà intégré        historique des lignes absorbées par un import
 *   Rapport import      résultat du dernier import (OK / ATTENTION / ERREUR)
 *   État du site        export en lecture seule du catalogue réel
 */

import ExcelJS from "exceljs";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categoryTitles, readCatalog } from "./content.mjs";
import {
  COMPUTED,
  EDITABLE,
  RECAP_HEADERS,
  recapSpec,
  summarySpec,
} from "./recap.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const TABS = {
  readme: "Lisez-moi",
  summary: "Synthèse",
  products: "Produits",
  done: "Déjà intégré",
  report: "Rapport import",
  state: "État du site",
};

/** Le tableau fusionné : catalogue + saisie du client dans les mêmes lignes. */
export const PRODUCT_HEADERS = RECAP_HEADERS;

export const STATE_HEADERS = [
  "Slug",
  "Titre",
  "Catégorie",
  "Marque",
  "Prix (FCFA)",
  "Disponibilité",
  "Délai",
  "En vedette",
  "Statut",
  "Images",
  "Vidéos",
  "Spécs",
  "Résumé",
  "Dernière maj",
  "Commit",
];

export const DONE_HEADERS = ["Date", "Type", "Objet", "Détail", "Note client"];

export const REPORT_HEADERS = ["Niveau", "Type", "Objet", "Message"];

/* Env -------------------------------------------------------------------- */

function readDotEnv() {
  const file = join(ROOT, ".env");
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...readDotEnv(), ...process.env };

export function serviceAccountPath() {
  const p = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!p) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON absent de .env — voir SUIVI-PRODUITS.md (étapes 1 à 5)"
    );
  }
  if (!existsSync(p)) {
    throw new Error(
      `clé du compte de service introuvable : ${p}\n` +
        "  → la clé a été purgée ou déplacée. Regénère-la (SUIVI-PRODUITS.md, étapes 3-5)."
    );
  }
  return p;
}

export function spreadsheetId() {
  const id = env.GOOGLE_SHEETS_ID;
  if (!id) {
    throw new Error(
      "GOOGLE_SHEETS_ID absent de .env — voir SUIVI-PRODUITS.md (étape 6)"
    );
  }
  return id;
}

/**
 * Affiche une erreur propre (sans pile d'appels) et sort en code 1.
 * À appeler en tête des scripts CLI.
 */
export function installCliGuard() {
  const show = (err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ ${msg}\n`);
    if (process.env.DEBUG && err instanceof Error) console.error(err.stack);
    process.exit(1);
  };
  process.on("uncaughtException", show);
  process.on("unhandledRejection", show);
}

/* Google API -------------------------------------------------------------- */

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
];
const API = "https://sheets.googleapis.com/v4";

let tokenPromise = null;

async function accessToken() {
  if (!tokenPromise) {
    tokenPromise = (async () => {
      const { GoogleAuth } = await import("google-auth-library");
      const auth = new GoogleAuth({ keyFile: serviceAccountPath(), scopes: SCOPES });
      const client = await auth.getClient();
      const res = await client.getAccessToken();
      const token = typeof res === "string" ? res : res?.token;
      if (!token) throw new Error("impossible d'obtenir un jeton d'accès Google");
      return token;
    })().catch((e) => {
      tokenPromise = null;
      throw e;
    });
  }
  return tokenPromise;
}

/** Jeton Google partagé (Sheets + Drive en lecture), pour les scripts média. */
export async function googleAccessToken() {
  return accessToken();
}

async function call(method, path, body) {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      detail = JSON.parse(text)?.error?.message ?? text;
    } catch {
      /* texte brut */
    }
    throw new Error(`Google Sheets API ${res.status} — ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

/** Onglet entouré de guillemets simples, comme l'attend l'API Sheets. */
const q = (name) => `'${name.replace(/'/g, "''")}'`;

export async function listSheetTitles() {
  return (await listSheets()).map((s) => s.title);
}

/** Propriétés de chaque onglet : `{sheetId, title, index, …}`. */
async function listSheets() {
  const data = await call(
    "GET",
    `/spreadsheets/${spreadsheetId()}?fields=sheets.properties(sheetId,title,index)`
  );
  return (data.sheets ?? []).map((s) => s.properties);
}

export async function ensureTab(title, index) {
  const titles = await listSheetTitles();
  if (titles.includes(title)) return false;
  await call("POST", `/spreadsheets/${spreadsheetId()}:batchUpdate`, {
    requests: [{ addSheet: { properties: index === undefined ? { title } : { title, index } } }],
  });
  return true;
}

/** Onglets hérités de l'ancien découpage, supprimés à la première poussée. */
const LEGACY_TABS = ["Récap produits", "Vos ajouts"];

/**
 * Crée les onglets manquants AVANT toute lecture, supprime les anciens et les
 * remet dans l'ordre de TABS (le client doit tomber d'abord sur « Synthèse »
 * puis sur « Produits »).
 *
 * Sert aussi de test d'authentification : sans clé valide on échoue ici,
 * bruyamment, plutôt que de lire un tableau vide et d'écraser la feuille.
 */
export async function ensureTabs() {
  const wanted = Object.values(TABS);
  let existing = await listSheetTitles();
  const legacy = existing.filter((t) => LEGACY_TABS.includes(t));
  if (legacy.length) {
    const sheets = await listSheets();
    await call("POST", `/spreadsheets/${spreadsheetId()}:batchUpdate`, {
      requests: sheets
        .filter((s) => legacy.includes(s.title))
        .map((s) => ({ deleteSheet: { sheetId: s.sheetId } })),
    });
    existing = await listSheetTitles();
  }
  for (let i = 0; i < wanted.length; i++) {
    if (!existing.includes(wanted[i])) await ensureTab(wanted[i], i);
  }

  const sheets = await listSheets();
  const byTitle = new Map(sheets.map((s) => [s.title, s]));
  const requests = [];
  wanted.forEach((title, i) => {
    const sheet = byTitle.get(title);
    if (!sheet || sheet.index === i) return;
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: sheet.sheetId, index: i },
        fields: "index",
      },
    });
  });
  if (requests.length) {
    await call("POST", `/spreadsheets/${spreadsheetId()}:batchUpdate`, { requests });
  }
}

/**
 * @param {string} titre onglet
 * @param {{unformatted?: boolean}} [opts] `unformatted` rend les nombres bruts
 *   (3850000 au lieu de « 3 850 000 FCFA ») — indispensable pour comparer les
 *   cellules de l'onglet « Produits » à leur valeur d'origine.
 */
export async function readRange(title, opts = {}) {
  const range = encodeURIComponent(`${q(title)}!A1:ZZ`);
  const opt = opts.unformatted ? "?valueRenderOption=UNFORMATTED_VALUE" : "";
  const data = await call("GET", `/spreadsheets/${spreadsheetId()}/values/${range}${opt}`);
  return data.values ?? [];
}

export async function clearRange(title) {
  const range = encodeURIComponent(`${q(title)}!A:ZZ`);
  await call("POST", `/spreadsheets/${spreadsheetId()}/values/${range}:clear`, {});
}

export async function writeRange(title, values) {
  const range = encodeURIComponent(`${q(title)}!A1`);
  await call(
    "PUT",
    `/spreadsheets/${spreadsheetId()}/values/${range}?valueInputOption=USER_ENTERED`,
    { range: `${q(title)}!A1`, values }
  );
}

/* Classeur ---------------------------------------------------------------- */

const DARK = { argb: "FF1B2632" };
const LIGHT = { argb: "FFF3F5F7" };

function styleHeader(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  row.fill = { type: "pattern", pattern: "solid", fg: DARK };
  row.alignment = { vertical: "middle", wrapText: true };
  row.height = 28;
}

function writeGrid(ws, headers, rows) {
  ws.addRow(headers).eachCell(styleHeader);
  for (const r of rows) ws.addRow(headers.map((h) => r[h] ?? ""));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };
  headers.forEach((h, i) => {
    const longest = Math.max(h.length, ...rows.map((r) => String(r[h] ?? "").length));
    ws.getColumn(i + 1).width = Math.min(Math.max(longest + 2, 10), 60);
  });
  ws.getRow(1).height = 30;
}

function rowsToMatrix(headers, rows) {
  return [headers, ...rows.map((h) => headers.map((k) => h[k] ?? ""))];
}

const README = [
  ["GÉOTOPO — SUIVI DES PRODUITS", ""],
  ["", ""],
  ["Le principe", ""],
  ["", "Une seule table : l'onglet « Produits ». Tout ce qui existe déjà y figure, et c'est la même table que vous modifiez."],
  ["", ""],
  ["Corriger un produit existant", ""],
  ["1.", "Repérez la ligne (filtre sur la ligne 1, ou Ctrl+F)."],
  ["2.", "Modifiez directement les cellules en fond blanc."],
  ["3.", "Laissez le lien ouvert : l'intégrateur relit la table automatiquement."],
  ["4.", "Les colonnes « Import » et « Message » confirment le passage de chaque ligne."],
  ["", ""],
  ["Ajouter un produit", ""],
  ["1.", "Ajoutez une ligne en bas, en laissant « Référence » vide."],
  ["2.", "Remplissez « Produit », « Catégorie », « Marque », puis le reste."],
  ["3.", "Le produit arrive en brouillon : il n'apparaît sur le site qu'après validation."],
  ["", ""],
  ["Ajouter des photos et une vidéo", ""],
  ["1.", "Créez un dossier Google Drive par produit et déposez-y les photos (01, 02, 03… dans l'ordre voulu)."],
  ["2.", "Partagez le dossier avec l'adresse du compte de service, ou activez « Toute personne disposant du lien »."],
  ["3.", "Collez le lien du dossier dans « Photos (Drive) » : la première photo devient la couverture, les suivantes la galerie."],
  ["4.", "Collez un lien YouTube (watch, youtu.be ou Shorts) dans « Vidéo (YouTube) »."],
  ["5.", "L'intégrateur lance l'import : les images sont converties en WebP et optimisées automatiquement."],
  ["", ""],
  ["Colonnes modifiables (fond blanc)", "Produit, Marque, Prix, Disponibilité, Délai, En vedette, Résumé, Points forts, Photos (Drive), Vidéo (YouTube) — et Catégorie pour une nouvelle ligne."],
  ["Colonnes grises", "Calculées depuis le site (statut, nombre d'images, nombre de vidéos, guide, pack, complétude, référence) : vos modifications n'y sont pas prises en compte."],
  ["", ""],
  ["Les règles", ""],
  ["Cellule vidée", "Aucun changement — pour effacer un prix, écrivez « Sur devis »."],
  ["Prix", "En francs CFA, sans virgule. Vide = affiché « Sur devis »."],
  ["Disponibilité", "Liste déroulante : En boutique / Sur commande."],
  ["Points forts", "Au moins 3, séparés par « · » au format Libellé : valeur."],
  ["Résumé", "Entre 20 et 160 caractères."],
  ["Photos", "4 photos minimum, format 4:3 ou 1:1, 1600 px de large, fond neutre. La 1re photo du dossier = couverture."],
  ["Vidéo", "YouTube non répertoriée acceptée, 30 à 90 s, horizontale. Une URL par cellule (séparer plusieurs vidéos par « · »)."],
  ["", ""],
  ["Ce qui n'est PAS à faire ici", ""],
  ["×", "Supprimer une ligne : un produit n'est jamais retiré depuis ce tableau."],
  ["×", "Modifier « Référence » : c'est l'identifiant automatique du produit."],
  ["×", "Déposer les photos directement dans la feuille : elles doivent rester dans le dossier Drive."],
];

/**
 * Construit le classeur complet.
 * @param {{state: object[], products: object[], done: object[], report: object[],
 *          summary?: any[][],
 *          summaryMeta?: {titleRows: number[], headerRows: number[]}}} data
 */
export async function buildWorkbook(data) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "geotopo";
  wb.created = new Date();

  const readme = wb.addWorksheet(TABS.readme);
  for (const [a, b] of README) readme.addRow([a, b]);
  readme.getColumn(1).width = 34;
  readme.getColumn(2).width = 96;
  readme.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF1B2632" } };
  readme.getColumn(2).alignment = { wrapText: true, vertical: "top" };
  readme.views = [{ state: "frozen", ySplit: 1 }];

  const summary = wb.addWorksheet(TABS.summary);
  const summaryRows = data.summary?.matrix ?? data.summary ?? [];
  const summaryMeta = data.summaryMeta ?? data.summary ?? {};
  for (const row of summaryRows) summary.addRow(row);
  for (const r of summaryMeta.titleRows ?? []) {
    const row = summary.getRow(r + 1);
    row.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    row.fill = { type: "pattern", pattern: "solid", fg: DARK };
  }
  for (const r of summaryMeta.headerRows ?? []) {
    const row = summary.getRow(r + 1);
    row.font = { bold: true, color: { argb: "FF1B2632" } };
    row.fill = { type: "pattern", pattern: "solid", fg: LIGHT };
  }
  summary.getColumn(1).width = 46;
  for (let i = 2; i <= 10; i++) summary.getColumn(i).width = 15;
  summary.getColumn(4).width = 44;
  summary.views = [{ state: "frozen", ySplit: 1 }];

  const products = wb.addWorksheet(TABS.products);
  writeGrid(products, PRODUCT_HEADERS, data.products ?? []);
  const px = (h) => PRODUCT_HEADERS.indexOf(h) + 1;
  const lastRow = (data.products?.length ?? 0) + 1;
  const validationEnd = Math.max(lastRow + 40, 60);
  for (let r = 2; r <= validationEnd; r++) {
    products.getCell(r, px("Catégorie")).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${Object.values(categoryTitles()).join(",")}"`],
    };
    products.getCell(r, px("Disponibilité")).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"En boutique,Sur commande"'],
    };
    products.getCell(r, px("En vedette")).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"oui,non"'],
    };
  }
  for (const h of PRODUCT_HEADERS) {
    if (!COMPUTED.has(h)) continue;
    const c = px(h);
    for (let r = 1; r <= Math.max(lastRow, 2); r++) {
      products.getCell(r, c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: LIGHT,
      };
    }
  }
  for (let r = 2; r <= lastRow; r++) {
    products.getCell(r, px("Prix (FCFA)")).numFmt = '#,##0" FCFA"';
    products.getCell(r, px("Complétude")).numFmt = '0"%"';
  }

  const state = wb.addWorksheet(TABS.state);
  writeGrid(state, STATE_HEADERS, data.state ?? []);

  const done = wb.addWorksheet(TABS.done);
  writeGrid(done, DONE_HEADERS, data.done ?? []);

  const report = wb.addWorksheet(TABS.report);
  writeGrid(report, REPORT_HEADERS, data.report ?? []);

  return wb;
}

export async function saveWorkbook(wb, path) {
  await wb.xlsx.writeFile(path);
}

/** Lit un classeur local → tableaux d'objets indexés par en-tête. */
export async function readWorkbook(path) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path);
  return {
    state: sheetObjects(wb, TABS.state, STATE_HEADERS),
    products: sheetObjects(wb, TABS.products, PRODUCT_HEADERS),
    done: sheetObjects(wb, TABS.done, DONE_HEADERS),
    report: sheetObjects(wb, TABS.report, REPORT_HEADERS),
    categories: [],
  };
}

/** Lit des valeurs brutes (API Sheets) → objets indexés par en-tête. */
export function matrixToObjects(matrix, headers) {
  if (!matrix.length) return [];
  const head = matrix[0].map((h) => String(h ?? "").trim());
  return matrix.slice(1).map((line) => {
    const o = {};
    headers.forEach((h, i) => {
      const at = head.indexOf(h);
      o[h] = at >= 0 ? line[at] : "";
    });
    return o;
  });
}

function sheetObjects(wb, title, headers) {
  const ws = wb.getWorksheet(title);
  if (!ws) return [];
  const matrix = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values.slice(1);
    matrix.push(values.map((v) => (v == null ? "" : v)));
  });
  return matrixToObjects(matrix, headers);
}

const textCell = (v) => (v == null ? "" : String(v).trim());

/** Ligne sans aucune donnée (hors colonnes gérées par l'intégrateur). */
export function isBlankRow(row) {
  return PRODUCT_HEADERS.every(
    (h) => h === "Import" || h === "Message" || !textCell(row[h]),
  );
}

/**
 * Fusionne la ligne du site (source de vérité) avec la ligne que le client
 * a dans sa feuille, en conservant l'ordre de ses lignes.
 *
 * - colonnes modifiables : la cellule du client l'emporte si elle est remplie
 *   (cellule vidée = aucun changement) ;
 * - colonnes calculées : toujours la valeur du site ;
 * - lignes sans « Référence » (nouveaux produits, validés ou non) : conservées
 *   telles quelles ;
 * - produits du site absents de la feuille : ajoutés à la fin.
 *
 * @param {object[]} siteRows lignes calculées depuis le catalogue
 * @param {object[]} remoteRows lignes lues dans la feuille
 * @param {Map<string, object>|Record<string, object>|null} status
 *        résultat de l'import, indexé par slug ou `#index` pour une ligne neuve
 */
export function mergeProducts(siteRows, remoteRows = [], status = null) {
  const st = (key) => {
    if (!status) return null;
    if (status instanceof Map) return status.get(key) ?? null;
    return status[key] ?? null;
  };
  const siteBySlug = new Map(siteRows.map((r) => [r.Référence, r]));
  const seen = new Set();
  const out = [];

  const withStatus = (row, key) => {
    const s = st(key) ?? {};
    return {
      ...row,
      Import: s.Import ?? textCell(row.Import),
      Message: s.Message ?? textCell(row.Message),
    };
  };

  remoteRows.forEach((row, i) => {
    if (isBlankRow(row)) return;
    const slug = textCell(row.Référence);
    const site = slug ? siteBySlug.get(slug) : undefined;
    if (!site) {
      out.push(withStatus(row, slug || `#${i}`));
      return;
    }
    seen.add(slug);
    const merged = { ...site };
    for (const h of EDITABLE) {
      if (textCell(row[h])) merged[h] = row[h];
    }
    out.push(withStatus(merged, slug));
  });

  for (const row of siteRows) {
    if (seen.has(row.Référence)) continue;
    out.push(withStatus(row, row.Référence));
  }
  return out;
}

/** Lignes actuellement dans la feuille Google (onglet « Produits »). */
async function readRemoteProducts() {
  try {
    const matrix = await readRange(TABS.products, { unformatted: true });
    if (matrix.length < 2) return [];
    return matrixToObjects(matrix, PRODUCT_HEADERS).filter((r) => !isBlankRow(r));
  } catch {
    return [];
  }
}

export { rowsToMatrix };

/** Lignes de l'onglet « État du site », depuis le contenu Markdown réel. */
export function stateRows() {
  const { products } = readCatalog();
  return products
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))
    .map((p) => ({
      Slug: p.slug,
      Titre: p.title,
      "Catégorie": p.category,
      Marque: p.brand,
      "Prix (FCFA)": p.price ?? "Sur devis",
      Disponibilité: p.availability,
      Délai: p.leadTime,
      "En vedette": p.featured ? "oui" : "non",
      Statut: p.draft ? "brouillon" : "publié",
      Images: p.images,
      Vidéos: p.video,
      Spécs: p.specs,
      Résumé: p.summary,
      "Dernière maj": p.updatedAt,
      Commit: p.commit,
    }));
}

export function readmeMatrix() {
  return README;
}

/* Mise en forme Google ---------------------------------------------------- */

const HEADER_BG = { red: 0.106, green: 0.149, blue: 0.196 }; // #1B2632
const HEADER_FG = { red: 1, green: 1, blue: 1 };
const AMBER = { red: 1, green: 0.87, blue: 0.55 };
const GREEN = { red: 0.78, green: 0.94, blue: 0.81 };
const RED = { red: 0.75, green: 0.15, blue: 0.12 };
const SOFT = { red: 0.95, green: 0.96, blue: 0.97 };

const TAB_COLORS = {
  [TABS.readme]: { red: 0.55, green: 0.58, blue: 0.62 },
  [TABS.summary]: HEADER_BG,
  [TABS.products]: { red: 0.18, green: 0.62, blue: 0.36 },
  [TABS.state]: { red: 0.72, green: 0.75, blue: 0.78 },
  [TABS.done]: { red: 0.85, green: 0.87, blue: 0.89 },
  [TABS.report]: { red: 0.95, green: 0.7, blue: 0.35 },
};

const SUMMARY_WIDTHS = [460, 240, 130, 170, 150, 150, 150, 120, 130, 140];

function headerRequests(sheetId, ncols) {
  return [
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: ncols },
        cell: {
          userEnteredFormat: {
            backgroundColor: HEADER_BG,
            textFormat: { bold: true, foregroundColor: HEADER_FG },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 36 },
        fields: "pixelSize",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
  ];
}

const widthRequests = (sheetId, widths) =>
  widths.map((w, i) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
      properties: { pixelSize: w },
      fields: "pixelSize",
    },
  }));

const gridWidths = (headers) => headers.map((h) => Math.min(Math.max(String(h).length * 9 + 24, 90), 430));

const filterRequest = (sheetId, nrows, ncols) => [
  { clearBasicFilter: { sheetId } },
  {
    setBasicFilter: {
      filter: {
        range: { sheetId, startRowIndex: 0, endRowIndex: nrows + 1, startColumnIndex: 0, endColumnIndex: ncols },
      },
    },
  },
];

const numberFormatRequest = (sheetId, fmt) => ({
  repeatCell: {
    range: {
      sheetId,
      startRowIndex: fmt.startRow,
      endRowIndex: fmt.endRow,
      startColumnIndex: fmt.startCol,
      endColumnIndex: fmt.endCol,
    },
    cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: fmt.numberFormat } } },
    fields: "userEnteredFormat.numberFormat",
  },
});

/**
 * Onglets + protections + formats conditionnels. Sert à repartir de zéro à
 * chaque envoi : ces objets s'accumulent sinon (un lot = un envoi).
 */
async function sheetMeta() {
  const data = await call(
    "GET",
    `/spreadsheets/${spreadsheetId()}?fields=${encodeURIComponent(
      "sheets(properties(sheetId,title,index,gridProperties(frozenRowCount)),protectedRanges,conditionalFormats)"
    )}`
  );
  return (data.sheets ?? []).map((s) => ({
    ...(s.properties ?? {}),
    protectedRanges: s.protectedRanges ?? [],
    conditionalFormats: s.conditionalFormats ?? [],
  }));
}

/**
 * Applique la mise en forme de la feuille Google : en-têtes figés, filtres,
 * largeurs, formats de nombres, couleurs conditionnelles, colonnes calculées
 * grisées et protégées (avertissement), onglets en couleur et listes
 * déroulantes de l'onglet « Produits ».
 *
 * @param {{products: object, summary: object, categoryLabels?: string[]}} data
 */
export async function formatWorkbook(data) {
  const sheets = await sheetMeta();
  const byTitle = new Map(sheets.map((s) => [s.title, s]));
  const sheetId = (title) => {
    const s = byTitle.get(title);
    if (!s) throw new Error(`onglet introuvable dans la feuille Google : ${title}`);
    return s.sheetId;
  };

  const prodId = sheetId(TABS.products);
  const requests = [];
  for (const s of sheets) {
    for (const p of s.protectedRanges ?? []) {
      if (p.range?.sheetId !== prodId) continue;
      requests.push({ deleteProtectedRange: { protectedRangeId: p.protectedRangeId } });
    }
  }
  const rules = byTitle.get(TABS.products)?.conditionalFormats ?? [];
  for (let i = rules.length - 1; i >= 0; i--) {
    requests.push({ deleteConditionalFormatRule: { sheetId: prodId, index: i } });
  }

  const prod = data.products;
  const summary = data.summary;

  /* Lisez-moi ------------------------------------------------------------ */
  const readme = sheetId(TABS.readme);
  requests.push(
    {
      updateDimensionProperties: {
        range: { sheetId: readme, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 210 },
        fields: "pixelSize",
      },
      },
    {
      updateDimensionProperties: {
        range: { sheetId: readme, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 880 },
        fields: "pixelSize",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: readme, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: { sheetId: readme, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 14 } } },
        fields: "userEnteredFormat.textFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId: readme, startColumnIndex: 1, endColumnIndex: 2 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    },
  );

  /* Synthèse ------------------------------------------------------------- */
  const sum = sheetId(TABS.summary);
  requests.push(
    ...headerRequests(sum, SUMMARY_WIDTHS.length),
    ...widthRequests(sum, SUMMARY_WIDTHS),
  );
  for (const r of summary.titleRows) {
    requests.push({
      repeatCell: {
        range: { sheetId: sum, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: SUMMARY_WIDTHS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: HEADER_BG,
            textFormat: { bold: true, foregroundColor: HEADER_FG, fontSize: 12 },
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat",
      },
    });
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: sum, dimension: "ROWS", startIndex: r, endIndex: r + 1 },
        properties: { pixelSize: 30 },
        fields: "pixelSize",
      },
    });
  }
  for (const r of summary.headerRows) {
    requests.push({
      repeatCell: {
        range: { sheetId: sum, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: SUMMARY_WIDTHS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: SOFT,
            textFormat: { bold: true },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat",
      },
    });
  }
  for (const fmt of summary.formats) requests.push(numberFormatRequest(sum, fmt));
  requests.push({
    repeatCell: {
      range: { sheetId: sum, startColumnIndex: 0, endColumnIndex: 1 },
      cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
      fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
    },
  });

  /* Produits ------------------------------------------------------------- */
  const prodRows = prod.rows.length;
  const prodCols = prod.headers.length;
  requests.push(
    ...headerRequests(prodId, prodCols),
    ...widthRequests(prodId, prod.widths),
    ...filterRequest(prodId, prodRows, prodCols),
  );
  requests.push(
    numberFormatRequest(prodId, {
      startRow: 1,
      endRow: prodRows + 1,
      startCol: prod.priceCol,
      endCol: prod.priceCol + 1,
      numberFormat: '#,##0" FCFA"',
    }),
    numberFormatRequest(prodId, {
      startRow: 1,
      endRow: prodRows + 1,
      startCol: prod.scoreCol,
      endCol: prod.scoreCol + 1,
      numberFormat: '0"%"',
    }),
  );
  /* Colonnes calculées : fond gris + avertissement à la saisie. */
  const computedRanges = [];
  PRODUCT_HEADERS.forEach((h, i) => {
    if (!COMPUTED.has(h)) return;
    const last = computedRanges[computedRanges.length - 1];
    if (last && last.endColumnIndex === i) last.endColumnIndex = i + 1;
    else computedRanges.push({ startColumnIndex: i, endColumnIndex: i + 1 });
  });
  for (const r of computedRanges) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: prodId,
          startRowIndex: 1,
          endRowIndex: prodRows + 1,
          ...r,
        },
        cell: { userEnteredFormat: { backgroundColor: SOFT } },
        fields: "userEnteredFormat.backgroundColor",
      },
      });
    requests.push({
      addProtectedRange: {
        protectedRange: {
          range: {
            sheetId: prodId,
            startRowIndex: 1,
            endRowIndex: 2000,
            ...r,
          },
          warningOnly: true,
          description:
            "Colonne calculée depuis le site : elle n'est pas modifiable, les changements y sont ignorés.",
        },
      },
    });
  }
  const ruleRange = (col) => ({
    sheetId: prodId,
    startRowIndex: 1,
    endRowIndex: prodRows + 1,
    startColumnIndex: col,
    endColumnIndex: col + 1,
  });
  requests.push(
    {
      addConditionalFormatRule: {
        index: 0,
        rule: {
          ranges: [ruleRange(prod.statusCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "brouillon" }] },
            format: { backgroundColor: AMBER, textFormat: { bold: true } },
          },
        },
      },
    },
    {
      addConditionalFormatRule: {
        index: 1,
        rule: {
          ranges: [ruleRange(prod.scoreCol)],
          booleanRule: {
            condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "60" }] },
            format: { backgroundColor: { red: 1, green: 0.82, blue: 0.8 }, textFormat: { bold: true, foregroundColor: RED } },
          },
        },
      },
    },
    {
      addConditionalFormatRule: {
        index: 2,
        rule: {
          ranges: [ruleRange(prod.scoreCol)],
          booleanRule: {
            condition: { type: "NUMBER_GREATER_THAN_EQ", values: [{ userEnteredValue: "100" }] },
            format: { backgroundColor: GREEN, textFormat: { bold: true } },
          },
        },
      },
    },
    {
      addConditionalFormatRule: {
        index: 3,
        rule: {
          ranges: [ruleRange(prod.missingCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "complet" }] },
            format: { backgroundColor: GREEN },
          },
        },
      },
    },
  );

  /* Onglets tabulaires --------------------------------------------------- */
  const tabs = [
    { title: TABS.state, headers: STATE_HEADERS, rows: data.state ?? [] },
    { title: TABS.done, headers: DONE_HEADERS, rows: data.done ?? [] },
    { title: TABS.report, headers: REPORT_HEADERS, rows: data.report ?? [] },
  ];
  for (const t of tabs) {
    const id = sheetId(t.title);
    const ncols = t.headers.length;
    requests.push(
      ...headerRequests(id, ncols),
      ...widthRequests(id, gridWidths(t.headers)),
      ...filterRequest(id, t.rows.length, ncols),
    );
  }

  /* Listes déroulantes de l'onglet « Produits » --------------------------- */
  const dropdown = (col, values, strict) => ({
    setDataValidation: {
      range: {
        sheetId: prodId,
        startRowIndex: 1,
        endRowIndex: 500,
        startColumnIndex: col,
        endColumnIndex: col + 1,
      },
      rule: {
        strict,
        showCustomUi: true,
        condition: { type: "ONE_OF_LIST", values: values.map((v) => ({ userEnteredValue: v })) },
      },
    },
  });
  requests.push(
    dropdown(PRODUCT_HEADERS.indexOf("Catégorie"), data.categoryLabels ?? [], false),
    dropdown(PRODUCT_HEADERS.indexOf("Disponibilité"), ["En boutique", "Sur commande"], true),
    dropdown(PRODUCT_HEADERS.indexOf("En vedette"), ["oui", "non"], true),
  );

  /* Couleurs d'onglet ----------------------------------------------------- */
  for (const [title, color] of Object.entries(TAB_COLORS)) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: sheetId(title), tabColor: color },
        fields: "tabColor",
      },
    });
  }

  await call("POST", `/spreadsheets/${spreadsheetId()}:batchUpdate`, { requests });
}

/** Réécrit les onglets du classeur dans la feuille Google partagée. */
export async function pushWorkbook(data) {
  await ensureTabs();
  const spec = recapSpec();
  const summary = summarySpec();
  const remote = data.remoteProducts ?? (await readRemoteProducts());
  const products =
    data.products ?? mergeProducts(spec.rows, remote, data.status ?? null);
  const summaryRows = data.summary?.matrix ?? summary.matrix ?? data.summary ?? [];

  const targets = [
    [TABS.readme, README],
    [TABS.summary, padMatrix(summaryRows)],
    [TABS.products, rowsToMatrix(PRODUCT_HEADERS, products)],
    [TABS.state, rowsToMatrix(STATE_HEADERS, data.state ?? [])],
    [TABS.done, rowsToMatrix(DONE_HEADERS, data.done ?? [])],
    [TABS.report, rowsToMatrix(REPORT_HEADERS, data.report ?? [])],
  ];
  for (const [title, values] of targets) {
    await clearRange(title);
    await writeRange(title, values);
  }

  await formatWorkbook({
    products: spec,
    summary,
    categories: data.categories ?? readCatalog().categories,
    categoryLabels: Object.values(categoryTitles()),
    state: data.state ?? [],
    done: data.done ?? [],
    report: data.report ?? [],
  });
}

/** Comble les lignes hétérogènes d'une matrice multi-blocs. */
function padMatrix(matrix) {
  const width = Math.max(1, ...matrix.map((r) => r.length));
  return matrix.map((r) => {
    const out = Array(width).fill("");
    r.forEach((v, i) => (out[i] = v ?? ""));
    return out;
  });
}

