import { fromMinor, toMinor } from '../../money';
import { parseDate, toISODate } from '../../ui/calendar';

export interface DayPoint {
  date: string; // YYYY-MM-DD
  orders: number;
  revenue: string; // money string
}

const dayMs = 24 * 60 * 60 * 1000;
const asUtc = (iso: string): number | null => {
  const p = parseDate(iso.slice(0, 10));
  return p ? Date.UTC(p.y, p.m - 1, p.d) : null;
};

/** Every day from `from` to `to` (inclusive), with zero for days that had no orders. */
export function fillDaily(
  fromIso: string,
  toIso: string,
  daily: DayPoint[],
): DayPoint[] {
  const start = asUtc(fromIso);
  const end = asUtc(toIso);
  if (start === null || end === null || end < start) {
    return [...daily];
  }
  const byDate = new Map(daily.map(d => [d.date, d]));
  const out: DayPoint[] = [];
  for (let t = start; t <= end; t += dayMs) {
    const d = new Date(t);
    const date = toISODate({
      y: d.getUTCFullYear(),
      m: d.getUTCMonth() + 1,
      d: d.getUTCDate(),
    });
    out.push(byDate.get(date) ?? { date, orders: 0, revenue: '0.00' });
  }
  return out;
}

/** Bar heights as 0..1 of the largest day. Exact integer paisa, never floats on money. */
export function barFractions(points: DayPoint[]): number[] {
  const minor = points.map(p => toMinor(p.revenue));
  const max = Math.max(0, ...minor);
  return minor.map(m => (max > 0 ? m / max : 0));
}

/** A server fraction (0.5) as a percentage string ("50%"), or "" when there is no data. */
export function ratePercent(rate: number | null): string {
  return rate === null ? '' : `${Math.round(rate * 1000) / 10}%`;
}

/** A change from the previous period: "+12.5%", "-3%", or "" when there was nothing to compare. */
export function deltaLabel(pct: number | null): string {
  if (pct === null) {
    return '';
  }
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export const sumRevenue = (points: DayPoint[]): string =>
  fromMinor(points.reduce((s, p) => s + toMinor(p.revenue), 0));

/** Whole days between two YYYY-MM-DD dates, inclusive of both ends. */
export function spanDays(from: string, to: string): number | null {
  const a = asUtc(from);
  const b = asUtc(to);
  return a === null || b === null ? null : Math.round((b - a) / dayMs) + 1;
}

export const MAX_CUSTOM_DAYS = 366;

/** Courtesy check for a custom range; the server is authoritative (max one year, both dates). */
export function customRangeError(
  from: string,
  to: string,
): 'missing' | 'order' | 'toolong' | null {
  if (!parseDate(from) || !parseDate(to)) {
    return 'missing';
  }
  const days = spanDays(from, to);
  if (days === null || days < 1) {
    return 'order';
  }
  return days > MAX_CUSTOM_DAYS ? 'toolong' : null;
}
