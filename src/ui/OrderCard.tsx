import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OrderRow } from '../api/schemas/orders';
import { formatDateTime, formatMoney } from '../i18n/format';
import { useLang } from '../i18n';
import { Badge, PAYMENT_TONE, StatusBadge } from './Badge';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './index';
import { useStyles, useTheme } from './ThemeProvider';

/** One order in a list: number and total up top, the customer, soft status badges, the time. */
export function OrderCard({
  order,
  onPress,
}: {
  order: OrderRow;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const s = useStyles(({ spacing }) => ({
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: spacing.md,
    },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
    foot: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
  }));
  const total = formatMoney(order.total, lang);
  const status = t(`orders.status.${order.status}`);
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${order.order_number}, ${order.customer_name}, ${total}, ${status}`}
      style={{ marginBottom: 12 }}
    >
      <View style={s.top}>
        <Text variant="label">{order.order_number}</Text>
        <Text variant="subtitle">{total}</Text>
      </View>
      <Text variant="small" numberOfLines={1}>
        {order.customer_name}
      </Text>
      <View style={s.badges}>
        <StatusBadge status={order.status} />
        <Badge
          label={t(`orders.paymentStatus.${order.payment_status}`)}
          tone={PAYMENT_TONE[order.payment_status]}
        />
        <Badge label={t(`orders.payment.${order.payment_method}`)} />
      </View>
      <View style={s.foot}>
        <Text variant="caption">{formatDateTime(order.created_at, lang)}</Text>
        <Icon name="chevronRight" size={18} color={c.textSecondary} />
      </View>
    </Card>
  );
}
