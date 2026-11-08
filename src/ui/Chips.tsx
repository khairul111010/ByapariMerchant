import React from 'react';
import { Pressable, Text as RNText } from 'react-native';
import { Badge, Tone } from './Badge';
import { useStyles } from './ThemeProvider';

/** A pill filter chip: teal when selected, a quiet outlined pill otherwise. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const s = useStyles(({ c, radius, spacing, font }) => ({
    chip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    on: { backgroundColor: c.primaryFill, borderColor: c.primaryFill },
    text: {
      fontFamily: font.bold,
      fontSize: 14,
      lineHeight: 20,
      color: c.textPrimary,
    },
    textOn: { color: c.textOnPrimary },
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.chip, selected && s.on]}
    >
      <RNText style={[s.text, selected && s.textOn]}>{label}</RNText>
    </Pressable>
  );
}

/** Older name for a soft badge, kept for existing screens. */
export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: Tone;
}) {
  return <Badge label={label} tone={tone} />;
}
