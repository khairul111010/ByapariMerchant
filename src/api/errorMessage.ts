import type { TFunction } from 'i18next';
import { ApiError } from './errors';

/** Turns any thrown value into a translated, user-facing message. */
export function errorMessage(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    return t(`errors.${err.kind}`);
  }
  return t('errors.server');
}
