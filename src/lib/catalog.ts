/**
 * Helpers d'accès au catalogue.
 *
 * Tous les filtres excluent les entrées `draft: true` : un brouillon n'est
 * ni listé, ni généré.
 */

import { getCollection, type CollectionEntry } from "astro:content";

export type ProductEntry = CollectionEntry<"products">;
export type PackEntry = CollectionEntry<"packs">;
export type CategoryEntry = CollectionEntry<"categories">;
export type GuideEntry = CollectionEntry<"guides">;

/* Catégories ------------------------------------------------------------- */

export async function getVisibleCategories(): Promise<CategoryEntry[]> {
  return (await getCollection("categories")).sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export const getCategories = getVisibleCategories;

export async function getCategoryBySlug(slug: string): Promise<CategoryEntry | undefined> {
  return (await getVisibleCategories()).find((c) => c.id === slug);
}

/* Produits --------------------------------------------------------------- */

export async function getVisibleProducts(): Promise<ProductEntry[]> {
  return (await getCollection("products", ({ data }) => !data.draft)).sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export const getProducts = getVisibleProducts;

export async function getProductBySlug(slug: string): Promise<ProductEntry | undefined> {
  return (await getVisibleProducts()).find((p) => p.id === slug);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductEntry[]> {
  const all = await getVisibleProducts();
  return all.filter((p) => p.data.featured).slice(0, limit);
}

export async function getProductsByCategory(slug: string): Promise<ProductEntry[]> {
  const all = await getVisibleProducts();
  return all.filter((p) => p.data.category === slug);
}

/**
 * Produits liés à une fiche : `related` s'il est renseigné, sinon les autres
 * produits de la même catégorie (guide §5 : 4 maximum).
 */
export async function getRelated(
  productSlug: string,
  category: string,
  limit = 4
): Promise<ProductEntry[]> {
  const all = await getVisibleProducts();
  const me = all.find((p) => p.id === productSlug);
  const explicit = me?.data.related ?? [];

  if (explicit.length) {
    return explicit
      .map((slug) => all.find((p) => p.id === slug))
      .filter((p): p is ProductEntry => Boolean(p) && p.id !== productSlug)
      .slice(0, limit);
  }

  return all
    .filter((p) => p.id !== productSlug && p.data.category === category)
    .slice(0, limit);
}

/* Packs ------------------------------------------------------------------ */

export async function getVisiblePacks(): Promise<PackEntry[]> {
  return (await getCollection("packs", ({ data }) => !data.draft)).sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export const getPacks = getVisiblePacks;

export async function getPackBySlug(slug: string): Promise<PackEntry | undefined> {
  return (await getVisiblePacks()).find((p) => p.id === slug);
}

/** Produits d'un pack, dans l'ordre déclaré dans le frontmatter. */
export async function getPackProducts(pack: PackEntry): Promise<ProductEntry[]> {
  const all = await getVisibleProducts();
  return pack.data.products
    .map((slug) => all.find((p) => p.id === slug))
    .filter((p): p is ProductEntry => p !== undefined);
}

/* Guides secrets --------------------------------------------------------- */

/** Guide associé à un produit, s'il existe (pour la mention sur la fiche). */
export async function getGuideFor(productSlug: string): Promise<GuideEntry | undefined> {
  const all = await getCollection("guides");
  return all.find((g) => g.data.product === productSlug);
}

/**
 * Guide par jeton secret — route /guide/[token] (guide §6 ter).
 * Un guide en brouillon n'est jamais servi.
 */
export async function getGuideByToken(token: string): Promise<GuideEntry | undefined> {
  const all = await getCollection("guides");
  return all.find((g) => g.data.token === token);
}