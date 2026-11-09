import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from './ThemeProvider';

/** Simple 24px line icons, drawn here so there is no icon font to ship. */
const PATHS = {
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z'],
  orders: [
    'M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z',
    'M9 8h6',
    'M9 12h6',
  ],
  products: ['M21 8 12 3 3 8v8l9 5 9-5V8Z', 'M3 8l9 5 9-5', 'M12 13v8'],
  sell: ['M6 7h12l1 13H5L6 7Z', 'M9 7a3 3 0 0 1 6 0'],
  more: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  chevronRight: ['M9 6l6 6-6 6'],
  chevronLeft: ['M15 6l-6 6 6 6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4'],
  inbox: [
    'M3 13h5l1.5 3h5L16 13h5',
    'M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-8Z',
  ],
  plus: ['M12 5v14', 'M5 12h14'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3', 'M16 4h3a1 1 0 0 1 1 1v3', 'M20 16v3a1 1 0 0 1-1 1h-3', 'M8 20H5a1 1 0 0 1-1-1v-3', 'M4 12h16'],
  share: ['M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'm8.6 13.5 6.8 4', 'm15.4 6.5-6.8 4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  wallet: ['M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z', 'M3 7l13-3v3', 'M16 14h2'],
  alert: ['M12 3 2 20h20L12 3Z', 'M12 10v4', 'M12 17h.01'],
  chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  card: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h3'],
  truck: ['M2 6h12v10H2z', 'M14 10h4l3 3v3h-7', 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  sparkle: ['M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z', 'M19 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z'],
  megaphone: ['M3 10v4h3l7 4V6L6 10H3Z', 'M17 9a4 4 0 0 1 0 6', 'M6 14l1 5h3l-1-4'],
  users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M2 21v-1a6 6 0 0 1 12 0v1', 'M16 3.5a4 4 0 0 1 0 7.5', 'M18 14a6 6 0 0 1 4 6v1'],
  star: ['M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z'],
  store: ['M3 9l2-5h14l2 5', 'M3 9h18v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z', 'M5 12v8h14v-8', 'M10 20v-5h4v5'],
  image: ['M3 5h18v14H3z', 'M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'm21 16-5-5-9 8'],
  layout: ['M3 4h18v6H3z', 'M3 14h8v6H3z', 'M15 14h6v6h-6z'],
  palette: ['M12 21a9 9 0 1 1 9-9c0 2.5-2 3-3.5 3H15a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 21Z', 'M7.5 11h.01', 'M10.5 7h.01', 'M15 7.5h.01'],
  tag: ['M3 12V4h8l10 10-8 8L3 12Z', 'M7.5 8.5h.01'],
  mapPin: ['M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z', 'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  cart: ['M3 4h2l2.4 11h11L21 7H6', 'M9 20h.01', 'M18 20h.01'],
  page: ['M6 3h9l4 4v14H6z', 'M14 3v5h5', 'M9 13h7', 'M9 17h5'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z'],
  language: ['M4 5h8', 'M8 3v2', 'M10 5c-1 4-3.5 7-6 8', 'M6 9c1 2 3 3.5 5 4', 'M13 21l4-9 4 9', 'M14.5 18h5'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  logout: ['M14 4h5v16h-5', 'M10 8l-4 4 4 4', 'M6 12h11'],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { c } = useTheme();
  const ink = color ?? c.textPrimary;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {PATHS[name].map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={ink}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
