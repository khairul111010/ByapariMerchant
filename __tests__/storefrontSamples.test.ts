import { mapError } from '../src/api/errors';
import {
  appearanceEnvelopeSchema, bannerEnvelopeSchema, bannersSchema, dashboardEnvelopeSchema,
  homeSectionDetailEnvelopeSchema, homeSectionEnvelopeSchema, homeSectionsSchema, sectionPreviewSchema, themesSchema,
} from '../src/api/schemas/storefront';
import { storefrontSamples as s } from '../test/samples-storefront';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, key: string) =>
  expect(schema.safeParse(s[key]).success).toBe(true);

describe('storefront schemas accept the real backend samples', () => {
  it.each(['Create banner', 'Create banner (image only)', 'Update banner (hide it)'])('banner: %s', (k) => ok(bannerEnvelopeSchema, k));
  it('banner lists', () => {
    ok(bannersSchema, 'List banners');
    ok(bannersSchema, 'List banners after reorder');
  });
  it.each(['Create home section (manual)', 'Create home section (category)'])('section: %s', (k) => ok(homeSectionEnvelopeSchema, k));
  it('sections with picks', () => {
    ok(homeSectionDetailEnvelopeSchema, 'Add pick');
    ok(homeSectionDetailEnvelopeSchema, 'Add pick #2');
    ok(homeSectionDetailEnvelopeSchema, 'One home section with picks');
  });
  it('section list with limits and sources, and the preview', () => {
    ok(homeSectionsSchema, 'List home sections (with limits)');
    ok(sectionPreviewSchema, 'Home section preview');
  });
  it('themes and appearance', () => {
    ok(themesSchema, 'Theme catalogue');
    ok(appearanceEnvelopeSchema, 'Appearance (current)');
    ok(appearanceEnvelopeSchema, 'Update appearance');
    ok(appearanceEnvelopeSchema, 'Upload logo');
  });
  it('dashboard, 7-day and custom range', () => {
    ok(dashboardEnvelopeSchema, 'Dashboard, 7-day range');
    ok(dashboardEnvelopeSchema, 'Dashboard, custom range');
  });
  it('money stays strings and null deltas are accepted', () => {
    const d = dashboardEnvelopeSchema.parse(s['Dashboard, 7-day range']).data;
    expect(d.revenue).toBe('1950.00');
    expect(d.revenue_delta_percent).toBeNull();
    expect(d.conversion_rate).toBe(0.5);
  });
});

describe('error samples', () => {
  it('banner validation names the image and link fields', () => {
    expect(mapError(422, s['Create banner, validation errors'] as never).fieldErrors).toHaveProperty('link_url');
  });
  it('home section limit error is a field error', () => {
    expect(mapError(422, s['Create home section, validation errors'] as never).fieldErrors).toHaveProperty('product_limit');
  });
  it('appearance and logo errors map to fields', () => {
    expect(mapError(422, s['Update appearance, validation errors'] as never).fieldErrors).toHaveProperty('theme_accent_color');
    expect(mapError(422, s['Upload logo, validation error'] as never).fieldErrors).toHaveProperty('logo');
  });
  it('an invalid dashboard range is a validation error', () => {
    expect(mapError(422, s['Dashboard, invalid range'] as never).fieldErrors).toHaveProperty('range');
  });
});
