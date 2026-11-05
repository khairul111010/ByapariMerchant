import { homeSectionsSchema } from '../src/api/schemas/storefront';
import { makeSectionSchema, toSectionPayload } from '../src/features/sections/sectionForm';
import { storefrontSamples as s } from '../test/samples-storefront';

const t = ((k: string) => k) as never;
const base = { title: ' Our picks ', title_bn: '', subtitle: '', source: 'manual' as const, category_id: null, product_limit: '8', is_active: true };
const schema = makeSectionSchema(t);
const firstPath = (v: object) => {
  const r = schema.safeParse(v);
  return r.success ? null : r.error.issues[0].path[0];
};

describe('home section form', () => {
  it('accepts a valid manual section and builds the payload', () => {
    expect(schema.safeParse(base).success).toBe(true);
    expect(toSectionPayload(base)).toEqual({ title: 'Our picks', title_bn: null, subtitle: null, source: 'manual', category_id: null, product_limit: 8, is_active: true });
  });
  it('a category section needs a category, and only it sends one', () => {
    expect(firstPath({ ...base, source: 'category' })).toBe('category_id');
    expect(schema.safeParse({ ...base, source: 'category', category_id: 1 }).success).toBe(true);
    expect(toSectionPayload({ ...base, source: 'category', category_id: 1 }).category_id).toBe(1);
    expect(toSectionPayload({ ...base, source: 'newest', category_id: 1 }).category_id).toBeNull();
  });
  it('the product limit must be 4 to 12, as the server enforces', () => {
    expect(firstPath({ ...base, product_limit: '2' })).toBe('product_limit');
    expect(firstPath({ ...base, product_limit: '13' })).toBe('product_limit');
    expect(schema.safeParse({ ...base, product_limit: '4' }).success).toBe(true);
    expect(schema.safeParse({ ...base, product_limit: '12' }).success).toBe(true);
    expect(firstPath({ ...base, product_limit: 'abc' })).toBe('product_limit');
  });
  it('requires a title and keeps the Bangla title optional', () => {
    expect(firstPath({ ...base, title: '  ' })).toBe('title');
    expect(toSectionPayload({ ...base, title_bn: ' আমাদের পছন্দ ' }).title_bn).toBe('আমাদের পছন্দ');
  });
  it('every source the server offers is one the form knows', () => {
    const keys = homeSectionsSchema.parse(s['List home sections (with limits)']).sources.map((x) => x.key);
    expect(keys.sort()).toEqual(['best_sellers', 'category', 'featured', 'manual', 'newest', 'on_sale']);
  });
});
