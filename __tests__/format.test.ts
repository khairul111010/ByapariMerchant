import {
  formatCount,
  formatDate,
  formatDateTime,
  formatMoney,
  toBanglaDigits,
} from '../src/i18n/format';

describe('formatCount', () => {
  it('groups whole counts the Bangladeshi way, with Bangla digits in bn', () => {
    expect(formatCount(42, 'en')).toBe('42');
    expect(formatCount(1000, 'en')).toBe('1,000');
    expect(formatCount(150000, 'en')).toBe('1,50,000');
    expect(formatCount(2000, 'bn')).toBe('২,০০০');
  });
});

describe('formatMoney', () => {
  it('formats with ৳ and drops .00', () => {
    expect(formatMoney('1560.00', 'en')).toBe('৳1,560');
  });
  it('uses lakh/crore grouping', () => {
    expect(formatMoney('1560000.00', 'en')).toBe('৳15,60,000');
    expect(formatMoney('123456789', 'en')).toBe('৳12,34,56,789');
  });
  it('keeps real decimals', () => {
    expect(formatMoney('99.50', 'en')).toBe('৳99.5');
    expect(formatMoney('0.05', 'en')).toBe('৳0.05');
  });
  it('uses Bangla digits in bn', () => {
    expect(formatMoney('1560.00', 'bn')).toBe('৳১,৫৬০');
  });
  it('does not lose precision on huge values', () => {
    expect(formatMoney('9007199254740993.10', 'en')).toBe('৳9,00,71,99,25,47,40,993.1');
  });
  it('passes through junk and handles empty', () => {
    expect(formatMoney('abc', 'en')).toBe('abc');
    expect(formatMoney(null, 'en')).toBe('');
  });
  it('handles negatives', () => {
    expect(formatMoney('-250.00', 'en')).toBe('-৳250');
  });
});

describe('dates (Asia/Dhaka)', () => {
  it('shifts UTC to +6', () => {
    expect(formatDateTime('2026-11-02T11:30:00Z', 'en')).toBe('2 Nov 2026, 5:30 PM');
  });
  it('rolls over midnight', () => {
    expect(formatDateTime('2026-12-31T19:00:00Z', 'en')).toBe('1 Jan 2027, 1:00 AM');
  });
  it('localises to Bangla', () => {
    expect(formatDateTime('2026-11-02T11:30:00Z', 'bn')).toBe('২ নভেম্বর ২০২৬, ৫:৩০ অপরাহ্ন');
  });
  it('date-only', () => {
    expect(formatDate('2026-11-02T11:30:00Z', 'en')).toBe('2 Nov 2026');
  });
  it('empty on bad input', () => {
    expect(formatDateTime('nope', 'en')).toBe('');
  });
  it('digit conversion', () => {
    expect(toBanglaDigits('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
  });
});
