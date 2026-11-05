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
        <Text variant="title">{t('products.title')}</Text>
        <Button
          title={t('products.form.newProductButton')}
          onPress={onCreate}
        />
        <Button
          title={t('categories.open')}
          kind="secondary"
          onPress={onCategories}
        />
        <Button title={t('imports.open')} kind="secondary" onPress={onImport} />
        <View style={styles.tools}>
          <View style={styles.flex}>
            <Button
              title={t('inventory.scan')}
              kind="secondary"
              onPress={onScan}
            />
          </View>
          <View style={styles.flex}>
            <Button
              title={t('inventory.lowTitle')}
              kind="secondary"
              onPress={onLowStock}
            />
          </View>
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('products.search')}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('products.search')}
          style={styles.search}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {chips.map(c => (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              accessibilityState={{ selected: chip.key === c.key }}
              onPress={() => setChip(c)}
              style={[styles.chip, chip.key === c.key && styles.chipOn]}
            >
              <Text
                variant="label"
                style={chip.key === c.key ? styles.chipTextOn : undefined}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
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
