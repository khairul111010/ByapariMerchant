import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from './Icon';
import { Button, Text } from './index';
import { useStyles, useTheme } from './ThemeProvider';

/** A calm, centred empty list: an icon in a soft circle, a title, a hint and an optional action. */
export function EmptyState({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { c } = useTheme();
  const s = useStyles(({ c: p, spacing }) => ({
    wrap: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.xxl,
      gap: spacing.sm,
    },
    circle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: p.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    text: { textAlign: 'center' },
    action: { marginTop: spacing.md, alignSelf: 'stretch' },
  }));
  return (
    <View style={s.wrap}>
      <View style={s.circle}>
        <Icon name={icon} size={32} color={c.primary} />
      </View>
      <Text variant="subtitle" style={s.text}>
        {title}
      </Text>
      {message ? (
        <Text variant="muted" style={s.text}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={s.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
