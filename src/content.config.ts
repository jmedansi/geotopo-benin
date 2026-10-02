import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Collection des catégories
 * Fichiers : src/content/categories/<slug>.md
 */
const categories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/categories" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tagline: z.string().optional(),
      cover: image().optional(),
      order: z.number().default(0),
      tips: z
        .array(
          z.object({
            title: z.string(),
            text: z.string(),
          })
        )
        .optional(),
      faq: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          })
        )
        .optional(),
    }),
});

/**
 * Collection des produits
 * Fichiers : src/content/products/<slug>/index.md
 */
const products = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.string(),
      brand: z.string().optional(),
      summary: z.string().max(160, "Le résumé doit comporter 160 caractères maximum"),
      cover: image(),
      gallery: z.array(image()).optional(),
      youtube: z.array(z.string()).optional(),
      availability: z.enum(["en-boutique", "sur-commande"]),
      leadTime: z.string().optional(),
      features: z.array(z.string()).default([]),
      specs: z.record(z.string(), z.string()).optional(),
      price: z.number().int().positive().optional(),
      related: z.array(z.string()).optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),
      highlights: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          })
        )
        .optional(),
      included: z.array(z.string()).optional(),
      useCases: z.array(z.string()).optional(),
    }),
});

/**
 * Collection des packs d'équipements
 * Fichiers : src/content/packs/<slug>/index.md
 */
const packs = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/packs" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      cover: image(),
      products: z.array(z.string()),
      price: z.number().int().positive().optional(),
      availability: z.enum(["en-boutique", "sur-commande"]),
      leadTime: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
});

/**
 * Collection des guides d'utilisation (réservés aux acheteurs par jeton secret)
 * Fichiers : src/content/guides/<slug>.md
 */
const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    product: z.string(),
    token: z.string().min(16, "Le jeton doit comporter au moins 16 caractères"),
    title: z.string(),
    youtube: z.array(z.string()).optional(),
  }),
});

export const collections = { categories, products, packs, guides };