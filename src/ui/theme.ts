export const colors = {
  bg: '#FFFFFF',
  surface: '#F4F6F8',
  border: '#C9D0D8',
  text: '#101820',
  textMuted: '#4A5561',
  primary: '#0B6E4F',
  primaryText: '#FFFFFF',
  danger: '#B3261E',
  warningBg: '#FFF3CD',
  warningText: '#5C4400',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { md: 10, lg: 14 } as const;

/** Minimum touch target (dp) for mid-range phones and large fingers. */
export const touch = 48;

export const font = {
  regular: 'NotoSansBengali-Regular',
  bold: 'NotoSansBengali-Bold',
} as const;
