/**
 * Settings updates are partial: only the keys sent change. These helpers keep that exact,
 * and keep secrets write-only (a blank secret field means "unchanged").
 */

/** Keys whose trimmed value differs from what was loaded. Nothing else is sent. */
export function changedFields<K extends string>(
  original: Record<K, string>,
  edited: Record<K, string>,
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const key of Object.keys(edited) as K[]) {
    const next = edited[key].trim();
    if (next !== (original[key] ?? '').trim()) {
      out[key] = next; // an empty string clears the field on the server
    }
  }
  return out;
}

/** A secret input: blank means "leave the stored one alone", so it is simply not sent. */
export const secretValue = (input: string): string | undefined =>
  input.trim() === '' ? undefined : input.trim();

/** Names to delete, sent as `{clear: [...]}`. Each settings group accepts only its own secrets. */
export const clearPatch = (...names: string[]): { clear: string[] } => ({
  clear: names,
});

/** Adds the secret to a patch only when one was typed. */
export function withSecret<T extends object>(
  patch: T,
  field: string,
  input: string,
): T & Record<string, string> {
  const v = secretValue(input);
  return v === undefined
    ? (patch as T & Record<string, string>)
    : { ...patch, [field]: v };
}

export const isEmptyPatch = (patch: object): boolean =>
  Object.keys(patch).length === 0;
