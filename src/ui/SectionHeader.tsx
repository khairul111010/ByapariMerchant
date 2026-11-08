import React from 'react';
import { View } from 'react-native';
import { Button, Text } from './index';
import { useStyles } from './ThemeProvider';

/** A section title with an optional subtitle and a small text action on the right. */
export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const s = useStyles(({ spacing }) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    text: { flex: 1, gap: 2 },
  }));
  return (
    <View style={s.row}>
      <View style={s.text}>
        <Text variant="subtitle" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} kind="ghost" size="sm" />
      ) : null}
    </View>
  );
}
