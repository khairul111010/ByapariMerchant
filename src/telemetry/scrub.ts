/** Removes phones, emails and tokens from text before it leaves the device. */
export function scrub(text: string): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9|._~+/=-]+/gi, 'Bearer [token]')
    .replace(/\b\d+\|[A-Za-z0-9]{20,}\b/g, '[token]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(?:\+?88[\s-]?)?01[3-9](?:[\s-]?\d){8}/g, '[phone]')
    .replace(/\b\d{9,}\b/g, '[number]');
}
