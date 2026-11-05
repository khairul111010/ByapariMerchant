import { planEnvelopeSchema } from '../src/api/schemas/settings';
import { priceString, renewalState, upgradeOptions } from '../src/features/plan/logic';
import { settingsSamples as s } from '../test/samples-settings';

const growth = planEnvelopeSchema.parse(s['Plan (Growth)']).data;
const starter = planEnvelopeSchema.parse(s['Plan (Starter)']).data;

describe('plan logic', () => {
  it('upgrades are whatever the server flags, not decided from the plan name', () => {
    expect(upgradeOptions(growth).map((p) => p.key)).toEqual(['business']);
    expect(upgradeOptions(starter).map((p) => p.key)).toEqual(['growth', 'business']);
  });
  it('exactly one plan is current', () => {
    expect(growth.plans.filter((p) => p.is_current)).toHaveLength(1);
    expect(starter.plans.filter((p) => p.is_current).map((p) => p.key)).toEqual(['starter']);
  });
  it('prices come through as plain strings for the money formatter', () => {
    expect(priceString(growth.plan.price_monthly_quote)).toBe('700');
    expect(priceString('350')).toBe('350');
  });
  it('renewal state: a new store has no date yet; overdue is flagged', () => {
    expect(renewalState(starter.renewal)).toBe('none');
    expect(renewalState(growth.renewal)).toBe('ok');
    expect(renewalState({ expires_at: '2026-01-01T00:00:00+00:00', overdue: true, days_left: -3 })).toBe('overdue');
  });
  it('products and orders are unlimited: there is no cap to show', () => {
    expect(growth.usage.products).toBe('unlimited');
    expect(starter.usage.orders).toBe('unlimited');
  });
  it('upgrade and renew links are WhatsApp links, never payment details', () => {
    for (const p of growth.plans) {
      expect(p.contact_whatsapp_url).toMatch(/^https:\/\/wa\.me\//);
    }
    expect(growth.renew_whatsapp_url).toMatch(/^https:\/\/wa\.me\//);
  });
});
