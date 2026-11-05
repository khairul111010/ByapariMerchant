import { normalizeHex, readableOn } from '../src/features/appearance/color';

describe('normalizeHex', () => {
  it('adds the #, upper-cases and accepts the real sample value', () => {
    expect(normalizeHex('ff8800')).toBe('#FF8800');
    expect(normalizeHex('#FF8800')).toBe('#FF8800');
    expect(normalizeHex('  #ff8800 ')).toBe('#FF8800');
  });
  it('expands the three-digit shorthand', () => {
    expect(normalizeHex('#f80')).toBe('#FF8800');
    expect(normalizeHex('abc')).toBe('#AABBCC');
  });
  it('rejects anything else, including the "red" the server refused', () => {
    expect(normalizeHex('red')).toBeNull();
    expect(normalizeHex('#GG0000')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('#1234567')).toBeNull();
    expect(normalizeHex('')).toBeNull();
  });
});

describe('readableOn', () => {
  it('picks dark text on light colours and light text on dark ones', () => {
    expect(readableOn('#FFFFFF')).toBe('#000000');
    expect(readableOn('#FFCA0D')).toBe('#000000');
    expect(readableOn('#0B0F1A')).toBe('#FFFFFF');
    expect(readableOn('#2F5BEA')).toBe('#FFFFFF');
  });
  it('falls back safely on junk', () => {
    expect(readableOn('nope')).toBe('#000000');
  });
});
