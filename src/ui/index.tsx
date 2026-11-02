import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  View,
} from 'react-native';
import { colors, font, radius, spacing, touch } from './theme';

type Variant = 'body' | 'title' | 'label' | 'muted' | 'error';

const textStyles = StyleSheet.create({
  body: { fontFamily: font.regular, fontSize: 16, color: colors.text, lineHeight: 26 },
  title: { fontFamily: font.bold, fontSize: 24, color: colors.text, lineHeight: 36 },
  label: { fontFamily: font.bold, fontSize: 15, color: colors.text, lineHeight: 24 },
  muted: { fontFamily: font.regular, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  error: { fontFamily: font.regular, fontSize: 14, color: colors.danger, lineHeight: 22 },
});

export function Text({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  return <RNText {...rest} style={[textStyles[variant], style]} />;
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
  kind = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  kind?: 'primary' | 'secondary';
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={[
        buttonStyles.base,
        kind === 'primary' ? buttonStyles.primary : buttonStyles.secondary,
        inactive && buttonStyles.inactive,
      ]}>
      {loading ? (
        <ActivityIndicator color={kind === 'primary' ? colors.primaryText : colors.primary} />
      ) : (
        <Text
          variant="label"
          style={{ color: kind === 'primary' ? colors.primaryText : colors.primary }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    minHeight: touch + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.primary },
  inactive: { opacity: 0.55 },
});

export function Field({
  label,
  error,
  suffix,
  ...input
}: TextInputProps & { label: string; error?: string; suffix?: string }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text variant="label">{label}</Text>
      <View style={[fieldStyles.row, error ? fieldStyles.rowError : null]}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          style={fieldStyles.input}
        />
        {suffix ? <Text variant="muted">{suffix}</Text> : null}
      </View>
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: {
    minHeight: touch + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
  },
  rowError: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: font.regular, fontSize: 16, color: colors.text, paddingVertical: spacing.sm },
});

export function Choice({
  selected,
  onPress,
  children,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[choiceStyles.base, selected && choiceStyles.selected]}>
      {children}
    </Pressable>
  );
}

const choiceStyles = StyleSheet.create({
  base: {
    minHeight: touch,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.bg,
  },
  selected: { borderColor: colors.primary, borderWidth: 2.5, backgroundColor: colors.surface },
});
