/**
 * Télécharge la feuille Google de suivi vers un classeur local.
 *
 * Usage :
 *   npm run sheet:pull                → suivi/suivi-produits.xlsx
 *   npm run sheet:pull -- <chemin>
 *
 * Sert à conserver un instantané lisible/hors-ligne avant de lancer
 * `npm run sheet:import` sur ce fichier.
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  readRange,
  saveWorkbook,
  stateRows,
} from "./lib/sheet.mjs";

installCliGuard();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PATH = join(ROOT, "suivi", "suivi-produits.xlsx");

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--")) ?? DEFAULT_PATH;

const pull = async (tab, headers, opts) =>
  matrixToObjects(await readRange(tab, opts), headers).filter((r) => !isBlankRow(r));

console.log("Lecture de la feuille Google…");
await ensureTabs(); // vérifie la clé AVANT d'écrire le moindre fichier
const products = await pull(TABS.products, PRODUCT_HEADERS, { unformatted: true });
const done = await pull(TABS.done, DONE_HEADERS);
const report = await pull(TABS.report, REPORT_HEADERS);

const wb = await buildWorkbook({ state: stateRows(), products, done, report });
mkdirSync(dirname(target), { recursive: true });
await saveWorkbook(wb, target);

const pending = products.filter((r) => String(r.Référence ?? "").trim() === "").length;
console.log(
  `✓ ${products.length} ligne(s) « ${TABS.products} » (${pending} nouvelle(s)), ` +
    `${done.length} déjà intégrée(s) → ${target}`
);
console.log(`\n→ relance : npm run sheet:import -- "${target}"`);
