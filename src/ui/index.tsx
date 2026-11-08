import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  DimensionValue,
  Easing,
  Pressable,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
} from 'react-native';
import type { IconName } from './Icon';
import { Icon } from './Icon';
import { usePressScale } from './press';
import { useStyles, useTheme } from './ThemeProvider';
import { touch } from './theme';

/* ------------------------------------------------------------------ Text */

type Variant =
  | 'metric'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'small'
  | 'muted'
  | 'caption'
  | 'overline'
  | 'error';

export function Text({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  const s = useStyles(({ c, font, type }) => ({
    metric: { fontFamily: font.bold, ...type.metric, color: c.textPrimary },
    display: { fontFamily: font.bold, ...type.display, color: c.textPrimary },
    title: { fontFamily: font.bold, ...type.title, color: c.textPrimary },
    subtitle: { fontFamily: font.bold, ...type.subtitle, color: c.textPrimary },
    body: { fontFamily: font.regular, ...type.body, color: c.textPrimary },
    label: {
      fontFamily: font.bold,
      fontSize: 15,
      lineHeight: 24,
      color: c.textPrimary,
    },
    small: { fontFamily: font.regular, ...type.small, color: c.textPrimary },
    muted: { fontFamily: font.regular, ...type.small, color: c.textSecondary },
    caption: {
      fontFamily: font.regular,
      ...type.caption,
      color: c.textSecondary,
    },
    overline: {
      fontFamily: font.bold,
      ...type.overline,
      color: c.textSecondary,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    error: { fontFamily: font.bold, ...type.small, color: c.dangerText },
  }));
  return (
    <RNText
      accessibilityRole={variant === 'error' ? 'alert' : rest.accessibilityRole}
      {...rest}
      style={[s[variant], style]}
    />
  );
}

/* ---------------------------------------------------------------- Button */

export type ButtonKind = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * - primary: the one main action on a screen (filled teal)
 * - secondary: neutral actions such as Back, Cancel, Edit (white, thin border)
 * - outline: a teal-outlined alternative action
 * - ghost: low-emphasis text action
 */
export function Button({
  title,
  onPress,
  loading,
  disabled,
  kind = 'primary',
  size = 'md',
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  kind?: ButtonKind;
  size?: 'md' | 'sm';
  icon?: IconName;
}) {
  const { c } = useTheme();
  const press = usePressScale();
  const s = useStyles(({ c: p, radius, spacing, shadow, font }) => ({
    base: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
    },
    md: { minHeight: 52 },
    sm: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: 12 },
    primary: { backgroundColor: p.primaryFill, ...shadow.card },
    secondary: {
      backgroundColor: p.card,
      borderWidth: 1,
      borderColor: p.border,
      ...shadow.card,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: p.primaryFill,
    },
    ghost: { backgroundColor: 'transparent' },
    inactive: { opacity: 0.45 },
    label: {
      fontFamily: font.bold,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    labelSm: { fontSize: 14, lineHeight: 20 },
  }));
  const ink = {
    primary: c.textOnPrimary,
    secondary: c.textPrimary,
    outline: c.primaryFill,
    ghost: c.primaryFill,
  }[kind];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={inactive}
      hitSlop={size === 'sm' ? 4 : 0}
    >
      <Animated.View
        style={[s.base, s[size], s[kind], inactive && s.inactive, press.style]}
      >
        {loading ? (
          <ActivityIndicator color={ink} />
        ) : (
          <>
            {icon ? (
              <Icon name={icon} size={size === 'sm' ? 18 : 20} color={ink} />
            ) : null}
            <RNText
              style={[s.label, size === 'sm' && s.labelSm, { color: ink }]}
              numberOfLines={2}
            >
              {title}
            </RNText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------- TextField / Field */

/** A labelled input. `helper` sits under it; an `error` replaces the helper and turns the border red. */
export function TextField({
  label,
  error,
  helper,
  suffix,
  onFocus,
  onBlur,
  editable = true,
  ...input
}: TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  suffix?: string;
}) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const s = useStyles(({ c: p, radius, spacing, font }) => ({
    wrap: { gap: 6 },
    label: {
      fontFamily: font.bold,
      fontSize: 13,
      lineHeight: 18,
      color: p.textSecondary,
    },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: p.card,
    },
    focus: { borderColor: p.primary, borderWidth: 1.5 },
    error: { borderColor: p.danger, borderWidth: 1.5 },
    disabled: { backgroundColor: p.cardSunken },
    input: {
      flex: 1,
      fontFamily: font.regular,
      fontSize: 16,
      color: p.textPrimary,
      paddingVertical: spacing.sm,
    },
  }));
  return (
    <View style={s.wrap}>
      <RNText style={s.label}>{label}</RNText>
      <View
        style={[
          s.row,
          !editable && s.disabled,
          focused && s.focus,
          error ? s.error : null,
        ]}
      >
        <TextInput
          {...input}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          placeholderTextColor={c.textSecondary}
          selectionColor={c.primary}
          cursorColor={c.primary}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={s.input}
        />
        {suffix ? <Text variant="muted">{suffix}</Text> : null}
      </View>
      {error ? (
        <Text variant="error">{error}</Text>
      ) : helper ? (
        <Text variant="caption">{helper}</Text>
      ) : null}
    </View>
  );
}

/** The original name, kept so every existing form works unchanged. */
export const Field = TextField;

/* ---------------------------------------------------------------- Choice */

/** A selectable card with a radio mark, for "pick one" lists. */
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
  const press = usePressScale(0.98);
  const s = useStyles(({ c: p, radius, spacing }) => ({
    base: {
      minHeight: touch,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      backgroundColor: p.card,
    },
    selected: {
      borderColor: p.primary,
      borderWidth: 1.5,
      backgroundColor: p.primarySoft,
    },
    body: { flex: 1, gap: 4 },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: p.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: { borderColor: p.primary },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: p.primary },
  }));
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View style={[s.base, selected && s.selected, press.style]}>
        <View style={s.body}>{children}</View>
        <View style={[s.radio, selected && s.radioOn]}>
          {selected ? <View style={s.dot} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

/* -------------------------------------------------------------- Skeleton */

/** A soft pulsing placeholder shown instead of a spinner while content loads. */
export function Skeleton({
  height = 20,
  width = '100%',
  rounded,
}: {
  height?: number;
  width?: DimensionValue;
  rounded?: number;
}) {
  const { c, radius } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 750,
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
        width,
        borderRadius: rounded ?? radius.md,
        backgroundColor: c.cardSunken,
        marginBottom: 8,
        opacity: pulse,
      }}
    />
  );
}

/** A few text-like lines; the last one shorter, like a real paragraph. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
          rounded={7}
        />
      ))}
    </View>
  );
}

/** The loading shape of a list card: a title line, two detail lines and a badge row. */
export function SkeletonCard() {
  const s = useStyles(({ c: p, radius, spacing, shadow }) => ({
    card: {
      backgroundColor: p.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: p.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadow.card,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  }));
  return (
    <View
      style={s.card}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={s.row}>
        <Skeleton height={18} width="40%" rounded={9} />
        <Skeleton height={18} width="22%" rounded={9} />
      </View>
      <Skeleton height={14} width="55%" rounded={7} />
      <View style={s.badges}>
        <Skeleton height={22} width={72} rounded={11} />
        <Skeleton height={22} width={56} rounded={11} />
      </View>
    </View>
  );
}
