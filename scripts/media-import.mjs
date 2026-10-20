/**
 * Importe les photos (Google Drive) et les vidéos (YouTube) déclarées par le
 * client dans l'onglet « Produits », puis met à jour les fiches Markdown.
 *
 * Usage :
 *   npm run media:import                 → lit suivi/suivi-produits.xlsx
 *   npm run media:import -- <chemin.xlsx>
 *   npm run media:import -- --remote     → lit ET réécrit la feuille Google
 *   npm run media:import -- --dry-run    → simule, n'écrit rien
 *
 * Colonnes sources (éditables, onglet « Produits ») :
 *   - « Photos (Drive) »   : lien d'un dossier Drive (ou d'une image seule)
 *   - « Vidéo (YouTube) »  : une ou plusieurs URLs YouTube, séparées par « · »
 *
 * Garanties :
 *   - aucune image n'est supprimée hors des fichiers numérotés réécrits ;
 *   - un lien invalide est signalé, la fiche reste inchangée ;
 *   - les images sont converties en WebP (1600 px max, qualité 82) ;
 *   - la première image (ordre alphabétique) devient la couverture.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTS_DIR,
  categorySlugs,
  patchFrontmatter,
  patchList,
} from "./lib/content.mjs";
import { downloadFile, listImages, parseDriveLink } from "./lib/drive.mjs";
import { parseYouTubeIds, toWebp } from "./lib/media.mjs";
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
const MAX_IMAGES = 8;

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
const TODAY = new Date().toISOString().slice(0, 10);

/** oEmbed : `true` = jouable, `false` = lien mort, `null` = vérification impossible. */
async function isPlayable(id) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${id}`
      )}&format=json`
    );
    return res.ok;
  } catch {
    return null;
  }
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

async function loadSource() {
  if (remote) {
    await ensureTabs();
    const pull = async (tab, headers, opts) =>
      matrixToObjects(await readRange(tab, opts), headers);
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
      `classeur introuvable : ${file}\n  → lancez \`npm run sheet:export\` ou \`npm run sheet:pull\`.`
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

/* Programme --------------------------------------------------------------- */

const source = await loadSource();
const report = [];
const doneRows = [];
const status = new Map();
let importedImages = 0;
let importedVideos = 0;
let errors = 0;

const say = (niveau, type, objet, message) =>
  report.push({ Niveau: niveau, Type: type, Objet: objet, Message: message });
const mark = (key, state, message) => status.set(key, { Import: state, Message: message });

console.log(`\nMédias depuis ${source.label} — ${source.products.length} ligne(s)\n`);

for (let i = 0; i < source.products.length; i++) {
  const row = source.products[i];
  if (isBlankRow(row)) continue;

  const ref = text(row.Référence);
  const title = text(row.Produit);
  const photoLink = text(row["Photos (Drive)"]);
  const videoLink = text(row["Vidéo (YouTube)"]);
  if (!photoLink && !videoLink) continue;

  if (!ref) {
    errors++;
    mark(`#${i}`, "ERREUR", "produit sans Référence : lancez d'abord sheet:import");
    say("ERREUR", "Média ignoré", title || "(vide)", "produit sans Référence : lancez d'abord sheet:import");
    continue;
  }

  const dir = join(PRODUCTS_DIR, ref);
  const md = join(dir, "index.md");
  if (!existsSync(md)) {
    errors++;
    mark(ref, "ERREUR", `fiche introuvable : src/content/products/${ref}/index.md`);
    say("ERREUR", "Média ignoré", ref, "fiche introuvable");
    continue;
  }

  const notes = [];
  const problems = [];

  /* Photos ---------------------------------------------------------------- */
  if (photoLink) {
    const target = parseDriveLink(photoLink);
    if (!target) {
      problems.push(`lien Drive illisible « ${photoLink} »`);
    } else {
      try {
        let images = await listImages(target);
        if (!images.length) {
          problems.push("aucune image dans le dossier Drive");
        } else {
          if (images.length > MAX_IMAGES) {
            notes.push(`${images.length - MAX_IMAGES} image(s) au-delà de ${MAX_IMAGES} ignorée(s)`);
            images = images.slice(0, MAX_IMAGES);
          }
          if (dryRun) {
            notes.push(`${images.length} image(s) seront importées (simulation)`);
          } else {
            const written = [];
            const failed = [];
            let position = 0;
            for (const image of images) {
              try {
                const buffer = await downloadFile(image.id);
                const webp = await toWebp(buffer);
                const name = position === 0 ? "cover.webp" : `${position}.webp`;
                writeFileSync(join(dir, name), webp);
                written.push(name);
                position++;
              } catch (e) {
                failed.push(`${image.name} : ${e.message}`);
              }
            }
            if (!written.length) {
              problems.push(`aucune image convertible (${failed.join(" · ")})`);
            } else {
              // Supprime les anciennes images numérotées qui ne font plus partie du lot.
              for (const name of readdirSync(dir)) {
                if (/^\d+\.webp$/.test(name) && !written.includes(name)) {
                  try {
                    unlinkSync(join(dir, name));
                  } catch {
                    /* fichier verrouillé */
                  }
                }
              }
              patchFrontmatter(md, { cover: "./cover.webp" });
              patchList(
                md,
                "gallery",
                written.filter((n) => n !== "cover.webp").map((n) => `./${n}`)
              );
              importedImages += written.length;
              notes.push(`${written.length} image(s) importée(s)`);
              if (failed.length) notes.push(`ignorée(s) : ${failed.join(" · ")}`);
            }
          }
        }
      } catch (e) {
        problems.push(e.message);
      }
    }
  }

  /* Vidéo ----------------------------------------------------------------- */
  if (videoLink) {
    const ids = parseYouTubeIds(videoLink);
    if (!ids.length) {
      problems.push(`lien YouTube illisible « ${videoLink} »`);
    } else {
      const dead = [];
      for (const id of ids) {
        if ((await isPlayable(id)) === false) dead.push(id);
      }
      if (dead.length) {
        problems.push(`vidéo(s) introuvable(s) : ${dead.join(", ")}`);
      } else if (dryRun) {
        notes.push(`${ids.length} vidéo(s) seront importées (simulation)`);
      } else {
        patchList(md, "youtube", ids);
        importedVideos += ids.length;
        notes.push(`${ids.length} vidéo(s) importée(s)`);
      }
    }
  }

  if (problems.length) {
    errors++;
    mark(ref, "ERREUR", problems.join(" · "));
    say("ERREUR", "Média", ref, problems.join(" · "));
  } else {
    mark(ref, dryRun ? "SIMULÉ" : "OK", notes.join(" · ") || "aucun média");
    say("OK", dryRun ? "Média (simulé)" : "Média", ref, notes.join(" · "));
    if (!dryRun) {
      doneRows.push({
        Date: TODAY,
        Type: "Médias",
        Objet: ref,
        Détail: notes.join(" · "),
        "Note client": "",
      });
    }
  }
}

/* Contrôle et écriture ---------------------------------------------------- */

let checkOk = true;
if (!dryRun && !noCheck) {
  const res = runCheck();
  checkOk = res.ok;
  for (const line of res.out.split(/\r?\n/).filter((l) => /^[✓✗]/.test(l.trim())).slice(-8)) {
    say(line.includes("✗") ? "ERREUR" : "INFO", "npm run check", "contenu", line.trim());
  }
  if (!res.ok) say("ERREUR", "npm run check", "build", "le contenu reste invalide");
}

if (!dryRun) {
  const summary = summarySpec();
  const data = {
    state: stateRows(),
    done: [...source.done, ...doneRows],
    report,
    categories: categorySlugs(),
    status,
    remoteProducts: source.products,
    products: mergeProducts(recapSpec().rows, source.products, status),
    summary: summary.matrix,
    summaryMeta: summary,
  };
  await source.write(data);
}

console.log("Rapport :");
for (const r of report) {
  const icon = r.Niveau === "ERREUR" ? "✗" : r.Niveau === "ATTENTION" ? "!" : r.Niveau === "OK" ? "✓" : "·";
  console.log(`  ${icon} [${r.Niveau}] ${r.Type} — ${r.Objet} : ${r.Message}`);
}

console.log(
  `\n${importedImages} image(s), ${importedVideos} vidéo(s), ${errors} erreur(s)` +
    `${dryRun ? " (simulation — rien n'a été écrit)" : ""}`
);
console.log(`Classeur mis à jour : ${dryRun ? "(simulation)" : remote ? "feuille Google" : file}`);

if (dryRun) process.exit(0);
if (!checkOk || errors) process.exit(1);
