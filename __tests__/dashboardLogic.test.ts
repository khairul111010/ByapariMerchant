import { dashboardEnvelopeSchema } from '../src/api/schemas/storefront';
import {
  barFractions, customRangeError, deltaLabel, fillDaily, ratePercent, spanDays, sumRevenue,
} from '../src/features/dashboard/logic';
import { storefrontSamples as s } from '../test/samples-storefront';

const d7 = dashboardEnvelopeSchema.parse(s['Dashboard, 7-day range']).data;

describe('fillDaily', () => {
  it('fills the whole 7-day period, with zero for days without orders', () => {
    const days = fillDaily(d7.period.from, d7.period.to, d7.daily);
    expect(days.map((x) => x.date)).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']);
    expect(days[0]).toEqual({ date: '2026-10-29', orders: 0, revenue: '0.00' });
    expect(days.find((x) => x.date === '2026-11-03')).toMatchObject({ orders: 1, revenue: '1350.00' });
  });
  it('keeps real days untouched and the total unchanged', () => {
    const days = fillDaily(d7.period.from, d7.period.to, d7.daily);
    expect(sumRevenue(days)).toBe(sumRevenue(d7.daily));
    expect(sumRevenue(d7.daily)).toBe('1950.00');
  });
  it('handles a single-day custom range and a backwards range without crashing', () => {
    expect(fillDaily('2026-09-26T00:00:00+00:00', '2026-09-26T23:59:59+00:00', [])).toHaveLength(1);
    expect(fillDaily('2026-09-27', '2026-09-26', [{ date: 'x', orders: 1, revenue: '5.00' }])).toHaveLength(1);
  });
  it('crosses month and year boundaries', () => {
    expect(fillDaily('2026-12-30', '2027-01-02', []).map((x) => x.date)).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
  });
});

describe('barFractions', () => {
  it('scales to the largest day using exact money', () => {
    expect(barFractions([{ date: 'a', orders: 1, revenue: '0.00' }, { date: 'b', orders: 1, revenue: '600.00' }, { date: 'c', orders: 1, revenue: '1350.00' }])).toEqual([0, 600 / 1350, 1]);
  });
  it('an all-zero period is all zero (no division by zero)', () => {
    expect(barFractions([{ date: 'a', orders: 0, revenue: '0.00' }])).toEqual([0]);
    expect(barFractions([])).toEqual([]);
  });
});

describe('labels', () => {
  it('formats rates and deltas, and says nothing when there is no comparison', () => {
    expect(ratePercent(0.5)).toBe('50%');
    expect(ratePercent(0.1234)).toBe('12.3%');
    expect(ratePercent(null)).toBe('');
    expect(deltaLabel(12.5)).toBe('+12.5%');
    expect(deltaLabel(-3)).toBe('-3%');
    expect(deltaLabel(0)).toBe('0%');
    expect(deltaLabel(null)).toBe('');
  });
});

describe('custom range', () => {
  it('counts days inclusively', () => {
    expect(spanDays('2026-09-21', '2026-10-01')).toBe(11);
    expect(spanDays('2026-09-21', '2026-09-21')).toBe(1);
  });
  it('validates before asking the server', () => {
    expect(customRangeError('', '2026-10-01')).toBe('missing');
    expect(customRangeError('2026-10-02', '2026-10-01')).toBe('order');
    expect(customRangeError('2025-01-01', '2026-10-01')).toBe('toolong');
    expect(customRangeError('2026-01-01', '2026-12-31')).toBeNull();
    expect(customRangeError('2026-09-21', '2026-10-01')).toBeNull();
  });
});
