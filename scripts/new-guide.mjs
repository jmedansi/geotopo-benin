import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const productSlug = args[0];

if (!productSlug) {
  console.error("Usage: npm run new:guide -- <slug-produit>");
  console.error("Exemple: npm run new:guide -- st-m5");
  process.exit(1);
}

// Jeton aléatoire sécurisé de 24 caractères hexadécimaux
const token = crypto.randomBytes(12).toString("hex");

const targetFile = path.join(rootDir, "src", "content", "guides", `${productSlug}.md`);

if (fs.existsSync(targetFile)) {
  console.error(`❌ Le guide pour le produit "${productSlug}" existe déjà: ${targetFile}`);
  process.exit(1);
}

const content = `---
product: "${productSlug}"
token: "${token}"
title: "Guide d'utilisation et de mise en station"
---

# Guide d'utilisation réservé aux acheteurs

Merci pour votre achat ! Ce guide vous accompagne pas à pas dans la prise en main et l'étalonnage de votre équipement.

## 1. Déballage et vérifications initiales

- Vérifiez l'état du niveau à bulle.
- Chargez complètement les batteries avant la première sortie sur le terrain.

## 2. Mise en station pas à pas

1. Fixez le trépied à hauteur de poitrine.
2. Centrer le fil à plomb optique sur le repère au sol.
3. Ajustez les vis calantes pour centrer la bulle d'air.
`;

fs.writeFileSync(targetFile, content, "utf-8");
console.log(`✅ Guide créé pour "${productSlug}" !`);
console.log(`Lien secret client: /guide/${token}`);
