import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  View,
} from 'react-native';
import { colors, font, radius, shadow, spacing, touch, type } from './theme';

type Variant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'small'
  | 'muted'
  | 'caption'
  | 'error';

const textStyles = StyleSheet.create({
  display: { fontFamily: font.bold, ...type.display, color: colors.text },
  title: { fontFamily: font.bold, ...type.title, color: colors.text },
  subtitle: { fontFamily: font.bold, ...type.subtitle, color: colors.text },
  body: { fontFamily: font.regular, ...type.body, color: colors.text },
  label: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  small: { fontFamily: font.regular, ...type.small, color: colors.text },
  muted: { fontFamily: font.regular, ...type.small, color: colors.textMuted },
  caption: {
    fontFamily: font.regular,
    ...type.caption,
    color: colors.textMuted,
  },
  error: { fontFamily: font.bold, ...type.small, color: colors.danger },
});

export function Text({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  return (
    <RNText
      accessibilityRole={variant === 'error' ? 'alert' : rest.accessibilityRole}
      {...rest}
      style={[textStyles[variant], style]}
    />
  );
}

/** Scales down a little under the finger and springs back: the whole app's "press" feel. */
function usePress() {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, {
      toValue: v,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  return { scale, onPressIn: () => to(0.97), onPressOut: () => to(1) };
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
  const press = usePress();
  const inactive = disabled || loading;
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={inactive}
    >
      <Animated.View
        style={[
          buttonStyles.base,
          primary ? buttonStyles.primary : buttonStyles.secondary,
          inactive && buttonStyles.inactive,
          { transform: [{ scale: press.scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={primary ? colors.primaryText : colors.primary}
          />
        ) : (
          <Text
            variant="label"
            style={[
              buttonStyles.label,
              { color: primary ? colors.primaryText : colors.text },
            ]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary, ...shadow.card },
  secondary: { backgroundColor: colors.card, ...shadow.card },
  inactive: { opacity: 0.5 },
  label: { fontSize: 16, textAlign: 'center' },
});

export function Field({
  label,
  error,
  suffix,
  onFocus,
  onBlur,
  ...input
}: TextInputProps & { label: string; error?: string; suffix?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrap}>
      <Text variant="label" style={fieldStyles.label}>
        {label}
      </Text>
      <View
        style={[
          fieldStyles.row,
          focused && fieldStyles.rowFocus,
          error ? fieldStyles.rowError : null,
        ]}
      >
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
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
  label: { color: colors.textMuted, fontSize: 13 },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  rowFocus: { borderColor: colors.primary },
  rowError: { borderColor: colors.danger },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});

/** A selectable card with a radio dot, for "pick one" lists. */
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
  const press = usePress();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View
        style={[
          choiceStyles.base,
          selected && choiceStyles.selected,
          { transform: [{ scale: press.scale }] },
        ]}
      >
        <View style={choiceStyles.body}>{children}</View>
        <View style={[choiceStyles.radio, selected && choiceStyles.radioOn]}>
          {selected ? <View style={choiceStyles.dot} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const choiceStyles = StyleSheet.create({
  base: {
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  body: { flex: 1, gap: spacing.xs },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

/** A soft pulsing placeholder shown instead of a spinner while content loads. */
export function Skeleton({ height = 20 }: { height?: number }) {
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        marginBottom: spacing.sm,
        opacity: pulse,
      }}
    />
  );
}
