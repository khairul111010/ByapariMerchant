import { addMonths, daysInMonth, monthGrid, parseDate, toISODate, todayInDhaka } from '../src/ui/calendar';

describe('calendar helpers', () => {
  it('parses and formats real dates only', () => {
    expect(parseDate('2026-12-31')).toEqual({ y: 2026, m: 12, d: 31 });
    expect(toISODate({ y: 2026, m: 2, d: 5 })).toBe('2026-02-05');
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('2026-13-01')).toBeNull();
    expect(parseDate('31/12/2026')).toBeNull();
    expect(parseDate('')).toBeNull();
  });
  it('knows month lengths, including leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 12)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
  });
  it('lays a month out in Sunday-first weeks', () => {
    // 1 Nov 2026 is a Sunday: no leading blanks, 30 days -> 5 weeks, last week padded.
    const nov = monthGrid(2026, 11);
    expect(nov[0][0]).toBe(1);
    expect(nov).toHaveLength(5);
    expect(nov[4]).toEqual([29, 30, null, null, null, null, null]);
    // 1 Dec 2026 is a Tuesday: two leading blanks.
    expect(monthGrid(2026, 12)[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });
  it('every week has seven cells and every day appears once', () => {
    for (const [y, m] of [[2026, 2], [2026, 5], [2028, 2], [2026, 8]]) {
      const grid = monthGrid(y, m);
      expect(grid.every((w) => w.length === 7)).toBe(true);
      expect(grid.flat().filter((c) => c !== null)).toHaveLength(daysInMonth(y, m));
    }
  });
  it('moves between months across year boundaries', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ y: 2025, m: 12 });
    expect(addMonths(2026, 6, 0)).toEqual({ y: 2026, m: 6 });
    expect(addMonths(2026, 3, -15)).toEqual({ y: 2024, m: 12 });
  });
  it('today is the Dhaka date, not the phone timezone date', () => {
    // 2026-11-05 20:00 UTC is already 2 Nov 6 02:00 in Dhaka.
    expect(todayInDhaka(Date.UTC(2026, 10, 5, 20, 0, 0))).toEqual({ y: 2026, m: 11, d: 6 });
    expect(todayInDhaka(Date.UTC(2026, 10, 5, 17, 59, 0))).toEqual({ y: 2026, m: 11, d: 5 });
  });
});
