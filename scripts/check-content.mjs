/**
 * Valide le contenu avant le build. Échoue avec un message clair sinon.
 * Usage : node scripts/check-content.mjs
 *
 * `build` est câblé sur « npm run check && astro build » : ce script est la
 * porte d'entrée du build.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const C = join(root, "src", "content");

/* Attentes du PROMPT 0 ---------------------------------------------------- */
const EXPECTED = {
  categories: 6,
  products: 18,
  packs: 3,
  guides: 3,
  minWithRelated: 5,
  minFeatured: 4,
  minWithVideo: 3,
  /** Mots dans le corps Markdown. */
  bodyWords: { category: [120, 200], product: [120, 180] },
};

let errors = 0;
const fail = (m) => {
  console.error("✗ " + m);
  errors++;
};
const ok = (m) => console.log("✓ " + m);

/* Lecture du frontmatter ------------------------------------------------- */

function readFm(file) {
  const txt = readFileSync(file, "utf8");
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { raw: null, body: txt };
  return { raw: m[1], body: txt.slice(m[0].length) };
}

function scalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  if (!m) return undefined;
  const v = m[1];
  if (v === "") return undefined;
  if (/^".*"$/.test(v)) return v.slice(1, -1);
  if (/^'.*'$/.test(v)) return v.slice(1, -1);
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

/**
 * Liste d'items associée à `key:` — accepte le bloc (`- item`) et le flow
 * (`[a, b, c]`). Une ligne d'imbrication (`    text: ...`) ne termine pas la
 * lecture : seul une colonne 0 non vide l'arrête.
 */
function listOf(fm, key) {
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

/** Nombre d'entrées d'une liste en bloc, mapping imbriqué compris. */
function blockCount(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*$`, "m"));
  if (!m) return 0;
  let n = 0;
  for (const line of fm.slice(m.index + m[0].length).split(/\r?\n/)) {
    if (/^\s*-\s+/.test(line)) n++;
    else if (/^\S/.test(line) && line.trim() !== "") break;
  }
  return n;
}

/** Nombre de mots du corps Markdown (frontmatter exclu). */
function bodyWordCount(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/* Lecture des répertoires ----------------------------------------------- */

const listDirs = (p) =>
  !existsSync(p)
    ? []
    : readdirSync(p).filter((n) => {
        const full = join(p, n);
        return statSync(full).isDirectory() && !n.startsWith("_");
      });

const listMd = (p) =>
  !existsSync(p) ? [] : readdirSync(p).filter((n) => n.endsWith(".md"));

/* Catégories -------------------------------------------------------------- */

const catDir = join(C, "categories");
const catSlugs = new Set();

for (const f of listMd(catDir)) {
  const slug = basename(f, ".md");
  catSlugs.add(slug);
  const { raw, body } = readFm(join(catDir, f));
  if (!raw) {
    fail(`catégorie ${slug} : frontmatter manquant`);
    continue;
  }

  if (!scalar(raw, "tagline")) fail(`catégorie ${slug} : tagline manquant`);

  const tips = blockCount(raw, "tips");
  if (tips < 3 || tips > 4) {
    fail(`catégorie ${slug} : tips doit contenir 3 à 4 entrées (actuel ${tips})`);
  }

  const faq = blockCount(raw, "faq");
  if (faq < 2 || faq > 3) {
    fail(`catégorie ${slug} : faq doit contenir 2 à 3 entrées (actuel ${faq})`);
  }

  const w = bodyWordCount(body);
  const [wMin, wMax] = EXPECTED.bodyWords.category;
  if (w < wMin || w > wMax) {
    fail(`catégorie ${slug} : corps de ${w} mots (attendu ${wMin}-${wMax})`);
  }

  if (!existsSync(join(catDir, `${slug}.webp`))) {
    fail(`catégorie ${slug} : cover ${slug}.webp manquant`);
  }
}

if (catSlugs.size !== EXPECTED.categories) {
  fail(`${catSlugs.size} catégories au lieu de ${EXPECTED.categories}`);
} else {
  ok(`${catSlugs.size} catégories validées`);
}

/* Produits ---------------------------------------------------------------- */

const prodDir = join(C, "products");
const prodSlugs = new Set();
let withRelated = 0;
let withVideo = 0;
let featured = 0;

for (const slug of listDirs(prodDir)) {
  prodSlugs.add(slug);
  const file = join(prodDir, slug, "index.md");
  if (!existsSync(file)) {
    fail(`produit ${slug} : index.md manquant`);
    continue;
  }
  const { raw, body } = readFm(file);
  if (!raw) {
    fail(`produit ${slug} : frontmatter manquant`);
    continue;
  }

  const cat = scalar(raw, "category");
  if (!cat || !catSlugs.has(cat)) {
    fail(`produit ${slug} : catégorie « ${cat} » introuvable`);
  }

  const summary = scalar(raw, "summary") || "";
  if (summary.length < 20 || summary.length > 160) {
    fail(`produit ${slug} : summary de ${summary.length} caractères (attendu 20-160)`);
  }

  if (!existsSync(join(prodDir, slug, "cover.webp"))) {
    fail(`produit ${slug} : cover.webp manquant`);
  }

  for (const g of listOf(raw, "gallery").map((p) => p.replace(/^\.\//, ""))) {
    if (!existsSync(join(prodDir, slug, g))) {
      fail(`produit ${slug} : image de galerie manquante → ${g}`);
    }
  }

  const features = listOf(raw, "features");
  if (features.length < 4 || features.length > 6) {
    fail(`produit ${slug} : features doit contenir 4 à 6 entrées (actuel ${features.length})`);
  }

  const hl = blockCount(raw, "highlights");
  if (hl < 3 || hl > 4) {
    fail(`produit ${slug} : highlights doit contenir 3 à 4 entrées (actuel ${hl})`);
  }

  if (listOf(raw, "included").length < 1) fail(`produit ${slug} : included est vide`);

  const uc = listOf(raw, "useCases");
  if (uc.length < 2 || uc.length > 4) {
    fail(`produit ${slug} : useCases doit contenir 2 à 4 entrées (actuel ${uc.length})`);
  }

  if (!scalar(raw, "specs")) fail(`produit ${slug} : specs manquant`);

  for (const id of listOf(raw, "youtube")) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      fail(`produit ${slug} : identifiant YouTube mal formé « ${id} »`);
    }
  }
  if (listOf(raw, "youtube").length) withVideo++;

  const price = scalar(raw, "price");
  if (price !== undefined) {
    if (!Number.isInteger(price) || price <= 0) {
      fail(`produit ${slug} : price doit être un entier > 0 — omettre la clé pour « Sur devis »`);
    }
  }

  if (scalar(raw, "featured")) featured++;

  const w = bodyWordCount(body);
  const [wMin, wMax] = EXPECTED.bodyWords.product;
  if (w < wMin || w > wMax) {
    fail(`produit ${slug} : corps de ${w} mots (attendu ${wMin}-${wMax})`);
  }
}

/* related : deuxième passe, une fois tous les slugs collectés ------------- */

for (const slug of prodSlugs) {
  const { raw } = readFm(join(prodDir, slug, "index.md"));
  const rel = listOf(raw, "related");
  if (rel.length) withRelated++;
  if (rel.length > 4) {
    fail(`produit ${slug} : related accepte 4 entrées maximum (actuel ${rel.length})`);
  }
  for (const r of rel) {
    if (!prodSlugs.has(r)) fail(`produit ${slug} : related « ${r} » introuvable`);
  }
}

if (prodSlugs.size !== EXPECTED.products) {
  fail(`${prodSlugs.size} produits au lieu de ${EXPECTED.products}`);
} else {
  ok(`${prodSlugs.size} produits validés`);
}

for (const [label, actual, min] of [
  ["related", withRelated, EXPECTED.minWithRelated],
  ["vidéo YouTube", withVideo, EXPECTED.minWithVideo],
  ["featured", featured, EXPECTED.minFeatured],
]) {
  if (actual < min) fail(`au moins ${min} produits doivent définir « ${label} » (actuel ${actual})`);
  else ok(`${actual} produits avec ${label}`);
}

/* Packs ------------------------------------------------------------------ */

const packDir = join(C, "packs");
const packSlugs = new Set();

for (const slug of listDirs(packDir)) {
  packSlugs.add(slug);
  const file = join(packDir, slug, "index.md");
  if (!existsSync(file)) {
    fail(`pack ${slug} : index.md manquant`);
    continue;
  }
  const { raw } = readFm(file);
  if (!raw) {
    fail(`pack ${slug} : frontmatter manquant`);
    continue;
  }

  const prods = listOf(raw, "products");
  if (prods.length < 2) fail(`pack ${slug} : au moins 2 produits attendus`);
  for (const p of prods) {
    if (!prodSlugs.has(p)) fail(`pack ${slug} : produit « ${p} » introuvable`);
  }

  const price = scalar(raw, "price");
  if (price !== undefined && (!Number.isInteger(price) || price <= 0)) {
    fail(`pack ${slug} : price doit être un entier > 0 — omettre la clé pour « Sur devis »`);
  }

  if (!existsSync(join(packDir, slug, "cover.webp"))) {
    fail(`pack ${slug} : cover.webp manquant`);
  }
}

if (packSlugs.size !== EXPECTED.packs) {
  fail(`${packSlugs.size} packs au lieu de ${EXPECTED.packs}`);
} else {
  ok(`${packSlugs.size} packs validés`);
}

/* Guides secrets ---------------------------------------------------------- */

const guideDir = join(C, "guides");
const tokens = new Set();
const guideFiles = listMd(guideDir);

for (const f of guideFiles) {
  const { raw } = readFm(join(guideDir, f));
  if (!raw) {
    fail(`guide ${f} : frontmatter manquant`);
    continue;
  }
  const token = scalar(raw, "token") || "";
  if (token.length < 16) fail(`guide ${f} : token de ${token.length} caractères (16 minimum)`);
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    fail(`guide ${f} : token « ${token} » contient des caractères non autorisés`);
  }
  if (tokens.has(token)) fail(`guide ${f} : token déjà utilisé`);
  tokens.add(token);

  const prod = scalar(raw, "product");
  if (!prod || !prodSlugs.has(prod)) fail(`guide ${f} : produit « ${prod} » introuvable`);

  for (const id of listOf(raw, "youtube")) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      fail(`guide ${f} : identifiant YouTube mal formé « ${id} » (11 caractères attendus)`);
    }
  }
}

if (guideFiles.length !== EXPECTED.guides) {
  fail(`${guideFiles.length} guides au lieu de ${EXPECTED.guides}`);
} else {
  ok(`${guideFiles.length} guides validés (jetons uniques, ≥ 16 caractères)`);
}

/* Verdict ----------------------------------------------------------------- */

if (errors) {
  console.error(`\n${errors} erreur(s). Build interrompu.`);
  process.exit(1);
}
console.log("\nContenu OK.");