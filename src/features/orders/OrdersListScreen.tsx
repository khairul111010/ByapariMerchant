import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import {
  ORDER_STATUSES,
  OrderRow,
  OrderStatus,
} from '../../api/schemas/orders';
import { formatDateTime, formatMoney } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Pill } from '../../ui/Chips';
import { PendingBanner } from '../shell/PendingBanner';
import { Button, Skeleton, Text } from '../../ui';
import {
  colors,
  font,
  radius,
  spacing,
  touch,
  cardStyle,
  shadow,
} from '../../ui/theme';
import { useOrders } from './hooks';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: 'warning',
  confirmed: 'brand',
  shipped: 'brand',
  delivered: 'success',
  cancelled: 'danger',
};
const PAYMENT_TONE: Record<OrderRow['payment_status'], Tone> = {
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
};

export function OrdersListScreen({ onOpen }: { onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [q, setQ] = useState('');
  const query = q.trim() || undefined;
  const orders = useOrders({ status, q: query });
  const rows = useMemo(
    () => orders.data?.pages.flatMap(p => p.data) ?? [],
    [orders.data],
  );

  const renderRow = ({ item }: { item: OrderRow }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.order_number}, ${item.customer_name}`}
      onPress={() => onOpen(item.id)}
      style={styles.row}
    >
      <View style={styles.rowTop}>
        <Text variant="label">{item.order_number}</Text>
        <Text variant="label">{formatMoney(item.total, lang)}</Text>
      </View>
      <Text>{item.customer_name}</Text>
      <View style={styles.pills}>
        <Pill
          label={t(`orders.status.${item.status}`)}
          tone={STATUS_TONE[item.status]}
        />
        <Pill
          label={t(`orders.paymentStatus.${item.payment_status}`)}
          tone={PAYMENT_TONE[item.payment_status]}
        />
        <Pill label={t(`orders.payment.${item.payment_method}`)} />
      </View>
      <Text variant="caption">{formatDateTime(item.created_at, lang)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <PendingBanner />
      <View style={styles.header}>
        <Text variant="title">{t('orders.title')}</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('orders.search')}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('orders.search')}
          style={styles.search}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[undefined, ...ORDER_STATUSES].map(s => (
            <Pressable
              key={s ?? 'all'}
              accessibilityRole="button"
              accessibilityState={{ selected: status === s }}
              onPress={() => setStatus(s)}
              style={[styles.chip, status === s && styles.chipOn]}
            >
              <Text
                variant="label"
                style={status === s ? styles.chipTextOn : undefined}
              >
                {s ? t(`orders.status.${s}`) : t('orders.all')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {orders.isPending ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} height={96} />
          ))}
        </View>
      ) : orders.isError && rows.length === 0 ? (
        <View style={styles.center}>
          <Text variant="error">{errorMessage(orders.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void orders.refetch()}
          />
        </View>
      ) : (
        <FlashList
          data={rows}
          renderItem={renderRow}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={styles.list}
          onEndReached={() => orders.hasNextPage && void orders.fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshing={orders.isRefetching && !orders.isFetchingNextPage}
          onRefresh={() => void orders.refetch()}
          ListEmptyComponent={
            <Text variant="muted" style={styles.empty}>
              {status || query ? t('orders.emptyFiltered') : t('orders.empty')}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, gap: spacing.sm },
  search: {
    minHeight: touch,
    backgroundColor: colors.card,
    ...shadow.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.text,
  },
  chips: { gap: spacing.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTextOn: { color: colors.primaryText },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  row: {
    ...cardStyle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: touch,
    gap: 2,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  center: { padding: spacing.xl, gap: spacing.md },
  empty: { textAlign: 'center', padding: spacing.xl },
});
