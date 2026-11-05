import type { PosProduct } from '../../api/schemas/selling';
import { fromMinor, toMinor } from '../../money';

export interface CartLine {
  product: PosProduct;
  quantity: number;
}

/** Unit price for a quantity: the tier with the highest min_quantity that the quantity reaches. */
export function unitPrice(p: PosProduct, quantity: number): string {
  const tier = [...p.price_tiers]
    .filter((t) => quantity >= t.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0];
  return tier ? tier.price : p.price;
}

/** Most the cart may hold of this variant: its stock when tracked, otherwise unbounded. */
export const maxQuantity = (p: PosProduct): number => (p.tracks_inventory ? Math.max(0, p.stock_quantity) : Infinity);

export const lineTotalMinor = (l: CartLine): number => toMinor(unitPrice(l.product, l.quantity)) * l.quantity;
export const cartTotal = (lines: CartLine[]): string => fromMinor(lines.reduce((sum, l) => sum + lineTotalMinor(l), 0));
export const lineTotal = (l: CartLine): string => fromMinor(lineTotalMinor(l));

/** Adds one (or merges into the existing line), respecting stock. Returns the same cart if it cannot add. */
export function addToCart(lines: CartLine[], product: PosProduct, by = 1): CartLine[] {
  const at = lines.findIndex((l) => l.product.variant_id === product.variant_id);
  if (at === -1) {
    return maxQuantity(product) >= by ? [...lines, { product, quantity: by }] : lines;
  }
  const next = Math.min(lines[at].quantity + by, maxQuantity(lines[at].product));
  return next === lines[at].quantity ? lines : lines.map((l, i) => (i === at ? { ...l, quantity: next } : l));
}

/** Sets an exact quantity (clamped to stock); zero or less removes the line. */
export function setQuantity(lines: CartLine[], variantId: number, quantity: number): CartLine[] {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return lines.filter((l) => l.product.variant_id !== variantId);
  }
  return lines.map((l) =>
    l.product.variant_id === variantId ? { ...l, quantity: Math.min(Math.floor(quantity), maxQuantity(l.product)) } : l,
  );
}

export const toSaleItems = (lines: CartLine[]) => lines.map((l) => ({ variant_id: l.product.variant_id, quantity: l.quantity }));
