import { changedFields, clearPatch, isEmptyPatch, secretValue, withSecret } from '../src/features/settings/patch';

describe('changedFields', () => {
  const original = { bkash_number: '01711111111', nagad_number: '', sslcommerz_store_id: 'shop001' };
  it('sends only what changed', () => {
    expect(changedFields(original, { ...original, nagad_number: '01822222222' })).toEqual({ nagad_number: '01822222222' });
  });
  it('sends nothing when nothing changed, ignoring surrounding spaces', () => {
    const p = changedFields(original, { ...original, bkash_number: ' 01711111111 ' });
    expect(isEmptyPatch(p)).toBe(true);
  });
  it('an emptied field is sent as an empty string so the server clears it', () => {
    expect(changedFields(original, { ...original, bkash_number: '' })).toEqual({ bkash_number: '' });
  });
  it('treats a missing original like an empty one', () => {
    expect(changedFields({ a: '' }, { a: ' ' })).toEqual({});
  });
});

describe('secrets are write-only', () => {
  it('a blank secret is never sent, and a typed one is trimmed', () => {
    expect(secretValue('')).toBeUndefined();
    expect(secretValue('   ')).toBeUndefined();
    expect(secretValue(' sk-123 ')).toBe('sk-123');
  });
  it('withSecret leaves the patch alone for a blank input', () => {
    expect(withSecret({ a: '1' }, 'ai_api_key', '')).toEqual({ a: '1' });
    expect(withSecret({ a: '1' }, 'ai_api_key', 'k')).toEqual({ a: '1', ai_api_key: 'k' });
  });
  it('clear lists the secret names to delete', () => {
    expect(clearPatch('sslcommerz_store_password')).toEqual({ clear: ['sslcommerz_store_password'] });
  });
});
