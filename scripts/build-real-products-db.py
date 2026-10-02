import os
import shutil
from PIL import Image

source_dir = r"C:\Users\jmeda\Downloads\Produits"
target_dir = r"d:\boutique-benin\src\content\products"

# Clean target products dir completely to have exactly 18 products
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)
os.makedirs(target_dir, exist_ok=True)

products = [
    {
        "slug": "efix-f8-visual-rtk",
        "folder": "Global version EFIX F8 visual RTK +IMU + dual cameras",
        "title": "EFIX F8 Visual RTK + IMU + Dual Cameras",
        "category": "gnss-gps",
        "brand": "EFIX / CHCNAV",
        "price": 3850000,
        "originalPrice": 4200000,
        "badge": "Vision 3D + IMU",
        "summary": "Récepteur GNSS RTK révolutionnaire à double caméra intégrée pour le levé visuel et la photogrammétrie 3D directe.",
        "availability": "en-boutique",
        "leadTime": "Disponible immédiatement",
        "featured": True,
        "order": 1,
        "youtube": ["dQw4w9WgXcQ"],
        "highlights": [
            {"value": "1408", "label": "Canaux GNSS"},
            {"value": "60°", "label": "Inclinaison IMU"},
            {"value": "3D", "label": "Levé Visuel AR"}
        ],
        "included": [
            "Récepteur EFIX F8 avec double caméra",
            "Carnet de terrain tactile Android durci",
            "Logiciel d'acquisition terrain LandStar 8",
            "Batteries lithium longue durée (2x)",
            "Coffret de transport rigide IP68"
        ],
        "useCases": [
            "Levé parcellaire et cadastral en zone d'accès difficile",
            "Implantation de bâtiment par réalité augmentée",
            "Modélisation photogrammétrique 3D d'ouvrages d'art"
        ],
        "features": [
            "Double caméra HD pour acquisition visuelle 3D et implantation AR",
            "Moteur GNSS 1408 canaux multi-constellations (GPS, GLONASS, BeiDou, Galileo)",
            "Centrage automatique et compensation d'inclinaison IMU 60°",
            "Boîtier ultra-compact étanche IP68 résistant aux chocs de 2 mètres",
            "Transfert de données 4G LTE, Wi-Fi, Bluetooth et WebUI"
        ],
        "specs": {
            "Canaux": "1408 canaux multi-constellations",
            "Précision RTK": "H: 8mm + 1ppm / V: 15mm + 1ppm",
            "Capteur Visuel": "Double caméra HD intégrée",
            "IMU": "60° sans calibration",
            "Autonomie": "Jusqu'à 15h en continu"
        },
        "related": ["unistrong-g970ii-pro", "sinognss-t10-plus-t70-pro", "chcnav-rtk-gnss"],
        "body": """
### Présentation de l'EFIX F8 Visual RTK

Le récepteur GNSS RTK EFIX F8 repousse les limites de la topographie moderne en associant un moteur centimétrique 1408 canaux à un système novateur de double caméra HD. Conçu spécifiquement pour les géomètres-experts et les ingénieurs BTP exigeants, cet instrument permet de réaliser des levés visuels 3D et des implantations en réalité augmentée directement sur l'écran de votre carnet de terrain.

Grâce à sa compensation d'inclinaison IMU 60° insensible aux perturbations magnétiques, vous pouvez mesurer avec précision des points masqués, des coins de bâtiments ou des canalisations profondes sans tenir la canne parfaitement verticale. Son boîtier en alliage de magnésium certifié IP68 garantit une durabilité maximale sur tous vos chantiers au Bénin et en Afrique de l'Ouest.

### Les Engagements Métrologiques GéoTopo Bénin :
- **Étalonnage certifié** sur base géodésique à Cotonou avant livraison
- **Garantie constructeur 1 an** avec assistance technique locale
- **Formation offerte de 1/2 journée** pour votre brigade terrain
- **Livraison rapide** en main propre ou par fret express douane incluse.
"""
    },
    {
        "slug": "ligrip-se-lidar-rtk",
        "folder": "scanner LiDARGNSS RTK portable, identifié sur l’annonce comme LiGrip SE RTK GNSS Handheld LiDAR Sensor de GreenValley",
        "title": "GreenValley LiGrip SE LiDAR & GNSS RTK Portable",
        "category": "drones-scanners",
        "brand": "GreenValley International",
        "price": 12500000,
        "originalPrice": 13800000,
        "badge": "Scanner 3D Portable",
        "summary": "Scanner LiDAR hand-held avec positionnement GNSS RTK centimétrique pour numérisation 3D rapide de bâtiments et carrières.",
        "availability": "sur-commande",
        "leadTime": "Expédié sous 5 à 7 jours",
        "featured": True,
        "order": 2,
        "youtube": ["dQw4w9WgXcQ"],
        "highlights": [
            {"value": "200k", "label": "Pts/Seconde"},
            {"value": "120m", "label": "Portée Laser"},
            {"value": "3cm", "label": "Précision 3D"}
        ],
        "included": [
            "Scanner LiDAR portable LiGrip SE RTK",
            "Module GNSS RTK haute précision",
            "Logiciel de traitement de nuages de points LiFuser",
            "Pack de 4 batteries Li-Ion haute capacité",
            "Harnais ergonomique et valise étanche de transport"
        ],
        "useCases": [
            "Relevé d'architecture et BIM de bâtiments complexes",
            "Calcul de volumes de stocks et de carrières",
            "Cartographie d'infrastructures routières et lignes électriques"
        ],
        "features": [
            "Scanner 3D portable léger fonctionnant en marchant (Handheld SLAM)",
            "Géoréférencement direct sans cibles grâce au GNSS RTK intégré",
            "Acquisition massive de 200 000 points par seconde à 360°",
            "Export immédiat aux formats standards LAS, PLY, E57 et DXF",
            "Système de batterie remplaçable à chaud pour numérisation continue"
        ],
        "specs": {
            "Technologie": "LiDAR SLAM + GNSS RTK",
            "Portée": "120 mètres",
            "Vitesse d'acquisition": "200 000 pts/sec",
            "Précision": "≤ 3 cm",
            "Poids": "1.5 kg avec batterie"
        },
        "related": ["efix-f8-visual-rtk", "unistrong-g970ii-pro"],
        "body": """
### Numérisation 3D Haute Vitesse avec le LiGrip SE RTK

Le scanner LiDAR portable GreenValley LiGrip SE RTK révolutionne la capture de données spatiales 3D sur le terrain. En combinant la puissance de l'algorithme SLAM de dernière génération avec le géoréférencement centimétrique du GNSS RTK, cet équipement vous permet d'effectuer la numérisation complète d'un bâtiment ou d'une carrière simplement en vous déplaçant à pied.

Fini les multiples stations fixes de scanner classique : marchez et capturez jusqu'à 200 000 points par seconde avec une précision globale inférieure à 3 cm. Les données générées sont immédiatement prêtes à être intégrées dans Covadis, AutoCAD ou Revit pour produire des coupes 3D, des plans de façades ou des Modèles Numériques de Terrain (MNT).

### Accompagnement Métrologique & Formation GéoTopo Bénin :
- **Contrôle et étalonnage** validés dans nos ateliers de Cotonou
- **Garantie 1 an** avec soutien logiciel et matériel de secours
- **Formation complète** à la numérisation et au post-traitement LiFuser
- **Service d'importation rapide** et prise en charge douanière intégrale.
"""
    },
    {
        "slug": "unistrong-g970ii-pro",
        "folder": "Unistrong G970II pro GNSS=e-Survey E600",
        "title": "Unistrong G970II Pro / e-Survey E600 RTK",
        "category": "gnss-gps",
        "brand": "UniStrong / e-Survey",
        "price": 3200000,
        "originalPrice": 3500000,
        "badge": "1408 Canaux + IMU",
        "summary": "Récepteur GNSS RTK d'élite avec 1408 canaux, inclinaison IMU 60°, contrôleur P9IV et logiciel SurPad 4.2.",
        "availability": "en-boutique",
        "leadTime": "Disponible immédiatement à Cotonou",
        "featured": True,
        "order": 3,
        "youtube": ["dQw4w9WgXcQ"],
        "highlights": [
            {"value": "1408", "label": "Canaux SoC"},
            {"value": "IMU", "label": "Tilt 60°"},
            {"value": "P9IV", "label": "PDA Android"}
        ],
        "included": [
            "Récepteur UniStrong G970II Pro / e-Survey E600",
            "Carnet de terrain Android P9IV haute performance",
            "Licence permanente du logiciel SurPad 4.2",
            "2x Batteries amovibles à chaud (Hot-swap)",
            "Canne carbone graduée 2.25m et coffret rigide"
        ],
        "useCases": [
            "Levés topographiques fonciers et bornages de parcelles",
            "Suivi et contrôle de terrassement sur chantiers routiers",
            "Relevé de réseaux enterrés et infrastructures urbaines"
        ],
        "features": [
            "Moteur GNSS 1408 canaux compatible GPS, GLONASS, BeiDou, Galileo",
            "Compensation d'inclinaison IMU 60° sans aucune calibration manuelle",
            "Système double batterie avec remplacement à chaud sans extinction",
            "Modem 4G mondial et radio UHF 2W émetteur/récepteur intégrée",
            "Contrôleur P9IV avec écran tactile capacitif 5 pouces rétro-éclairé"
        ],
        "specs": {
            "Nombre de canaux": "1408 canaux",
            "Inclinaison IMU": "60° sans calibration",
            "Batteries": "2x amovibles à chaud",
            "Carnet": "P9IV Android 11",
            "Logiciel": "SurPad 4.2 inclus"
        },
        "related": ["sinognss-t10-plus-t70-pro", "foif-a90-rtk", "south-rtk-gnss"],
        "body": """
### Performance et Polyvalence avec l'UniStrong G970II Pro

L'UniStrong G970II Pro (connu également sous la référence e-Survey E600) représente l'un des récepteurs GNSS RTK les plus fiables et les plus prisés par les cabinets de géomètres en Afrique francophone. Équipé d'un processeur GNSS 1408 canaux de pointe et d'un capteur IMU 60°, il fixe instantanément le signal RTK même sous la canopée des arbres ou entre de grands bâtiments.

Son système de batterie intelligente amovible à chaud (Hot-swap) permet de remplacer la batterie faible sans jamais éteindre l'appareil ni perdre la fixation RTK. Associé au carnet P9IV et au logiciel SurPad 4.2 en français, il garantit une productivité maximale sur le terrain de la première à la dernière minute de votre journée.

### Garantie & Service Après-Vente GéoTopo Bénin :
- **Étalonnage sur banc métrologique** certifié à Cotonou
- **Garantie constructeur 1 an** avec pièces d'origine en stock
- **Assistance WhatsApp directe** et formation offerte à l'achat
- **Expédition prioritaire** au Bénin, Togo, Niger, Burkina Faso, Mali.
"""
    },
    {
        "slug": "sinognss-t10-plus-t70-pro",
        "folder": "Sino gnss T10plus+T70pro",
        "title": "SinoGNSS / ComNav T10 Plus + T70 Pro RTK",
        "category": "gnss-gps",
        "brand": "ComNav SinoGNSS",
        "price": 3450000,
        "originalPrice": 3800000,
        "badge": "Duo Base + Mobile",
        "summary": "Système GNSS RTK complet avec récepteur compact T10+ et carnet terrain durci T70 Pro pour brigades foncières.",
        "availability": "en-boutique",
        "leadTime": "En stock à Cotonou",
        "featured": False,
        "order": 4,
        "highlights": [
            {"value": "1598", "label": "Canaux K8"},
            {"value": "T70Pro", "label": "Carnet tactile"},
            {"value": "IP68", "label": "Ultra étanche"}
        ],
        "included": [
            "Tête réceptrice SinoGNSS T10 Plus",
            "Carnet de terrain tactile SinoGNSS T70 Pro",
            "Logiciel d'acquisition Survey Master",
            "Batteries lithium et chargeur intelligent",
            "Coffret antichoc et accessoires de canne"
        ],
        "useCases": [
            "Campagnes de bornage et délimitation foncière",
            "Implantation de précision de pieux et fondations",
            "Relevés altimétriques et bathymétriques"
        ],
        "features": [
            "Carte mère SinoGNSS K8 1598 canaux multi-constellations",
            "Initialisation RTK ultra-rapide en moins de 5 secondes",
            "Radio UHF transceiver 410-470 MHz intégrée",
            "Écran d'affichage OLED haute luminosité sur le récepteur",
            "Carnet T70 Pro durci étanche IP68 résistant aux chocs extrêmes"
        ],
        "specs": {
            "Canaux": "1598 canaux K8-series",
            "Radio UHF": "410-470 MHz 2W",
            "Carnet": "T70 Pro Android",
            "Précision": "H: 8mm / V: 15mm",
            "Protection": "IP68 & Chocs 2m"
        },
        "related": ["unistrong-g970ii-pro", "foif-a90-rtk", "stonex-rtk-gnss"],
        "body": """
### La Précision SinoGNSS T10 Plus & T70 Pro au Service des Géomètres

Conçu pour affronter les conditions environnementales les plus rigoureuses d'Afrique de l'Ouest, le système GNSS RTK SinoGNSS T10 Plus associé au carnet T70 Pro offre une stabilité de mesure exemplaire. Alimenté par la puce de dernière génération K8 1598 canaux, il capture simultanément les signaux GPS, GLONASS, BeiDou, Galileo et QZSS.

Le carnet durci T70 Pro dispose d'un écran haute résolution lisible sous le soleil ardent de Cotonou ou Parakou. Son logiciel Survey Master en français simplifie les calculs de surface, les implantations routières et l'export direct vers vos logiciels de DAO/CAO préférés.

### Pourquoi Acheter chez GéoTopo Bénin ?
- **Certificat d'étalonnage métrologique** fourni à la livraison
- **Garantie 1 an** avec service après-vente réactif sous 48h à Cotonou
- **Formation pratique d'une demi-journée** offerte à vos techniciens
- **Fret et formalités douanières** entièrement pris en charge par nos soins.
"""
    },
    {
        "slug": "ruide-rcs-rts822",
        "folder": "Station total de marque RUIDE",
        "title": "Station Totale RUIDE RCS / RTS-822R10m",
        "category": "stations-totales",
        "brand": "RUIDE / SOUTH",
        "price": 2450000,
        "originalPrice": 2750000,
        "badge": "1000m Sans Prisme",
        "summary": "Station totale électronique haute précision 2\" avec portée de 1000m sans réflecteur et grand écran couleur.",
        "availability": "en-boutique",
        "leadTime": "En stock à Cotonou",
        "featured": True,
        "order": 5,
        "highlights": [
            {"value": "2\"", "label": "Précision Angle"},
            {"value": "1000m", "label": "Sans Prisme"},
            {"value": "Couleur", "label": "Écran Tactile"}
        ],
        "included": [
            "Station totale RUIDE RCS / RTS-822",
            "2x Batteries Ni-MH/Li-ion grand format",
            "Chargeur rapide avec indicateur LED",
            "Câble de transfert USB et clé USB",
            "Coffret rigide rembourré avec bretelles"
        ],
        "useCases": [
            "Implantation de précision sur chantiers de bâtiment et génie civil",
            "Levés topographiques urbains et détails d'infrastructures",
            "Contrôle de verticalité d'ouvrages et auscultation"
        ],
        "features": [
            "Distance-mètre EDM ultra-performant : 1000m sans réflecteur",
            "Précision angulaire certifiée 2 secondes (2\")",
            "Compensateur électronique automatique double axe",
            "Grand écran graphique couleur tactile avec clavier alphanumérique",
            "Programmes embarqués : Gisement, Implantation, Resection, COGO"
        ],
        "specs": {
            "Précision": "2 secondes (2\")",
            "Portée Sans Prisme": "1000 mètres",
            "Portée Avec Prisme": "5000 mètres",
            "Écran": "Couleur tactile LCD",
            "Mémoire": "Internal 100k pts + SD/USB"
        },
        "related": ["chcnav-station-totale", "stonex-station-totale", "tersus-station-totale"],
        "body": """
### La Station Totale RUIDE RCS/RTS-822 : Puissance & Ergonomie

La station totale RUIDE RCS / RTS-822R10m s'impose comme l'un des instruments de mesure les plus performants et les plus robustes de sa catégorie. Équipée d'un distancemètre EDM de technologie avancée, elle mesure des distances jusqu'à 1000 mètres sans réflecteur en seulement 0.3 seconde, facilitant grandement la mesure de points inaccessibles.

Son interface utilisateur graphique en couleur sur écran tactile permet une navigation intuitive à travers les menus d'implantation, de levé et de calculs géométriques (COGO). Le transfert de données vers votre ordinateur s'effectue en quelques secondes via clé USB, carte SD ou câble série.

### La Sécurité de l'Importateur Officiel GéoTopo Bénin :
- **Contrôle métrologique 48h** en atelier sur banc d'étalonnage à Cotonou
- **Garantie 1 an** avec remplacement des pièces d'origine en SAV
- **Prise en main et formation terrain** offertes par nos ingénieurs
- **Livraison sécurisée** dans tout le Bénin et en Afrique francophone.
"""
    },
    {
        "slug": "leica-na532-kit",
        "folder": "Niveau de marque Leica model  NA532 avec ses accessoires ( trépied et Mire)",
        "title": "Niveau Optique Leica NA532 + Pack Trépied & Mire",
        "category": "niveaux",
        "brand": "Leica Geosystems",
        "price": 450000,
        "originalPrice": 520000,
        "badge": "Grossissement 32x",
        "summary": "Le niveau optique de référence mondial Leica NA532 livré en pack complet avec trépied aluminium et mire téléscopique 5m.",
        "availability": "en-boutique",
        "leadTime": "En stock à Cotonou",
        "featured": True,
        "order": 6,
        "highlights": [
            {"value": "32x", "label": "Optique Leica"},
            {"value": "1.6mm", "label": "Précision / km"},
            {"value": "IP56", "label": "Protection eau"}
        ],
        "included": [
            "Niveau optique automatique Leica NA532",
            "Trépied lourd d'origine pour niveau",
            "Mire télescopique aluminium 5 mètres avec niveau à bulle",
            "Fil à plomb et clés d'ajustement",
            "Coffret de transport rigide de haute protection"
        ],
        "useCases": [
            "Contrôle d'altimétrie et nivellement de précision sur chantiers BTP",
            "Coulage de dalles béton et terrassement routier",
            "Pose de bordures, canalisations et canalisations d'assainissement"
        ],
        "features": [
            "Optique légendaire Leica à haute clarté et fort contraste",
            "Grossissement puissant 32x pour visées à longue distance",
            "Compensateur automatique amorti par coussin d'air",
            "Boîtier étanche résistant à la poussière et aux jets d'eau IP56",
            "Cercle horizontal gradué en degrés pour mesure d'angles simples"
        ],
        "specs": {
            "Grossissement": "32x",
            "Précision": "1.6 mm / km",
            "Compensateur": "Amortissement pneumatique",
            "Protection": "IP56",
            "Poids": "1.5 kg"
        },
        "related": ["topcon-atb4-niveau", "ruide-rcs-rts822"],
        "body": """
### Excellence et Fiabilité avec le Niveau Optique Leica NA532

Sur un chantier de construction ou de VRD, la précision du nivellement ne tolère aucun compromis. Le niveau automatique Leica NA532 de la série NA500 associe le savoir-faire optique légendaire de Leica Geosystems à un compensateur magnétique ultra-stable amorti à l'air.

Même en présence de fortes vibrations dues au passage d'engins lourds de terrassement, le compensateur maintient la ligne de visée parfaitement horizontale. Livré chez GéoTopo Bénin sous forme de pack complet prêt à l'emploi avec son trépied lourd et sa mire 5m, il est votre meilleur allié pour tous vos travaux de nivellement au quotidien.

### Engagement Qualité GéoTopo Bénin :
- **Vérification et calage du compensateur** avant remise au client
- **Garantie constructeur 1 an** certifiée
- **Service après-vente et pièces détachées** disponibles à Cotonou
- **Livraison rapide** partout au Bénin et dans les pays voisins.
"""
    },
    {
        "slug": "foif-a90-rtk",
        "folder": "Gnss me marque FOIF model A90",
        "title": "FOIF A90 GNSS RTK Multi-Constellation",
        "category": "gnss-gps",
        "brand": "FOIF",
        "price": 2950000,
        "originalPrice": 3300000,
        "badge": "Compact & Robust",
        "summary": "Récepteur GNSS RTK compact et robuste FOIF A90 avec synthèse vocale intelligente et inclinaison IMU.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 7,
        "highlights": [
            {"value": "800+", "label": "Canaux GNSS"},
            {"value": "IMU", "label": "Mesure inclinée"},
            {"value": "Linux", "label": "OS Embarqué"}
        ],
        "included": [
            "Récepteur FOIF A90 compact",
            "Carnet de terrain Android durci",
            "Logiciel FOIF Field Survey",
            "2x Batteries Li-ion longue durée",
            "Valise de transport renforcée"
        ],
        "useCases": [
            "Relevés de détails et bornages fonciers",
            "Levés topographiques en milieu rural et forestier",
            "Projets d'aménagement du territoire et SIG"
        ],
        "features": [
            "Moteur GNSS multi-constellations 800+ canaux",
            "Design compact en alliage de magnésium ne pesant que 950g",
            "Synthèse vocale intelligente pour guidage sur le terrain",
            "Capteur d'inclinaison IMU pour mesures rapides et précises",
            "WebUI conviviale accessible depuis smartphone ou tablette"
        ],
        "specs": {
            "Canaux": "800+ canaux",
            "Poids": "950g avec batterie",
            "IMU": "Prise en charge inclinaison",
            "Radio": "UHF interne 2W",
            "Autonomie": "12 heures"
        },
        "related": ["unistrong-g970ii-pro", "chcnav-rtk-gnss", "south-rtk-gnss"],
        "body": """
### La Légèreté et l'Efficacité du Récepteur FOIF A90

Le récepteur GNSS RTK FOIF A90 combine un boîtier compact d'une compacité remarquable avec une puissance de traitement satellite exceptionnelle. Alimenté par un moteur 800+ canaux, il offre une fixation rapide du signal RTK tout en réduisant la fatigue du géomètre lors des longues journées de marche sur le terrain.

Sa synthèse vocale multilingue informe l'opérateur de l'état de la connexion et du mode de mesure sans avoir à scruter constamment l'écran du carnet. Le système d'exploitation Linux embarqué offre une interface WebUI rapide pour paramétrer le récepteur en Wi-Fi depuis n'importe quel terminal mobile.

### Garantie & Service GéoTopo Bénin :
- **Étalonnage certifié** à Cotonou avant livraison
- **Garantie 1 an** avec SAV réactif
- **Assistance technique permanente** par nos experts topographes
- **Livraison rapide** au Bénin et Afrique de l'Ouest.
"""
    },
    {
        "slug": "chcnav-rtk-gnss",
        "folder": "Gnss de marque CHC NAV",
        "title": "CHCNAV i73 / i83 GNSS RTK Smart",
        "category": "gnss-gps",
        "brand": "CHCNAV",
        "price": 3100000,
        "originalPrice": 3400000,
        "badge": "Technologie iStar",
        "summary": "Le GNSS RTK le plus populaire en Afrique de l'Ouest, alimenté par le moteur iStar pour une précision sous couvert végétal.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": True,
        "order": 8,
        "highlights": [
            {"value": "1408", "label": "Canaux iStar"},
            {"value": "34h", "label": "Autonomie MAX"},
            {"value": "730g", "label": "Poids Plume"}
        ],
        "included": [
            "Récepteur CHCNAV i73 / i83 RTK",
            "Carnet de terrain tactile LandStar 8",
            "Batterie lithium intégrée haute capacité",
            "Antenne radio et câble de charge rapide",
            "Coffret de transport rigide résistant"
        ],
        "useCases": [
            "Levés sous canopée dense et zones urbaines encaissées",
            "Implantation routière et terrassement BTP",
            "Projets de cadastre national et foncier"
        ],
        "features": [
            "Algorithme CHCNAV iStar 1408 canaux pour fixation optimale",
            "Autonomie exceptionnelle jusqu'à 34 heures en mode Mobile",
            "Capteur IMU 60° sans étalonnage préalable",
            "Boîtier ultra-léger 730g résistant aux chutes de 2 mètres",
            "Logiciel LandStar 8 intuitif en français inclus"
        ],
        "specs": {
            "Canaux": "1408 canaux iStar",
            "Autonomie": "34 heures",
            "Poids": "730g",
            "Protection": "IP68",
            "IMU": "60° automatique"
        },
        "related": ["efix-f8-visual-rtk", "unistrong-g970ii-pro", "sinognss-t10-plus-t70-pro"],
        "body": """
### CHCNAV i73/i83 : La Référence Incontournable des Géomètres

Le récepteur GNSS RTK CHCNAV s'est imposé sur les chantiers d'Afrique francophone grâce à son moteur iStar 1408 canaux capable de fixer le signal dans les conditions les plus difficiles. Même sous un couvert végétal dense ou à proximité de structures métalliques masquantes, il fournit des coordonnées centimétriques fiables.

Son poids plume de 730 grammes associé à une autonomie record de 34 heures en fait l'outil préféré des brigades de terrain qui parcourent des kilomètres chaque jour. Le logiciel LandStar 8 permet d'importer directement des fichiers DWG/DXF et d'effectuer l'implantation avec un guidage visuel clair.

### Les Garanties GéoTopo Bénin :
- **Contrôle et étalonnage** en atelier à Cotonou
- **Garantie 1 an** avec SAV réactif
- **Formation offerte** pour la prise en main de LandStar 8
- **Livraison rapide et sécurisée** dans toute la sub-région.
"""
    },
    {
        "slug": "stonex-rtk-gnss",
        "folder": "Gnss de marque STONEX 4M",
        "title": "Stonex S900 / 4M GNSS RTK Pro",
        "category": "gnss-gps",
        "brand": "Stonex",
        "price": 3600000,
        "originalPrice": 3950000,
        "badge": "Précision Pro",
        "summary": "GNSS RTK haut de gamme Stonex avec carte mère multi-constellations et modem 4G mondial.",
        "availability": "en-boutique",
        "leadTime": "Disponible",
        "featured": False,
        "order": 9,
        "highlights": [
            {"value": "1408", "label": "Canaux Pro"},
            {"value": "4G", "label": "Modem Mondial"},
            {"value": "IP68", "label": "Robuste"}
        ],
        "included": [
            "Récepteur Stonex S900 / 4M",
            "Carnet de terrain Stonex Cube-a",
            "2x Batteries Li-Ion rechargeables",
            "Chargeur double et câbles USB",
            "Valise de transport haute protection"
        ],
        "useCases": [
            "Levés topographiques d'ingénierie et de précision",
            "Suivi de grands chantiers d'infrastructures",
            "Cadastre et géodésie appliquée"
        ],
        "features": [
            "Carte mère GNSS 1408 canaux de technologie supérieure",
            "Modem 4G mondial et radio UHF multi-protocoles",
            "Système de compensation d'inclinaison IMU intégré",
            "Boîtier magnésium résistant aux conditions climatiques extrêmes",
            "Logiciel de terrain Stonex Cube-a complet et ergonomique"
        ],
        "specs": {
            "Canaux": "1408 canaux",
            "Modem": "4G LTE mondial",
            "Radio": "UHF 1W/2W réglable",
            "Protection": "IP68",
            "Logiciel": "Stonex Cube-a"
        },
        "related": ["efix-f8-visual-rtk", "unistrong-g970ii-pro", "south-rtk-gnss"],
        "body": """
### La Qualité et le Savoir-Faire Stonex S900

Le Stonex S900 / 4M est conçu pour répondre aux exigences les plus élevées des professionnels de la mesure. Sa carte GNSS 1408 canaux suit l'ensemble des constellations existantes et garantit un positionnement RTK d'une précision millimétrique.

Son modem 4G intégré permet de se connecter instantanément aux réseaux Ntrip VRS ou de transmettre des données vers le bureau en temps réel. Avec son logiciel de terrain Cube-a, réaliser un levé de réseau ou implanter un projet d'ingénierie devient une tâche simple et parfaitement contrôlée.

### Pourquoi Choisir GéoTopo Bénin ?
- **Certificat d'étalonnage** délivré après vérification métrologique
- **Garantie 1 an** et SAV assuré sur place à Cotonou
- **Formation complète** incluse avec l'équipement
- **Livraison rapide** dans tous les pays de l'UEMOA.
"""
    },
    {
        "slug": "south-rtk-gnss",
        "folder": "Gnss de marque SOUTH",
        "title": "SOUTH Galaxy G1 / G6 GNSS RTK",
        "category": "gnss-gps",
        "brand": "SOUTH",
        "price": 2850000,
        "originalPrice": 3200000,
        "badge": "Référence Terrain",
        "summary": "Le couteau suisse du géomètre : récepteur SOUTH éprouvé sur tous les chantiers africains.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 10,
        "highlights": [
            {"value": "1598", "label": "Canaux SoC"},
            {"value": "Farlink", "label": "Radio 10km"},
            {"value": "SurvX", "label": "Android App"}
        ],
        "included": [
            "Récepteur SOUTH Galaxy G1/G6",
            "Carnet de terrain tactile Android avec SurvX",
            "Batteries lithium longue durée et chargeur",
            "Antenne radio Farlink UHF",
            "Coffret rigide de transport"
        ],
        "useCases": [
            "Levés fonciers ruraux et urbains",
            "Relevés de détails et terrassements",
            "Projets d'adduction d'eau et génie rural"
        ],
        "features": [
            "SoC GNSS 1598 canaux avec suivi satellite haute performance",
            "Protocol de transmission radio Farlink offrant jusqu'à 10km de portée",
            "Mesure inclinée par capteur IMU sans calibration",
            "Interface WebUI pour accès et configuration faciles via Wi-Fi",
            "Boîtier renforcé résistant à la poussière, à l'eau et aux chutes"
        ],
        "specs": {
            "Canaux": "1598 canaux",
            "Radio": "Farlink UHF (jusqu'à 10km)",
            "Batterie": "Intégrée grande capacité",
            "Logiciel": "SurvX / EGStar",
            "Protection": "IP68"
        },
        "related": ["unistrong-g970ii-pro", "foif-a90-rtk", "sinognss-t10-plus-t70-pro"],
        "body": """
### SOUTH Galaxy G1/G6 : Fiabilité Inégalée sur le Terrain

La gamme SOUTH Galaxy s'est imposée auprès des géomètres africains grâce à une robustesse à toute épreuve et à un rapport qualité/prix imbattable. Son moteur 1598 canaux garantit une acquisition satellite rapide même dans les zones reculées ou sous les arbres.

Grâce à la technologie radio Farlink, la portée de transmission entre la base et le mobile atteint jusqu'à 10 kilomètres sans répéteur. Son carnet tactile avec le logiciel SurvX en français facilite le travail quotidien sur le chantier avec des outils d'exportation flexibles.

### Le Service Réseau GéoTopo Bénin :
- **Appareil contrôlé et étalonné** à Cotonou
- **Garantie constructeur 1 an** avec suivi après-vente
- **Formation offerte** à votre brigade lors de la remise
- **Expédition sécurisée** au Bénin et en Afrique francophone.
"""
    },
    {
        "slug": "chcnav-station-totale",
        "folder": "Station totale de marque CHC NAV",
        "title": "Station Totale CHCNAV CTS-112R4",
        "category": "stations-totales",
        "brand": "CHCNAV",
        "price": 2650000,
        "originalPrice": 2900000,
        "badge": "Précision 2\"",
        "summary": "Station totale CHCNAV robuste et intuitive, idéale pour l'implantation de bâtiments et routes.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 11,
        "highlights": [
            {"value": "2\"", "label": "Précision Angulaire"},
            {"value": "1000m", "label": "Sans Prisme"},
            {"value": "20h", "label": "Autonomie"}
        ],
        "included": [
            "Station totale CHCNAV CTS-112R4",
            "2x Batteries Li-ion haute capacité",
            "Chargeur double et câble de données",
            "Plomb optique/laser et housse de pluie",
            "Coffret rigide antichoc"
        ],
        "useCases": [
            "Implantation de bâtiments et d'ouvrages d'art",
            "Levés de détails urbains et de voiries",
            "Contrôle de géométrie de structures BTP"
        ],
        "features": [
            "Mesure sans réflecteur jusqu'à 1000 mètres",
            "Précision angulaire de 2 secondes (2\")",
            "Double écran rétroéclairé avec clavier alphanumérique complet",
            "Logiciel d'implantation embarqué riche en fonctionnalités",
            "Transfert de données rapide par carte SD, USB ou Bluetooth"
        ],
        "specs": {
            "Précision": "2\" (2 secondes)",
            "Portée sans prisme": "1000m",
            "Portée avec prisme": "5000m",
            "Autonomie": "20 heures",
            "Mémoire": "Interne + Carte SD/USB"
        },
        "related": ["ruide-rcs-rts822", "stonex-station-totale", "tersus-station-totale"],
        "body": """
### La Station Totale CHCNAV CTS-112R4 : Simplicité & Rigueur

La station totale CHCNAV CTS-112R4 allie une mécanique de haute précision à une électronique de mesure avancée. Son distancemètre sans prisme de 1000 mètres permet de relever les façades, toitures ou éléments dangereux en toute sécurité sans poser de réflecteur.

Son double écran à contraste élevé assure une lecture claire des angles et des distances sous tous les éclairages. Les programmes de calcul embarqués simplifient les tâches courantes comme le calcul de surfaces, le nivellement indirect et l'implantation de lignes de référence.

### Les Garanties GéoTopo Bénin :
- **Contrôle et étalonnage** sur banc géodésique à Cotonou
- **Garantie 1 an** avec SAV local réactif
- **Formation théorique et pratique** offerte
- **Livraison rapide** au Bénin et sub-région.
"""
    },
    {
        "slug": "stonex-station-totale",
        "folder": "Station total de marque Stonex",
        "title": "Station Totale Stonex STS2R Pro",
        "category": "stations-totales",
        "brand": "Stonex",
        "price": 2800000,
        "originalPrice": 3100000,
        "badge": "Optique Clarté HD",
        "summary": "Station totale Stonex avec distancemètre haute fréquence et pointeur laser visible red.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 12,
        "highlights": [
            {"value": "2\"", "label": "Angle HD"},
            {"value": "800m", "label": "Sans Prisme"},
            {"value": "Red", "label": "Pointeur Laser"}
        ],
        "included": [
            "Station totale Stonex STS2R",
            "2x Batteries Li-Ion et chargeur rapide",
            "Câble USB et clé USB de transfert",
            "Outillage de réglage et housse de protection",
            "Valise de transport étanche"
        ],
        "useCases": [
            "Chantiers de génie civil et de bâtiment",
            "Relevés topographiques d'aménagements",
            "Mesures de profils en travers et en long"
        ],
        "features": [
            "Distancemètre EDM haute performance 800m sans prisme",
            "Optique traitée multi-couches pour une visée ultra-claire",
            "Clavier alphanumérique ergonomique rétroéclairé sur deux faces",
            "Transfert facile des fichiers DXF, TXT, CSV",
            "Boîtier étanche résistant à l'eau et à la poussière IP55"
        ],
        "specs": {
            "Précision": "2\"",
            "Portée sans prisme": "800m",
            "Portée avec prisme": "5000m",
            "Écran": "Double écran rétroéclairé",
            "Transfert": "USB / RS232"
        },
        "related": ["ruide-rcs-rts822", "chcnav-station-totale", "tersus-station-totale"],
        "body": """
### Précision et Ergonomie Italienne avec la Stonex STS2R

La station totale Stonex STS2R est reconnue pour sa clarté optique exceptionnelle et la rapidité de son distancemètre EDM. Conçue pour une prise en main rapide, elle permet aux géomètres et ingénieurs de réaliser leurs implantations et leurs levés avec une grande régularité.

Son pointeur laser rouge visible facilite le repérage du point à mesurer en intérieur comme en extérieur. Grâce au logiciel embarqué complet, l'importation de fichiers de points et l'exportation vers votre logiciel de DAO s'effectuent sans aucune perte de données.

### Service & Engagement GéoTopo Bénin :
- **Étalonnage certifié** avant toute livraison
- **Garantie 1 an** avec support après-vente local
- **Formation terrain** gratuite offerte
- **Expédition sécurisée** dans toute l'Afrique francophone.
"""
    },
    {
        "slug": "tersus-station-totale",
        "folder": "Station totale de Marque TERSUS",
        "title": "Station Totale Tersus TS2 Touch",
        "category": "stations-totales",
        "brand": "Tersus",
        "price": 2550000,
        "originalPrice": 2850000,
        "badge": "Écran Tactile",
        "summary": "Station totale moderne avec écran couleur tactile et programmes de calcul topographique avancés.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 13,
        "highlights": [
            {"value": "2\"", "label": "Précision 2s"},
            {"value": "Touch", "label": "Écran Couleur"},
            {"value": "1000m", "label": "Sans Prisme"}
        ],
        "included": [
            "Station totale Tersus TS2",
            "2x Batteries Li-ion haute autonomie",
            "Chargeur et câble de communication USB",
            "Accessoires d'étalonnage et coffret rigide"
        ],
        "useCases": [
            "Implantation de précision et suivi de terrassement",
            "Relevés de structures et d'ouvrages BTP",
            "Calculs de surfaces et de volumes"
        ],
        "features": [
            "Écran couleur tactile intuitif de 3.5 pouces",
            "Mesure sans réflecteur jusqu'à 1000 mètres",
            "Précision angulaire de 2 secondes (2\")",
            "Compensateur électronique double axe de haute stabilité",
            "Export direct des plans au format DXF compatible AutoCAD"
        ],
        "specs": {
            "Précision": "2\"",
            "Portée sans prisme": "1000m",
            "Écran": "Tactile couleur 3.5\"",
            "Compensateur": "Double axe",
            "Protection": "IP55"
        },
        "related": ["ruide-rcs-rts822", "chcnav-station-totale", "stonex-station-totale"],
        "body": """
### La Modernité de la Station Totale Tersus TS2 Touch

La station totale Tersus TS2 apporte la convivialité de l'écran tactile couleur aux instruments de mesure topographiques. Son interface graphique moderne simplifie la saisie des codes de points, l'affichage du plan sur l'écran et la réalisation des programmes d'implantation.

Équipée d'un distancemètre puissant de 1000 mètres sans prisme, elle offre la flexibilité nécessaire pour travailler sur les chantiers urbains complexes. Sa batterie haute capacité garantit une autonomie confortable pour une journée complète de travail.

### Garantie, Formation & Service Métrologique GéoTopo Bénin :
- **Contrôle et étalonnage métrologique certifié** sur banc géodésique dans nos locaux de Cotonou avant livraison
- **Garantie constructeur intégrale 1 an** avec prise en charge du SAV et remplacement des pièces d'origine
- **Formation théorique et pratique offerte d'une demi-journée** pour vos techniciens et géomètres de terrain
- **Service d'expédition rapide et sécurisé** avec gestion douanière intégrale vers le Bénin, Togo, Niger, Burkina Faso, Côte d'Ivoire, Cameroun et Mali.
"""
    },
    {
        "slug": "topcon-atb4-niveau",
        "folder": "Niveau de marque TOPCON ATB4 ( ça fonctionne toujours avec mire, trépied) comme accessoires.jpeg",
        "title": "Niveau Optique Topcon AT-B4A + Trépied & Mire",
        "category": "niveaux",
        "brand": "Topcon",
        "price": 380000,
        "originalPrice": 430000,
        "badge": "IPX6 Étanche",
        "summary": "Niveau automatique de chantier Topcon AT-B4A étanche IPX6 ultra-robuste avec compensateur magnétique.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 14,
        "highlights": [
            {"value": "24x", "label": "Optique Topcon"},
            {"value": "IPX6", "label": "100% Étanche"},
            {"value": "2.0mm", "label": "Précision / km"}
        ],
        "included": [
            "Niveau optique automatique Topcon AT-B4A",
            "Trépied aluminium robuste avec bandoulière",
            "Mire télescopique 5 mètres avec niveau à bulle",
            "Fil à plomb et housse de protection",
            "Coffret rigide antichoc"
        ],
        "useCases": [
            "Nivellement de chantier et contrôle d'altimétrie",
            "Travaux de voirie, canalisations et VRD",
            "Implantation de dalles et fondations"
        ],
        "features": [
            "Grossissement optique 24x à haute résolution",
            "Étanchéité exceptionnelle IPX6 résistante aux fortes pluies",
            "Compensateur magnétique rapide et ultra-stable",
            "Mise au point minimale ultra-courte de 20 cm",
            "Cercle horizontal protégé pour lecture d'angles"
        ],
        "specs": {
            "Grossissement": "24x",
            "Précision": "2.0 mm / km",
            "Étanchéité": "IPX6",
            "Mise au point": "20 cm min",
            "Poids": "1.5 kg"
        },
        "related": ["leica-na532-kit", "ruide-rcs-rts822"],
        "body": """
### Robuste et Inusable : Le Niveau Optique Topcon AT-B4A

Le niveau automatique Topcon AT-B4A est réputé à travers le monde pour sa durabilité et sa résistance légendaire sur les chantiers. Bénéficiant de la norme d'étanchéité IPX6, il supporte les averses soudaines et les projections d'eau intenses sans aucune infiltration.

Son compensateur magnétique stabilisé garantit une visée parfaitement horizontale même en présence de fortes vibrations dues aux engins lourds. Livré sous forme de pack complet prêt à mesurer avec son trépied et sa mire 5m chez GéoTopo Bénin, il est prêt pour tous vos chantiers.

### Garantie & Service GéoTopo Bénin :
- **Contrôle et vérification du compensateur** avant livraison
- **Garantie 1 an** certifiée
- **Service après-vente rapide** à Cotonou
- **Livraison sécurisée** dans tout le Bénin et la sous-région.
"""
    },
    {
        "slug": "pack-brigade-gnss-complet",
        "folder": "Voici un gnss complet avec ses accessoires ( 2 trépied, canne, réflecteur, le bras, la radio, l'antenne et le PDA)",
        "title": "Pack Brigade RTK \"Master Terrain\" (Système Complet)",
        "category": "gnss-gps",
        "brand": "GéoTopo Pack",
        "price": 4950000,
        "originalPrice": 5600000,
        "badge": "Pack Tout-Inclus",
        "summary": "L'équipement ultime pour brigade foncière : 2 trépieds lourds, canne carbone, réflecteur, bras radio, antenne UHF et carnet PDA.",
        "availability": "en-boutique",
        "leadTime": "En stock à Cotonou",
        "featured": True,
        "order": 15,
        "highlights": [
            {"value": "Duo", "label": "Base + Mobile"},
            {"value": "35W", "label": "Radio 20km"},
            {"value": "Pack", "label": "Tout-Inclus"}
        ],
        "included": [
            "2x Récepteurs GNSS RTK Base et Mobile",
            "Carnet de terrain tactile Android PDA durci",
            "Radio UHF externe grand émetteur 35W pour portée 20km",
            "2x Trépieds lourds en aluminium avec embase et treuil",
            "Canne carbone graduée, réflecteur, bras d'antenne et coffrets"
        ],
        "useCases": [
            "Grands projets de cadastre et délimitation foncière rurale",
            "Projets d'infrastructures routières à grande échelle",
            "Campagnes de géodésie et points de référence Ntrip"
        ],
        "features": [
            "Pack brigade 100% complet et autonome sur le terrain",
            "Radio externe 35W assurant une portée RTK jusqu'à 20 km",
            "Double trépied lourd et accessoires de fixation professionnels",
            "Logiciel terrain en français préinstallé et configuré",
            "Solution éprouvée pour les brigades foncières et cabinets d'ingénierie"
        ],
        "specs": {
            "Composition": "Base + Mobile + Radio 35W + 2 Trépieds + Carnet",
            "Portée RTK": "Jusqu'à 20 km en UHF",
            "Autonomie": "Batteries jumelées 24h",
            "Précision": "Centimétrique RTK",
            "Garantie": "1 an intégrale avec SAV local"
        },
        "related": ["efix-f8-visual-rtk", "unistrong-g970ii-pro", "sinognss-t10-plus-t70-pro"],
        "body": """
### Le Pack Brigade RTK Master Terrain : Autonomie Maximale

Conçu spécifiquement par les ingénieurs de GéoTopo Bénin pour répondre aux besoins des cabinets de géomètres-experts et des brigades foncières opérant sur de grandes étendues, ce pack réunit l'ensemble du matériel nécessaire pour travailler en autonomie totale.

Comprenant un récepteur Base, un récepteur Mobile, une radio externe grand émetteur 35W (portée jusqu'à 20km), 2 trépieds professionnels lourds, une canne carbone et un carnet PDA tactile, votre équipe est prête à intervenir dès J+1 sur le chantier.

### La Réassurance Importateur GéoTopo Bénin :
- **Étalonnage complet et vérification métrologique** à Cotonou
- **Garantie 1 an** avec prêt d'appareil en cas d'immobilisation
- **Formation gratuite d'une journée entière** pour votre brigade
- **Livraison gratuite et sécurisée** au Bénin et en Afrique francophone.
"""
    },
    {
        "slug": "apeks-ap10-ap30",
        "folder": "Gnss APEKS AP10+AP30.jpeg",
        "title": "Apeks AP10 + AP30 GNSS RTK Smart",
        "category": "gnss-gps",
        "brand": "Apeks",
        "price": 2750000,
        "originalPrice": 3100000,
        "badge": "Compact & Performant",
        "summary": "Système GNSS RTK Apeks AP10/AP30 ultra-compact pour levés topographiques et cadastraux de précision.",
        "availability": "en-boutique",
        "leadTime": "Disponible",
        "featured": False,
        "order": 16,
        "highlights": [
            {"value": "1408", "label": "Canaux GNSS"},
            {"value": "AP30", "label": "Carnet tactile"},
            {"value": "IMU", "label": "60° Tilt"}
        ],
        "included": [
            "Tête réceptrice Apeks AP10 RTK",
            "Carnet de terrain tactile Apeks AP30",
            "Batteries lithium et chargeur intelligent",
            "Canne carbone et support de carnet",
            "Coffret rigide de transport"
        ],
        "useCases": [
            "Levés fonciers et bornages parcellaires",
            "Suivi de travaux d'assainissement et voirie",
            "Cartographie SIG et réseaux d'eau"
        ],
        "features": [
            "Puce GNSS multi-constellations 1408 canaux",
            "Capteur IMU pour levés inclinés jusqu'à 60°",
            "Carnet tactile AP30 sous Android avec écran grand angle",
            "Boîtier étanche IP68 antichoc",
            "Logiciel de terrain complet en français"
        ],
        "specs": {
            "Canaux": "1408 canaux",
            "Protection": "IP68",
            "Poids": "850g",
            "Autonomie": "16 heures",
            "Logiciel": "Apeks Survey"
        },
        "related": ["unistrong-g970ii-pro", "foif-a90-rtk", "south-rtk-gnss"],
        "body": """
### La Performance Accessible avec l'Apeks AP10 + AP30

Le système GNSS RTK Apeks AP10 + AP30 propose une alternative moderne et performante pour l'équipement des brigades de géomètres. Sa carte mère 1408 canaux capte efficacement les signaux de toutes les constellations satellites pour fournir une précision centimétrique instantanée.

Son carnet de terrain AP30 Android offre une prise en main rapide avec des menus clairs et intuitifs. Associé au capteur IMU pour compenser l'inclinaison de la canne, il vous fait gagner un temps précieux sur chaque point mesuré.

### Garantie, Formation & Service Métrologique GéoTopo Bénin :
- **Contrôle et étalonnage métrologique certifié** sur banc géodésique dans nos locaux de Cotonou avant livraison
- **Garantie constructeur intégrale 1 an** avec prise en charge du SAV et remplacement des pièces d'origine
- **Formation théorique et pratique offerte d'une demi-journée** pour vos techniciens et géomètres de terrain
- **Service d'expédition rapide et sécurisé** avec gestion douanière intégrale vers le Bénin, Togo, Niger, Burkina Faso, Côte d'Ivoire, Cameroun et Mali.
"""
    },
    {
        "slug": "newdi-rtk-gnss",
        "folder": "Gnss de marque NEWDI",
        "title": "NEWDI GNSS RTK Multi-Fréquences",
        "category": "gnss-gps",
        "brand": "NEWDI",
        "price": 2600000,
        "originalPrice": 2900000,
        "badge": "Fiabilité Terrain",
        "summary": "Récepteur GNSS RTK NEWDI robuste et performant, conçu pour les travaux de bornage et de terrassement.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 17,
        "highlights": [
            {"value": "1408", "label": "Canaux multi"},
            {"value": "Radio", "label": "UHF 2W"},
            {"value": "IP67", "label": "Étanche"}
        ],
        "included": [
            "Récepteur NEWDI GNSS RTK",
            "Carnet de terrain Android",
            "Logiciel d'acquisition terrain",
            "Batteries lithium et chargeur",
            "Coffret rigide de protection"
        ],
        "useCases": [
            "Topographie générale et cadastre",
            "Implantation de repères d'alignement",
            "Levés de profils altimétriques"
        ],
        "features": [
            "Réception multi-fréquences GPS, GLONASS, BeiDou, Galileo",
            "Radio UHF interne émetteur/récepteur",
            "Boîtier en alliage magnésium robuste IP67",
            "Autonomie batterie étendue jusqu'à 15 heures",
            "Interface WebUI pour contrôle Wi-Fi"
        ],
        "specs": {
            "Canaux": "1408 canaux",
            "Portée Radio": "5 km",
            "Autonomie": "15 heures",
            "Poids": "900g",
            "Protection": "IP67"
        },
        "related": ["unistrong-g970ii-pro", "south-rtk-gnss", "foif-a90-rtk"],
        "body": """
### Robustesse et Précision avec le NEWDI GNSS RTK

Le récepteur GNSS RTK NEWDI est spécialement conçu pour offrir un positionnement centimétrique fiable tout en préservant le budget de votre entreprise. Doté d'un processeur multi-constellations 1408 canaux, il assure une fixation rapide du signal RTK.

Son boîtier durci étanche IP67 protège les composants internes contre la poussière et les fortes précipitations tropicales. Il s'intègre parfaitement dans la chaîne de travail de votre cabinet avec des formats d'export standards.

### Garantie, Formation & Service Métrologique GéoTopo Bénin :
- **Contrôle et étalonnage métrologique certifié** sur banc géodésique dans nos locaux de Cotonou avant livraison
- **Garantie constructeur intégrale 1 an** avec prise en charge du SAV et remplacement des pièces d'origine
- **Formation théorique et pratique offerte d'une demi-journée** pour vos techniciens et géomètres de terrain
- **Service d'expédition rapide et sécurisé** avec gestion douanière intégrale vers le Bénin, Togo, Niger, Burkina Faso, Côte d'Ivoire, Cameroun et Mali.
"""
    },
    {
        "slug": "south-station-totale",
        "folder": "Station total de marque SOUTH.jpeg",
        "title": "Station Totale South NTS-332R / N6",
        "category": "stations-totales",
        "brand": "SOUTH",
        "price": 2400000,
        "originalPrice": 2700000,
        "badge": "Précision 2\"",
        "summary": "Station totale South NTS-332R reconnue pour sa rapidité de mesure sans prisme et son étanchéité.",
        "availability": "en-boutique",
        "leadTime": "En stock",
        "featured": False,
        "order": 18,
        "highlights": [
            {"value": "2\"", "label": "Précision Angle"},
            {"value": "1000m", "label": "Sans Prisme"},
            {"value": "Double", "label": "Clavier Écran"}
        ],
        "included": [
            "Station totale South NTS-332R / N6",
            "2x Batteries Li-ion grand format",
            "Chargeur rapide et câble de transfert",
            "Prisme simple avec canne et housse",
            "Coffret rigide rembourré"
        ],
        "useCases": [
            "Levés de détails topographiques et cadastraux",
            "Implantation de bâtiments et de voiries",
            "Auscultation et suivi de chantiers BTP"
        ],
        "features": [
            "Mesure sans réflecteur rapide jusqu'à 1000 mètres",
            "Précision angulaire de 2 secondes (2\")",
            "Double clavier alphanumérique avec écran rétroéclairé",
            "Capteur de température et de pression automatique",
            "Logiciel embarqué intuitif en français"
        ],
        "specs": {
            "Précision": "2\"",
            "Portée sans prisme": "1000m",
            "Portée avec prisme": "5000m",
            "Mémoire": "100 000 points",
            "Protection": "IP55"
        },
        "related": ["ruide-rcs-rts822", "chcnav-station-totale", "stonex-station-totale"],
        "body": """
### La Station Totale South NTS-332R : Référence des Chantiers

La station totale South NTS-332R réunit la fiabilité mécanique de South et une électronique de distancemètre EDM d'une rapidité remarquable. Elle permet de réaliser des visées jusqu'à 1000 mètres sans prisme en une fraction de seconde.

Son double écran rétroéclairé assure une lisibilité parfaite même dans des conditions de lumière difficile. Avec sa grande capacité de mémoire interne et ses fonctions d'export USB, elle simplifie le transfert de vos relevés vers AutoCAD et Covadis.

### Garantie, Formation & Service Métrologique GéoTopo Bénin :
- **Contrôle et étalonnage métrologique certifié** sur banc géodésique dans nos locaux de Cotonou avant livraison
- **Garantie constructeur intégrale 1 an** avec prise en charge du SAV et remplacement des pièces d'origine
- **Formation théorique et pratique offerte d'une demi-journée** pour vos techniciens et géomètres de terrain
- **Service d'expedition rapide et sécurisé** avec gestion douanière intégrale vers le Bénin, Togo, Niger, Burkina Faso, Côte d'Ivoire, Cameroun et Mali.
"""
    }
]

# Nettoyage des anciens guides
guides_dir = r"d:\boutique-benin\src\content\guides"
if os.path.exists(guides_dir):
    shutil.rmtree(guides_dir)
os.makedirs(guides_dir, exist_ok=True)

def convert_to_webp(src_file, dest_file):
    try:
        with Image.open(src_file) as img:
            img.convert("RGB").save(dest_file, "WEBP", quality=85)
            return True
    except Exception as e:
        print(f"Erreur conversion {src_file} -> {dest_file}: {e}")
        return False

print("--- DEBUT RECONSTRUCTION BASE PRODUITS REELS (18 PRODUITS) ---")

for p in products:
    p_dir = os.path.join(target_dir, p["slug"])
    os.makedirs(p_dir, exist_ok=True)
    
    # 1. Traitement des images
    folder_path = os.path.join(source_dir, p["folder"])
    images_found = []
    
    if os.path.exists(folder_path):
        if os.path.isdir(folder_path):
            files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpeg', '.jpg', '.png', '.webp'))]
            files.sort()
            for idx, fname in enumerate(files):
                full_src = os.path.join(folder_path, fname)
                dest_name = "cover.webp" if idx == 0 else f"{idx}.webp"
                dest_full = os.path.join(p_dir, dest_name)
                if convert_to_webp(full_src, dest_full):
                    images_found.append(dest_name)
        elif os.path.isfile(folder_path) and folder_path.lower().endswith(('.jpeg', '.jpg', '.png', '.webp')):
            dest_full = os.path.join(p_dir, "cover.webp")
            if convert_to_webp(folder_path, dest_full):
                images_found.append("cover.webp")
    
    if not images_found:
        print(f"⚠️ Aucune image pour {p['slug']}, création image vide cover.webp")
        img = Image.new("RGB", (800, 600), color=(24, 32, 48))
        img.save(os.path.join(p_dir, "cover.webp"), "WEBP")
        images_found.append("cover.webp")
    
    # 2. Construction du fichier Markdown index.md
    gallery_items = [i for i in images_found if i != "cover.webp"]
    
    highlights_str = "\n".join([f"  - value: \"{h['value'].replace('\"', '\\\"')}\"\n    label: \"{h['label'].replace('\"', '\\\"')}\"" for h in p["highlights"]])
    included_str = "\n".join([f"  - \"{inc.replace('\"', '\\\"')}\"" for inc in p["included"]])
    usecases_str = "\n".join([f"  - \"{uc.replace('\"', '\\\"')}\"" for uc in p["useCases"]])
    features_str = "\n".join([f"  - \"{feat.replace('\"', '\\\"')}\"" for feat in p["features"]])
    specs_str = "\n".join([f"  \"{k.replace('\"', '\\\"')}\": \"{v.replace('\"', '\\\"')}\"" for k, v in p["specs"].items()])
    related_str = "\n".join([f"  - \"{r}\"" for r in p["related"]])
    youtube_str = "\n".join([f"  - \"{y}\"" for y in p.get("youtube", [])])

    md = f"""---
title: "{p['title'].replace('"', '\\"')}"
category: "{p['category']}"
brand: "{p['brand']}"
summary: "{p['summary'].replace('"', '\\"')}"
cover: "./cover.webp"
gallery:
{chr(10).join([f'  - "./{g}"' for g in gallery_items]) if gallery_items else '  - "./cover.webp"'}
youtube:
{youtube_str if youtube_str else '  - "dQw4w9WgXcQ"'}
availability: "{p['availability']}"
leadTime: "{p['leadTime']}"
price: {p['price']}
featured: {str(p['featured']).lower()}
order: {p['order']}
highlights:
{highlights_str}
included:
{included_str}
useCases:
{usecases_str}
features:
{features_str}
specs:
{specs_str}
related:
{related_str}
---

{p['body'].strip()}
"""
    
    with open(os.path.join(p_dir, "index.md"), "w", encoding="utf-8") as f:
        f.write(md)

    print(f"[OK] {p['title']} ({len(images_found)} images WebP)")

print("--- DEBUT MIS A JOUR DES PACKS ET GUIDES ---")

# Mise à jour des packs pour référencer les nouveaux slugs réels
packs_dir = r"d:\boutique-benin\src\content\packs"

pack1 = """---
title: "Pack Brigade Topographe Complet"
summary: "Pack intégral comprenant Station Totale RUIDE 2 secondes, trépied lourd, canne, réflecteur et accessoires."
cover: "./cover.webp"
products:
  - "ruide-rcs-rts822"
  - "leica-na532-kit"
price: 2850000
availability: "en-boutique"
leadTime: "En stock à Cotonou"
featured: true
order: 1
---

### Pack Brigade Topographe Complet
L'ensemble indispensable pour équiper une brigade sur le terrain avec une station totale haute précision 2 secondes RUIDE et un niveau optique Leica.
"""

pack2 = """---
title: "Pack Brigade GNSS RTK Master"
summary: "Système complet Base + Mobile GNSS RTK 1408 canaux avec carnet Android, trépieds et radio 35W."
cover: "./cover.webp"
products:
  - "efix-f8-visual-rtk"
  - "unistrong-g970ii-pro"
price: 6900000
availability: "en-boutique"
leadTime: "En stock à Cotonou"
featured: true
order: 2
---

### Pack Brigade GNSS RTK Master
Le pack ultime combinant le récepteur visuel EFIX F8 avec double caméra et l'UniStrong G970II Pro pour des levés d'une efficacité inégalée.
"""

pack3 = """---
title: "Pack Nivellement & Auscultation Expert"
summary: "Ensemble de nivellement de haute précision comprenant le niveau optique Leica NA532 32x, le niveau Topcon AT-B4A et leurs trépieds."
cover: "./cover.webp"
products:
  - "leica-na532-kit"
  - "topcon-atb4-niveau"
price: 790000
availability: "en-boutique"
leadTime: "En stock à Cotonou"
featured: false
order: 3
---

### Pack Nivellement & Auscultation Expert
La solution idéale pour les contrôles altimétriques rigoureux et le nivellement de précision sur vos chantiers BTP.
"""

for p_name, p_md in [("pack-topographe-complet", pack1), ("pack-brigade-gnss-rtk", pack2), ("pack-nivellement-expert", pack3)]:
    pd = os.path.join(packs_dir, p_name)
    os.makedirs(pd, exist_ok=True)
    with open(os.path.join(pd, "index.md"), "w", encoding="utf-8") as f:
        f.write(p_md)
    # copy cover image
    img = Image.new("RGB", (800, 600), color=(255, 107, 0))
    img.save(os.path.join(pd, "cover.webp"), "WEBP")

# Mise à jour des guides
guides_dir = r"d:\boutique-benin\src\content\guides"
guide1 = """---
product: "efix-f8-visual-rtk"
token: "sec_efix_f8_visual_rtk_guide_2026"
title: "Guide de prise en main et levé 3D visuel EFIX F8"
youtube:
  - "dQw4w9WgXcQ"
---

# Guide de démarrage EFIX F8 Visual RTK

Bienvenue dans votre guide d'utilisation exclusif pour le récepteur EFIX F8.

### 1. Configuration initiale et calibration IMU
Allumez le récepteur et ouvrez LandStar 8 sur votre carnet Android. Activez la fonction IMU 60°.
"""

guide2 = """---
product: "unistrong-g970ii-pro"
token: "sec_unistrong_g970ii_pro_guide_2026"
title: "Guide d'utilisation SurPad 4.2 & UniStrong G970II Pro"
youtube:
  - "dQw4w9WgXcQ"
---

# Guide d'utilisation SurPad 4.2 & UniStrong G970II Pro

Ce guide vous explique pas à pas comment configurer votre base et mobile RTK.
"""

guide3 = """---
product: "ruide-rcs-rts822"
token: "sec_ruide_rcs_rts822_guide_2026"
title: "Guide de stationnement et d'implantation RUIDE RTS-822"
youtube:
  - "dQw4w9WgXcQ"
---

# Guide d'implantation Station Totale RUIDE RTS-822

Guide pratique pour réaliser une mise en station rapide et exporter vos fichiers DXF.
"""

for g_name, g_md in [("efix-f8", guide1), ("gx-lite", guide2), ("st-m5", guide3)]:
    with open(os.path.join(guides_dir, f"{g_name}.md"), "w", encoding="utf-8") as f:
        f.write(g_md)

print("--- FIN RECONSTRUCTION COMPLETED ---")
