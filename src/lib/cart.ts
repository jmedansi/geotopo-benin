/**
 * lib/cart.ts — Gestion du panier client dans localStorage.
 *
 * Clé localStorage : 'panier-v1'
 * Format stocké : Array<{ type: 'produit' | 'pack'; slug: string; qty: number }>
 *
 * RÈGLE STRICTE DU GUIDE : Ne JAMAIS stocker de prix dans localStorage.
 * Les prix sont toujours relus depuis le catalogue.
 */

export interface CartItem {
  type: "produit" | "pack";
  slug: string;
  qty: number;
}

const STORAGE_KEY = "panier-v1";
export const MAX_CART_ITEMS = 25;

/**
 * Lit le panier depuis localStorage.
 * Renvoie un tableau vide en cas d'erreur ou d'absence.
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          item &&
          (item.type === "produit" || item.type === "pack") &&
          typeof item.slug === "string" &&
          typeof item.qty === "number" &&
          item.qty > 0
      );
    }
  } catch {
    // localStorage indisponible ou corrompu
  }
  return [];
}

/**
 * Sauvegarde le panier dans localStorage et notifie l'application.
 */
export function saveCart(cart: CartItem[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("panier-mis-a-jour"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Ajoute un article au panier.
 * @returns { success: boolean; isLimitReached?: boolean; totalCount: number }
 */
export function addToCart(
  slug: string,
  type: "produit" | "pack" = "produit",
  qtyToAdd = 1
): { success: boolean; isLimitReached?: boolean; totalCount: number } {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.slug === slug && item.type === type);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += qtyToAdd;
  } else {
    // Vérification de la limite des 25 lignes
    if (cart.length >= MAX_CART_ITEMS) {
      return { success: false, isLimitReached: true, totalCount: getCartCount(cart) };
    }
    cart.push({ type, slug, qty: qtyToAdd });
  }

  const ok = saveCart(cart);
  return { success: ok, totalCount: getCartCount(cart) };
}

/**
 * Modifie la quantité d'un article. Si qty <= 0, retire l'article.
 */
export function updateCartQty(slug: string, type: "produit" | "pack", newQty: number): CartItem[] {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter((item) => !(item.slug === slug && item.type === type));
  } else {
    const item = cart.find((i) => i.slug === slug && i.type === type);
    if (item) {
      item.qty = newQty;
    }
  }
  saveCart(cart);
  return cart;
}

/**
 * Supprime un article du panier.
 */
export function removeFromCart(slug: string, type: "produit" | "pack"): CartItem[] {
  return updateCartQty(slug, type, 0);
}

/**
 * Vide entièrement le panier.
 */
export function clearCart(): void {
  saveCart([]);
}

/**
 * Compte le nombre total d'articles (somme des quantités).
 */
export function getCartCount(cart?: CartItem[]): number {
  const list = cart ?? getCart();
  return list.reduce((sum, item) => sum + item.qty, 0);
}
