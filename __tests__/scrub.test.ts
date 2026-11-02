import { ApiError } from '../src/api/errors';
import { toSafeError } from '../src/telemetry/crash';
import { scrub } from '../src/telemetry/scrub';

describe('scrub', () => {
  it.each([
    ['call 01712345678 now', 'call [phone] now'],
    ['call +8801712345678 now', 'call [phone] now'],
    ['call 017 1234-5678 now', 'call [phone] now'],
    ['mail rahim@example.com please', 'mail [email] please'],
    ['Authorization: Bearer 12|abcdefghijklmnopqrstuvwxyz0123', 'Authorization: Bearer [token]'],
    ['token 12|abcdefghijklmnopqrstuvwxyz0123 leaked', 'token [token] leaked'],
    ['order 42 total 1560', 'order 42 total 1560'],
  ])('%s', (input, expected) => {
    expect(scrub(input)).toBe(expected);
  });
});

describe('toSafeError', () => {
  it('never forwards server text for API errors', () => {
    const e = new ApiError('validation', 422, {
      message: 'The phone 01712345678 is invalid',
      code: 'x',
    });
    expect(toSafeError(e).message).toBe('ApiError validation 422 x');
  });
  it('scrubs message and stack of ordinary errors', () => {
    const e = new Error('failed for rahim@example.com');
    e.stack = 'Error: failed for rahim@example.com\n at f (app.js:1)';
    const safe = toSafeError(e);
    expect(safe.message).toBe('failed for [email]');
    expect(safe.stack).not.toContain('rahim@');
  });
});
