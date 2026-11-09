import React, { useMemo, useState } from 'react';
import {
  Image,
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
  PRODUCT_STATUSES,
  ProductRow,
  ProductStatus,
} from '../../api/schemas/catalogue';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useSession } from '../../store/session';
import { Chip } from '../../ui/Chips';
import { Icon } from '../../ui/Icon';
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
import { useProducts } from './hooks';
import { absoluteUrl } from './imageUrl';

type Chip = {
  key: string;
  label: string;
  status?: ProductStatus;
  lowStock?: boolean;
};

export function ProductsListScreen({
  onOpen,
  onScan,
  onLowStock,
  onCreate,
  onCategories,
  onImport,
}: {
  onOpen: (id: number) => void;
  onScan: () => void;
  onLowStock: () => void;
  onCreate: () => void;
  onCategories: () => void;
  onImport: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const [chip, setChip] = useState<Chip>({ key: 'all', label: '' });
  const [q, setQ] = useState('');
  const query = q.trim() || undefined;
  const products = useProducts({
    status: chip.status,
    low_stock: chip.lowStock,
    q: query,
  });
  const rows = useMemo(
    () => products.data?.pages.flatMap(p => p.data) ?? [],
    [products.data],
  );

  const chips: Chip[] = [
    { key: 'all', label: t('products.all') },
    { key: 'low', label: t('products.lowStock'), lowStock: true },
    ...PRODUCT_STATUSES.map(s => ({
      key: s,
      label: t(`products.status.${s}`),
      status: s,
    })),
  ];

  const renderRow = ({ item }: { item: ProductRow }) => {
    const v = item.default_variant;
    const thumb = absoluteUrl(item.thumb, apiBase);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.name}
        onPress={() => onOpen(item.id)}
        style={styles.row}
      >
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.noThumb]} />
        )}
        <View style={styles.rowBody}>
          <Text variant="label" numberOfLines={2}>
            {item.name}
          </Text>
          <Text variant="muted">
            {t(`products.status.${item.status}`)}
            {item.category ? ` · ${item.category.name}` : ''}
          </Text>
          {v ? (
            <Text>
              {formatMoney(v.price, lang)}
              {item.track_inventory
                ? ` · ${t('products.stock', {
                    count: formatNumber(v.stock_quantity, lang),
                  })}`
                : ''}
            </Text>
          ) : (
            <Text variant="muted">{t('products.noVariants')}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <PendingBanner />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="title" style={styles.flex}>
            {t('products.title')}
          </Text>
          <Button
            title={t('products.form.newProductButton')}
            size="sm"
            icon="plus"
            onPress={onCreate}
          />
        </View>
        <View style={styles.searchPill}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('products.search')}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            accessibilityLabel={t('products.search')}
            style={styles.searchInput}
          />
          {/* Scan sits inside the search: a barcode is just a faster way to type the SKU. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('inventory.scan')}
            onPress={onScan}
            style={styles.scanButton}
          >
            <Icon name="scan" size={20} color={colors.primaryText} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {chips.map(c => (
            <Chip
              key={c.key}
              label={c.label}
              selected={chip.key === c.key}
              onPress={() => setChip(c)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Button
            title={t('categories.open')}
            kind="ghost"
            size="sm"
            onPress={onCategories}
          />
          <Button
            title={t('inventory.lowTitle')}
            kind="ghost"
            size="sm"
            onPress={onLowStock}
          />
          <Button
            title={t('imports.open')}
            kind="ghost"
            size="sm"
            onPress={onImport}
          />
        </ScrollView>
      </View>
      {products.isPending ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} height={88} />
          ))}
        </View>
      ) : products.isError && rows.length === 0 ? (
        <View style={styles.center}>
          <Text variant="error">{errorMessage(products.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void products.refetch()}
          />
        </View>
      ) : (
        <FlashList
          data={rows}
          renderItem={renderRow}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={styles.list}
          onEndReached={() =>
            products.hasNextPage && void products.fetchNextPage()
          }
          onEndReachedThreshold={0.5}
          refreshing={products.isRefetching && !products.isFetchingNextPage}
          onRefresh={() => void products.refetch()}
          ListEmptyComponent={
            <Text variant="muted" style={styles.empty}>
              {chip.key !== 'all' || query
                ? t('products.emptyFiltered')
                : t('products.empty')}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingLeft: spacing.md,
    paddingRight: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tools: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
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
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    ...cardStyle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: touch,
  },
  rowBody: { flex: 1, gap: 2 },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
  noThumb: { backgroundColor: colors.surface },
  center: { padding: spacing.xl, gap: spacing.md },
  empty: { textAlign: 'center', padding: spacing.xl },
});
