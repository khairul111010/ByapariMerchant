import { Platform, ViewStyle } from 'react-native';

/* ============================================================================
 * Design tokens. Clean premium SaaS: soft slate background, white cards with a
 * thin border and a soft shadow, deep teal as the one accent colour.
 *
 * Contrast (WCAG): the brand teal #0D9488 is 3.7:1 against white, too low for
 * text. So it is the ACCENT (focus rings, icons, bars, selection), and every
 * filled button and teal text uses primaryDark #0F766E (5.5:1). Status colours
 * work the same way: the bright hue for dots and bars, a deeper shade for text.
 * __tests__/theme.test.ts checks every text pair below in both modes.
 * ========================================================================== */

export interface Palette {
  /* surfaces */
  background: string;
  card: string;
  cardSunken: string; // inputs at rest, skeletons, inactive chips
  border: string;
  borderStrong: string;
  overlay: string;
  /* text */
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  /* brand */
  primary: string; // accent: rings, icons, bars, selected marks
  primaryFill: string; // filled buttons and teal text
  primaryPressed: string;
  primarySoft: string; // soft teal wash: selected rows, confirmed badge
  /* status: `x` for dots/bars/icons, `xText` + `xSoft` for soft badges */
  success: string;
  successText: string;
  successSoft: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  info: string;
  infoText: string;
  infoSoft: string;
  neutralText: string;
  neutralSoft: string;
}

export const lightPalette: Palette = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardSunken: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  overlay: 'rgba(15,23,42,0.45)',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textOnPrimary: '#FFFFFF',
  primary: '#0D9488',
  primaryFill: '#0F766E',
  primaryPressed: '#115E59',
  primarySoft: '#F0FDFA',
  success: '#10B981',
  successText: '#047857',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningText: '#B45309',
  warningSoft: '#FFFBEB',
  danger: '#EF4444',
  dangerText: '#B91C1C',
  dangerSoft: '#FEF2F2',
  info: '#3B82F6',
  infoText: '#1D4ED8',
  infoSoft: '#EFF6FF',
  neutralText: '#334155',
  neutralSoft: '#F1F5F9',
};

export const darkPalette: Palette = {
  background: '#0B1220',
  card: '#131C2E',
  cardSunken: '#1B2538',
  border: '#243046',
  borderStrong: '#334155',
  overlay: 'rgba(2,6,23,0.7)',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textOnPrimary: '#042F2E', // dark ink on the bright teal fill
  primary: '#2DD4BF',
  primaryFill: '#2DD4BF',
  primaryPressed: '#14B8A6',
  primarySoft: 'rgba(45,212,191,0.12)',
  success: '#34D399',
  successText: '#34D399',
  successSoft: 'rgba(52,211,153,0.14)',
  warning: '#FBBF24',
  warningText: '#FBBF24',
  warningSoft: 'rgba(251,191,36,0.14)',
  danger: '#F87171',
  dangerText: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.14)',
  info: '#60A5FA',
  infoText: '#60A5FA',
  infoSoft: 'rgba(96,165,250,0.14)',
  neutralText: '#CBD5E1',
  neutralSoft: 'rgba(148,163,184,0.14)',
};

export type Scheme = 'light' | 'dark';
export const palettes: Record<Scheme, Palette> = { light: lightPalette, dark: darkPalette };

/** The spacing scale: 8, 12, 16, 20, 24, with 4 for tight inner gaps and 32 for section breaks. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

/** Buttons and inputs 12-14, cards 18, sheets 24. */
export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

/** Minimum touch target (dp) for mid-range phones and large fingers. */
export const touch = 48;

export const font = {
  regular: 'NotoSansBengali-Regular',
  bold: 'NotoSansBengali-Bold',
} as const;

/**
 * Type scale. Big, clear numbers for dashboard figures (`metric`). Line heights are
 * generous because Bangla letters are tall and carry marks above and below.
 */
export const type = {
  metric: { fontSize: 34, lineHeight: 44 },
  display: { fontSize: 28, lineHeight: 38 },
  title: { fontSize: 22, lineHeight: 32 },
  subtitle: { fontSize: 17, lineHeight: 26 },
  body: { fontSize: 15, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18 },
  overline: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
} as const;

/** Soft, low shadows. In dark mode a shadow barely reads, so the thin border carries the edge. */
export function shadows(scheme: Scheme) {
  const k = scheme === 'dark' ? 0 : 1;
  return {
    card: Platform.select<ViewStyle>({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.05 * k, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      default: { elevation: 1 * k, shadowColor: '#0F172A' },
    }) as ViewStyle,
    raised: Platform.select<ViewStyle>({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.12 * k + 0.2 * (1 - k), shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
      default: { elevation: 8, shadowColor: '#0F172A' },
    }) as ViewStyle,
  };
}

/* ============================================================================
 * Legacy static tokens (light mode). Screens written before the theme hook read
 * these at module load, so they stay light until moved to useTheme(); new and
 * kit components use useTheme() and follow the colour scheme.
 * ========================================================================== */

const L = lightPalette;
export const colors = {
  brand: L.primaryFill,
  primary: L.primaryFill, // legacy screens use `primary` for filled buttons and teal text
  primaryPressed: L.primaryPressed,
  primaryText: L.textOnPrimary,
  primarySoft: L.primarySoft,
  bg: L.background,
  card: L.card,
  surface: L.cardSunken,
  border: L.border,
  text: L.textPrimary,
  textMuted: L.textSecondary,
  success: L.successText,
  successSoft: L.successSoft,
  danger: L.dangerText,
  dangerSoft: L.dangerSoft,
  warningBg: L.warningSoft,
  warningText: L.warningText,
  overlay: L.overlay,
} as const;

export const shadow = shadows('light');

/** A white rounded card with a thin border and a soft shadow (light mode). */
export const cardStyle: ViewStyle = {
  backgroundColor: L.card,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: L.border,
  padding: spacing.lg,
  gap: spacing.sm,
  ...shadow.card,
};
