/**
 * Images WebP de remplacement (couverture d'un produit importé).
 *
 * Même identité visuelle que scripts/generate-placeholders.mjs :
 * fond sombre, grille de coordonnées, réticule orange, libellé centré.
 * Un fichier déjà présent n'est jamais écrasé.
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const PALETTE = {
  "stations-totales": { bg: "#1f2a36", fg: "#ff7a1a", accent: "#4a5b6d" },
  "gnss-gps": { bg: "#13212e", fg: "#ffb066", accent: "#2e4256" },
  niveaux: { bg: "#243447", fg: "#ff7a1a", accent: "#4d627a" },
  "lasers-distancemetres": { bg: "#1a2530", fg: "#ffb066", accent: "#33475b" },
  "drones-scanners": { bg: "#0f1a24", fg: "#ff7a1a", accent: "#26384a" },
  accessoires: { bg: "#2a3644", fg: "#ffb066", accent: "#4a5d72" },
  packs: { bg: "#101923", fg: "#ff7a1a", accent: "#2b3d4f" },
  _default: { bg: "#1b2632", fg: "#ff9a3d", accent: "#3a4a5c" },
};

const W = 1200;
const H = 900;

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
      <path d="M0 0H48V48" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
    </pattern>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <g stroke="${fg}" stroke-width="2" fill="none" opacity="0.7">
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

/**
 * Génère `cover.webp` dans `dir`. Retourne true si le fichier a été créé.
 * @param {string} outPath chemin complet du fichier .webp
 * @param {{label: string, category?: string, sub?: string}} opts
 */
export async function makeCover(outPath, opts) {
  if (existsSync(outPath)) return false;
  const palette = PALETTE[opts.category] ?? PALETTE._default;
  mkdirSync(dirname(outPath), { recursive: true });
  const content = svg({
    ...palette,
    label: (opts.label ?? "PRODUIT").toUpperCase(),
    sub: opts.sub ?? "couverture",
  });
  await sharp(Buffer.from(content)).webp({ quality: 82 }).toFile(outPath);
  return true;
}
