import type { TFunction } from 'i18next';
import { ApiError } from './errors';

/**
 * Turns any thrown value into a translated, user-facing message. A server
 * `code` with its own string (errors.codes.<code>) wins over the generic kind.
 */
export function errorMessage(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    if (err.code) {
      const key = `errors.codes.${err.code}`;
      const msg = t(key, { defaultValue: '' });
      if (msg) {
        return msg;
      }
    }
    // A 422 with a message but no field and no code (e.g. "a store must always have one owner")
    // has nothing to highlight, so the server's own sentence is the useful answer.
    if (err.kind === 'validation' && Object.keys(err.fieldErrors).length === 0 && err.message && err.message !== err.kind) {
      return err.message;
    }
    return t(`errors.${err.kind}`);
  }
  return t('errors.server');
}
