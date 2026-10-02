// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Sortie 100 % statique
  output: "static",

  // Domaine de production
  site: "https://topo.incidenx.com",

  integrations: [
    sitemap({
      // Exclure les guides secrets du sitemap
      filter: (page) => !page.includes("/guide/"),
    }),
  ],

  // Options de build
  build: {
    // Génère les assets avec hash pour le cache
    assets: "_assets",
  },

  // TypeScript strict (défini aussi dans tsconfig.json)
  vite: {
    // Empêche Vite d'importer des fichiers en dehors du src
    server: {
      fs: {
        strict: true,
      },
    },
  },
});
