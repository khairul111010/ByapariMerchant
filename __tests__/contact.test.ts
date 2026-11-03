import { telUrl, whatsappUrl } from '../src/features/orders/contact';

describe('contact links', () => {
  it('builds a wa.me link with the Bangladesh prefix', () => {
    expect(whatsappUrl('01700000000')).toBe('https://wa.me/8801700000000');
    expect(whatsappUrl('+880 1700-000000')).toBe('https://wa.me/8801700000000');
  });
  it('builds a tel link', () => {
    expect(telUrl('017 0000-0000')).toBe('tel:01700000000');
  });
});
