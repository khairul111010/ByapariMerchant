const BN_TO_ASCII: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const toAsciiDigits = (s: string): string =>
  s.replace(/[০-৯]/g, d => BN_TO_ASCII[d]);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A Bangladeshi mobile as the server stores it: `01XXXXXXXXX`. Accepts spaces, dashes, brackets,
 * `+880` / `880` prefixes and Bangla digits. Returns null if it is not a valid number.
 */
export function normalizePhone(input: string): string | null {
  const digits = toAsciiDigits(input).replace(/[^\d]/g, '');
  const local =
    digits.startsWith('880') && digits.length === 13
      ? `0${digits.slice(3)}`
      : digits;
  return /^01\d{9}$/.test(local) ? local : null;
}

export type LoginId =
  | { kind: 'email'; value: string }
  | { kind: 'phone'; value: string };

/** What was typed in the "email or phone" box. An "@" means email; anything else is tried as a phone. */
export function parseLoginId(input: string): LoginId | null {
  const v = input.trim();
  if (v === '') {
    return null;
  }
  if (v.includes('@')) {
    return EMAIL_RE.test(v) ? { kind: 'email', value: v } : null;
  }
  const phone = normalizePhone(v);
  return phone ? { kind: 'phone', value: phone } : null;
}

/** Shown for a person: their email, else their phone. Either can be missing, never both. */
export const contactLabel = (p: {
  email?: string | null;
  phone?: string | null;
}): string => p.email || p.phone || '';
