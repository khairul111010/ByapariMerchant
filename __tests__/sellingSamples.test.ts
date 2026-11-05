import { mapError } from '../src/api/errors';
import {
  abandonedCartsPageSchema, couponEnvelopeSchema, couponsPageSchema, customerEnvelopeSchema, customersPageSchema,
  deliveryZoneEnvelopeSchema, deliveryZonesSchema, landingImageEnvelopeSchema, landingPageEnvelopeSchema,
  landingPagesPageSchema, posProductsSchema, posSaleSchema, reviewEnvelopeSchema, reviewsPageSchema,
  testimonialEnvelopeSchema,
} from '../src/api/schemas/selling';
import { sellingSamples as s } from '../test/samples-selling';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, key: string) =>
  expect(schema.safeParse(s[key]).success).toBe(true);

describe('selling schemas accept the real backend samples', () => {
  it('pos products', () => ok(posProductsSchema, 'POS product search (variant with price tiers)'));
  it('pos sale', () => ok(posSaleSchema, 'POS sale (success, wholesale tier applied)'));
  it.each(['Create coupon (percentage)', 'Create coupon (free delivery)', 'One coupon', 'Update coupon'])('coupon: %s', (k) => ok(couponEnvelopeSchema, k));
  it('coupons list', () => ok(couponsPageSchema, 'List coupons'));
  it('delivery zones', () => {
    ok(deliveryZonesSchema, 'List delivery zones');
    ok(deliveryZoneEnvelopeSchema, 'Update delivery zone');
  });
  it('landing pages', () => {
    ok(landingPageEnvelopeSchema, 'Create landing page (with an image)');
    ok(landingPageEnvelopeSchema, 'Landing page detail (images + testimonials)');
    ok(landingPagesPageSchema, 'List landing pages');
    ok(landingImageEnvelopeSchema, 'Upload landing page image');
    ok(testimonialEnvelopeSchema, 'Add testimonial');
  });
  it('abandoned carts', () => ok(abandonedCartsPageSchema, 'List abandoned carts'));
  it('reviews', () => {
    ok(reviewsPageSchema, 'List reviews (default: pending) with counts');
    ok(reviewEnvelopeSchema, 'Approve review');
  });
  it('customers', () => {
    ok(customersPageSchema, 'List customers');
    ok(customerEnvelopeSchema, 'One customer');
  });
  it('money stays strings, including coupon values', () => {
    expect(couponEnvelopeSchema.parse(s['Create coupon (percentage)']).data.value).toBe('20.00');
    expect(posSaleSchema.parse(s['POS sale (success, wholesale tier applied)']).data.total).toBe('6750.00');
  });
});

describe('error samples map through the central mapper', () => {
  it('POS insufficient stock is a 409 conflict carrying the real count and variant', () => {
    const e = mapError(409, s['POS sale, insufficient stock'] as never);
    expect(e.kind).toBe('conflict');
    expect(e.code).toBe('insufficient_stock');
    expect(e.extra.stock_quantity).toBe(2);
    expect(e.extra.variant_id).toBe(2);
  });
  it('validation errors carry field names', () => {
    expect(mapError(422, s['Create coupon, validation errors'] as never).fieldErrors).toHaveProperty('code');
    expect(mapError(422, s['Update delivery zone, validation error'] as never).fieldErrors).toHaveProperty('per_kg_charge');
    expect(mapError(422, s['POS sale, validation error (empty cart)'] as never).fieldErrors).toHaveProperty('items');
    expect(mapError(422, s['Add testimonial, validation error'] as never).fieldErrors).toHaveProperty('quote');
  });
  it('an unknown customer is a 404 (its message is empty, so never show it)', () => {
    expect(mapError(404, s['Unknown customer'] as never).kind).toBe('not_found');
  });
});
