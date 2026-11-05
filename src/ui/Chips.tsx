import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from './theme';
import { Text } from './index';

/** A pill-shaped filter chip: filled brand colour when selected. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text variant="label" style={selected ? styles.textOn : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surface, fg: colors.text },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warningText },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  brand: { bg: colors.primarySoft, fg: colors.primary },
};

/** A small status badge. Colour is never the only signal: the text always says what it is. */
export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: TONES[tone].bg }]}>
      <Text
        variant="caption"
        style={{ color: TONES[tone].fg, fontFamily: 'NotoSansBengali-Bold' }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  chipOn: { backgroundColor: colors.primary },
  textOn: { color: colors.primaryText },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
