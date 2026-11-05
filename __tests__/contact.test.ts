import { contactLabel, normalizePhone, parseLoginId, toAsciiDigits } from '../src/features/auth/contact';

describe('normalizePhone', () => {
  it.each([
    ['01712345678', '01712345678'],
    ['+880 1712-345678', '01712345678'],
    ['8801712345678', '01712345678'],
    ['+8801712345678', '01712345678'],
    ['01712-345 678', '01712345678'],
    ['(017) 1234 5678', '01712345678'],
  ])('%s -> %s (the examples in the backend note)', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
  it('accepts Bangla digits', () => {
    expect(toAsciiDigits('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
    expect(normalizePhone('০১৭১২-৩৪৫৬৭৮')).toBe('01712345678');
    expect(normalizePhone('+৮৮০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
  });
  it.each([[''], ['12345'], ['02712345678'], ['0171234567'], ['017123456789'], ['abc'], ['+8801712345']])('rejects %j', input => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe('parseLoginId', () => {
  it('an email is an email, trimmed', () => {
    expect(parseLoginId('  rahim@example.com ')).toEqual({ kind: 'email', value: 'rahim@example.com' });
  });
  it('a phone in any typed form is a phone, normalised', () => {
    expect(parseLoginId('+880 1712-345678')).toEqual({ kind: 'phone', value: '01712345678' });
    expect(parseLoginId('01712345678')).toEqual({ kind: 'phone', value: '01712345678' });
  });
  it('rejects junk and half-typed values', () => {
    expect(parseLoginId('')).toBeNull();
    expect(parseLoginId('rahim@')).toBeNull();
    expect(parseLoginId('rahim@example')).toBeNull();
    expect(parseLoginId('hello')).toBeNull();
    expect(parseLoginId('0171')).toBeNull();
  });
});

describe('contactLabel', () => {
  it('prefers the email, falls back to the phone', () => {
    expect(contactLabel({ email: 'a@b.com', phone: '01712345678' })).toBe('a@b.com');
    expect(contactLabel({ email: null, phone: '01712345678' })).toBe('01712345678');
    expect(contactLabel({})).toBe('');
  });
});
