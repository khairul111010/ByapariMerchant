import React, { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import {
  ORDER_STATUSES,
  OrderRow,
  OrderStatus,
} from '../../api/schemas/orders';
import { PendingBanner } from '../shell/PendingBanner';
import { Button, SkeletonCard, Text } from '../../ui';
import { Chip } from '../../ui/Chips';
import { EmptyState } from '../../ui/EmptyState';
import { Icon } from '../../ui/Icon';
import { OrderCard } from '../../ui/OrderCard';
import { useStyles, useTheme } from '../../ui/ThemeProvider';
import { useOrders } from './hooks';

/** Fully on the theme: the pattern for moving the other screens to dark-mode-ready styles. */
export function OrdersListScreen({
  onOpen,
  initialStatus,
}: {
  onOpen: (id: number) => void;
  initialStatus?: OrderStatus;
}) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const [status, setStatus] = useState<OrderStatus | undefined>(initialStatus);
  const [q, setQ] = useState('');
  const query = q.trim() || undefined;
  const orders = useOrders({ status, q: query });
  const rows = useMemo(
    () => orders.data?.pages.flatMap(p => p.data) ?? [],
    [orders.data],
  );
  const s = useStyles(({ c: p, radius, spacing, font, type }) => ({
    screen: { flex: 1, backgroundColor: p.background },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      gap: spacing.md,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.card,
    },
    searchInput: {
      flex: 1,
      fontFamily: font.regular,
      ...type.body,
      color: p.textPrimary,
      paddingVertical: spacing.sm,
    },
    chips: { gap: spacing.sm, paddingRight: spacing.lg },
    list: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xxl,
    },
    center: { padding: spacing.xxl, gap: spacing.md },
  }));

  const renderRow = ({ item }: { item: OrderRow }) => (
    <OrderCard order={item} onPress={() => onOpen(item.id)} />
  );
  const filtered = Boolean(status || query);

  return (
    <View style={s.screen}>
      <PendingBanner />
      <View style={s.header}>
        <Text variant="title">{t('orders.title')}</Text>
        <View style={s.search}>
          <Icon name="search" size={20} color={c.textSecondary} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('orders.search')}
            placeholderTextColor={c.textSecondary}
            selectionColor={c.primary}
            accessibilityLabel={t('orders.search')}
            style={s.searchInput}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {[undefined, ...ORDER_STATUSES].map(st => (
            <Chip
              key={st ?? 'all'}
              label={st ? t(`orders.status.${st}`) : t('orders.all')}
              selected={status === st}
              onPress={() => setStatus(st)}
            />
          ))}
        </ScrollView>
      </View>

      {orders.isPending ? (
        <View style={s.list}>
          {[0, 1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : orders.isError && rows.length === 0 ? (
        <View style={s.center}>
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
          contentContainerStyle={s.list}
          onEndReached={() => orders.hasNextPage && void orders.fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshing={orders.isRefetching && !orders.isFetchingNextPage}
          onRefresh={() => void orders.refetch()}
          ListEmptyComponent={
            <EmptyState
              icon={filtered ? 'search' : 'inbox'}
              title={
                filtered ? t('orders.emptyFiltered') : t('orders.emptyTitle')
              }
              message={filtered ? undefined : t('orders.empty')}
            />
          }
        />
      )}
    </View>
  );
}
