import { resolveScheme } from '../src/ui/ThemeProvider';
import { contrastRatio } from '../src/ui/contrast';
import { darkPalette, lightPalette, Palette } from '../src/ui/theme';

const AA = 4.5;

/** Every pair the kit puts text on, in a given palette. Soft colours sit on cards. */
const textPairs = (p: Palette): Array<[string, string, string]> => [
  ['primary text on background', p.textPrimary, p.background],
  ['primary text on card', p.textPrimary, p.card],
  ['secondary text on card', p.textSecondary, p.card],
  ['secondary text on background', p.textSecondary, p.background],
  ['text on a filled button', p.textOnPrimary, p.primaryFill],
  ['teal link text on card', p.primaryFill, p.card],
  ['success badge', p.successText, p.successSoft],
  ['warning badge', p.warningText, p.warningSoft],
  ['danger badge', p.dangerText, p.dangerSoft],
  ['info badge', p.infoText, p.infoSoft],
  ['neutral badge', p.neutralText, p.neutralSoft],
  ['confirmed badge', p.primaryFill, p.primarySoft],
];

describe.each([
  ['light', lightPalette],
  ['dark', darkPalette],
])('%s palette is readable (WCAG AA 4.5:1)', (_name, palette) => {
  it.each(textPairs(palette))('%s', (_label, fg, bg) => {
    expect(contrastRatio(fg, bg, palette.card)).toBeGreaterThanOrEqual(AA);
  });
});

describe('brand teal is an accent, not a text colour', () => {
  it('the brief\'s #0D9488 is too light for text on white, which is why filled buttons use #0F766E', () => {
    expect(contrastRatio('#FFFFFF', lightPalette.primary)).toBeLessThan(AA);
    expect(contrastRatio('#FFFFFF', lightPalette.primaryFill)).toBeGreaterThanOrEqual(AA);
  });
});

describe('resolveScheme', () => {
  it('follows the phone when set to system, else the choice', () => {
    expect(resolveScheme('system', 'dark', true)).toBe('dark');
    expect(resolveScheme('system', 'light', true)).toBe('light');
    expect(resolveScheme('system', null, true)).toBe('light');
    expect(resolveScheme('dark', 'light', true)).toBe('dark');
    expect(resolveScheme('light', 'dark', true)).toBe('light');
  });
  it('stays light while dark mode is switched off app-wide', () => {
    expect(resolveScheme('dark', 'dark', false)).toBe('light');
  });
});
