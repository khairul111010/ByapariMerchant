import { landingFields, makeLandingSchema, normalizeBullets } from '../src/features/landing/landingForm';

const t = ((k: string) => k) as never;
const v = { title: ' Eid Offer ', headline: ' Best deal ', subheadline: '', description: '', why_choose_us: ' Fast \n\n  Cheap  \n', is_active: true };

describe('landing form', () => {
  it('requires a title and a headline', () => {
    const s = makeLandingSchema(t);
    expect(s.safeParse(v).success).toBe(true);
    expect(s.safeParse({ ...v, title: ' ' }).success).toBe(false);
    expect(s.safeParse({ ...v, headline: '' }).success).toBe(false);
  });
  it('always sends product_id, title and headline, as strings for multipart', () => {
    expect(landingFields(v, 7)).toEqual({
      product_id: '7', title: 'Eid Offer', headline: 'Best deal', subheadline: '', description: '',
      why_choose_us: 'Fast\nCheap', is_active: '1',
    });
  });
  it('encodes the active flag as 1/0', () => {
    expect(landingFields({ ...v, is_active: false }, 1).is_active).toBe('0');
  });
  it('one bullet per line: blanks dropped, lines trimmed', () => {
    expect(normalizeBullets('  a \n\n b\n   \n')).toBe('a\nb');
    expect(normalizeBullets('')).toBe('');
  });
});
