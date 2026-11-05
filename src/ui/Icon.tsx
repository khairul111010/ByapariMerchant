import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from './theme';

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
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 24,
  color = colors.text,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
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
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
