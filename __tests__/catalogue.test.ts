import {
  categoriesSchema, describeSchema, importEnvelopeSchema, importsSchema, lookupSchema,
  lowStockSchema, productEnvelopeSchema, productsPageSchema, stockHistorySchema, variantEnvelopeSchema,
} from '../src/api/schemas/catalogue';
import { catalogueSamples as s } from '../test/samples-catalogue';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, key: string) =>
  expect(schema.safeParse(s[key]).success).toBe(true);

describe('catalogue schemas accept the real backend samples', () => {
  it('create product', () => ok(productEnvelopeSchema, 'Create product'));
  it('product detail', () => ok(productEnvelopeSchema, 'Product detail (full)'));
  it('list products', () => ok(productsPageSchema, 'List products (compact rows)'));
  it('create variant', () => ok(variantEnvelopeSchema, 'Create variant'));
  it('stock delta result', () => ok(variantEnvelopeSchema, 'Stock adjust, delta mode'));
  it('variant save', () => ok(variantEnvelopeSchema, 'Variant save (price only, stock untouched)'));
  it('categories', () => ok(categoriesSchema, 'List categories'));
  it('stock history', () => ok(stockHistorySchema, 'Stock history'));
  it('low stock', () => ok(lowStockSchema, 'Low stock'));
  it('sku lookup', () => ok(lookupSchema, 'SKU lookup (found)'));
  it('start import', () => ok(importEnvelopeSchema, 'Start CSV import'));
  it('poll import with row errors', () => ok(importEnvelopeSchema, 'Poll CSV import (with row errors)'));
  it('list imports (errors can be null)', () => ok(importsSchema, 'List CSV imports'));
  it('describe', () => ok(describeSchema, 'AI describe'));
  it('keeps money as strings', () => {
    expect(variantEnvelopeSchema.parse(s['Create variant']).data.price).toBe('1550.00');
  });
});
