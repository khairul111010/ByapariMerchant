import type { PlanData } from '../../api/schemas/settings';

/** A plan price as a money string ("700"), whether the server sent a number or a string. */
export const priceString = (v: number | string): string => String(v);

/**
 * Plans differ only by usage limits, never by features. Everything the screen decides about a plan
 * comes from the server's flags (`is_current`, `is_upgrade`) and numbers, never from the plan's name.
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
