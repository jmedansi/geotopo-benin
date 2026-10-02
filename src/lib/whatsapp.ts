import { site } from "../config/site";
import { formatPrice } from "./price";

/** Construit un lien wa.me avec le numéro de la boutique et un message prérempli. */
export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Ajoute l'URL de la page à la fin du message si elle est fournie. */
function withUrl(message: string, url?: string): string {
  return url ? `${message}\n${url}` : message;
}

/**
 * Message produit à prix connu :
 * « Bonjour, je souhaite commander : {titre} ({prix}). » + URL
 * Message produit sur devis :
 * « Bonjour, je souhaite un devis pour : {titre}. » + URL
 */
export function waProduct(p: {
  title: string;
  price?: number;
  url?: string;
}): string {
  const intro =
    p.price !== undefined
      ? `Bonjour, je souhaite commander : ${p.title} (${formatPrice(p.price)}).`
      : `Bonjour, je souhaite un devis pour : ${p.title}.`;
  return waLink(withUrl(intro, p.url));
}

export function waMessageProduit(title: string, price: string, url: string): string {
  return `Bonjour, je souhaite commander : ${title} (${price}).\n${url}`;
}

export function waMessageDevis(title: string, url: string): string {
  return `Bonjour, je souhaite un devis pour : ${title}.\n${url}`;
}

/** Message pack : même principe, avec la liste des produits inclus. */
export function waPack(p: {
  title: string;
  productTitles: string[];
  url?: string;
}): string {
  const list = p.productTitles.map((t) => `- ${t}`).join("\n");
  const msg = `Bonjour, je souhaite commander le pack : ${p.title}.\nIl contient :\n${list}`;
  return waLink(withUrl(msg, p.url));
}

/** Sur-mesure : le client décrit son besoin. */
export function waSurMesure(): string {
  return waLink(site.messages.surMesure);
}

/** Question posée sur la fiche produit. */
export function waQuestion(productTitle: string): string {
  return waLink(`Bonjour, j'ai une question sur : ${productTitle}.`);
}