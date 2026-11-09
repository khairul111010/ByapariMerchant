import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { Text } from './index';
import { useStyles, useTheme } from './ThemeProvider';
import { useHardwareBack } from './useHardwareBack';

/**
 * The top of every inner screen: a round back arrow, the title and an optional
 * action on the right. The phone's back button does the same as the arrow.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { c } = useTheme();
  useHardwareBack(onBack);
  const s = useStyles(({ c: col, spacing }) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
    },
    back: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: col.card,
      borderWidth: 1,
      borderColor: col.border,
    },
    pressed: { backgroundColor: col.cardSunken },
    text: { flex: 1, gap: 2 },
  }));
  return (
    <View style={s.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [s.back, pressed && s.pressed]}
        >
          <Icon name="chevronLeft" size={22} color={c.textPrimary} />
        </Pressable>
      ) : null}
      <View style={s.text}>
        {title ? (
          <Text variant="title" accessibilityRole="header" numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
