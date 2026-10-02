/**
 * Génère les images WebP de remplacement (phase 1) : aplats de couleur,
 * grille de coordonnées et réticule, texte centré.
 *
 * Usage : node scripts/generate-placeholders.mjs
 * Un fichier déjà présent n'est jamais écrasé : supprimer l'image à
 * régénérer, puis relancer le script.
 */

import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/* Identité géotopographie : fond sombre, grille, accent orange chantier. */
const PALETTE = {
  "stations-totales": { bg: "#1f2a36", fg: "#ff7a1a", accent: "#4a5b6d" },
  "gnss-gps": { bg: "#13212e", fg: "#ffb066", accent: "#2e4256" },
  "niveaux": { bg: "#243447", fg: "#ff7a1a", accent: "#4d627a" },
  "lasers-distancemetres": { bg: "#1a2530", fg: "#ffb066", accent: "#33475b" },
  "drones-scanners": { bg: "#0f1a24", fg: "#ff7a1a", accent: "#26384a" },
  accessoires: { bg: "#2a3644", fg: "#ffb066", accent: "#4a5d72" },
  packs: { bg: "#101923", fg: "#ff7a1a", accent: "#2b3d4f" },
};

const W = 1200;
const H = 900; // ratio 4/3, cohérent avec ProductCard

/**
 * Taille de police adaptée à la longueur du libellé : en mono, la largeur
 * d'un caractère vaut environ 0,6 em. On vise 88 % de la largeur utile.
 */
function fitFontSize(label, maxWidth = W * 0.88) {
  const size = maxWidth / (Math.max(label.length, 1) * 0.6);
  return Math.round(Math.min(Math.max(size, 20), 110));
}

function svg({ bg, fg, accent, label, sub }) {
  const fontSize = fitFontSize(label);
  const subSize = Math.max(Math.round(fontSize * 0.42), 16);
  const cx = W / 2;
  const cy = H / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
    </pattern>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <g stroke="${fg}" stroke-width="2" opacity="0.7" fill="none">
    <circle cx="${cx}" cy="${cy}" r="60"/>
    <line x1="${cx - 80}" y1="${cy}" x2="${cx + 80}" y2="${cy}"/>
    <line x1="${cx}" y1="${cy - 80}" x2="${cx}" y2="${cy + 80}"/>
  </g>
  <text x="50%" y="${cy + fontSize * 0.36}" text-anchor="middle"
        font-family="ui-monospace, Menlo, Consolas, monospace"
        font-size="${fontSize}" fill="#ffffff">${label}</text>
  <text x="50%" y="${cy + fontSize * 0.36 + subSize * 1.8}" text-anchor="middle"
        font-family="ui-monospace, Menlo, Consolas, monospace"
        font-size="${subSize}" fill="${fg}" opacity="0.9">${sub}</text>
</svg>`;
}

async function makeFile(outPath, opts) {
  if (existsSync(outPath)) {
    console.log("· déjà présent, ignoré :", outPath.replace(root + "/", ""));
    return;
  }
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg(opts))).webp({ quality: 82 }).toFile(outPath);
  console.log("✓", outPath.replace(root + "/", ""));
}

/* Produits : 18 slugs répartis sur 6 catégories. */
const PRODUCTS = [
  ["stations-totales", "st-m5"],
  ["stations-totales", "st-x2"],
  ["stations-totales", "st-r1"],
  ["gnss-gps", "gx-lite"],
  ["gnss-gps", "gx-pro"],
  ["gnss-gps", "gx-hand"],
  ["niveaux", "no-32"],
  ["niveaux", "nd-02"],
  ["niveaux", "nl-360"],
  ["lasers-distancemetres", "lr-500"],
  ["lasers-distancemetres", "lr-green"],
  ["lasers-distancemetres", "dl-100"],
  ["drones-scanners", "dp-rtk"],
  ["drones-scanners", "dp-mini"],
  ["drones-scanners", "sl-go"],
  ["accessoires", "ta-160"],
  ["accessoires", "pr-360"],
  ["accessoires", "mt-5"],
];

/** Ces produits reçoivent deux vues supplémentaires (la moitié du catalogue). */
const WITH_GALLERY = [
  "st-m5",
  "gx-lite",
  "gx-pro",
  "no-32",
  "nd-02",
  "lr-500",
  "dp-rtk",
  "sl-go",
  "ta-160",
];

const PACKS = ["pack-implantation-chantier", "pack-gnss-base-rover", "pack-nivellement"];

const targets = [
  // Catégories : <slug>.webp, convention reprise par check-content.mjs
  ...Object.keys(PALETTE)
    .filter((k) => k !== "packs")
    .map((slug) => ({
      out: join(root, "src/content/categories", `${slug}.webp`),
      opts: { ...PALETTE[slug], label: slug, sub: "catégorie" },
    })),

  // Produits : cover.webp + éventuelles vues
  ...PRODUCTS.flatMap(([cat, slug]) => {
    const files = [
      {
        out: join(root, "src/content/products", slug, "cover.webp"),
        opts: { ...PALETTE[cat], label: slug.toUpperCase(), sub: "cover" },
      },
    ];
    if (WITH_GALLERY.includes(slug)) {
      for (const n of ["1", "2"]) {
        files.push({
          out: join(root, "src/content/products", slug, `${n}.webp`),
          opts: { ...PALETTE[cat], label: slug.toUpperCase(), sub: `vue ${n}` },
        });
      }
    }
    return files;
  }),

  // Packs
  ...PACKS.map((slug) => ({
    out: join(root, "src/content/packs", slug, "cover.webp"),
    opts: { ...PALETTE.packs, label: slug.toUpperCase(), sub: "pack" },
  })),
];

for (const t of targets) await makeFile(t.out, t.opts);

console.log(`\n${targets.length} placeholders traités.`);