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
    return t(`errors.${err.kind}`);
  }
  return t('errors.server');
}
