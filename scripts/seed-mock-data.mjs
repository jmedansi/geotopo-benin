import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "src", "content");

async function generatePlaceholderImage(filePath, text, bgColor = "#C25B3A") {
  const safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${bgColor}"/>
      <circle cx="400" cy="300" r="220" stroke="rgba(255,255,255,0.15)" stroke-width="4" fill="none"/>
      <circle cx="400" cy="300" r="140" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <line x1="100" y1="300" x2="700" y2="300" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <line x1="400" y1="100" x2="400" y2="500" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <text x="50%" y="46%" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">GéoTopo Bénin</text>
      <text x="50%" y="56%" font-family="sans-serif" font-size="24" fill="#f0e6df" text-anchor="middle">${safeText}</text>
    </svg>
  `;

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await sharp(Buffer.from(svg))
    .webp({ quality: 80 })
    .toFile(filePath);
}

// Fonction pour générer un corps Markdown d'un nombre exact de mots
function generateBodyWords(targetWords = 140, title = "") {
  const paragraphs = [
    `Le matériel **${title}** est spécialement sélectionné par nos géomètres experts pour répondre aux contraintes du terrain en Afrique francophone et particulièrement au Bénin. Que vous travailliez dans le domaine du cadastre foncier, de l'aménagement urbain ou des grandes infrastructures de génie civil, cet instrument vous apporte une fiabilité constante et une précision mesurée.`,
    `Sur le chantier, la rapidité d'exécution et l'ergonomie sont déterminantes. Grâce à sa conception renforcée étanche aux poussières et aux fortes chaleurs tropicales, cet équipement réduit les interruptions de travail et sécurise vos données brutes avant l'exportation vers votre logiciel de DAO ou de SIG.`,
    `Toutes nos machines bénéficient d'un contrôle rigoureux en atelier à Cotonou avant livraison. Notre équipe technique reste disponible sur WhatsApp pour vous assister lors des premières mises en station et garantir une prise en main fluide par vos équipes.`,
    `Commandez directement en ligne avec livraison suivie ou sollicitez un devis sur mesure avec accessoires complémentaires adaptés à la configuration de vos chantiers.`,
  ];
  let fullText = paragraphs.join("\n\n");
  const words = fullText.split(/\s+/);
  if (words.length > targetWords) {
    fullText = words.slice(0, targetWords).join(" ") + ".";
  }
  return fullText;
}

async function run() {
  console.log("🌱 Génération certifiée conforme pour check-content.mjs...");

  if (fs.existsSync(contentDir)) {
    fs.rmSync(contentDir, { recursive: true, force: true });
  }

  // 1. Catégories (6)
  const categories = [
    {
      slug: "stations-totales",
      title: "Stations Totales & Théodolites",
      tagline: "Précision angulaire et télémétrie laser pour levé foncier et implantation.",
      description: "Appareils de mesure d'angles et de distances de haute précision pour le levé topographique, l'implantation de chantier et le contrôle d'ouvrages d'art.",
      order: 1,
      bgColor: "#2C1A0E",
      tips: [
        { title: "Précision angulaire", text: "Choisissez 1 pouce ou 2 pouces pour le bornage foncier et les ouvrages de génie civil." },
        { title: "Portée sans prisme", text: "La mesure sans réflecteur jusqu'à 600m permet de relever les façades inaccessibles." },
        { title: "Exportation des données", text: "Vérifiez le transfert direct DXF et DWG pour votre logiciel de DAO habituel." },
      ],
      faq: [
        { q: "Quelle est l'autonomie sur le terrain ?", a: "Nos stations totales sont livrées avec 2 batteries Li-ion assurant 16h de travail." },
        { q: "Assurez-vous l'étalonnage au Bénin ?", a: "Oui, notre atelier technique situé à Cotonou réalise le contrôle et l'étalonnage annuel." },
      ],
    },
    {
      slug: "gnss-gps",
      title: "Récepteurs GNSS & RTK",
      tagline: "Positionnement centimétrique multi-constellations pour cadastre et SIG.",
      description: "Systèmes de positionnement par satellite RTK centimétriques intégrant GPS, GLONASS, Galileo et BeiDou avec capteurs d'inclinaison IMU.",
      order: 2,
      bgColor: "#1D4ED8",
      tips: [
        { title: "Nombre de canaux", text: "Un récepteur de 800 à 1408 canaux garantit un fix rapide sous couvert végétal." },
        { title: "Capteur IMU", text: "L'inclinomètre IMU permet de mesurer avec précision sans centrer la bulle de la canne." },
        { title: "Radio UHF vs 4G", text: "Le mode UHF interne évite toute dépendance au réseau mobile en zone rurale." },
      ],
      faq: [
        { q: "Le RTK nécessite-t-il un abonnement ?", a: "En mode Base et Mobile UHF, aucun abonnement payant n'est nécessaire sur le terrain." },
        { q: "Le matérel résiste-t-il à la pluie ?", a: "Tous nos récepteurs sont certifiés IP67 ou IP68 contre l'eau et la poussière." },
      ],
    },
    {
      slug: "niveaux",
      title: "Niveaux Optiques & Numériques",
      tagline: "Nivellement direct, calcul de dénivelé et suivi de chantier.",
      description: "Niveaux automatiques de chantier, niveaux optiques de précision et niveaux numériques électroniques lisant sur mire à code-barres.",
      order: 3,
      bgColor: "#047857",
      tips: [
        { title: "Grossissement optique", text: "Un objectif 32x procure un confort de lecture optimal au-delà de 60 mètres." },
        { title: "Niveau numérique", text: "Le niveau numérique élimine 100% des erreurs de lecture et calcule le dénivelé." },
        { title: "Compensateur automatique", text: "Le compensateur magnétique stabilise la ligne de visée en cas de vibrations." },
      ],
      faq: [
        { q: "Le trépied est-il compris ?", a: "Le trépied et la mire sont vendus séparément ou en pack complet prêt à l'emploi." },
        { q: "Comment vérifier le calage ?", a: "La méthode du contrôle des deux visées est expliquée dans la notice fournie." },
      ],
    },
    {
      slug: "lasers-distancemetres",
      title: "Lasers Rotatifs & Distancemètres",
      tagline: "Alignement 360°, contrôle de nivellement et mesure rapide d'intérieur.",
      description: "Lasers rotatifs d'extérieur avec cellule de réception numérique, lasers de guidage et distancemètres électroniques portatifs.",
      order: 4,
      bgColor: "#D97706",
      tips: [
        { title: "Faisceau vert vs rouge", text: "Le faisceau vert offre une visibilité 4 fois supérieure pour les travaux d'intérieur." },
        { title: "Cellule de réception", text: "En extérieur, la cellule de guidage permet de travailler jusqu'à 500m de rayon." },
        { title: "Alimentation hybride", text: "Privilégiez les modèles acceptant à la fois batteries Li-ion et piles alcalines." },
      ],
      faq: [
        { q: "Quelle est la précision d'un laser rotatif ?", a: "Nos lasers d'extérieur affichent une précision de plus ou moins 1.5mm à 30 mètres." },
        { q: "Le laser est-il visible au soleil ?", a: "En plein soleil extérieur, l'utilisation de la cellule de réception est obligatoire." },
      ],
    },
    {
      slug: "drones-scanners",
      title: "Drones Photogrammétriques & Scanners 3D",
      tagline: "Modélisation nuage de points, orthophotos et volumétrie rapide.",
      description: "Drones de cartographie aérienne RTK et scanners laser 3D fixes ou portables pour relevés d'architecture, carrières et grands sites.",
      order: 5,
      bgColor: "#7C3AED",
      tips: [
        { title: "Module RTK aérien", text: "Le RTK embarqué sur le drone réduit fortement le nombre de points de calage au sol." },
        { title: "Obturateur mécanique", text: "L'obturateur mécanique évite le flou de bougé lors des prises de vue à grande vitesse." },
        { title: "Scanners SLAM", text: "Le scanner portable SLAM permet de numériser des intérieurs en marchant." },
      ],
      faq: [
        { q: "La formation au vol est-elle incluse ?", a: "Une journée d'initiation au pilotage et au logiciel de traitement est offerte." },
        { q: "Quel logiciel utiliser en photogrammétrie ?", a: "Nos drones sont compatibles avec Agisoft Metashape, Pix4D et DJI Terra." },
      ],
    },
    {
      slug: "accessoires",
      title: "Accessoires Topo, Trépieds & Prismes",
      tagline: "Trépieds lourds, mires télescopiques, prismes 360° et jallons.",
      description: "Tout le matériel de soutien robuste pour le topographe : trépieds aluminium et bois, prismes, cannes carbone et housses.",
      order: 6,
      bgColor: "#475569",
      tips: [
        { title: "Choix du trépied", text: "L'aluminium est idéal pour le chantier courant, le bois amortit mieux les vibrations." },
        { title: "Prisme 360°", text: "Le prisme omnidirectionnel évite de réorienter la cible avec les stations robotisées." },
        { title: "Canne carbone", text: "La fibre de carbone offre légèreté et stabilité thermique constante sur le terrain." },
      ],
      faq: [
        { q: "Les pas de vis sont-ils universels ?", a: "Oui, la fixation 5/8 pouces est le standard international pour toutes les marques." },
        { q: "La mire est-elle livrée avec étui ?", a: "Toutes nos mires sont livrées avec leur housse de protection imperméable." },
      ],
    },
  ];

  for (const cat of categories) {
    const catDir = path.join(contentDir, "categories");
    fs.mkdirSync(catDir, { recursive: true });

    // Fichier image cover dans src/content/categories/<slug>.webp
    const coverFile = path.join(catDir, `${cat.slug}.webp`);
    await generatePlaceholderImage(coverFile, cat.title, cat.bgColor);

    const tipsYaml = "tips:\n" + cat.tips.map((t) => `  - title: "${t.title}"\n    text: "${t.text}"`).join("\n");
    const faqYaml = "faq:\n" + cat.faq.map((f) => `  - q: "${f.q}"\n    a: "${f.a}"`).join("\n");

    const bodyText = generateBodyWords(145, cat.title);

    const mdContent = `---
title: "${cat.title}"
tagline: "${cat.tagline}"
description: "${cat.description}"
cover: ./${cat.slug}.webp
order: ${cat.order}
${tipsYaml}
${faqYaml}
---

${bodyText}
`;
    fs.writeFileSync(path.join(catDir, `${cat.slug}.md`), mdContent, "utf-8");
  }

  // 2. Produits (18)
  const products = [
    // Stations Totales
    {
      slug: "st-m5",
      title: "Station Totale Manuelle ST-M5",
      category: "stations-totales",
      brand: "GéoMaster",
      summary: "Station totale d'entrée de gamme robuste avec précision 5'' et double écran LCD rétroéclairé.",
      availability: "en-boutique",
      price: 1950000,
      featured: true,
      order: 1,
      specs: { Précision: "5''", Portée_prisme: "3000m", Autonomie: "16h", Protection: "IP65" },
      features: ["Double écran LCD rétroéclairé", "Clavier 28 touches alphanumérique", "Mémoire interne 20 000 points", "Batterie Li-ion longue durée"],
      highlights: [{ value: "5''", label: "Précision angulaire" }, { value: "16 h", label: "Autonomie continue" }, { value: "3 km", label: "Portée prisme" }],
      included: ["Station ST-M5", "2 Batteries Li-ion", "Chargeur secteur", "Coffret étanche"],
      useCases: ["Levés parcellaires", "Implantation de bâtiments", "Chantiers de voirie"],
      youtube: ["dQw4w9WgXcQ"],
      related: ["st-x2", "ta-160"],
      bgColor: "#C25B3A",
    },
    {
      slug: "st-x2",
      title: "Station Totale Laser ST-X2",
      category: "stations-totales",
      brand: "GéoMaster",
      summary: "Station de précision 2'' avec mesure sans réflecteur jusqu'à 600m et pointeur laser visible.",
      availability: "sur-commande",
      leadTime: "15 à 20 jours",
      featured: true,
      order: 2,
      specs: { Précision: "2''", Portée_sans_prisme: "600m", Autonomie: "18h", Écran: "Couleur tactile" },
      features: ["Mesure sans prisme 600m", "Pointeur laser rouge visible", "Transfert USB & Bluetooth", "Compensation double axe"],
      highlights: [{ value: "2''", label: "Précision suisse" }, { value: "600 m", label: "Sans prisme" }, { value: "IP66", label: "Étanche poussière" }],
      included: ["Station ST-X2", "Canne réflectrice", "Logiciel d'export PC", "Coffret rigide"],
      useCases: ["Cadastre urbain", "Ouvrages d'art", "Topographie routière"],
      youtube: ["dQw4w9WgXcQ"],
      related: ["st-m5", "pr-360"],
      bgColor: "#9E3E22",
    },
    {
      slug: "st-r1",
      title: "Station Totale Robotisée ST-R1",
      category: "stations-totales",
      brand: "GéoMaster",
      summary: "Station robotisée 1'' avec poursuite automatique de cible et contrôle à distance par carnet 4G.",
      availability: "sur-commande",
      leadTime: "20 à 30 jours",
      featured: true,
      order: 3,
      specs: { Précision: "1''", Suivi_cible: "Auto-tracking 800m", Moteurs: "Direct Drive Maglev" },
      features: ["Poursuite automatique du prisme", "Opération par un seul opérateur", "Caméra grand angle intégrée", "Connexion cloud 4G"],
      highlights: [{ value: "1''", label: "Haute précision" }, { value: "1 Op", label: "Travail en solo" }, { value: "4G", label: "Connecté Cloud" }],
      included: ["Station ST-R1", "Carnet de terrain Android 5''", "Prisme 360° actif", "Chargeur rapide"],
      useCases: ["Auscultation de barrages", "Implantation TGV", "Relevés de précision"],
      related: ["pr-360"],
      bgColor: "#7C2D12",
    },

    // GNSS RTK
    {
      slug: "gx-lite",
      title: "Récepteur GNSS RTK GX-Lite",
      category: "gnss-gps",
      brand: "NavGeo",
      summary: "Centromètre RTK compact 800 canaux avec capteur d'inclinaison IMU et autonomie 12h.",
      availability: "en-boutique",
      price: 2800000,
      featured: true,
      order: 4,
      specs: { Canaux: "800", Précision_RTK: "8mm + 1ppm", IMU: "Inclinaison 60°", Poids: "820g" },
      features: ["Capteur IMU sans étalonnage", "Radio UHF 2W intégrée", "Batterie longue durée 12h", "Châssis magnésium léger"],
      highlights: [{ value: "8 mm", label: "Précision RTK" }, { value: "60°", label: "Compensation IMU" }, { value: "800", label: "Canaux GNSS" }],
      included: ["Récepteur GX-Lite", "Antenne UHF", "Carnet tactile Android", "Canne carbone 2.15m"],
      useCases: ["Bornage foncier centimétrique", "Relevé SIG de réseaux", "Bordures de voies"],
      youtube: ["dQw4w9WgXcQ"],
      related: ["gx-pro", "ta-160"],
      bgColor: "#1D4ED8",
    },
    {
      slug: "gx-pro",
      title: "Récepteur GNSS RTK GX-Pro",
      category: "gnss-gps",
      brand: "NavGeo",
      summary: "Système RTK référence 1408 canaux multi-constellations avec radio longue portée 5km.",
      availability: "sur-commande",
      leadTime: "12 à 18 jours",
      featured: true,
      order: 5,
      specs: { Canaux: "1408", UHF: "Radio 5km", Autonomie: "16h", IP: "IP68 Submersible" },
      features: ["Suivi sous canopée dense", "Démarrage fixe en 4 secondes", "Modem 4G mondial intégré", "Guidage vocal intelligent"],
      highlights: [{ value: "1408", label: "Canaux satellites" }, { value: "5 km", label: "Radio UHF" }, { value: "IP68", label: "Chocs et immersion" }],
      included: ["Base & Mobile GX-Pro", "Trépied lourd aluminium", "Carnet durci avec logiciel Topo", "Coffret de transport"],
      useCases: ["Grands levés régionaux", "Cadastre rural", "Projets d'aménagement d'État"],
      related: ["gx-lite"],
      bgColor: "#1E40AF",
    },
    {
      slug: "gx-hand",
      title: "SIG Pocket GX-Hand Submétrique",
      category: "gnss-gps",
      brand: "NavGeo",
      summary: "Terminal SIG durci de poche pour la cartographie rapide de réseaux électriques et d'eau.",
      availability: "en-boutique",
      price: 1250000,
      featured: false,
      order: 6,
      specs: { Précision: "30cm (RTK 2cm opt)", Écran: "6'' Lisible en plein soleil", Android: "Android 12" },
      features: ["Appareil photo 13MP intégré", "Autonomie journée entière", "Lecteur code-barres 2D", "Norme militaire MIL-STD"],
      highlights: [{ value: "30 cm", label: "Précision SIG" }, { value: "6''", label: "Écran lisible soleil" }, { value: "IP67", label: "Robuste" }],
      included: ["GX-Hand", "Housse de ceinture", "Dragonne", "Chargeur rapide USB-C"],
      useCases: ["Inventaire d'actifs urbains", "Réseaux d'eau potable", "Cartographie d'arbres"],
      bgColor: "#1E3A8A",
    },

    // Niveaux
    {
      slug: "no-32",
      title: "Niveau Optique Automatique NO-32",
      category: "niveaux",
      brand: "PrecisionLevel",
      summary: "Niveau de chantier automatique grossissement 32x avec compensateur amorti magnétiquement.",
      availability: "en-boutique",
      price: 165000,
      featured: true,
      order: 7,
      specs: { Grossissement: "32x", Précision_1km: "1.5mm", Étanchéité: "IPX6" },
      features: ["Objectif clair 40mm haute résolution", "Vis micrométrique horizontale sans fin", "Boîtier métallique antichoc", "Cercle gradué 360°"],
      highlights: [{ value: "32x", label: "Grossissement" }, { value: "1.5 mm", label: "Écart-type / km" }, { value: "IPX6", label: "Résistant à la pluie" }],
      included: ["Niveau NO-32", "Fil à plomb", "Clé d'ajustement", "Coffret de transport"],
      useCases: ["Nivellement de dalle", "Contrôle de pente", "Terrassement"],
      related: ["mt-5", "ta-160"],
      bgColor: "#047857",
    },
    {
      slug: "nd-02",
      title: "Niveau Numérique Électronique ND-02",
      category: "niveaux",
      brand: "PrecisionLevel",
      summary: "Niveau électronique supprimant l'erreur de lecture optique. Précision 0.3mm par km.",
      availability: "sur-commande",
      leadTime: "10 à 15 jours",
      featured: false,
      order: 8,
      specs: { Précision: "0.3mm/km", Portée: "100m", Mémoire: "2000 mesures" },
      features: ["Lecture automatique sur mire code-barres", "Calcul instantané du dénivelé", "Export CSV par câble USB", "Écran LCD rétroéclairé"],
      highlights: [{ value: "0.3 mm", label: "Précision au km" }, { value: "0 Erreur", label: "Lecture automatique" }, { value: "USB", label: "Export direct" }],
      included: ["Niveau ND-02", "Mire code-barres 3m", "Câble de données", "Housse de transport"],
      useCases: ["Auscultation d'ouvrages", "Nivellement de haute précision", "Réseaux d'assainissement"],
      bgColor: "#065F46",
    },
    {
      slug: "nl-360",
      title: "Niveau Laser Lignes 360° NL-360 Vert",
      category: "niveaux",
      brand: "PrecisionLevel",
      summary: "Laser 3 lignes 360° faisceau vert haute visibilité pour l'aménagement intérieur et second œuvre.",
      availability: "en-boutique",
      price: 290000,
      featured: false,
      order: 9,
      specs: { Portée: "40m (70m avec cellule)", Faisceau: "Vert 520nm", Précision: "±2mm / 10m" },
      features: ["3 plans 360° indépendants", "Diode laser verte classe 2", "Support mural magnétique orientable", "Blocage du pendule"],
      highlights: [{ value: "3x360°", label: "Projection complète" }, { value: "Vert", label: "4x plus visible" }, { value: "Li-Ion", label: "Batterie USB-C" }],
      included: ["Laser NL-360", "Support magnétique", "Cible verte", "Batterie & Chargeur"],
      useCases: ["Pose de faux-plafonds", "Alignement de cloisons", "Pose de carrelage grand format"],
      bgColor: "#064E3B",
    },

    // Lasers & Distancemètres
    {
      slug: "lr-500",
      title: "Laser Rotatif Chantier LR-500",
      category: "lasers-distancemetres",
      brand: "LaserTech",
      summary: "Laser rotatif automatique d'extérieur avec cellule numérique et trépied à manivelle.",
      availability: "en-boutique",
      price: 480000,
      featured: false,
      order: 10,
      specs: { Portée: "500m diamètre", Précision: "±1.5mm / 30m", Rotation: "600 tr/min" },
      features: ["Auto-nivellement horizontal rapide", "Alerte de bousculade TILT automatique", "Cellule avec écran mm et pince", "Boîtier surmoulé antichoc"],
      highlights: [{ value: "500 m", label: "Diamètre d'action" }, { value: "IP66", label: "Chantier extérieur" }, { value: "60 h", label: "Autonomie piles" }],
      included: ["Laser LR-500", "Cellule de réception", "Pince de mire", "Coffret rigide"],
      useCases: ["Nivellement de grands terrains", "Coulage de dalles béton", "Contrôle de guidage d'engin"],
      bgColor: "#D97706",
    },
    {
      slug: "lr-green",
      title: "Laser Rotatif Double Pente LR-Green",
      category: "lasers-distancemetres",
      brand: "LaserTech",
      summary: "Laser rotatif de grande portée à faisceau vert avec réglage de pente numérique double axe ±10%.",
      availability: "sur-commande",
      leadTime: "12 à 18 jours",
      featured: false,
      order: 11,
      specs: { Portée: "800m", Pente: "Dual ±10%", Faisceau: "Vert de puissance" },
      features: ["Saisie directe de pente en %", "Télécommande radio 100m", "Masquage de secteur réglable", "Affichage numérique sur cellule"],
      highlights: [{ value: "800 m", label: "Portée extrême" }, { value: "±10%", label: "Double pente" }, { value: "Radio", label: "Télécommande 100m" }],
      included: ["LR-Green", "Télécommande radio", "Cellule de précision", "Batterie Li-ion"],
      useCases: ["Pistes d'atterrissage", "Canalisations à pente contrôlée", "Grands aménagement agricoles"],
      bgColor: "#B45309",
    },
    {
      slug: "dl-100",
      title: "Distancemètre Laser DL-100 Bluetooth",
      category: "lasers-distancemetres",
      brand: "LaserTech",
      summary: "Télémètre laser compact 100m avec calcul de surfaces, volumes et transfert Bluetooth vers smartphone.",
      availability: "en-boutique",
      price: 85000,
      featured: false,
      order: 12,
      specs: { Portée: "100m", Précision: "±1.5mm", Bluetooth: "iOS & Android" },
      features: ["Mesure Pythagore indirecte 3 points", "Écran couleur 2 pouces avec rotation", "Capteur d'inclinaison 360°", "Mémoire 50 dernières mesures"],
      highlights: [{ value: "100 m", label: "Portée laser" }, { value: "±1.5 mm", label: "Précision" }, { value: "App", label: "Plan croquis sur tel" }],
      included: ["DL-100", "Étui ceinture", "Dragonne", "Piles AAA"],
      useCases: ["Métré immobilier", "Devis de peinture et carrelage", "Contrôle de hauteurs sous plafond"],
      bgColor: "#92400E",
    },

    // Drones & Scanners
    {
      slug: "dp-rtk",
      title: "Drone Photogrammétrie DP-RTK",
      category: "drones-scanners",
      brand: "AeroScan",
      summary: "Drone quadricoptère de cartographie aérienne avec capteur 20MP obturateur mécanique et module RTK centimétrique.",
      availability: "sur-commande",
      leadTime: "15 à 25 jours",
      featured: true,
      order: 13,
      specs: { Autonomie: "45 min", Capteur: "20 MP 1'' CMOS", RTK: "Centimétrique intégrée", Poids: "920g" },
      features: ["Obturateur mécanique 1/2000s", "Planification de vol automatique", "Evitement d'obstacles omnidirectionnel", "Transmetteur vidéo HD 15km"],
      highlights: [{ value: "45 min", label: "Temps de vol" }, { value: "2 cm", label: "Précision MNT" }, { value: "20 MP", label: "Capteur mécanique" }],
      included: ["Drone DP-RTK", "Station radio avec écran", "3 Batteries de vol", "Station de recharge 4 entrées"],
      useCases: ["Cubature de carrières", "Cartographie cadastrale de grandes surfaces", "Suivi d'avancement de chantier"],
      bgColor: "#7C3AED",
    },
    {
      slug: "dp-mini",
      title: "Drone Cartographie Léger DP-Mini",
      category: "drones-scanners",
      brand: "AeroScan",
      summary: "Drone sous la barre des 249g certifié pour la cartographie rapide et l'inspection visuelle d'ouvrages.",
      availability: "en-boutique",
      price: 1450000,
      featured: false,
      order: 14,
      specs: { Poids: "249g", Vidéo: "4K 60fps", Autonomie: "34 min" },
      features: ["Ultra-portable de poche", "Détection d'obstacles tridirectionnelle", "Retransmission vidéo 10km", "Prise de vue verticale native"],
      highlights: [{ value: "< 249g", label: "Sans contrainte lourde" }, { value: "4K", label: "Vidéo Ultra-HD" }, { value: "34 min", label: "Autonomie" }],
      included: ["DP-Mini", "Radio télécommande Smart", "2 Batteries", "Sacoche de transport"],
      useCases: ["Inspection de toitures", "Photos d'avancement de chantier", "Levés rapides de parcelles"],
      bgColor: "#6D28D9",
    },
    {
      slug: "sl-go",
      title: "Scanner Laser 3D Portable SL-Go",
      category: "drones-scanners",
      brand: "AeroScan",
      summary: "Scanner SLAM à main pour la modélisation 3D en marchant dans les bâtiments, tunnels et forêts.",
      availability: "sur-commande",
      leadTime: "20 à 30 jours",
      featured: false,
      order: 15,
      specs: { Vitesse: "300 000 pts/sec", Portée: "100m", Technologie: "SLAM temps réel" },
      features: ["Numérisation continue en marchant", "Caméras panoramiques HD couleur", "Logiciel d'assemblage automatique", "Visualisation en direct sur tablette"],
      highlights: [{ value: "300k", label: "Points / seconde" }, { value: "SLAM", label: "Sans trépied" }, { value: "BIM", label: "Nuage de points 3D" }],
      included: ["Scanner SL-Go", "Sac à dos batterie", "Logiciel Post-traitement PC", "Valise de protection"],
      useCases: ["Modélisation BIM de bâtiments", "Relevés de galeries souterraines", "Inventaire forestier 3D"],
      bgColor: "#5B21B6",
    },

    // Accessoires
    {
      slug: "ta-160",
      title: "Trépied Aluminium Heavy Duty TA-160",
      category: "accessoires",
      brand: "TopoFit",
      summary: "Trépied aluminium renforcé à double blocage rapide pour stations totales et récepteurs GNSS.",
      availability: "en-boutique",
      price: 65000,
      featured: false,
      order: 16,
      specs: { Matériau: "Aluminium anodisé", Hauteur: "105 à 170cm", Poids: "4.5kg", Filetage: "5/8''" },
      features: ["Pieds en acier trempé avec ergots", "Sangle de transport à l'épaule", "Double système de serrage à levier", "Tête plate de fixation 160mm"],
      highlights: [{ value: "170 cm", label: "Hauteur max" }, { value: "5/8''", label: "Pas universel" }, { value: "4.5 kg", label: "Stable au vent" }],
      included: ["Trépied TA-160", "Sangle d'épaule", "Capuchon de tête"],
      useCases: ["Support station totale", "Support embase GNSS", "Chantiers exigeants"],
      bgColor: "#475569",
    },
    {
      slug: "pr-360",
      title: "Prisme Circulaire 360° + Canne Carbone PR-360",
      category: "accessoires",
      brand: "TopoFit",
      summary: "Ensemble prisme omnidirectionnel 360° en verre de quartz avec canne télescopique en fibre de carbone 2.20m.",
      availability: "en-boutique",
      price: 140000,
      featured: false,
      order: 17,
      specs: { Constante: "+7mm / 0mm", Canne: "Fibre de carbone 2.20m", Poids: "1.1kg" },
      features: ["Réflexion 360° sans réorienter", "Niveau à bulle 20' réglable", "Canne légère indeformable", "Verre optique traité antireflet"],
      highlights: [{ value: "360°", label: "Visée tous angles" }, { value: "Carbone", label: "Poids plume" }, { value: "Quartz", label: "Verre optique suisse" }],
      included: ["Prisme 360° PR-360", "Canne carbone graduée", "Housse de protection matelassée"],
      useCases: ["Levé automatisé avec station robotisée", "Cheminement rapide", "Levé parcellaire solo"],
      bgColor: "#334155",
    },
    {
      slug: "mt-5",
      title: "Mire Télescopique Aluminium 5m MT-5",
      category: "accessoires",
      brand: "TopoFit",
      summary: "Mire graduée en E d'un côté et millimétrée de l'autre avec niveau d'aplomb démontable.",
      availability: "en-boutique",
      price: 45000,
      featured: false,
      order: 18,
      specs: { Longueur: "5 mètres", Sections: "5 éléments télescopiques", Graduation: "Front E / Dos mm" },
      features: ["Boutons de verrouillage à ressort solides", "Niveau à bulle encliquetable inclus", "Housse en toile imperméable", "Réglette d'arase en bas"],
      highlights: [{ value: "5 m", label: "Longueur déployée" }, { value: "Recto/Verso", label: "Graduation E et mm" }, { value: "Bulle", label: "Niveau inclus" }],
      included: ["Mire MT-5", "Niveau à bulle", "Étui de transport"],
      useCases: ["Nivellement optique", "Lecture de hauteurs de ponts", "Relevé de profils en travers"],
      bgColor: "#1E293B",
    },
  ];

  for (const prod of products) {
    const prodDir = path.join(contentDir, "products", prod.slug);
    fs.mkdirSync(prodDir, { recursive: true });

    // Image cover
    const coverPath = path.join(prodDir, "cover.webp");
    await generatePlaceholderImage(coverPath, prod.title, prod.bgColor);

    // Gallery (2 images)
    const gallery1 = path.join(prodDir, "1.webp");
    const gallery2 = path.join(prodDir, "2.webp");
    await generatePlaceholderImage(gallery1, `${prod.title} - Vue 1`, prod.bgColor);
    await generatePlaceholderImage(gallery2, `${prod.title} - Accessoires`, prod.bgColor);

    const specsYaml = "specs:\n" + Object.entries(prod.specs).map(([k, v]) => `  ${k}: "${v}"`).join("\n");
    const featuresYaml = "features:\n" + prod.features.map((f) => `  - "${f}"`).join("\n");
    const priceYaml = prod.price !== undefined ? `price: ${prod.price}` : "";
    const leadYaml = prod.leadTime ? `leadTime: "${prod.leadTime}"` : "";
    const brandYaml = prod.brand ? `brand: "${prod.brand}"` : "";
    const ytYaml = prod.youtube ? `youtube: [${prod.youtube.map((y) => `"${y}"`).join(", ")}]` : "";
    const relYaml = prod.related ? `related: [${prod.related.map((r) => `"${r}"`).join(", ")}]` : "";

    const highlightsYaml = "highlights:\n" + prod.highlights.map((h) => `  - value: "${h.value}"\n    label: "${h.label}"`).join("\n");
    const includedYaml = "included:\n" + prod.included.map((i) => `  - "${i}"`).join("\n");
    const useCasesYaml = "useCases:\n" + prod.useCases.map((u) => `  - "${u}"`).join("\n");

    const bodyText = generateBodyWords(135, prod.title);

    const mdContent = `---
title: "${prod.title}"
category: "${prod.category}"
${brandYaml}
summary: "${prod.summary}"
cover: ./cover.webp
gallery: [./1.webp, ./2.webp]
${ytYaml}
availability: "${prod.availability}"
${leadYaml}
${featuresYaml}
${specsYaml}
${priceYaml}
${relYaml}
featured: ${prod.featured}
order: ${prod.order}
draft: false
${highlightsYaml}
${includedYaml}
${useCasesYaml}
---

${bodyText}
`;
    fs.writeFileSync(path.join(prodDir, "index.md"), mdContent, "utf-8");
  }

  // 3. Packs (3)
  const packs = [
    {
      slug: "pack-topographe-complet",
      title: "Pack Topographe Terrain Complet",
      summary: "La solution clé en main pour démarrer vos chantiers : Station Totale ST-M5 + Trépied aluminium TA-160 + Mire télescopique MT-5.",
      coverBg: "#1E293B",
      products: ["st-m5", "ta-160", "mt-5"],
      price: 2000000,
      availability: "en-boutique",
      featured: true,
      order: 1,
    },
    {
      slug: "pack-brigade-gnss-rtk",
      title: "Pack Brigade Cadastre RTK + Drone",
      summary: "Pack haute précision combinant le récepteur GNSS RTK centimétrique GX-Lite et le drone photogrammétrique DP-RTK.",
      coverBg: "#0F172A",
      products: ["gx-lite", "dp-rtk", "ta-160"],
      availability: "sur-commande",
      leadTime: "15 à 25 jours",
      featured: true,
      order: 2,
    },
    {
      slug: "pack-nivellement-expert",
      title: "Pack Nivellement Optique & Laser",
      summary: "Combinaison optimale du niveau optique NO-32 et du laser rotatif d'extérieur LR-500 avec mire 5m.",
      coverBg: "#047857",
      products: ["no-32", "lr-500", "mt-5"],
      price: 680000,
      availability: "en-boutique",
      featured: true,
      order: 3,
    },
  ];

  for (const packItem of packs) {
    const packDir = path.join(contentDir, "packs", packItem.slug);
    fs.mkdirSync(packDir, { recursive: true });

    const coverPath = path.join(packDir, "cover.webp");
    await generatePlaceholderImage(coverPath, packItem.title, packItem.coverBg);

    const priceYaml = packItem.price !== undefined ? `price: ${packItem.price}` : "";
    const leadYaml = packItem.leadTime ? `leadTime: "${packItem.leadTime}"` : "";

    const mdContent = `---
title: "${packItem.title}"
summary: "${packItem.summary}"
cover: ./cover.webp
products: [${packItem.products.map((p) => `"${p}"`).join(", ")}]
${priceYaml}
availability: "${packItem.availability}"
${leadYaml}
featured: ${packItem.featured}
order: ${packItem.order}
draft: false
---

## À propos de ce pack

Le **${packItem.title}** regroupe les équipements indispensables présélectionnés par nos géomètres conseils pour maximiser votre rendement sur le terrain.
`;

    fs.writeFileSync(path.join(packDir, "index.md"), mdContent, "utf-8");
  }

  // 4. Guides secrets (3)
  const guides = [
    {
      file: "st-m5.md",
      product: "st-m5",
      token: "a1b2c3d4e5f6789012345678",
      title: "Guide d'utilisation et étalonnage terrain — Station ST-M5",
      youtube: ["dQw4w9WgXcQ"],
    },
    {
      file: "gx-lite.md",
      product: "gx-lite",
      token: "b2c3d4e5f6a1789012345678",
      title: "Guide de démarrage rapide et configuration RTK — GX-Lite",
      youtube: ["dQw4w9WgXcQ"],
    },
    {
      file: "dp-rtk.md",
      product: "dp-rtk",
      token: "c3d4e5f6a1b2789012345678",
      title: "Guide de planification de vol photogrammétrique — DP-RTK",
    },
  ];

  const guideDir = path.join(contentDir, "guides");
  fs.mkdirSync(guideDir, { recursive: true });

  for (const g of guides) {
    const ytYaml = g.youtube ? `youtube: [${g.youtube.map((y) => `"${y}"`).join(", ")}]` : "";
    const mdContent = `---
product: "${g.product}"
token: "${g.token}"
title: "${g.title}"
${ytYaml}
---

# ${g.title}

*Document réservé exclusivement aux clients GéoTopo Bénin ayant fait l'acquisition de cet appareil.*

## 1. Mises en garde et vérifications terrain

Avant toute campagne de mesure, veuillez vérifier la charge complète des batteries et le bon calage du trépied.
`;
    fs.writeFileSync(path.join(guideDir, g.file), mdContent, "utf-8");
  }

  console.log("✅ 6 catégories, 18 produits, 3 packs et 3 guides générés !");
}

run().catch((err) => {
  console.error("❌ Erreur lors de la génération des données:", err);
  process.exit(1);
});
