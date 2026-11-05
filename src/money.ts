/**
 * Exact money arithmetic on server strings ("1350.00"). Values are converted to whole paisa
 * (integers) by string handling, never through floats, so sums and products are exact.
 * The server stays authoritative; this is only for previews (e.g. a POS cart total).
 */
export function toMinor(value: string): number {
  const m = /^(-?)(\d+)(?:\.(\d{1,2})\d*)?$/.exec(value.trim());
  if (!m) {
    throw new Error(`not a money string: ${value}`);
  }
  const [, sign, whole, frac = ''] = m;
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return sign === '-' ? -minor : minor;
}

export function fromMinor(minor: number): string {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
