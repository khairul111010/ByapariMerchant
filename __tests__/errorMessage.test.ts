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
  it('handles non-API errors', () => {
    expect(errorMessage(new Error('x'), t)).toBe('errors.server');
  });
});
