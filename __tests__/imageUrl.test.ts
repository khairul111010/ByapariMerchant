import { absoluteUrl } from '../src/features/products/imageUrl';

describe('absoluteUrl', () => {
  const base = 'https://shop.byapari.shop/api/v1';
  it('prefixes the store origin', () => {
    expect(absoluteUrl('/storage/a.webp', base)).toBe('https://shop.byapari.shop/storage/a.webp');
    expect(absoluteUrl('storage/a.webp', base)).toBe('https://shop.byapari.shop/storage/a.webp');
  });
  it('keeps absolute urls and handles empties', () => {
    expect(absoluteUrl('https://cdn.x/a.png', base)).toBe('https://cdn.x/a.png');
    expect(absoluteUrl(null, base)).toBeUndefined();
    expect(absoluteUrl('/a.png', null)).toBeUndefined();
  });
});
