/**
 * Génère le classeur de suivi des produits.
 *
 * Usage :
 *   npm run sheet:export                     → suivi/suivi-produits.xlsx
 *   npm run sheet:export -- --reset          → repart de zéro (onglets vidés)
 *   npm run sheet:export -- --remote         → pousse aussi dans la feuille Google
 *   npm run sheet:export -- <chemin.xlsx>
 *
 * Par défaut, les onglets « Produits », « Déjà intégré » et « Rapport import »
 * d'un classeur existant sont conservés : ré-exporter ne détruit pas le travail
 * en cours du client. Avec `--remote`, la feuille Google est lue en premier :
 * ce que le client a saisi en ligne prime sur le fichier local.
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCatalog } from "./lib/content.mjs";
import { recapSpec, summarySpec } from "./lib/recap.mjs";
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

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const remote = args.includes("--remote");
const target = args.find((a) => !a.startsWith("--")) ?? DEFAULT_PATH;

const { categories } = readCatalog();
const state = stateRows();

let localRows = [];
let remoteRows = [];
let done = [];
let report = [];

if (!reset && existsSync(target)) {
  const prev = await readWorkbook(target);
  localRows = prev.products.filter((r) => !isBlankRow(r));
  done = prev.done;
  report = prev.report;
}

const filled = (rows) =>
  rows.filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));

if (remote && !reset) {
  await ensureTabs();
  const read = async (tab, headers, opts) =>
    filled(matrixToObjects(await readRange(tab, opts), headers));
  const rProducts = await read(TABS.products, PRODUCT_HEADERS, { unformatted: true });
  const rDone = await read(TABS.done, DONE_HEADERS);
  const rReport = await read(TABS.report, REPORT_HEADERS);
  if (rProducts.length) remoteRows = rProducts;
  if (rDone.length) done = rDone;
  if (rReport.length) report = rReport;
}

const recap = recapSpec();
const summary = summarySpec();
const source = reset ? [] : remoteRows.length ? remoteRows : localRows;
const products = mergeProducts(recap.rows, source, null);
const data = {
  state,
  products,
  done,
  report,
  categories,
  summary: summary.matrix,
  summaryMeta: summary,
};
const wb = await buildWorkbook(data);
mkdirSync(dirname(target), { recursive: true });
await saveWorkbook(wb, target);

const pending = products.filter((r) => String(r.Référence ?? "").trim() === "").length;
console.log(`✓ ${state.length} produits exportés → ${target}`);
console.log(`  onglets : ${Object.values(TABS).join(" · ")}`);
if (pending) console.log(`  ${pending} ligne(s) neuve(s) en attente dans « ${TABS.products} »`);

if (remote) {
  await pushWorkbook(data);
  console.log(`\n✓ feuille Google mise à jour (${state.length} produits)`);
} else {
  console.log(
    `\n→ Téléversez ce fichier sur Google Drive puis partagez le lien au client,\n` +
      `  ou relancez avec --remote pour écrire directement dans la feuille Google.`
  );
}
