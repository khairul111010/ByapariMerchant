import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { Variant } from '../../api/schemas/catalogue';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Skeleton, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';
import { useAdjustStock, useProduct } from './hooks';
import { DeleteProduct } from './DeleteProduct';
import { ProductImages } from './ProductImages';
import { StockTools } from './StockTools';
import { DeleteVariant, VariantEditor } from './VariantEditor';

function VariantCard({
  productId,
  v,
  tracked,
  canDelete,
}: {
  productId: number;
  v: Variant;
  tracked: boolean;
  canDelete: boolean;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const [editing, setEditing] = useState(false);
  const adjust = useAdjustStock(productId);
  const busy = adjust.isPending;
  return (
    <View style={styles.card}>
      <Text variant="label">
        {v.name ?? t('products.defaultVariant')} · {v.sku}
      </Text>
      <Text>
        {formatMoney(v.price, lang)}
        {v.compare_at_price
          ? `  (${formatMoney(v.compare_at_price, lang)})`
          : ''}
      </Text>
      {v.price_tiers && v.price_tiers.length > 0 ? (
        <Text variant="muted">
          {t('products.priceTiers')}:{' '}
          {v.price_tiers
            .map(
              p =>
                `${t('products.tierFrom', {
                  qty: formatNumber(p.min_quantity, lang),
                })} ${formatMoney(p.price, lang)}`,
            )
            .join(' · ')}
        </Text>
      ) : null}
      {tracked ? (
        <>
          <Text variant="label">
            {t('products.stockNow', {
              count: formatNumber(v.stock_quantity, lang),
            })}
          </Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                title={t('products.stockMinus')}
                kind="secondary"
                disabled={busy || v.stock_quantity <= 0}
                onPress={() => adjust.mutate({ variantId: v.id, quantity: -1 })}
              />
            </View>
            <View style={styles.flex}>
              <Button
                title={t('products.stockPlus')}
                kind="secondary"
                disabled={busy}
                onPress={() => adjust.mutate({ variantId: v.id, quantity: 1 })}
              />
            </View>
          </View>
          {adjust.error ? (
            <Text variant="error">{errorMessage(adjust.error, t)}</Text>
          ) : null}
          <StockTools productId={productId} v={v} />
        </>
      ) : null}
      {editing ? (
        <VariantEditor
          productId={productId}
          mode={{ kind: 'edit', variant: v }}
          onClose={() => setEditing(false)}
        />
      ) : (
        <Button
          title={t('products.form.editVariant')}
          kind="secondary"
          onPress={() => setEditing(true)}
        />
      )}
      {canDelete ? <DeleteVariant productId={productId} variant={v} /> : null}
    </View>
  );
}

export function ProductDetailScreen({
  id,
  onBack,
  onEdit,
  onDeleted,
}: {
  id: number;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const product = useProduct(id);
  const header = (
    <Button title={t('common.back')} kind="secondary" onPress={onBack} />
  );

  if (product.isPending) {
    return (
      <View style={styles.wrap}>
        {header}
        <Skeleton height={40} />
        <Skeleton height={160} />
      </View>
    );
  }
  if (product.isError) {
    return (
      <View style={styles.wrap}>
        {header}
        <Text variant="error">{errorMessage(product.error, t)}</Text>
        <Button
          title={t('common.retry')}
          onPress={() => void product.refetch()}
        />
      </View>
    );
  }
  const p = product.data;
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      {header}
      <Text variant="title">{p.name}</Text>
      <Button
        title={t('products.form.editProduct')}
        kind="secondary"
        onPress={onEdit}
      />
      <Text variant="muted">
        {t(`products.status.${p.status}`)} ·{' '}
        {p.category?.name ?? t('products.uncategorised')}
      </Text>
      <ProductImages product={p} />
      <Text variant="label">{t('products.variants')}</Text>
      {p.variants.map(v => (
        <VariantCard
          key={v.id}
          productId={p.id}
          v={v}
          tracked={p.track_inventory}
          canDelete={p.variants.length > 1}
        />
      ))}
      {adding ? (
        <VariantEditor
          productId={p.id}
          mode={{ kind: 'add' }}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button
          title={t('products.form.addVariant')}
          kind="secondary"
          onPress={() => setAdding(true)}
        />
      )}
      <DeleteProduct id={p.id} name={p.name} onDeleted={onDeleted} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
