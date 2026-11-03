import {
  makeCreateSchema, makeNewVariantSchema, makeVariantSchema, toCreatePayload, toNewVariantPayload,
  toUpdatePayload, toVariantUpdatePayload,
} from '../src/features/products/productForm';

const t = ((k: string) => k) as never;
const base = {
  name: ' Wireless Earbuds ', status: 'active' as const, sku: ' EAR-001 ', price: '1500', compare_at_price: '1800',
  stock_quantity: '25', category_id: 1, brand: '', track_inventory: true, is_featured: false,
};

describe('create product', () => {
  it('accepts a valid form and keeps money as strings', () => {
    const r = makeCreateSchema(t).safeParse(base);
    expect(r.success).toBe(true);
    const p = toCreatePayload(base, '<p>x</p>');
    expect(p).toMatchObject({ name: 'Wireless Earbuds', sku: 'EAR-001', price: '1500', compare_at_price: '1800', stock_quantity: 25, category_id: 1, description: '<p>x</p>' });
    expect(p.brand).toBeUndefined();
  });
  it.each([['abc'], ['12.345'], ['-5'], ['']])('rejects price %j', (price) => {
    expect(makeCreateSchema(t).safeParse({ ...base, price }).success).toBe(false);
  });
  it('allows 1500.50 and an empty compare-at price', () => {
    expect(makeCreateSchema(t).safeParse({ ...base, price: '1500.50', compare_at_price: '' }).success).toBe(true);
    expect(toCreatePayload({ ...base, compare_at_price: '' }, '').compare_at_price).toBeUndefined();
  });
  it('requires a whole-number stock and a name and SKU', () => {
    expect(makeCreateSchema(t).safeParse({ ...base, stock_quantity: '2.5' }).success).toBe(false);
    expect(makeCreateSchema(t).safeParse({ ...base, name: '  ' }).success).toBe(false);
    expect(makeCreateSchema(t).safeParse({ ...base, sku: '' }).success).toBe(false);
  });
});

describe('update product', () => {
  it('sends the required fields every time and clears empty optionals with null', () => {
    const p = toUpdatePayload({ name: 'N', status: 'draft', category_id: null, brand: '', track_inventory: true, is_featured: true }, '');
    expect(p).toEqual({ name: 'N', status: 'draft', category_id: null, brand: null, track_inventory: true, is_featured: true, description: null });
  });
});

describe('variants', () => {
  const form = { sku: 'EAR-001', name: '', price: '1450', compare_at_price: '1800', low_stock_threshold: '' };
  it('a price edit sends stock_quantity_was so it can never overwrite sales', () => {
    const p = toVariantUpdatePayload(form, { stock_quantity: 22 });
    expect(p).toMatchObject({ price: '1450', stock_quantity: 22, stock_quantity_was: 22, name: null, low_stock_threshold: null });
  });
  it('new variants need a starting stock; edits do not', () => {
    expect(makeNewVariantSchema(t).safeParse({ ...form, stock_quantity: '8' }).success).toBe(true);
    expect(makeNewVariantSchema(t).safeParse({ ...form, stock_quantity: '' }).success).toBe(false);
    expect(makeVariantSchema(t).safeParse(form).success).toBe(true);
    expect(toNewVariantPayload({ ...form, name: 'White', stock_quantity: '8' })).toMatchObject({ name: 'White', stock_quantity: 8 });
  });
});
