/**
 * Traitement des médias : URLs YouTube → IDs, images → WebP optimisé.
 * Utilisé par `scripts/media-import.mjs`.
 */

import sharp from "sharp";

/** URLs YouTube → IDs (watch, youtu.be, shorts, embed, live, ID brut). */
export function parseYouTubeIds(value) {
  const out = [];
  for (const token of String(value ?? "").trim().split(/[\s,;·|]+/).filter(Boolean)) {
    const m =
      token.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
      ) ?? token.match(/^([A-Za-z0-9_-]{11})$/);
    if (m && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/** Rotation EXIF + redimensionnement 1600 px + WebP qualité 82. */
export async function toWebp(buffer) {
  return sharp(buffer, { failOn: "none", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
