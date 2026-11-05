import { isoToDateInput, makeCouponSchema, toCouponPayload } from '../src/features/coupons/couponForm';
import { makeZoneSchema, toZonePayload } from '../src/features/zones/zoneForm';

const t = ((k: string) => k) as never;
const base = {
  code: ' eid20 ', type: 'percentage' as const, value: '20', min_order_amount: '1000', max_uses: '100',
  starts_at: '', expires_at: '2026-12-31', is_active: true,
};
const coupon = makeCouponSchema(t);
const firstPath = (v: object) => {
  const r = coupon.safeParse(v);
  return r.success ? null : r.error.issues[0].path[0];
};

describe('coupon form', () => {
  it('accepts a valid percentage coupon and upper-cases the code in the payload', () => {
    expect(coupon.safeParse(base).success).toBe(true);
    expect(toCouponPayload(base)).toEqual({
      code: 'EID20', type: 'percentage', value: '20', min_order_amount: '1000', max_uses: 100,
      starts_at: null, expires_at: '2026-12-31', is_active: true,
    });
  });
  it('a free-delivery coupon needs no value and sends none', () => {
    const v = { ...base, type: 'free_delivery' as const, value: '', min_order_amount: '', max_uses: '', expires_at: '' };
    expect(coupon.safeParse(v).success).toBe(true);
    expect(toCouponPayload(v)).toMatchObject({ value: null, min_order_amount: null, max_uses: null, expires_at: null });
  });
  it('requires a value for percentage and fixed coupons', () => {
    expect(firstPath({ ...base, value: '' })).toBe('value');
    expect(firstPath({ ...base, type: 'fixed', value: 'abc' })).toBe('value');
  });
  it('caps a percentage at 100 but not a fixed amount', () => {
    expect(firstPath({ ...base, value: '150' })).toBe('value');
    expect(coupon.safeParse({ ...base, type: 'fixed', value: '150' }).success).toBe(true);
  });
  it('validates dates, including impossible ones, and their order', () => {
    expect(firstPath({ ...base, expires_at: '2026-13-40' })).toBe('expires_at');
    expect(firstPath({ ...base, expires_at: '31/12/2026' })).toBe('expires_at');
    expect(firstPath({ ...base, starts_at: '2026-12-31', expires_at: '2026-01-01' })).toBe('expires_at');
    expect(coupon.safeParse({ ...base, starts_at: '2026-01-01' }).success).toBe(true);
  });
  it('requires a code, and whole-number max uses', () => {
    expect(firstPath({ ...base, code: '  ' })).toBe('code');
    expect(firstPath({ ...base, max_uses: '2.5' })).toBe('max_uses');
  });
  it('turns the server date into the date field text', () => {
    expect(isoToDateInput('2026-12-31T00:00:00+00:00')).toBe('2026-12-31');
    expect(isoToDateInput(null)).toBe('');
  });
});

describe('zone form', () => {
  const v = { base_charge: '70', base_weight_grams: '1000', per_kg_charge: '20', estimated_delivery_note: ' 1-2 days ' };
  it('accepts a valid zone and keeps charges as strings', () => {
    expect(makeZoneSchema(t).safeParse(v).success).toBe(true);
    expect(toZonePayload(v)).toEqual({ base_charge: '70', base_weight_grams: 1000, per_kg_charge: '20', estimated_delivery_note: '1-2 days' });
  });
  it('requires every field except the note; an empty note is sent as null', () => {
    expect(makeZoneSchema(t).safeParse({ ...v, per_kg_charge: '' }).success).toBe(false);
    expect(makeZoneSchema(t).safeParse({ ...v, base_charge: '-5' }).success).toBe(false);
    expect(makeZoneSchema(t).safeParse({ ...v, estimated_delivery_note: '' }).success).toBe(true);
    expect(toZonePayload({ ...v, estimated_delivery_note: '' }).estimated_delivery_note).toBeNull();
  });
});
