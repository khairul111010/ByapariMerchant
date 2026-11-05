import { bannersSchema } from '../src/api/schemas/storefront';
import { isSafeBannerLink, moveId } from '../src/features/banners/logic';
import { storefrontSamples as s } from '../test/samples-storefront';

describe('banner link check', () => {
  it.each(['https://example.com/sale', 'http://a.b/c?d=1', '/products/earbuds', 'mailto:a@b.com', 'tel:01700000000', ''])('allows %j', (u) => {
    expect(isSafeBannerLink(u)).toBe(true);
  });
  it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html;base64,AAAA', 'ftp://x.com', 'example.com', 'https://', '//evil.com bad', '//evil.com', '//'])('blocks %j', (u) => {
    expect(isSafeBannerLink(u)).toBe(false);
  });
  it('is the same unsafe link the server rejected in the real sample', () => {
    expect(isSafeBannerLink('javascript:alert(1)')).toBe(false);
  });
});

describe('moveId', () => {
  it('swaps with the neighbour and keeps every id once', () => {
    expect(moveId([1, 2, 3], 2, 'up')).toEqual([2, 1, 3]);
    expect(moveId([1, 2, 3], 2, 'down')).toEqual([1, 3, 2]);
  });
  it('returns null at the edges and for unknown ids', () => {
    expect(moveId([1, 2, 3], 1, 'up')).toBeNull();
    expect(moveId([1, 2, 3], 3, 'down')).toBeNull();
    expect(moveId([1, 2, 3], 9, 'up')).toBeNull();
  });
  it('does not mutate its input', () => {
    const ids = [1, 2, 3];
    moveId(ids, 1, 'down');
    expect(ids).toEqual([1, 2, 3]);
  });
  it('works on the real banner list order', () => {
    const ids = bannersSchema.parse(s['List banners']).data.map((b) => b.id);
    expect(moveId(ids, 2, 'up')).toEqual([2, 1]);
  });
});
