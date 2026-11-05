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
import { CustomerRow } from '../../api/schemas/selling';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
} from '../../i18n/format';
import { useLang } from '../../i18n';
import { ContactActions } from '../orders/ContactActions';
import { useDebounced } from '../pos/hooks';
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
import { CustomerSort } from './api';
import { useCustomer, useCustomers } from './hooks';

function CustomerDetail({
  phone,
  onBack,
}: {
  phone: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const c = useCustomer(phone);
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      {c.isPending ? (
        <Skeleton height={120} />
      ) : c.isError ? (
        <Text variant="error">
          {c.error && 'kind' in c.error && c.error.kind === 'not_found'
            ? t('customers.notFound')
            : errorMessage(c.error, t)}
        </Text>
      ) : (
        <>
          <Text variant="title">{c.data.name}</Text>
          <Text>
            {lang === 'bn' ? formatNumber(c.data.phone, lang) : c.data.phone}
          </Text>
          <ContactActions phone={c.data.phone} />
          <Text variant="muted">
            {t(`orders.risk.${c.data.risk.level}`)} ·{' '}
            {t('customers.summary', {
              delivered: formatNumber(c.data.risk.delivered, lang),
              cancelled: formatNumber(c.data.risk.cancelled, lang),
            })}
          </Text>
          <Text>
            {t('customers.orders', {
              count: formatNumber(c.data.orders_count, lang),
            })}{' '}
            ·{' '}
            {t('customers.spent', {
              amount: formatMoney(c.data.total_spent, lang),
            })}
          </Text>
          {c.data.has_account ? (
            <Text variant="muted">{t('customers.hasAccount')}</Text>
          ) : null}
          {c.data.last_address ? (
            <>
              <Text variant="label">{t('customers.lastAddress')}</Text>
              <Text>{c.data.last_address}</Text>
            </>
          ) : null}
          <Text variant="label">{t('customers.history')}</Text>
          {c.data.orders.map(o => (
            <View key={o.id} style={styles.card}>
              <View style={styles.line}>
                <Text variant="label">{o.order_number}</Text>
                <Text variant="label">{formatMoney(o.total, lang)}</Text>
              </View>
              <Text variant="muted">
                {t(`orders.status.${o.status}`)} ·{' '}
                {t(`orders.payment.${o.payment_method}`)} ·{' '}
                {formatDateTime(o.created_at, lang)}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

export function CustomersScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<CustomerSort>('recent');
  const [open, setOpen] = useState<string | null>(null);
  const query = useDebounced(q.trim()) || undefined;
  const customers = useCustomers(query, sort);
  const rows = useMemo(
    () => customers.data?.pages.flatMap(p => p.data) ?? [],
    [customers.data],
  );

  if (open) {
    return <CustomerDetail phone={open} onBack={() => setOpen(null)} />;
  }
  const sorts: Array<[CustomerSort, string]> = [
    ['recent', t('customers.sortRecent')],
    ['orders', t('customers.sortOrders')],
    ['spent', t('customers.sortSpent')],
  ];
  const renderRow = ({ item }: { item: CustomerRow }) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => setOpen(item.phone)}
      style={styles.card}
    >
      <View style={styles.line}>
        <Text variant="label">{item.name}</Text>
        <Text variant="muted">{t(`orders.risk.${item.risk_level}`)}</Text>
      </View>
      <Text variant="muted">
        {lang === 'bn' ? formatNumber(item.phone, lang) : item.phone} ·{' '}
        {t('customers.orders', {
          count: formatNumber(item.orders_count, lang),
        })}{' '}
        · {formatMoney(item.total_spent, lang)}
      </Text>
      {item.last_order_at ? (
        <Text variant="muted">
          {t('customers.last', { date: formatDate(item.last_order_at, lang) })}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button title={t('common.back')} kind="secondary" onPress={onBack} />
        <Text variant="title">{t('customers.title')}</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('customers.search')}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('customers.search')}
          style={styles.search}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {sorts.map(([key, label]) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: sort === key }}
              onPress={() => setSort(key)}
              style={[styles.chip, sort === key && styles.chipOn]}
            >
              <Text
                variant="label"
                style={sort === key ? styles.chipTextOn : undefined}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {customers.isPending ? (
        <View style={styles.list}>
          {[0, 1, 2].map(i => (
            <Skeleton key={i} height={80} />
          ))}
        </View>
      ) : customers.isError && rows.length === 0 ? (
        <View style={styles.list}>
          <Text variant="error">{errorMessage(customers.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void customers.refetch()}
          />
        </View>
      ) : (
        <FlashList
          data={rows}
          renderItem={renderRow}
          keyExtractor={c => c.phone}
          contentContainerStyle={styles.list}
          onEndReached={() =>
            customers.hasNextPage && void customers.fetchNextPage()
          }
          onEndReachedThreshold={0.5}
          refreshing={customers.isRefetching && !customers.isFetchingNextPage}
          onRefresh={() => void customers.refetch()}
          ListEmptyComponent={
            <Text variant="muted">{t('customers.empty')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
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
  card: {
    ...cardStyle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
    minHeight: touch,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
