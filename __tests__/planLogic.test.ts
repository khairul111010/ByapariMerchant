import { planEnvelopeSchema } from '../src/api/schemas/settings';
import {
  historyAmount, historyPeriod, ordersTone, payAction, pickStoreBanner, priceString, productsTone,
  renewalState, stateTone, trialDaysLeft, upgradeOptions, usageFraction,
} from '../src/features/plan/logic';
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
  it('usage is {used, max} objects; orders carry a soft-limit state', () => {
    expect(starter.usage.products).toEqual({ used: 42, max: 100 });
    expect(starter.usage.orders).toEqual({ used: 380, max: 500, state: 'ok' });
    expect(growth.usage.orders.state).toBe('near');
  });
  it('the old "unlimited" strings no longer parse', () => {
    const old = JSON.parse(JSON.stringify(s['Plan (Starter)']));
    old.data.usage.products = 'unlimited';
    old.data.usage.orders = 'unlimited';
    expect(planEnvelopeSchema.safeParse(old).success).toBe(false);
  });
  it('history: newest first, the free trial is amount 0', () => {
    expect(starter.history[0]).toMatchObject({ label: 'Free trial', amount: 0 });
    expect(historyAmount(0)).toEqual({ kind: 'free' });
    expect(historyAmount(null)).toEqual({ kind: 'none' });
    expect(historyAmount(8400)).toEqual({ kind: 'money', value: '8400' });
    expect(historyPeriod(growth.history[1])).toEqual({ kind: 'until', to: growth.history[1].period_to });
    expect(historyPeriod({ period_from: 'a', period_to: 'b' })).toEqual({ kind: 'range', from: 'a', to: 'b' });
    expect(historyPeriod({ period_from: null, period_to: null })).toBeNull();
  });
  it('bar tones: products red at the cap, orders amber near and red over', () => {
    expect(productsTone({ used: 99, max: 100 })).toBe('normal');
    expect(productsTone({ used: 100, max: 100 })).toBe('danger');
    expect(productsTone({ used: 5000, max: null })).toBe('normal');
    expect(ordersTone('ok')).toBe('normal');
    expect(ordersTone('near')).toBe('warning');
    expect(ordersTone('over')).toBe('danger');
    expect(usageFraction(50, 100)).toBe(0.5);
    expect(usageFraction(600, 500)).toBe(1);
    expect(usageFraction(3, null)).toBe(0);
  });
  it('pay vs renew: trial/pending pay for the current plan, active/overdue renew', () => {
    expect(payAction(starter)).toEqual({ kind: 'pay', url: starter.plans.find((p) => p.is_current)?.contact_whatsapp_url });
    expect(payAction(growth)).toEqual({ kind: 'renew', url: growth.renew_whatsapp_url });
    expect(stateTone('trial_expired')).toBe('danger');
    expect(stateTone('overdue')).toBe('danger');
    expect(stateTone('something_new')).toBe('neutral');
  });
  it('upgrade and renew links are WhatsApp links, never payment details', () => {
    for (const p of growth.plans) {
      expect(p.contact_whatsapp_url).toMatch(/^https:\/\/wa\.me\//);
    }
    expect(growth.renew_whatsapp_url).toMatch(/^https:\/\/wa\.me\//);
  });
});

describe('store banner (from /me), most urgent first', () => {
  const NOW = Date.parse('2026-11-14T06:00:00Z');
  const me = (store: object, limits: object = {}) =>
    ({
      store: { api_base_url: 'x', is_pending: false, is_trial: false, storefront_closed: false, ...store },
      limits: {
        max_staff_accounts: 1, can_add_staff_account: true, custom_domain_enabled: false,
        courier_drivers: [], configured_courier_drivers: [], order_limit_state: 'ok', ...limits,
      },
    }) as never;

  it('nothing for a paid store under its limits', () => {
    expect(pickStoreBanner(me({}), NOW)).toBeNull();
    expect(pickStoreBanner(undefined, NOW)).toBeNull();
  });
  it('pending (Growth/Business awaiting payment) beats the order warning', () => {
    expect(pickStoreBanner(me({ is_pending: true, storefront_closed: true }, { order_limit_state: 'over' }), NOW)).toEqual({ kind: 'pending' });
  });
  it('an older server without storefront_closed still shows pending', () => {
    expect(pickStoreBanner(me({ is_pending: true, storefront_closed: undefined, is_trial: undefined }), NOW)).toEqual({ kind: 'pending' });
  });
  it('trial ended: closed, not pending, not on trial', () => {
    expect(pickStoreBanner(me({ storefront_closed: true }), NOW)).toEqual({ kind: 'trial_ended' });
  });
  it('trial running: whole days left, 0 on the last day', () => {
    expect(pickStoreBanner(me({ is_trial: true, trial_ends_at: '2026-11-19T17:59:59Z' }), NOW)).toEqual({ kind: 'trial', daysLeft: 5 });
    expect(pickStoreBanner(me({ is_trial: true, trial_ends_at: '2026-11-14T17:59:59Z' }), NOW)).toEqual({ kind: 'trial', daysLeft: 0 });
  });
  it('trial beats the order warning; then over beats near', () => {
    expect(pickStoreBanner(me({ is_trial: true, trial_ends_at: '2026-11-19T17:59:59Z' }, { order_limit_state: 'over' }), NOW)?.kind).toBe('trial');
    expect(pickStoreBanner(me({}, { order_limit_state: 'over' }), NOW)).toEqual({ kind: 'orders_over' });
    expect(pickStoreBanner(me({}, { order_limit_state: 'near' }), NOW)).toEqual({ kind: 'orders_near' });
  });
  it('trialDaysLeft matches the server: floor, never negative, null without a date', () => {
    expect(trialDaysLeft('2026-11-13T00:00:00Z', NOW)).toBe(0);
    expect(trialDaysLeft(null, NOW)).toBeNull();
    expect(trialDaysLeft('nonsense', NOW)).toBeNull();
  });
});
