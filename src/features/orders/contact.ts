/** `01712345678` -> `8801712345678` for wa.me links. */
export function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('880') ? digits : `88${digits.replace(/^0?/, '0')}`;
  return `https://wa.me/${intl}`;
}

export const telUrl = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;
