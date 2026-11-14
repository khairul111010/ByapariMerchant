import type { Me } from '../../api/schemas/auth';
import type { HistoryRow, PlanData } from '../../api/schemas/settings';

/** A plan price as a money string ("700"), whether the server sent a number or a string. */
export const priceString = (v: number | string): string => String(v);

/**
 * Plans differ only by usage limits, never by features. Everything the screen decides about a plan
 * comes from the server's flags (`is_current`, `is_upgrade`, `state`) and numbers, never from the plan's name.
 */
export const upgradeOptions = (data: PlanData) =>
  data.plans.filter(p => p.is_upgrade);

/** Seat usage: "2 of 3", or "2" when the plan has unlimited seats (max is null). */
export function seatsLabel(
  used: number,
  max: number | null,
): { used: number; max: number | null } {
  return { used, max };
}

/** Whole days to the renewal date as the server reports it; null when there is no date yet. */
export const renewalState = (
  r: PlanData['renewal'],
): 'none' | 'overdue' | 'ok' =>
  r.expires_at === null ? 'none' : r.overdue ? 'overdue' : 'ok';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whole days left in the trial, the same way the server counts them (floor, never below 0).
 * 0 means today is the last day. null when there is no valid end date.
 */
export function trialDaysLeft(
  endsAt: string | null | undefined,
  now: number = Date.now(),
): number | null {
  if (!endsAt) {
    return null;
  }
  const end = Date.parse(endsAt);
  if (Number.isNaN(end)) {
    return null;
  }
  return Math.max(0, Math.floor((end - now) / DAY_MS));
}

export type StoreBanner =
  | { kind: 'pending' }
  | { kind: 'trial_ended' }
  | { kind: 'trial'; daysLeft: number | null }
  | { kind: 'orders_over' }
  | { kind: 'orders_near' }
  | null;

/** The one app-wide banner to show, most urgent first, from `/me` only. */
export function pickStoreBanner(
  me: Pick<Me, 'store' | 'limits'> | undefined,
  now: number = Date.now(),
): StoreBanner {
  if (!me) {
    return null;
  }
  const { store, limits } = me;
  // A pending store (Growth/Business awaiting payment) is never on a trial.
  if (store.is_pending && store.is_trial !== true) {
    return { kind: 'pending' };
  }
  if (store.storefront_closed) {
    return { kind: 'trial_ended' };
  }
  if (store.is_trial) {
    return { kind: 'trial', daysLeft: trialDaysLeft(store.trial_ends_at, now) };
  }
  if (limits.order_limit_state === 'over') {
    return { kind: 'orders_over' };
  }
  if (limits.order_limit_state === 'near') {
    return { kind: 'orders_near' };
  }
  return null;
}

export type BarTone = 'normal' | 'warning' | 'danger';

/** Products are a hard cap: red once used reaches max. */
export const productsTone = (u: { used: number; max: number | null }): BarTone =>
  u.max !== null && u.used >= u.max ? 'danger' : 'normal';

/** Orders are a soft limit: amber when near, red when over. It never blocks anything. */
export const ordersTone = (state: 'ok' | 'near' | 'over'): BarTone =>
  state === 'over' ? 'danger' : state === 'near' ? 'warning' : 'normal';

/** Fill fraction for a usage bar, 0..1; 0 when unlimited. */
export const usageFraction = (used: number, max: number | null): number =>
  max === null || max <= 0 ? 0 : Math.min(1, Math.max(0, used / max));

export type StateTone = 'brand' | 'warning' | 'danger' | 'success' | 'neutral';

/** Badge tone per subscription state; an unknown state is neutral. */
export const stateTone = (state: string): StateTone =>
  ({
    trial: 'brand',
    trial_expired: 'danger',
    pending: 'warning',
    active: 'success',
    overdue: 'danger',
    suspended: 'danger',
    cancelled: 'neutral',
  } as Record<string, StateTone>)[state] ?? 'neutral';

/** Active or overdue stores renew; everyone else (trial, trial ended, pending) pays for the current plan. */
export function payAction(data: PlanData): { kind: 'renew' | 'pay'; url: string | null } {
  const renew = data.plan.state === 'active' || data.plan.state === 'overdue';
  if (renew) {
    return { kind: 'renew', url: data.renew_whatsapp_url };
  }
  const current = data.plans.find(p => p.is_current);
  return { kind: 'pay', url: current?.contact_whatsapp_url ?? data.renew_whatsapp_url };
}

/** History amount: 0 is the free trial, null was not recorded, anything else is BDT. */
export const historyAmount = (
  amount: HistoryRow['amount'],
): { kind: 'free' } | { kind: 'none' } | { kind: 'money'; value: string } =>
  amount === null
    ? { kind: 'none' }
    : amount === 0
    ? { kind: 'free' }
    : { kind: 'money', value: String(amount) };

/** History period: both ends, "until" when the start is unknown, or nothing. */
export const historyPeriod = (
  row: Pick<HistoryRow, 'period_from' | 'period_to'>,
): { kind: 'range'; from: string; to: string } | { kind: 'until'; to: string } | null =>
  row.period_to === null
    ? null
    : row.period_from === null
    ? { kind: 'until', to: row.period_to }
    : { kind: 'range', from: row.period_from, to: row.period_to };
