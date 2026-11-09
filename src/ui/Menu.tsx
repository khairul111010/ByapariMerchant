import React from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './index';
import { useStyles, useTheme } from './ThemeProvider';

function useMenuStyles() {
  return useStyles(({ c, radius, spacing, shadow, font }) => ({
    label: { marginLeft: spacing.xs, marginBottom: -spacing.sm },
    group: {
      borderRadius: radius.lg,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      ...shadow.card,
    },
    row: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    divider: { borderTopWidth: 1, borderTopColor: c.border },
    pressed: { backgroundColor: c.cardSunken },
    icon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconDanger: { backgroundColor: c.dangerSoft },
    text: { flex: 1, gap: 1 },
    title: {
      fontFamily: font.bold,
      fontSize: 15,
      lineHeight: 22,
      color: c.textPrimary,
    },
    danger: { color: c.dangerText },
  }));
}

/** A rounded card of rows, with an optional small heading above it. */
export function MenuGroup({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const s = useMenuStyles();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <>
      {label ? (
        <Text variant="overline" style={s.label}>
          {label}
        </Text>
      ) : null}
      <View style={s.group}>
        {rows.map((row, i) => (
          <View key={i} style={i > 0 ? s.divider : undefined}>
            {row}
          </View>
        ))}
      </View>
    </>
  );
}

/** One tappable row: icon, title, an optional one-line hint, value and chevron. */
export function MenuRow({
  icon,
  title,
  hint,
  value,
  onPress,
  danger,
  right,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const s = useMenuStyles();
  const { c } = useTheme();
  const body = (
    <>
      {icon ? (
        <View style={[s.icon, danger && s.iconDanger]}>
          <Icon
            name={icon}
            size={19}
            color={danger ? c.dangerText : c.primaryFill}
          />
        </View>
      ) : null}
      <View style={s.text}>
        <RNText style={[s.title, danger && s.danger]}>{title}</RNText>
        {hint ? (
          <Text variant="caption" numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      {value ? <Text variant="muted">{value}</Text> : null}
      {right}
      {onPress && !danger && !right ? (
        <Icon name="chevronRight" size={18} color={c.textSecondary} />
      ) : null}
    </>
  );
  if (!onPress) {
    return <View style={s.row}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}: ${value}` : title}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      {body}
    </Pressable>
  );
}
