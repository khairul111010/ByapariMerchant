import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { MARK_PATHS, WORDMARK_PATHS } from './logoPaths';

/** The Byapari mark: red rounded square with the cream bag. Crisp at any size. */
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 20.6 419 419"
      accessibilityLabel="Byapari"
      accessibilityRole="image"
    >
      {MARK_PATHS.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
    </Svg>
  );
}

/** Mark + Bangla wordmark side by side, as in the supplied logo. `height` sets the size. */
export function BrandLogo({ height = 44 }: { height?: number }) {
  const width = (height * 1501) / 440;
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 1501 440"
      accessibilityLabel="ব্যাপারি Byapari"
      accessibilityRole="image"
    >
      {[...MARK_PATHS, ...WORDMARK_PATHS].map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
    </Svg>
  );
}
