/**
 * Configuration globale du site.
 * Modifier ce fichier pour adapter le site à un autre commerçant.
 */

export const site = {
  /** Nom affiché dans le header, le footer et les balises <title> */
  name: "GéoTopo Bénin",

  /** Nom court pour les espaces restreints */
  nameShort: "GéoTopo",

  /** Domaine de production (sans slash final) */
  url: "https://topo.incidenx.com",

  /** Slogan principal affiché dans le hero */
  tagline: "L'Importateur & Distributeur N°1 d'Équipements Topographiques au Bénin et en Afrique Francophone.",

  /** Sous-titre du hero */
  heroSubtitle:
    "Stations Totales, Récepteurs GNSS RTK, Niveaux de Précision, Lasers, Drones Photogrammétriques et Accessoires. Nous importons directement auprès des fabricants mondiaux (FOIF, Leica, South, CHCNAV, Sokkia, DJI) et livrons votre matériel étalonné sur base géodésique avec garantie 1 an et formation offerte.",

  /** Numéro WhatsApp au format international sans + ni espaces */
  whatsapp: "22961572766",

  /** Téléphone affiché sur la page contact */
  phone: "+229 61 57 27 66",

  /** Adresse physique */
  address: "Rue des Géomètres, Cotonou, Bénin",

  /** Horaires d'ouverture */
  hours: "Lun – Sam : 8 h – 18 h",

  /** Code ISO de la devise */
  currency: "XOF",

  /** Libellé de la devise affiché */
  currencyLabel: "FCFA",

  /** Description courte pour le SEO (≤ 160 caractères) */
  description:
    "Importateur direct d'équipements de topographie au Bénin & Afrique francophone. Stations totales, GNSS RTK, niveaux, drones. Matériel étalonné & garanti 1 an.",

  /** Auteur / organisation pour les métadonnées */
  author: "GéoTopo Bénin",

  /** Chiffres clés affichés sur l'accueil (Section 2) */
  stats: [
    { value: 18, suffix: "+", label: "Équipements d'exception certifiés usine" },
    { value: 100, suffix: "%", label: "Appareils contrôlés sur base géodésique à Cotonou" },
    { value: 1, suffix: " an", label: "Garantie intégrale & SAV local assuré" },
    { value: 7, suffix: " pays", label: "Livrés en Afrique Francophone (Bénin, Togo, Niger...)" },
  ],

  /** Liste des marques partenaires (Section 9 - affiché si non vide) */
  brands: [
    "FOIF",
    "SOUTH",
    "LEICA GEOSYSTEMS",
    "CHCNAV",
    "SOKKIA",
    "BOSCH PROFESSIONAL",
    "DJI ENTERPRISE",
  ],

  /** Messages WhatsApp prêts à l'emploi */
  messages: {
    /** Hero / Conseil */
    advisor: "Bonjour, je souhaite être conseillé pour le choix d'un équipement de topographie.",
    /** Sur-mesure : le client décrit son besoin */
    surMesure: "Bonjour, je cherche un produit qui n'est pas dans votre catalogue : ",
    /** Message générique depuis la page contact */
    contact: "Bonjour, je souhaite vous contacter.",
  },

  /** Liens de navigation principale */
  nav: [
    { label: "Boutique", href: "/boutique" },
    { label: "Packs", href: "/packs" },
    { label: "Sur-mesure", href: "/sur-mesure" },
    { label: "Contact", href: "/contact" },
  ],
} as const;