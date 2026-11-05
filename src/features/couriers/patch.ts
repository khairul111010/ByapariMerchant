import type { Courier } from '../../api/schemas/settings';
import { changedFields, withSecret } from '../settings/patch';

/**
 * One PUT body for a driver: changed plain fields, plus any secret that was typed. A blank secret is
 * not sent (the stored one stays). Nothing from other drivers is included.
 */
export function courierPatch(
  courier: Courier,
  edited: Record<string, string>,
  secrets: Record<string, string>,
): Record<string, string> {
  const original: Record<string, string> = {};
  const next: Record<string, string> = {};
  for (const key of Object.keys(courier.fields)) {
    original[key] = courier.fields[key] ?? '';
    next[key] = edited[key] ?? original[key];
  }
  // changedFields only ever returns keys it set, so every value is a string.
  let patch = { ...changedFields(original, next) } as Record<string, string>;
  for (const key of Object.keys(courier.secrets_set)) {
    patch = withSecret(patch, key, secrets[key] ?? '');
  }
  return patch;
}

/** The secret names for this driver, for the "clear" list. */
export const secretNames = (courier: Courier): string[] =>
  Object.keys(courier.secrets_set);
