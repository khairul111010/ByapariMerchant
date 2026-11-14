export type Lang = 'bn' | 'en';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

const localizeDigits = (s: string, lang: Lang): string =>
  lang === 'bn' ? toBanglaDigits(s) : s;

/** Bangladeshi grouping on a digit string: 1560000 -> 15,60,000. */
function groupBd(intPart: string): string {
  if (intPart.length <= 3) {
    return intPart;
  }
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

/**
 * Formats a server money string ("1560.00") as ৳1,560. Pure string work:
 * the value is never parsed to a float. ".00" is dropped, other decimals kept.
 */
export function formatMoney(value: string | null | undefined, lang: Lang): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value.trim());
  if (!m) {
    return value;
  }
  const [, sign, int, frac = ''] = m;
  const trimmed = frac.replace(/0+$/, '');
  const body = groupBd(int) + (trimmed ? `.${trimmed}` : '');
  return `${sign}৳${localizeDigits(body, lang)}`;
}

export const formatNumber = (n: number | string, lang: Lang): string =>
  localizeDigits(String(n), lang);

/** A whole count with Bangladeshi grouping: 1000 -> "1,000", 150000 -> "1,50,000" (Bangla digits in bn). */
export const formatCount = (n: number, lang: Lang): string => {
  const int = String(Math.trunc(Math.abs(n)));
  return localizeDigits((n < 0 ? '-' : '') + groupBd(int), lang);
};

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6, no DST

export const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
};

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO-8601 UTC -> "2 Nov 2026, 5:30 PM" in Asia/Dhaka. */
export function formatDateTime(iso: string | null | undefined, lang: Lang): string {
  if (!iso) {
    return '';
  }
  const t = Date.parse(iso);
  if (Number.isNaN(t)) {
    return '';
  }
  const d = new Date(t + DHAKA_OFFSET_MS);
  const h24 = d.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const bnAmPm = h24 < 12 ? 'পূর্বাহ্ন' : 'অপরাহ্ন';
  const text =
    `${d.getUTCDate()} ${MONTHS[lang][d.getUTCMonth()]} ${d.getUTCFullYear()}, ` +
    `${h12}:${pad(d.getUTCMinutes())} ${lang === 'bn' ? bnAmPm : ampm}`;
  return localizeDigits(text, lang);
}

export function formatDate(iso: string | null | undefined, lang: Lang): string {
  const full = formatDateTime(iso, lang);
  return full ? full.slice(0, full.lastIndexOf(',')) : '';
}
