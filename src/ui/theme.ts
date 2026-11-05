import { Platform, ViewStyle } from 'react-native';

/** Brand colours come from the logo: red #ED1C24, near-black #1A1A1A, warm cream. */
export const colors = {
  brand: '#ED1C24', // the logo red: logo, accents, large surfaces
  primary: '#D8161E', // buttons and links: the brand red, a touch deeper so white text reads (5.2:1)
  primaryPressed: '#B91218',
  primaryText: '#FFFFFF',
  primarySoft: '#FDECEC', // light red wash for selected states
  bg: '#F7F5F0', // warm off-white app background
  card: '#FFFFFF',
  surface: '#EFECE6', // chips, inactive fills, skeletons
  border: '#E4E0D8',
  text: '#1A1A1A',
  textMuted: '#5F5B57',
  success: '#0F7B4A',
  successSoft: '#E5F5EC',
  danger: '#B42318', // error text: a deeper red than the brand so it reads as an error
  dangerSoft: '#FDEDEC',
  warningBg: '#FFF4D6',
  warningText: '#5C4400',
  overlay: 'rgba(26,26,26,0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 44,
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Minimum touch target (dp) for mid-range phones and large fingers. */
export const touch = 48;

export const font = {
  regular: 'NotoSansBengali-Regular',
  bold: 'NotoSansBengali-Bold',
} as const;

/** Type scale. Line heights are generous because Bangla letters are tall and stack marks above and below. */
export const type = {
  display: { fontSize: 30, lineHeight: 42 },
  title: { fontSize: 24, lineHeight: 34 },
  subtitle: { fontSize: 18, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 26 },
  small: { fontSize: 14, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18 },
} as const;

/** Soft, low shadows in place of hard borders: the "floating card" look. */
export const shadow = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1A1A1A',
      shadowOpacity: 0.07,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
    },
    default: { elevation: 3, shadowColor: '#1A1A1A' },
  }) as ViewStyle,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1A1A1A',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
    },
    default: { elevation: 10, shadowColor: '#1A1A1A' },
  }) as ViewStyle,
} as const;

/** A white rounded card with a soft shadow: the base surface of every list item and panel. */
export const cardStyle: ViewStyle = {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  padding: spacing.lg,
  gap: spacing.sm,
  ...shadow.card,
};
