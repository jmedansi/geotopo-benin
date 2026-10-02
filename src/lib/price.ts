import { site } from "../config/site";

/**
 * Formate un prix en FCFA, ou renvoie « Sur devis » si le prix est absent.
 * Convention du guide §4 : l'absence de `price` signifie « Sur devis ».
 * Ne jamais passer 0 : utiliser l'absence de la clé.
 */
export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) {
    return "Sur devis";
  }
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(price);
  return `${formatted} ${site.currencyLabel}`;
}

/** Indique si l'article est proposé sur devis (prix absent). */
export function isOnQuote(price?: number | null): boolean {
  return price === undefined || price === null;
}

export const isSurDevis = isOnQuote;