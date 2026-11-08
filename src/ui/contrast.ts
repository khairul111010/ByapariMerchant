/** WCAG 2 contrast helpers, used by tests and by anything that must pick readable ink. */

type RGB = [number, number, number];

function parse(color: string): { rgb: RGB; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = hex[1];
    return { rgb: [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16)) as RGB, alpha: 1 };
  }
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(color);
  if (rgba) {
    return { rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], alpha: rgba[4] === undefined ? 1 : Number(rgba[4]) };
  }
  throw new Error(`unsupported colour: ${color}`);
}

/** A (possibly translucent) colour as it actually looks over an opaque background. */
export function over(color: string, background: string): RGB {
  const top = parse(color);
  const base = parse(background).rgb;
  return top.rgb.map((c, i) => Math.round(c * top.alpha + base[i] * (1 - top.alpha))) as RGB;
}

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/** Contrast of `fg` text on `bg`, where `bg` may be translucent over `base`. */
export function contrastRatio(fg: string, bg: string, base: string = '#FFFFFF'): number {
  const background = over(bg, base);
  const backgroundHex = `rgb(${background.join(',')})`;
  const a = luminance(over(fg, backgroundHex));
  const b = luminance(background);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
