export interface YMD {
  y: number;
  m: number; // 1-12
  d: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = ({ y, m, d }: YMD): string =>
  `${y}-${pad(m)}-${pad(d)}`;

/** "2026-12-31" -> parts, or null if the text is not a real calendar date. */
export function parseDate(text: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) {
    return null;
  }
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y &&
    check.getUTCMonth() === m - 1 &&
    check.getUTCDate() === d
    ? { y, m, d }
    : null;
}

export const daysInMonth = (y: number, m: number): number =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Weeks of a month, Sunday first; null pads the days outside the month. All UTC, so no timezone drift. */
export function monthGrid(y: number, m: number): Array<Array<number | null>> {
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const cells: Array<number | null> = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function addMonths(
  y: number,
  m: number,
  delta: number,
): { y: number; m: number } {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

/** Today in Asia/Dhaka (UTC+6, no DST), whatever the phone's own timezone is set to. */
export function todayInDhaka(now: number = Date.now()): YMD {
  const d = new Date(now + 6 * 60 * 60 * 1000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}
