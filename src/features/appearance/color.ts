const HEX6 = /^#[0-9A-F]{6}$/;

/**
 * Turns what a person types into the server's `#RRGGBB`: adds the #, upper-cases, and expands
 * a 3-digit shorthand (#F80 -> #FF8800). Returns null when it is not a valid colour.
 */
export function normalizeHex(input: string): string | null {
  let v = input.trim().toUpperCase();
  if (v === '') {
    return null;
  }
  if (!v.startsWith('#')) {
    v = `#${v}`;
  }
  if (/^#[0-9A-F]{3}$/.test(v)) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return HEX6.test(v) ? v : null;
}

/** Black or white text, whichever reads better on this background (WCAG relative luminance). */
export function readableOn(hex: string): '#000000' | '#FFFFFF' {
  const n = normalizeHex(hex);
  if (!n) {
    return '#000000';
  }
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(n.slice(i, i + 2), 16)));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
}
