export const MAX_EDGE = 1600;
export const QUALITY_STEPS = [82, 70, 58, 46] as const;

/** Largest size with the same aspect ratio whose long edge is at most `max`. Never upscales. */
export function fitWithin(width: number, height: number, max = MAX_EDGE): { width: number; height: number } {
  const long = Math.max(width, height);
  if (long <= max || width <= 0 || height <= 0) {
    return { width, height };
  }
  const scale = max / long;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Server limits: product/landing/banner/category images 5 MB, the logo 2 MB. */
export const LIMITS = { image: 5 * 1024 * 1024, logo: 2 * 1024 * 1024 } as const;
