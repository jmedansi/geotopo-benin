/**
 * Importe les médias produits fournis dans `D:\Geotopo\Produits` (livraison
 * client) : convertit les photos en WebP et met à jour `cover` / `gallery`.
 *
 * Usage :
 *   node scripts/import-product-media.mjs --dry-run
 *   node scripts/import-product-media.mjs
 *
 * Le plan ci-dessous est volontaire : la première image devient la couverture,
 * les suivantes la galerie (max 8 images par produit). Les fichiers sources ne
 * sont jamais modifiés.
 */

import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS_DIR, patchFrontmatter, patchList } from "./lib/content.mjs";
import { toWebp } from "./lib/media.mjs";

const SOURCE = process.env.MEDIA_SOURCE || "D:/Geotopo/Produits";
const dryRun = process.argv.includes("--dry-run");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;
const MAX_IMAGES = 8;

const EFIX = "Global version EFIX F8 visual RTK +IMU + dual cameras";
const CHC = "Gnss de marque CHC NAV";
const NEWDI = "Gnss de marque NEWDI";
const SOUTH = "Gnss de marque SOUTH";
const STONEX = "Gnss de marque STONEX 4M";
const FOIF = "Gnss me marque FOIF model A90";
const LEICA = "Niveau de marque Leica model  NA532 avec ses accessoires ( trépied et Mire)";
const LIDAR =
  "scanner LiDARGNSS RTK portable, identifié sur l’annonce comme LiGrip SE RTK GNSS Handheld LiDAR Sensor de GreenValley";
const SINO = "Sino gnss T10plus+T70pro";
const APEKS_STATION = "station total avec ces accessoires ( réflecteur, canne et trépied)";
const RUIDE = "Station total de marque RUIDE";
const STONEX_STATION = "Station total de marque Stonex";
const CHC_STATION = "Station totale de marque CHC NAV";
const TERSUS_STATION = "Station totale de Marque TERSUS";
const UNISTRONG = "Unistrong G970II pro GNSS=e-Survey E600";
const PACK =
  "Voici un gnss complet avec ses accessoires ( 2 trépied, canne, réflecteur, le bras, la radio, l'antenne et le PDA)";

const P = (folder, file) => `${folder}/${file}`;

const PLAN = {
  "efix-f8-visual-rtk": [P(EFIX, "WhatsApp Image 2026-09-28 at 22.36.21.jpeg")],
  "apeks-ap10-ap30": ["Gnss APEKS AP10+AP30.jpeg"],
  "chcnav-rtk-gnss": [P(CHC, "Gnss de marque CHC NAV.jpeg")],
  "pilotnav-p10-p10": ["Gnss de marque PILOTNAV model  P10+P10.jpeg"],
  "qiansun-gnss-rtk": ["Gnss de marque QIANSUN.jpeg"],
  "tersus-gnss-rtk": ["Gnss de marque TERSUS.jpeg"],
  "newdi-rtk-gnss": [
    P(NEWDI, "WhatsApp Image 2026-09-28 at 22.59.23.jpeg"),
    P(NEWDI, "WhatsApp Image 2026-09-28 at 22.59.23 (1).jpeg"),
    P(NEWDI, "WhatsApp Image 2026-09-28 at 22.59.23 (2).jpeg"),
    P(NEWDI, "WhatsApp Image 2026-09-28 at 22.59.44.jpeg"),
  ],
  "sinognss-t10-plus-t70-pro": [
    P(SINO, "WhatsApp Image 2026-09-28 at 23.06.59.jpeg"),
    P(SINO, "WhatsApp Image 2026-09-28 at 23.07.14.jpeg"),
    "Nouveau dossier/WhatsApp Image 2026-09-28 at 23.06.59.jpeg",
    "Nouveau dossier/WhatsApp Image 2026-09-28 at 23.06.59 (1).jpeg",
  ],
  "south-rtk-gnss": [
    P(SOUTH, "WhatsApp Image 2026-09-28 at 23.06.14.jpeg"),
    P(SOUTH, "WhatsApp Image 2026-09-28 at 23.06.14 (1).jpeg"),
  ],
  "stonex-rtk-gnss": [
    P(STONEX, "WhatsApp Image 2026-09-28 at 23.01.01.jpeg"),
    P(STONEX, "WhatsApp Image 2026-09-28 at 23.01.01 (1).jpeg"),
  ],
  "unistrong-g970ii-pro": [
    P(UNISTRONG, "WhatsApp Image 2026-09-28 at 22.37.03.jpeg"),
    P(UNISTRONG, "WhatsApp Image 2026-09-28 at 22.38.19.jpeg"),
    "Gnss de marque Unistrong G970.jpeg",
  ],
  "foif-a90-rtk": [
    P(FOIF, "WhatsApp Image 2026-09-28 at 23.15.49.jpeg"),
    P(FOIF, "WhatsApp Image 2026-09-28 at 23.15.49 (1).jpeg"),
    P(FOIF, "WhatsApp Image 2026-09-28 at 23.15.49 (2).jpeg"),
  ],
  "leica-na532-kit": [
    P(LEICA, "dee.jpeg"),
    P(LEICA, "WhatsApp Image 2026-09-28 at 22.48.26.jpeg"),
    P(LEICA, "WhatsApp Image 2026-09-28 at 22.48.26 (1).jpeg"),
  ],
  "topcon-atb4-niveau": [
    "Niveau de marque TOPCON ATB4 ( ça fonctionne toujours avec mire, trépied) comme accessoires.jpeg",
  ],
  "ligrip-se-lidar-rtk": [
    P(LIDAR, "WhatsApp Image 2026-09-28 at 23.19.04 (1).jpeg"),
    P(LIDAR, "WhatsApp Image 2026-09-28 at 23.19.04 (5).jpeg"),
    P(LIDAR, "WhatsApp Image 2026-09-28 at 23.19.04 (3).jpeg"),
    P(LIDAR, "WhatsApp Image 2026-09-28 at 23.19.04 (2).jpeg"),
    P(LIDAR, "WhatsApp Image 2026-09-28 at 23.19.04.jpeg"),
  ],
  "pack-brigade-gnss-complet": [
    P(PACK, "WhatsApp Image 2026-09-28 at 23.02.13 (1).jpeg"),
    P(PACK, "WhatsApp Image 2026-09-28 at 23.02.13.jpeg"),
    P(PACK, "WhatsApp Image 2026-09-28 at 23.02.13 (2).jpeg"),
    P(PACK, "WhatsApp Image 2026-09-28 at 23.02.13 (3).jpeg"),
    P(PACK, "WhatsApp Image 2026-09-28 at 23.02.13 (4).jpeg"),
  ],
  "ruide-rcs-rts822": [
    P(RUIDE, "WhatsApp Image 2026-09-28 at 23.03.48 (1).jpeg"),
    P(RUIDE, "WhatsApp Image 2026-09-28 at 23.03.48.jpeg"),
    P(RUIDE, "WhatsApp Image 2026-09-28 at 23.03.48 (2).jpeg"),
    P(RUIDE, "WhatsApp Image 2026-09-28 at 23.03.48 (4).jpeg"),
    P(RUIDE, "WhatsApp Image 2026-09-28 at 23.03.48 (3).jpeg"),
  ],
  "south-station-totale": ["Station total de marque SOUTH.jpeg"],
  "stonex-station-totale": [
    P(STONEX_STATION, "WhatsApp Image 2026-09-28 at 23.09.07 (1).jpeg"),
    P(STONEX_STATION, "WhatsApp Image 2026-09-28 at 23.09.07 (3).jpeg"),
    P(STONEX_STATION, "WhatsApp Image 2026-09-28 at 23.09.07.jpeg"),
    P(STONEX_STATION, "WhatsApp Image 2026-09-28 at 23.09.07 (2).jpeg"),
  ],
  "chcnav-station-totale": [
    P(CHC_STATION, "WhatsApp Image 2026-09-28 at 22.58.05 (2).jpeg"),
    P(CHC_STATION, "WhatsApp Image 2026-09-28 at 22.58.05 (1).jpeg"),
    P(CHC_STATION, "WhatsApp Image 2026-09-28 at 22.58.05.jpeg"),
  ],
  "tersus-station-totale": [
    P(TERSUS_STATION, "WhatsApp Image 2026-09-28 at 23.31.04 (1).jpeg"),
    P(TERSUS_STATION, "WhatsApp Image 2026-09-28 at 23.31.04.jpeg"),
    P(TERSUS_STATION, "WhatsApp Image 2026-09-28 at 23.31.04 (2).jpeg"),
  ],
  "station-totale-apeks": [P(APEKS_STATION, "WhatsApp Image 2026-09-28 at 22.42.34.jpeg")],
};

const SKIPPED = [
  ["Gnss de HI TARGET.zip", "marque absente du catalogue"],
  ["Station total de marque RUIDE/RUIDE RCS _RTS-822R10m.pdf", "fiche technique PDF (non intégrée)"],
  ["Global version EFIX F8 visual RTK +IMU + dual cameras/WhatsApp Video 2026-09-28 at 22.34.10.mp4", "vidéo (traitée séparément)"],
  ["Gnss de marque NEWDI/WhatsApp Video 2026-09-28 at 22.59.26.mp4", "vidéo (traitée séparément)"],
  ["Station total de marque RUIDE/lili.mp4", "vidéo (traitée séparément)"],
  ["Station total de marque RUIDE/WhatsApp Video 2026-09-28 at 23.03.48.mp4", "vidéo (traitée séparément)"],
  [`${PACK}/WhatsApp Video 2026-09-28 at 23.02.13.mp4`, "vidéo (traitée séparément)"],
];

let failures = 0;
let processed = 0;
let totalIn = 0;
let totalOut = 0;

console.log(
  dryRun
    ? "\nSimulation — aucune fiche ne sera modifiée\n"
    : "\nImport des photos produits\n"
);

for (const [slug, files] of Object.entries(PLAN)) {
  if (only && slug !== only) continue;
  processed++;
  const dir = join(PRODUCTS_DIR, slug);
  const md = join(dir, "index.md");
  if (!existsSync(md)) {
    console.error(`✗ ${slug} : fiche introuvable`);
    failures++;
    continue;
  }
  if (files.length > MAX_IMAGES) {
    console.error(`✗ ${slug} : ${files.length} images (maximum ${MAX_IMAGES})`);
    failures++;
    continue;
  }
  const missing = files.filter((f) => !existsSync(join(SOURCE, f)));
  if (missing.length) {
    console.error(`✗ ${slug} : source(s) introuvable(s)`);
    for (const f of missing) console.error(`   ${f}`);
    failures++;
    continue;
  }

  if (dryRun) {
    console.log(`· ${slug} : ${files.length} image(s)`);
    for (const f of files) totalIn += readFileSync(join(SOURCE, f)).length;
    continue;
  }

  const written = [];
  for (let i = 0; i < files.length; i++) {
    const input = readFileSync(join(SOURCE, files[i]));
    const webp = await toWebp(input);
    const name = i === 0 ? "cover.webp" : `${i}.webp`;
    writeFileSync(join(dir, name), webp);
    written.push({ name, input: input.length, output: webp.length, src: files[i] });
    totalIn += input.length;
    totalOut += webp.length;
  }

  for (const name of readdirSync(dir)) {
    if (/^\d+\.webp$/.test(name) && !written.some((w) => w.name === name)) {
      unlinkSync(join(dir, name));
    }
  }

  patchFrontmatter(md, { cover: "./cover.webp" });
  patchList(
    md,
    "gallery",
    written.filter((w) => w.name !== "cover.webp").map((w) => `./${w.name}`)
  );

  console.log(
    `✓ ${slug} : ${written.length} image(s), ${Math.round(
      written.reduce((s, w) => s + w.output, 0) / 1024
    )} Ko — couverture ${written[0].src.split("/").pop()}`
  );
}

if (dryRun) {
  console.log(`\n${processed} produit(s), ${Math.round(totalIn / 1024)} Ko source.`);
} else {
  console.log(
    `\n${processed} produit(s) — ${Math.round(totalIn / 1024)} Ko → ${Math.round(
      totalOut / 1024
    )} Ko.`
  );
}

console.log("\nNon intégré (volontairement) :");
for (const [file, reason] of SKIPPED) console.log(`  · ${file} — ${reason}`);

if (failures) process.exit(1);
