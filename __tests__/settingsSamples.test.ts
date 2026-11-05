import { mapError } from '../src/api/errors';
import {
  aiEnvelopeSchema, couriersEnvelopeSchema, domainEnvelopeSchema, domainsSchema, generalEnvelopeSchema,
  marketingEnvelopeSchema, paymentsEnvelopeSchema, planEnvelopeSchema, staffEnvelopeSchema, staffListSchema, verifyDomainSchema,
} from '../src/api/schemas/settings';
import { settingsSamples as s } from '../test/samples-settings';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, key: string) =>
  expect(schema.safeParse(s[key]).success).toBe(true);

describe('settings schemas accept the real backend samples', () => {
  it('general', () => {
    ok(generalEnvelopeSchema, 'General settings');
    ok(generalEnvelopeSchema, 'Update general settings');
  });
  it.each(['Payments (nothing configured)', 'Update payments', 'Clear a payment secret'])('payments: %s', (k) => ok(paymentsEnvelopeSchema, k));
  it.each(['Couriers (Growth: all three allowed)', 'Update couriers', 'Couriers on Starter (Pathao/RedX shown but not allowed)'])('couriers: %s', (k) => ok(couriersEnvelopeSchema, k));
  it.each(['AI settings', 'Update AI key'])('ai: %s', (k) => ok(aiEnvelopeSchema, k));
  it.each(['Marketing settings', 'Update marketing'])('marketing: %s', (k) => ok(marketingEnvelopeSchema, k));
  it('domains', () => {
    ok(domainsSchema, 'Domains (empty)');
    ok(domainsSchema, 'List domains');
    ok(domainsSchema, 'Domains on Starter (list)');
    ok(domainEnvelopeSchema, 'Add a subdomain-style domain (DNS fields)');
    ok(domainEnvelopeSchema, 'Add a root domain (A record routing)');
    ok(domainEnvelopeSchema, 'Make primary');
  });
  it('verify replies, including the one without misplaced_record', () => {
    ok(verifyDomainSchema, 'Verify, nothing in DNS yet');
    ok(verifyDomainSchema, 'Verify, record typed with the zone doubled');
    ok(verifyDomainSchema, 'Verify, success');
  });
  it('staff', () => {
    ok(staffListSchema, 'Staff list');
    ok(staffEnvelopeSchema, 'Add staff');
    ok(staffEnvelopeSchema, 'Update staff (rename)');
  });
  it('plans, with unlimited staff as null', () => {
    ok(planEnvelopeSchema, 'Plan (Growth)');
    ok(planEnvelopeSchema, 'Plan (Starter)');
    const growth = planEnvelopeSchema.parse(s['Plan (Growth)']).data;
    expect(growth.plans.find((p) => p.key === 'business')?.staff_accounts).toBeNull();
    expect(growth.usage.products).toBe('unlimited');
  });
});

describe('secrets are never in a reply', () => {
  it('no sample reply carries a secret value, only flags', () => {
    const text = JSON.stringify(s);
    for (const secret of ['sup3r-secret', 'sk-ant-secret', 'EAAB-secret-token', 'sf-secret-456']) {
      expect(text).not.toContain(secret);
    }
  });
});

describe('error samples', () => {
  it('the three plan limits are plan gates carrying their extras', () => {
    const a = mapError(403, s['PLAN LIMIT: Pathao fields on Starter'] as never);
    expect([a.kind, a.code, a.extra.driver]).toEqual(['plan_gate', 'driver_not_in_plan', 'pathao']);
    const b = mapError(403, s['PLAN LIMIT: add a domain on Starter'] as never);
    expect([b.kind, b.code, b.extra.addon_price_yearly]).toEqual(['plan_gate', 'custom_domain_not_in_plan', 500]);
    const c = mapError(403, s['PLAN LIMIT: add staff past the cap'] as never);
    expect([c.kind, c.code, c.extra.max_staff_accounts]).toEqual(['plan_gate', 'staff_limit_reached', 3]);
  });
  it('a staff token on an owner-only endpoint is a plain 403 forbidden', () => {
    expect(mapError(403, s['Owner-only: staff token gets 403'] as never).kind).toBe('forbidden');
  });
  it('field errors carry their names, including the odd "clear.0"', () => {
    expect(mapError(422, s['General settings, validation error'] as never).fieldErrors).toHaveProperty('whatsapp_number');
    expect(mapError(422, s['Payments, invalid clear'] as never).fieldErrors).toHaveProperty(['clear.0']);
    expect(mapError(422, s['Add staff, validation errors'] as never).fieldErrors).toHaveProperty('password');
    expect(mapError(422, s['Add domain, already taken'] as never).fieldErrors).toHaveProperty('domain');
  });
  it('not_verified is a business refusal with a code', () => {
    const e = mapError(422, s['Make primary, not yet verified'] as never);
    expect([e.kind, e.code]).toEqual(['business_refusal', 'not_verified']);
  });
  it('the last-owner refusal is a 422 with a message but no field and no code', () => {
    const e = mapError(422, s['Last owner cannot be demoted'] as never);
    expect(e.kind).toBe('validation');
    expect(e.code).toBeUndefined();
    expect(Object.keys(e.fieldErrors)).toHaveLength(0);
    expect(e.message).toBe('This store must always have at least one owner.');
  });
});
