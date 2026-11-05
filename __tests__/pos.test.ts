import { posProductsSchema } from '../src/api/schemas/selling';
import { addToCart, cartTotal, lineTotal, setQuantity, toSaleItems, unitPrice } from '../src/features/pos/cart';
import { fromMinor, toMinor } from '../src/money';
import { sellingSamples as s } from '../test/samples-selling';

const earbuds = posProductsSchema.parse(s['POS product search (variant with price tiers)']).data[0]; // 1500, tiers 5+ 1350, 10+ 1200, stock 12
const untracked = { ...earbuds, variant_id: 9, tracks_inventory: false, stock_quantity: 0, price_tiers: [] };

describe('money', () => {
  it('converts to whole paisa and back without floats', () => {
    expect(toMinor('1350.00')).toBe(135000);
    expect(toMinor('0.05')).toBe(5);
    expect(toMinor('99.5')).toBe(9950);
    expect(toMinor('9007199254740.99')).toBe(900719925474099);
    expect(fromMinor(675000)).toBe('6750.00');
    expect(fromMinor(5)).toBe('0.05');
    expect(fromMinor(-250)).toBe('-2.50');
  });
  it('sums that floats would get wrong are exact', () => {
    expect(fromMinor(toMinor('0.10') + toMinor('0.20'))).toBe('0.30');
  });
  it('rejects junk', () => {
    expect(() => toMinor('abc')).toThrow();
  });
});

describe('POS cart', () => {
  it('applies the wholesale tier by quantity, matching the real sale sample (5 x 1350 = 6750)', () => {
    expect(unitPrice(earbuds, 1)).toBe('1500.00');
    expect(unitPrice(earbuds, 4)).toBe('1500.00');
    expect(unitPrice(earbuds, 5)).toBe('1350.00');
    expect(unitPrice(earbuds, 10)).toBe('1200.00');
    expect(unitPrice(earbuds, 11)).toBe('1200.00');
    expect(lineTotal({ product: earbuds, quantity: 5 })).toBe('6750.00');
  });
  it('adds, merges lines and totals exactly', () => {
    let cart = addToCart([], earbuds);
    cart = addToCart(cart, earbuds);
    cart = addToCart(cart, untracked, 3);
    expect(cart.map((l) => [l.product.variant_id, l.quantity])).toEqual([[1, 2], [9, 3]]);
    expect(cartTotal(cart)).toBe(String((1500 * 2 + 1500 * 3).toFixed(2)));
  });
  it('never lets tracked stock be exceeded', () => {
    let cart = addToCart([], earbuds, 12);
    expect(addToCart(cart, earbuds)).toBe(cart); // unchanged: already at stock (12)
    cart = setQuantity(cart, 1, 50);
    expect(cart[0].quantity).toBe(12);
  });
  it('refuses to add a sold-out tracked item, but untracked items have no cap', () => {
    const soldOut = { ...earbuds, stock_quantity: 0 };
    expect(addToCart([], soldOut)).toEqual([]);
    expect(addToCart([], untracked, 500)[0].quantity).toBe(500);
  });
  it('quantity zero or below removes the line', () => {
    const cart = addToCart([], earbuds, 3);
    expect(setQuantity(cart, 1, 0)).toEqual([]);
    expect(setQuantity(cart, 1, -2)).toEqual([]);
    expect(setQuantity(cart, 1, NaN)).toEqual([]);
  });
  it('builds the sale request from the cart', () => {
    expect(toSaleItems(addToCart([], earbuds, 5))).toEqual([{ variant_id: 1, quantity: 5 }]);
  });
});
