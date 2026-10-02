import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const slug = args[0];
const title = args[1] || "Nouveau Produit";
const category = args[2] || "stations-totales";

if (!slug) {
  console.error("Usage: npm run new:product -- <slug> \"<Titre>\" <categorie>");
  console.error("Exemple: npm run new:product -- station-foif-rts352 \"Station Totale FOIF RTS352\" stations-totales");
  process.exit(1);
}

const targetDir = path.join(rootDir, "src", "content", "products", slug);

if (fs.existsSync(targetDir)) {
  console.error(`❌ Le dossier produit "${slug}" existe déjà dans ${targetDir}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

const content = `---
title: "${title}"
category: "${category}"
summary: "Phrase courte de 20 à 160 caractères pour les cartes et le SEO."
cover: ./cover.webp
gallery: []
availability: "sur-commande"
leadTime: "15 à 25 jours"
features:
  - "Précision millimétrique"
  - "Robuste et adapté aux conditions tropicales"
  - "Autonomie annoncée supérieure à 10 h"
  - "Export des données en CSV et DXF"
highlights:
  - { value: "1 mm", label: "précision" }
  - { value: "10 h", label: "autonomie" }
  - { value: "IP54", label: "protection" }
included:
  - "Appareil principal"
  - "2 batteries rechargeables"
  - "Chargeur de batterie"
  - "Coffret de transport rigide"
  - "Notice en français"
useCases:
  - "Implantation de points"
  - "Levé de détail"
specs:
  Précision: "À spécifier"
  Autonomie: "À spécifier"
  Protection: "IP54"
# Pas de clé \`price\` = tarif « Sur devis ». Ne jamais écrire \`price: 0\`.
price: 2500000
related: []
featured: false
order: 0
draft: false
---

## Description générale

Rédigez ici la description détaillée du produit : usage, avantages, public visé,
en 120 à 180 mots. Ce nombre de mots est contrôlé par \`npm run check\`.
`;

fs.writeFileSync(path.join(targetDir, "index.md"), content, "utf-8");
console.log(`✅ Produit "${title}" créé avec succès dans: ${targetDir}`);
