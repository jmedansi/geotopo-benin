/**
 * Accès au contenu Markdown du site (collections Astro) depuis les scripts.
 *
 * Même lecture de frontmatter que scripts/check-content.mjs — volontairement
 * dupliquée pour ne pas mettre en jeu la porte d'entrée du build, mais les
 * règles d'écriture (patch, création de produit) sont ici.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { makeCover } from "./placeholder.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CONTENT_DIR = join(ROOT, "src", "content");
export const PRODUCTS_DIR = join(CONTENT_DIR, "products");
export const CATEGORIES_DIR = join(CONTENT_DIR, "categories");
export const PACKS_DIR = join(CONTENT_DIR, "packs");
export const CHECK_FILE = join(ROOT, "scripts", "check-content.mjs");

/* Lecture ---------------------------------------------------------------- */

export function readFrontmatter(file) {
  const txt = readFileSync(file, "utf8");
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { raw: null, body: txt, text: txt };
  return { raw: m[1], body: txt.slice(m[0].length), text: txt };
}

export function scalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  if (!m) return undefined;
  const v = m[1];
  if (v === "") return undefined;
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(v)) return v.slice(1, -1);
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

export function listOf(fm, key) {
  const flow = fm.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, "m"));
  if (flow) {
    return flow[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  const m = fm.match(new RegExp(`^${key}:\\s*$`, "m"));
  if (!m) return [];
  const items = [];
  for (const line of fm.slice(m.index + m[0].length).split(/\r?\n/)) {
    if (/^\s*-\s+/.test(line)) {
      items.push(line.replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
    } else if (/^\S/.test(line) && line.trim() !== "") {
      break;
    }
  }
  return items;
}

export const listDirs = (p) =>
  !existsSync(p)
    ? []
    : readdirSync(p).filter((n) => {
        const full = join(p, n);
        return statSync(full).isDirectory() && !n.startsWith("_");
      });

export const listMd = (p) =>
  !existsSync(p) ? [] : readdirSync(p).filter((n) => n.endsWith(".md"));

export function categorySlugs() {
  return listMd(CATEGORIES_DIR).map((f) => basename(f, ".md"));
}

/** Retire les guillemets d'une valeur YAML et décode ses échappements. */
const unquote = (s) => {
  const t = String(s).trim();
  if (/^"[\s\S]*"$/.test(t)) {
    try {
      return JSON.parse(t);
    } catch {
      /* échappement non standard : on retire simplement les guillemets */
    }
  }
  return t.replace(/^["']|["']$/g, "");
};

/** Libellés français des catégories : slug → titre du fichier. */
export function categoryTitles() {
  const map = {};
  for (const m of categoryMeta()) map[m.slug] = m.title;
  return map;
}

/** Catégories dans l'ordre d'affichage du site (frontmatter `order`). */
export function categoryMeta() {
  return listMd(CATEGORIES_DIR)
    .map((f) => {
      const slug = basename(f, ".md");
      const { raw } = readFrontmatter(join(CATEGORIES_DIR, f));
      return {
        slug,
        title: (raw && scalar(raw, "title")) || slug,
        order: (raw && scalar(raw, "order")) || 99,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/** Produits qui disposent d'un guide client (frontmatter `product:`). */
export function guideSlugs() {
  const dir = join(CONTENT_DIR, "guides");
  const out = new Set();
  for (const f of listMd(dir)) {
    const { raw } = readFrontmatter(join(dir, f));
    const p = raw && scalar(raw, "product");
    if (p) out.add(p);
  }
  return out;
}

/** Produit slug → titres des packs qui le contiennent. */
export function packIndex() {
  const map = new Map();
  for (const dir of listDirs(PACKS_DIR)) {
    const file = join(PACKS_DIR, dir, "index.md");
    if (!existsSync(file)) continue;
    const { raw } = readFrontmatter(file);
    if (!raw) continue;
    const title = scalar(raw, "title") || dir;
    for (const p of listOf(raw, "products")) {
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(title);
    }
  }
  return map;
}

/**
 * Points forts du frontmatter : paires `value` / `label` du bloc `highlights:`.
 * `listOf()` ne fonctionne pas ici (bloc structuré, pas liste de scalaires).
 */
export function highlightPairs(fm) {
  if (!fm) return [];
  const head = fm.match(/^highlights:\s*$/m);
  if (!head) return [];
  const out = [];
  let cur = null;
  for (const line of fm.slice(head.index + head[0].length).split(/\r?\n/)) {
    // style bloc : `- value: "x"` puis `  label: "y"`
    const flow = line.match(/^\s*-\s*\{\s*value:\s*(.+?),\s*label:\s*(.+?)\s*\}/);
    const v = flow ? null : line.match(/^\s*-\s+value:\s*(.+?)\s*$/);
    const l = flow ? null : line.match(/^\s+label:\s*(.+?)\s*$/);
    if (flow) {
      out.push({ value: unquote(flow[1]), label: unquote(flow[2]) });
      cur = out[out.length - 1];
    } else if (v) {
      cur = { value: unquote(v[1]), label: "" };
      out.push(cur);
    } else if (l && cur) {
      cur.label = unquote(l[1]);
    } else if (/^\S/.test(line) && line.trim() !== "") {
      break;
    }
  }
  return out;
}

/** Nombre d'entrées (clés ou items) dans un bloc de niveau 0 — `specs:` compris. */
export function blockEntryCount(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*$`, "m"));
  if (!m) return 0;
  let n = 0;
  for (const line of fm.slice(m.index + m[0].length).split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (/^\s/.test(line)) n++;
    else break;
  }
  return n;
}

/** Nombre de mots du corps Markdown (frontmatter exclu) — cf. check-content.mjs */
export function bodyWordCount(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/* Écriture --------------------------------------------------------------- */

const QUOTED = (v) => JSON.stringify(String(v));

/** Sérialise une valeur scalaire au style du frontmatter existant. */
function serialize(key, value) {
  if (value === null || value === undefined) return null; // → suppression
  if (typeof value === "number") return `${key}: ${value}`;
  if (typeof value === "boolean") return `${key}: ${value}`;
  return `${key}: ${QUOTED(value)}`;
}

/**
 * Patch ciblé du frontmatter : remplace, ajoute ou supprime des clés **scalars**
 * de niveau 0. Le corps Markdown et les structures imbriquées (listes, specs)
 * ne sont jamais touchés.
 *
 * @param {string} file chemin du .md
 * @param {Record<string, string|number|boolean|null>} updates null = supprimer la clé
 * @returns {{changed: string[], before: Record<string, unknown>}}
 */
export function patchFrontmatter(file, updates) {
  const { raw, body, text } = readFrontmatter(file);
  if (!raw) throw new Error(`frontmatter absent : ${file}`);

  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);
  const changed = [];
  const before = {};

  for (const [key, value] of Object.entries(updates)) {
    const idx = lines.findIndex((l) => l.startsWith(`${key}:`));
    const isBlock = idx >= 0 && /^\s*$/.test(lines[idx].slice(key.length + 1));

    if (idx >= 0 && isBlock) {
      // Clé à structure (liste / objet) : hors périmètre de ce patcher.
      continue;
    }

    const oldLine = idx >= 0 ? lines[idx] : undefined;
    const oldValue = oldLine === undefined ? undefined : scalar(raw, key);
    const newLine = serialize(key, value);

    if (oldLine === undefined && newLine === null) continue;
    if (oldLine === newLine) continue;

    if (newLine === null) {
      lines.splice(idx, 1);
    } else if (idx >= 0) {
      lines[idx] = newLine;
    } else {
      // Clé absente : on l'ajoute en fin de frontmatter (colonnes 0).
      while (lines.length && lines[lines.length - 1] === "") lines.pop();
      lines.push(newLine);
    }

    if (oldValue !== (value ?? undefined)) changed.push(key);
    before[key] = oldValue;
  }

  if (!changed.length) return { changed: [], before };

  writeFileSync(file, `---${eol}${lines.join(eol)}${eol}---${body}`, "utf8");
  return { changed, before };
}

/** Lignes indentées d'un bloc de niveau 0, sans l'en-tête `key:`. */
export function getBlockLines(fm, key) {
  const lines = String(fm).split(/\r?\n/);
  const start = lines.findIndex((l) => l === `${key}:`);
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    if (/^\s/.test(lines[i])) out.push(lines[i]);
    else break;
  }
  return out;
}

/**
 * Remplace un bloc de niveau 0 (`highlights:` et ses lignes indentées).
 * @param {string} file
 * @param {string} key
 * @param {string[]} blockLines lignes indentées, sans l'en-tête `key:`
 */
export function patchBlock(file, key, blockLines) {
  const { raw, body, text } = readFrontmatter(file);
  if (!raw) throw new Error(`frontmatter absent : ${file}`);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((l) => l === `${key}:`);
  if (start < 0) throw new Error(`clé « ${key}: » introuvable dans ${file}`);
  let end = start + 1;
  while (end < lines.length && (lines[end] === "" || /^\s/.test(lines[end]))) end++;
  lines.splice(start, end - start, `${key}:`, ...blockLines);
  writeFileSync(file, `---${eol}${lines.join(eol)}${eol}---${body}`, "utf8");
}

/**
 * Remplace (ou crée) un bloc de liste de niveau 0 (`gallery:`, `youtube:`).
 * `items` vide supprime la clé. Les valeurs sont écrites entre guillemets.
 * @param {string} file
 * @param {string} key
 * @param {string[]} items
 */
export function patchList(file, key, items) {
  const { raw, body, text } = readFrontmatter(file);
  if (!raw) throw new Error(`frontmatter absent : ${file}`);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((l) => l === `${key}:` || l.startsWith(`${key}: `));
  let end = start + 1;
  if (start >= 0 && lines[start] === `${key}:`) {
    while (end < lines.length && (lines[end] === "" || /^\s/.test(lines[end]))) end++;
  }
  const block = items.length
    ? [`${key}:`, ...items.map((v) => `  - ${JSON.stringify(v)}`)]
    : [];
  if (start >= 0) {
    lines.splice(start, end - start, ...block);
  } else if (block.length) {
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    lines.push(...block);
  } else {
    return;
  }
  writeFileSync(file, `---${eol}${lines.join(eol)}${eol}---${body}`, "utf8");
}

/** Lignes YAML pour une liste d'objets `{ value, label }` (style bloc, comme les fiches existantes). */
export const highlightsLines = (items) =>
  items.flatMap((h) => [
    `  - value: ${JSON.stringify(h.value)}`,
    `    label: ${JSON.stringify(h.label)}`,
  ]);

/** slug URL-friendly, compatible avec la collection products. */export function slugify(title) {
  return String(title)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export const isSlug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 60;

/**
 * Corps de brouillon dans la plage 120-180 mots exigée par check-content.mjs.
 * Le texte réel est rédigé après, par l'intégrateur.
 */
export function draftBody(title, category) {
  const head = `### ${title}\n\nBrouillon de fiche produit pour ${title}, catégorie ${category}.`;
  const filler = [
    "Cette description sera rédigée à partir de la fiche technique du constructeur et des retours du terrain, en détaillant l'usage visé, les avantages concurrentiels et le public concerné par l'équipement.",
    "Le nombre de mots de ce paragraphe est contrôlé automatiquement à chaque build : la version définitive devra rester dans la même fourchette pour ne pas interrompre la mise en ligne.",
    "Les informations commerciales — prix, délai de livraison, disponibilité — sont renseignées depuis le tableau de suivi transmis par le client, puis vérifiées avant publication.",
    "Chaque fiche sera complétée par la galerie d'images réelles, les points forts mesurables, le contenu de la valise de transport et les cas d'usage typiques.",
    "Une fois les textes, les visuels et les spécifications confirmés, le passage en production se fait en basculant le statut de brouillon à publié.",
  ];
  let body = head;
  let i = 0;
  while (bodyWordCount(body) < 140 && i < filler.length) body += `\n\n${filler[i++]}`;
  if (bodyWordCount(body) < 120) {
    body += `\n\nTexte provisoire à remplacer par la description complète du produit avant publication.`;
  }
  const words = bodyWordCount(body);
  if (words < 120 || words > 180) {
    throw new Error(`corps de brouillon hors plage : ${words} mots (120-180 attendus)`);
  }
  return body;
}

/** Gabarit de fiche produit, conforme au schéma Zod + check-content.mjs. */
export function draftMarkdown({
  slug,
  title,
  category,
  brand,
  summary,
  price,
  availability,
  leadTime,
  highlights,
}) {
  const features = [
    `Équipement ${brand || title} conforme aux exigences des travaux topographiques`,
    "Installation et prise en main accompagnées par nos techniciens",
    "Documentation technique en français fournie avec le matériel",
    "SAV assuré sur place à Cotonou, pièces et main-d'œuvre incluses",
  ];
  const defaultHighlights = [
    { value: "Pro", label: "Qualité pro" },
    { value: "1 an", label: "Garantie" },
    { value: "CF", label: "SAV Cotonou" },
  ];
  const hl = highlights ?? defaultHighlights;
  const included = ["Appareil principal", "Batteries rechargeables", "Chargeur secteur", "Coffret de transport"];
  const useCases = ["Levés et implantations sur chantier", "Contrôle et suivi des ouvrages"];
  const lines = [
    "---",
    `title: ${QUOTED(title)}`,
    `category: ${QUOTED(category)}`,
  ];
  if (brand) lines.push(`brand: ${QUOTED(brand)}`);
  lines.push(
    `summary: ${QUOTED(summary)}`,
    `cover: "./cover.webp"`,
    `availability: ${QUOTED(availability)}`,
    `leadTime: ${QUOTED(leadTime)}`,
    `features:`,
    ...features.map((f) => `  - ${QUOTED(f)}`),
    `highlights:`,
    ...highlightsLines(hl),
    `included:`,
    ...included.map((v) => `  - ${QUOTED(v)}`),
    `useCases:`,
    ...useCases.map((v) => `  - ${QUOTED(v)}`),
    `specs:`,
    `  Référence: ${QUOTED(slug)}`,
    `  Origine: ${QUOTED(brand || "À préciser")}`,
    `  État: "Neuf"`,
  );
  if (price !== null) lines.push(`price: ${price}`);
  lines.push(
    `related: []`,
    `featured: false`,
    `order: 0`,
    `draft: true`,
    "---",
    "",
    draftBody(title, category),
    ""
  );
  return lines.join("\n");
}

/**
 * Crée un produit en brouillon (fichier + couverture de remplacement).
 * @returns {Promise<{created: string[], dir: string}>}
 */
export async function createDraftProduct(fields) {
  const dir = join(PRODUCTS_DIR, fields.slug);
  const file = join(dir, "index.md");
  if (existsSync(file)) throw new Error(`le produit existe déjà : ${fields.slug}`);

  const created = [];
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, draftMarkdown(fields), "utf8");
  created.push(`src/content/products/${fields.slug}/index.md`);

  const cover = join(dir, "cover.webp");
  const hasCover = await makeCover(cover, {
    label: fields.slug,
    category: fields.category,
  });
  if (hasCover) created.push(`src/content/products/${fields.slug}/cover.webp`);

  return { created, dir };
}

/** Dernier commit touchant un chemin (pour l'onglet « État du site »). */
export function gitLastChange(relPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%h|%cI|%s", "--", relPath],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (!out) return { hash: "", date: "", subject: "" };
    const [hash, date, ...rest] = out.split("|");
    return { hash, date: date.slice(0, 10), subject: rest.join("|") };
  } catch {
    return { hash: "", date: "", subject: "" };
  }
}

/**
 * Met à jour automatiquement le compteur `products: N` de check-content.mjs
 * après un ajout. Échoue bruyamment plutôt que de trahir silencieusement.
 */
export function bumpExpectedProducts(count) {
  const src = readFileSync(CHECK_FILE, "utf8");
  const re = /(products:\s*)(\d+)/g;
  const hits = [...src.matchAll(re)];
  if (hits.length !== 1) {
    throw new Error(
      `${hits.length} compteurs \`products:\` trouvés dans scripts/check-content.mjs (1 attendu)`
    );
  }
  const next = src.replace(re, (_, p1, p2) => `${p1}${p2 === String(count) ? p2 : count}`);
  if (next === src) return false;
  writeFileSync(CHECK_FILE, next, "utf8");
  return true;
}

/* Lecture catalogue -------------------------------------------------------- */

/**
 * État courant du catalogue, normalisé pour le tableau de suivi.
 * @returns {{products: Array<Record<string, unknown>>, categories: string[]}}
 */
export function readCatalog() {
  const categories = categorySlugs();
  const labels = categoryTitles();
  const guides = guideSlugs();
  const packs = packIndex();
  const products = listDirs(PRODUCTS_DIR).map((slug) => {
    const file = join(PRODUCTS_DIR, slug, "index.md");
    const { raw } = readFrontmatter(file);
    const dir = join(PRODUCTS_DIR, slug);
    const images = existsSync(dir)
      ? readdirSync(dir).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f))
      : [];
    const price = raw ? scalar(raw, "price") : undefined;
    const git = gitLastChange(`src/content/products/${slug}`);
    const category = raw ? scalar(raw, "category") ?? "" : "";
    return {
      slug,
      title: raw ? scalar(raw, "title") ?? "" : "",
      category,
      categoryTitle: labels[category] ?? category,
      brand: raw ? scalar(raw, "brand") ?? "" : "",
      summary: raw ? scalar(raw, "summary") ?? "" : "",
      price: typeof price === "number" ? price : null,
      availability: raw ? scalar(raw, "availability") ?? "" : "",
      leadTime: raw ? scalar(raw, "leadTime") ?? "" : "",
      featured: raw ? scalar(raw, "featured") === true : false,
      order: raw ? (scalar(raw, "order") ?? 0) : 0,
      draft: raw ? scalar(raw, "draft") === true : false,
      images: images.length,
      video: raw ? listOf(raw, "youtube").length : 0,
      specs: raw ? blockEntryCount(raw, "specs") : 0,
      highlights: highlightPairs(raw),
      featuresCount: raw ? listOf(raw, "features").length : 0,
      useCasesCount: raw ? listOf(raw, "useCases").length : 0,
      includedCount: raw ? listOf(raw, "included").length : 0,
      guide: guides.has(slug),
      packs: packs.get(slug) ?? [],
      updatedAt: git.date,
      commit: git.hash,
      note: git.subject,
    };
  });
  return { products, categories };
}
