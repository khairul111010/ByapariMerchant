import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * The press feel used everywhere: shrink slightly under the finger, spring back on release.
 * Runs on the native driver, so it stays smooth even while JS is busy.
 */
export function usePressScale(to = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return {
    style: { transform: [{ scale }] },
    onPressIn: () => spring(to),
    onPressOut: () => spring(1),
  };
}
