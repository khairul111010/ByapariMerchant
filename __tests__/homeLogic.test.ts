import { greetingFor, initialOf, nextStatus, storefrontLink, todayRange } from '../src/features/home/logic';

const at = (h: number, m = 0) => Date.UTC(2026, 10, 9, h, m); // UTC hour; Dhaka is +6

describe('greetingFor (Dhaka time)', () => {
  it.each([
    [at(0), 'morning'], // 06:00 Dhaka
    [at(5, 59), 'morning'], // 11:59
    [at(6), 'afternoon'], // 12:00
    [at(11), 'evening'], // 17:00
    [at(15), 'night'], // 21:00
    [at(22), 'night'], // 04:00 next day
    [at(23), 'morning'], // 05:00 next day
  ])('%s -> %s', (now, expected) => {
    expect(greetingFor(now)).toBe(expected);
  });
});

describe('todayRange', () => {
  it('is one Dhaka day, even when UTC is still on the day before', () => {
    expect(todayRange(Date.UTC(2026, 10, 8, 20, 0))).toEqual({ from: '2026-11-09', to: '2026-11-09' });
  });
});

describe('storefrontLink', () => {
  it('prefers the server link, else the store host', () => {
    expect(storefrontLink({ storefront_url: 'https://shop.example.com/' })).toBe('https://shop.example.com/');
    expect(storefrontLink({ api_base_url: 'https://myshop.byapari.shop/api/v1' })).toBe('https://myshop.byapari.shop/');
    expect(storefrontLink(undefined)).toBeNull();
    expect(storefrontLink({})).toBeNull();
  });
});

describe('nextStatus', () => {
  it('walks pending -> confirmed -> shipped -> delivered, then stops', () => {
    expect(nextStatus('pending')).toBe('confirmed');
    expect(nextStatus('confirmed')).toBe('shipped');
    expect(nextStatus('shipped')).toBe('delivered');
    expect(nextStatus('delivered')).toBeNull();
    expect(nextStatus('cancelled')).toBeNull();
  });
});

describe('initialOf', () => {
  it('takes the first letter, Bangla included', () => {
    expect(initialOf('demo shop')).toBe('D');
    expect(initialOf('ব্যাপারি')).toBe('ব');
    expect(initialOf(undefined)).toBe('');
  });
});
