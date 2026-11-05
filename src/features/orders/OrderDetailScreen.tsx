import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ORDER_STATUSES } from '../../api/schemas/orders';
import { formatDateTime, formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Sheet } from '../../ui/Sheet';
import { Button, Choice, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { InvoiceButton } from '../invoice/InvoiceButton';
import { QueueNotice } from './QueueNotice';
import { AdvanceSection, CourierSection, PaymentSection } from './OrderActions';
import { telUrl, whatsappUrl } from './contact';
import { useChangeStatus, useOrder } from './hooks';

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Text variant={strong ? 'label' : 'body'}>{label}</Text>
      <Text variant={strong ? 'label' : 'body'}>{value}</Text>
    </View>
  );
}

export function OrderDetailScreen({
  id,
  onBack,
}: {
  id: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const order = useOrder(id);
  const change = useChangeStatus(id);
  const [statusSheet, setStatusSheet] = useState(false);

  const header = (
    <Button title={t('common.back')} kind="secondary" onPress={onBack} />
  );

  if (order.isPending) {
    return (
      <View style={styles.wrap}>
        {header}
        <Skeleton height={40} />
        <Skeleton height={120} />
        <Skeleton height={160} />
      </View>
    );
  }
  if (order.isError) {
    return (
      <View style={styles.wrap}>
        {header}
        <Text variant="error">{errorMessage(order.error, t)}</Text>
        <Button
          title={t('common.retry')}
          onPress={() => void order.refetch()}
        />
      </View>
    );
  }

  const o = order.data;
  const statusError = change.error ? errorMessage(change.error, t) : null;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      {header}
      <Text variant="title">{o.order_number}</Text>
      <QueueNotice orderId={o.id} />
      <Text variant="muted">
        {formatDateTime(o.created_at, lang)} · {t(`orders.status.${o.status}`)}{' '}
        · {t(`orders.payment.${o.payment_method}`)} ·{' '}
        {t(`orders.paymentStatus.${o.payment_status}`)}
      </Text>

      <View style={styles.card}>
        <Text variant="label">{t('orders.customer')}</Text>
        <Text>{o.customer_name}</Text>
        <Text>
          {lang === 'bn'
            ? formatNumber(o.customer_phone, lang)
            : o.customer_phone}
        </Text>
        <Text variant="muted">
          {t(`orders.risk.${o.customer_risk.level}`)}
          {o.customer_risk.total > 0
            ? ` · ${t('orders.riskHistory', {
                delivered: formatNumber(o.customer_risk.delivered, lang),
                cancelled: formatNumber(o.customer_risk.cancelled, lang),
              })}`
            : ''}
        </Text>
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              title={t('orders.call')}
              kind="secondary"
              onPress={() => void Linking.openURL(telUrl(o.customer_phone))}
            />
          </View>
          <View style={styles.flex}>
            <Button
              title={t('orders.whatsapp')}
              kind="secondary"
              onPress={() =>
                void Linking.openURL(whatsappUrl(o.customer_phone))
              }
            />
          </View>
        </View>
        {o.customer_address ? (
          <>
            <Text variant="label">{t('orders.address')}</Text>
            <Text>{o.customer_address}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text variant="label">{t('orders.items')}</Text>
        {o.items.map(it => (
          <View key={it.id} style={styles.line}>
            <Text style={styles.flex}>
              {it.product_name}
              {it.variant_name ? ` · ${it.variant_name}` : ''} ×{' '}
              {formatNumber(it.quantity, lang)}
            </Text>
            <Text>{formatMoney(it.line_total, lang)}</Text>
          </View>
        ))}
        <Line
          label={t('orders.subtotal')}
          value={formatMoney(o.subtotal, lang)}
        />
        <Line
          label={t('orders.discount')}
          value={formatMoney(o.discount_amount, lang)}
        />
        <Line
          label={t('orders.delivery')}
          value={formatMoney(o.delivery_charge, lang)}
        />
        <Line
          strong
          label={t('orders.total')}
          value={formatMoney(o.total, lang)}
        />
        <Line
          label={t('orders.advancePaid')}
          value={formatMoney(o.advance_paid, lang)}
        />
        <Line
          strong
          label={t('orders.amountDue')}
          value={formatMoney(o.amount_due, lang)}
        />
      </View>

      <InvoiceButton orderId={o.id} />
      <PaymentSection order={o} />
      <AdvanceSection order={o} />
      <CourierSection order={o} />

      <View style={styles.card}>
        <Text variant="label">{t('orders.changeStatus')}</Text>
        <Text variant="muted">{t(`orders.status.${o.status}`)}</Text>
        <Button
          title={t('orders.changeStatus')}
          onPress={() => setStatusSheet(true)}
        />
        {statusError ? <Text variant="error">{statusError}</Text> : null}
      </View>

      <Sheet
        visible={statusSheet}
        onClose={() => setStatusSheet(false)}
        title={t('orders.changeStatus')}
      >
        {ORDER_STATUSES.filter(st => st !== o.status).map(st => (
          <Choice
            key={st}
            label={t(`orders.status.${st}`)}
            selected={change.isPending && change.variables === st}
            onPress={() =>
              change.mutate(st, { onSettled: () => setStatusSheet(false) })
            }
          >
            <Text variant="label">{t(`orders.status.${st}`)}</Text>
          </Choice>
        ))}
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: { ...cardStyle, padding: spacing.md, gap: spacing.sm },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
