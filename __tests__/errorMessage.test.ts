import { ApiError } from '../src/api/errors';
import { errorMessage } from '../src/api/errorMessage';

// Minimal t(): returns the key, or defaultValue when asked and the key is unknown.
const known = new Set(['errors.codes.order_pending', 'errors.conflict', 'errors.server', 'errors.validation']);
const t = ((key: string, opts?: { defaultValue?: string }) =>
  known.has(key) ? key : opts?.defaultValue ?? key) as never;

describe('errorMessage', () => {
  it('prefers a translated server code', () => {
    expect(errorMessage(new ApiError('business_refusal', 422, { code: 'order_pending' }), t)).toBe('errors.codes.order_pending');
  });
  it('falls back to the error kind for unknown codes', () => {
    expect(errorMessage(new ApiError('conflict', 409, { code: 'something_new' }), t)).toBe('errors.conflict');
  });
  it('shows the server sentence for a 422 with no field and no code', () => {
    const e = new ApiError('validation', 422, { message: 'This store must always have at least one owner.' });
    expect(errorMessage(e, t)).toBe('This store must always have at least one owner.');
  });
  it('still uses the generic text when a 422 has field errors, or no message at all', () => {
    expect(errorMessage(new ApiError('validation', 422, { message: 'x', errors: { name: ['bad'] } }), t)).toBe('errors.validation');
    expect(errorMessage(new ApiError('validation', 422), t)).toBe('errors.validation');
  });
  it('handles non-API errors', () => {
    expect(errorMessage(new Error('x'), t)).toBe('errors.server');
  });
});
