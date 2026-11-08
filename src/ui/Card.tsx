import React from 'react';
import { Animated, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { usePressScale } from './press';
import { useStyles } from './ThemeProvider';

/**
 * The base surface: white (dark: slate) with a thin border and a soft shadow. Pass `onPress`
 * to make the whole card tappable, with the same press feel as buttons.
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  style,
  padding = 'lg',
}: {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'md' | 'lg' | 'xl';
}) {
  const press = usePressScale(0.985);
  const s = useStyles(({ c, radius, spacing, shadow }) => ({
    card: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.sm,
      ...shadow.card,
    },
    none: { padding: 0 },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
    xl: { padding: spacing.xxl },
  }));
  if (!onPress) {
    return <View style={[s.card, s[padding], style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View style={[s.card, s[padding], style, press.style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
