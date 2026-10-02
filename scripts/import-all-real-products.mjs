import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'C:\\Users\\jmeda\\Downloads\\Produits';
const targetProductsDir = 'd:\\boutique-benin\\src\\content\\products';
const publicDir = 'd:\\boutique-benin\\public\\real-products';

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Clean old placeholder products or keep & overwrite
const realProducts = [
  {
    slug: 'efix-f8-visual-rtk',
    folderName: 'Global version EFIX F8 visual RTK +IMU + dual cameras',
    title: 'EFIX F8 Visual RTK + IMU + Dual Cameras',
    category: 'gnss-gps',
    brand: 'EFIX / CHCNAV',
    price: 3850000,
    originalPrice: 4200000,
    badge: 'Vision 3D + IMU',
    inStock: true,
    rating: 4.9,
    reviewsCount: 18,
    isFeatured: true,
    summary: 'Récepteur GNSS RTK révolutionnaire à double caméra intégrée pour le levé visuel et la photogrammétrie 3D directe.',
    specs: [
      { name: 'Constellations', value: 'GPS, GLONASS, Galileo, BeiDou, QZSS (1408 canaux)' },
      { name: 'Précision RTK', value: 'H: 8mm + 1ppm / V: 15mm + 1ppm' },
      { name: 'Capteur Visuel', value: 'Double caméra HD pour levé d\'arrière-plan 3D' },
      { name: 'Inclinaison IMU', value: 'Jusqu\'à 60° sans calibration' },
      { name: 'Batterie', value: 'Jusqu\'à 15h d\'autonomie en continu' },
    ],
    features: [
      'Levé et implantation visuelle 3D en temps réel',
      'Centrage instantané par réalité augmentée sur l\'écran du carnet',
      'Capteur IMU 60° insensible aux perturbations magnétiques',
      'Boîtier magnésium ultra-résistant IP68',
      'Carnet de terrain tactile avec logiciel d\'acquisition'
    ]
  },
  {
    slug: 'ligrip-se-lidar-rtk',
    folderName: 'scanner LiDARGNSS RTK portable, identifié sur l’annonce comme LiGrip SE RTK GNSS Handheld LiDAR Sensor de GreenValley',
    title: 'GreenValley LiGrip SE LiDAR & GNSS RTK Portable',
    category: 'drones-scanners',
    brand: 'GreenValley International',
    price: 12500000,
    originalPrice: 13800000,
    badge: 'Scanner 3D Portable',
    inStock: true,
    rating: 5.0,
    reviewsCount: 9,
    isFeatured: true,
    summary: 'Scanner LiDAR hand-held avec positionnement GNSS RTK centimétrique pour numérisation 3D rapide de bâtiments et carrières.',
    specs: [
      { name: 'Technologie', value: 'LiDAR SLAM + GNSS RTK Centimétrique' },
      { name: 'Portée Laser', value: 'Jusqu\'à 120 mètres' },
      { name: 'Taux de Points', value: '200 000 points/seconde' },
      { name: 'Précision Globale', value: '≤ 3 cm' },
      { name: 'Autonomie', value: 'Pack batteries interchangeables (4h/batterie)' }
    ],
    features: [
      'Numérisation 3D en marchant (Handheld SLAM)',
      'Géoréférencement direct par GNSS RTK intégré',
      'Génération de nuages de points, MNT, MNS et coupes 3D',
      'Export aux formats LAS, PLY, E57 compatible Covadis / AutoCAD',
      'Batterie externe et harnais de transport ergonomique'
    ]
  },
  {
    slug: 'unistrong-g970ii-pro',
    folderName: 'Unistrong G970II pro GNSS=e-Survey E600',
    title: 'Unistrong G970II Pro / e-Survey E600 RTK',
    category: 'gnss-gps',
    brand: 'UniStrong / e-Survey',
    price: 3200000,
    originalPrice: 3500000,
    badge: '1408 Canaux + IMU 60°',
    inStock: true,
    rating: 4.8,
    reviewsCount: 24,
    isFeatured: true,
    summary: 'Récepteur GNSS RTK d\'élite avec 1408 canaux, inclinaison IMU 60°, contrôleur P9IV et logiciel SurPad 4.2.',
    specs: [
      { name: 'Nombre de canaux', value: '1408 canaux multi-constellations' },
      { name: 'Inclinaison IMU', value: 'Compensation automatique jusqu\'à 60°' },
      { name: 'Batteries', value: '2x batteries amovibles à chaud (Hot-swap)' },
      { name: 'Contrôleur', value: 'Carnet durci P9IV Android' },
      { name: 'Logiciel', value: 'SurPad 4.2 inclus avec licence à vie' }
    ],
    features: [
      'Changement de batterie à chaud sans interruption de mesure',
      'Antenne 3D à gain élevé avec réjection des multitrajets',
      'Radio UHF interne émetteur/récepteur 2W/5W',
      'Connexion 4G LTE, Wi-Fi, Bluetooth et WebUI'
    ]
  },
  {
    slug: 'sinognss-t10-plus-t70-pro',
    folderName: 'Sino gnss T10plus+T70pro',
    title: 'SinoGNSS / ComNav T10 Plus + T70 Pro RTK',
    category: 'gnss-gps',
    brand: 'ComNav SinoGNSS',
    price: 3450000,
    originalPrice: 3800000,
    badge: 'Duo Base + Mobile',
    inStock: true,
    rating: 4.9,
    reviewsCount: 15,
    isFeatured: false,
    summary: 'Système GNSS RTK complet avec récepteur compact T10+ et carnet terrain durci T70 Pro pour brigades foncières.',
    specs: [
      { name: 'Canaux GNSS', value: '1598 canaux K8-series' },
      { name: 'Radio UHF', value: 'Transceiver 410-470 MHz intégré' },
      { name: 'Carnet', value: 'SinoGNSS T70 Pro Android ultra-robuste' },
      { name: 'Précision', value: 'RTK H: 8mm / V: 15mm' }
    ],
    features: [
      'Design ultra-compact résistant aux chutes de 2m sur béton',
      'Initialisation RTK instantanée en moins de 5 secondes',
      'Affichage OLED haute lisibilité en plein soleil'
    ]
  },
  {
    slug: 'ruide-rcs-rts822',
    folderName: 'Station total de marque RUIDE',
    title: 'Station Totale RUIDE RCS / RTS-822R10m',
    category: 'stations-totales',
    brand: 'RUIDE / SOUTH',
    price: 2450000,
    originalPrice: 2750000,
    badge: '1000m Sans Prisme',
    inStock: true,
    rating: 4.8,
    reviewsCount: 31,
    isFeatured: true,
    summary: 'Station totale électronique haute précision 2" avec portée de 1000m sans réflecteur et grand écran couleur.',
    specs: [
      { name: 'Précision Angulaire', value: '2 secondes (2")' },
      { name: 'Portée Sans Prisme', value: '1000 mètres' },
      { name: 'Portée Avec Prisme', value: '5000 mètres' },
      { name: 'Écran', value: 'LCD Couleur tactile avec clavier alphanumérique' },
      { name: 'Mémoire', value: 'Carte SD, clé USB, mémoire interne 100 000 pts' }
    ],
    features: [
      'Distance-mètre EDM ultra-rapide (0,3s en mode rapide)',
      'Compensateur électronique double axe',
      'Plomb laser réglable en intensité',
      'Export direct des données au format DXF/TXT/CSV'
    ]
  },
  {
    slug: 'leica-na532-kit',
    folderName: 'Niveau de marque Leica model  NA532 avec ses accessoires ( trépied et Mire)',
    title: 'Niveau Optique Leica NA532 + Pack Trépied & Mire',
    category: 'niveaux',
    brand: 'Leica Geosystems',
    price: 450000,
    originalPrice: 520000,
    badge: 'Grossissement 32x',
    inStock: true,
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    summary: 'Le niveau optique de référence mondial Leica NA532 livré en pack complet avec trépied aluminium et mire téléscopique 5m.',
    specs: [
      { name: 'Grossissement', value: '32x' },
      { name: 'Précision par km', value: '1.6 mm' },
      { name: 'Compensateur', value: 'Magnétique amorti à suspension pneumatique' },
      { name: 'Protection', value: 'IP56 eau et poussière' }
    ],
    features: [
      'Optique haute définition d\'une clarté inégalée',
      'Compensateur automatique à système d\'amortissement d\'air',
      'Livré avec trépied lourd et mire téléscopique 5m d\'origine',
      'Coffret de transport rigide anti-chocs'
    ]
  },
  {
    slug: 'foif-a90-rtk',
    folderName: 'Gnss me marque FOIF model A90',
    title: 'FOIF A90 GNSS RTK Multi-Constellation',
    category: 'gnss-gps',
    brand: 'FOIF',
    price: 2950000,
    originalPrice: 3300000,
    badge: 'Compact & Puissant',
    inStock: true,
    rating: 4.8,
    reviewsCount: 22,
    isFeatured: false,
    summary: 'Récepteur GNSS RTK compact et robuste FOIF A90 avec synthèse vocale intelligent et inclinaison IMU.',
    specs: [
      { name: 'Canaux', value: '800+ canaux' },
      { name: 'Synthèse Vocale', value: 'Guide vocal multilingue' },
      { name: 'Batteries', value: 'Double batterie intelligente' }
    ],
    features: [
      'Design en alliage de magnésium ultraléger (0.95 kg)',
      'Système d\'exploitation Linux embarqué avec WebUI',
      'Connexion 4G universelle et radio UHF'
    ]
  },
  {
    slug: 'chcnav-rtk-gnss',
    folderName: 'Gnss de marque CHC NAV',
    title: 'CHCNAV i73 / i83 GNSS RTK Smart',
    category: 'gnss-gps',
    brand: 'CHCNAV',
    price: 3100000,
    originalPrice: 3400000,
    badge: 'Technologie iStar',
    inStock: true,
    rating: 4.9,
    reviewsCount: 27,
    isFeatured: true,
    summary: 'Le GNSS RTK le plus populaire en Afrique de l\'Ouest, alimenté par le moteur iStar pour une précision sous couvert végétal.',
    specs: [
      { name: 'Technologie', value: 'CHCNAV iStar 1408 canaux' },
      { name: 'Autonomie', value: 'Jusqu\'à 34h en mode Mobile' },
      { name: 'Poids', value: 'Seulement 730g' }
    ],
    features: [
      'Technologie iStar pour fixation RTK ultra-rapide sous les arbres',
      'IMU automatique sans pré-calibration',
      'Logiciel LandStar 8 en français inclus'
    ]
  },
  {
    slug: 'stonex-rtk-gnss',
    folderName: 'Gnss de marque STONEX 4M',
    title: 'Stonex S900 / 4M GNSS RTK Pro',
    category: 'gnss-gps',
    brand: 'Stonex',
    price: 3600000,
    originalPrice: 3950000,
    badge: 'Précision Suisse-Italienne',
    inStock: true,
    rating: 4.9,
    reviewsCount: 16,
    isFeatured: false,
    summary: 'GNSS RTK haut de gamme Stonex avec carte mère multi-constellations et modem 4G mondial.',
    specs: [
      { name: 'Canaux', value: '1408 canaux' },
      { name: 'Radio', value: 'UHF 1W/2W réglable' }
    ],
    features: [
      'Sensibilité de réception exceptionnelle',
      'Structure étanche renforcée IP68',
      'Carnet de terrain Stonex Cube-a'
    ]
  },
  {
    slug: 'south-rtk-gnss',
    folderName: 'Gnss de marque SOUTH',
    title: 'SOUTH Galaxy G1 / G6 GNSS RTK',
    category: 'gnss-gps',
    brand: 'SOUTH',
    price: 2850000,
    originalPrice: 3200000,
    badge: 'Référence Terrain',
    inStock: true,
    rating: 4.7,
    reviewsCount: 35,
    isFeatured: false,
    summary: 'Le couteau suisse du géomètre : récepteur SOUTH éprouvé sur tous les chantiers africains.',
    specs: [
      { name: 'Canaux', value: '1598 canaux' },
      { name: 'Radio', value: 'Farlink UHF portée 10km' }
    ],
    features: [
      'Protocole de transmission Farlink longue portée',
      'Bulles électroniques et mesure inclinée',
      'Carnet tactile Android avec EGStar / SurvX'
    ]
  },
  {
    slug: 'chcnav-station-totale',
    folderName: 'Station totale de marque CHC NAV',
    title: 'Station Totale CHCNAV CTS-112R4',
    category: 'stations-totales',
    brand: 'CHCNAV',
    price: 2650000,
    originalPrice: 2900000,
    badge: 'Précision 2"',
    inStock: true,
    rating: 4.8,
    reviewsCount: 14,
    isFeatured: false,
    summary: 'Station totale CHCNAV robuste et intuitive, idéale pour l\'implantation de bâtiments et routes.',
    specs: [
      { name: 'Précision', value: '2" (2 secondes)' },
      { name: 'Mesure sans prisme', value: '1000m' }
    ],
    features: [
      'Logiciel d\'implantation intégré complet',
      'Double écran avec rétro-éclairage automatique',
      'Batterie longue durée (20h)'
    ]
  },
  {
    slug: 'stonex-station-totale',
    folderName: 'Station total de marque Stonex',
    title: 'Station Totale Stonex STS2R',
    category: 'stations-totales',
    brand: 'Stonex',
    price: 2800000,
    originalPrice: 3100000,
    badge: 'Optique Haute Clarté',
    inStock: true,
    rating: 4.8,
    reviewsCount: 11,
    isFeatured: false,
    summary: 'Station totale Stonex avec distancemètre haute fréquence et pointeur laser visible red.',
    specs: [
      { name: 'Précision', value: '2"' },
      { name: 'Portée', value: '800m sans prisme' }
    ],
    features: [
      'Optique traitée multi-couches',
      'Clavier numérique rétroéclairé ergonomique',
      'Transfert de données USB / Bluetooth'
    ]
  },
  {
    slug: 'tersus-station-totale',
    folderName: 'Station totale de Marque TERSUS',
    title: 'Station Totale Tersus TS2 Touch',
    category: 'stations-totales',
    brand: 'Tersus',
    price: 2550000,
    originalPrice: 2850000,
    badge: 'Écran Tactile',
    inStock: true,
    rating: 4.7,
    reviewsCount: 8,
    isFeatured: false,
    summary: 'Station totale moderne avec écran couleur tactile et programmes de calcul topographique avancés.',
    specs: [
      { name: 'Précision', value: '2"' },
      { name: 'Écran', value: 'Tactile couleur 3.5"' }
    ],
    features: [
      'Interface graphique conviviale',
      'Compensateur double axe de haute précision',
      'Exportation directe vers AutoCAD (DXF)'
    ]
  },
  {
    slug: 'topcon-atb4-niveau',
    folderName: 'Niveau de marque TOPCON ATB4 ( ça fonctionne toujours avec mire, trépied) comme accessoires.jpeg',
    title: 'Niveau Optique Topcon AT-B4A + Trépied & Mire',
    category: 'niveaux',
    brand: 'Topcon',
    price: 380000,
    originalPrice: 430000,
    badge: 'IPX6 Étanche',
    inStock: true,
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: false,
    summary: 'Niveau automatique de chantier Topcon AT-B4A étanche IPX6 ultra-robuste avec compensateur magnétique.',
    specs: [
      { name: 'Grossissement', value: '24x' },
      { name: 'Précision', value: '2.0 mm' },
      { name: 'Étanchéité', value: 'IPX6 (projection d\'eau forte)' }
    ],
    features: [
      'Compensateur amorti par système magnétique',
      'Mise au point ultra-courte à 20cm',
      'Pack complet avec trépied et mire 5m'
    ]
  },
  {
    slug: 'pack-brigade-gnss-complet',
    folderName: 'Voici un gnss complet avec ses accessoires ( 2 trépied, canne, réflecteur, le bras, la radio, l\'antenne et le PDA)',
    title: 'Pack Brigade RTK "Master Terrain" (Système Complet)',
    category: 'gnss-gps',
    brand: 'GéoTopo Pack',
    price: 4950000,
    originalPrice: 5600000,
    badge: 'Pack Tout-Inclus',
    inStock: true,
    rating: 5.0,
    reviewsCount: 19,
    isFeatured: true,
    summary: 'L\'équipement ultime pour brigade foncière : 2 trépieds lourds, canne carbone, réflecteur, bras radio, antenne UHF et carnet PDA.',
    specs: [
      { name: 'Composition', value: 'Base + Mobile RTK + Carnet PDA + 2 Trépieds + Canne + Réflecteur + Radio 35W' },
      { name: 'Autonomie', value: 'Batteries jumelées pour 24h de levé continu' },
      { name: 'Garantie', value: '1 an avec prêt de matériel de remplacement immédiat' }
    ],
    features: [
      'Pack complet prêt à mesurer sur le terrain dès réception',
      'Radio externe 35W pour portée UHF jusqu\'à 20 km',
      'Formation de 1 journée offerte à Cotonou pour toute la brigade',
      'Certificat de contrôle et étalonnage métrologique d\'origine'
    ]
  }
];

function executeImport() {
  console.log('--- DEBUT DE L\'IMPORTATION DES VRAIS PRODUITS ---');

  for (const prod of realProducts) {
    const productDir = path.join(targetProductsDir, prod.slug);
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    // Copie des images
    let copiedImages = [];
    const sourcePath = path.join(sourceDir, prod.folderName);

    if (fs.existsSync(sourcePath)) {
      const isDir = fs.statSync(sourcePath).isDirectory();
      let filesToCopy = [];

      if (isDir) {
        filesToCopy = fs.readdirSync(sourcePath)
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .map(f => path.join(sourcePath, f));
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(sourcePath)) {
        filesToCopy = [sourcePath];
      }

      let imgIdx = 1;
      for (const srcImg of filesToCopy) {
        const ext = path.extname(srcImg).toLowerCase();
        const destName = imgIdx === 1 ? `cover${ext}` : `${imgIdx - 1}${ext}`;
        const destPath = path.join(productDir, destName);
        fs.copyFileSync(srcImg, destPath);

        // Copie aussi dans public pour accès direct
        const pubDestDir = path.join(publicDir, prod.slug);
        if (!fs.existsSync(pubDestDir)) fs.mkdirSync(pubDestDir, { recursive: true });
        fs.copyFileSync(srcImg, path.join(pubDestDir, destName));

        copiedImages.push(destName);
        imgIdx++;
      }
    }

    // fallback cover
    if (copiedImages.length === 0) {
      console.warn(`Aucune image trouvée pour ${prod.slug}, création d'un fallback.`);
    }

    // Génération Markdown
    const coverFile = copiedImages.find(i => i.startsWith('cover')) || copiedImages[0] || 'cover.webp';
    const galleryFiles = copiedImages.filter(i => !i.startsWith('cover'));

    const mdContent = `---
title: "${prod.title}"
brand: "${prod.brand}"
category: "${prod.category}"
price: ${prod.price}
originalPrice: ${prod.originalPrice}
badge: "${prod.badge}"
inStock: ${prod.inStock}
rating: ${prod.rating}
reviewsCount: ${prod.reviewsCount}
isFeatured: ${prod.isFeatured}
coverImage: "./${coverFile}"
gallery:
${galleryFiles.map(g => `  - "./${g}"`).join('\n')}
specs:
${prod.specs.map(s => `  - name: "${s.name}"\n    value: "${s.value}"`).join('\n')}
features:
${prod.features.map(f => `  - "${f}"`).join('\n')}
---

${prod.summary}

### Pourquoi choisir ce matériel ?
Ce modèle authentique est importé directement auprès du fabricant avec certificat de contrôle d'étalonnage délivré dans nos ateliers à Cotonou.

### Service & Accompagnement GéoTopo Bénin :
- **Étalonnage certifié** avant livraison
- **Garantie constructeur 1 an** avec SAV local à Cotonou
- **Formation gratuite de 1/2 journée** pour vos techniciens de terrain
- **Livraison rapide** au Bénin, Togo, Niger, Burkina Faso, Côte d'Ivoire, Cameroun et Mali.
`;

    fs.writeFileSync(path.join(productDir, 'index.md'), mdContent, 'utf8');
    console.log(`✅ Produit importé : ${prod.title} (${copiedImages.length} images)`);
  }

  console.log('--- IMPORTATION TERMINÉE AVEC SUCCÈS ---');
}

executeImport();
