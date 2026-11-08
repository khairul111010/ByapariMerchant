import React from 'react';
import { Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '../api/schemas/orders';
import { useStyles, useTheme } from './ThemeProvider';

export type Tone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * A soft badge: tinted background with deeper text of the same hue (never a solid block).
 * The text always says what it means, so colour is never the only signal.
 */
export function Badge({
  label,
  tone = 'neutral',
  dot = false,
}: {
  label: string;
  tone?: Tone;
  dot?: boolean;
}) {
  const { c } = useTheme();
  const palette = {
    neutral: { bg: c.neutralSoft, fg: c.neutralText, dot: c.textSecondary },
    brand: { bg: c.primarySoft, fg: c.primaryFill, dot: c.primary },
    success: { bg: c.successSoft, fg: c.successText, dot: c.success },
    warning: { bg: c.warningSoft, fg: c.warningText, dot: c.warning },
    danger: { bg: c.dangerSoft, fg: c.dangerText, dot: c.danger },
    info: { bg: c.infoSoft, fg: c.infoText, dot: c.info },
  }[tone];
  const s = useStyles(({ radius, font }) => ({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { fontFamily: font.bold, fontSize: 12, lineHeight: 18 },
  }));
  return (
    <View
      style={[s.badge, { backgroundColor: palette.bg }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {dot ? <View style={[s.dot, { backgroundColor: palette.dot }]} /> : null}
      <RNText style={[s.text, { color: palette.fg }]}>{label}</RNText>
    </View>
  );
}

export const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: 'warning',
  confirmed: 'brand',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

/** An order's status as a soft badge with a dot, translated. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <Badge
      label={t(`orders.status.${status}`)}
      tone={STATUS_TONE[status]}
      dot
    />
  );
}

export const PAYMENT_TONE: Record<'unpaid' | 'paid' | 'failed', Tone> = {
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
};
