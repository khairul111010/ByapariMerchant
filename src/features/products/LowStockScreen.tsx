import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { useLowStock } from './hooks';
import { ScreenHeader } from '../../ui/ScreenHeader';

export function LowStockScreen({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (productId: number) => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const low = useLowStock();
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('inventory.lowTitle')} onBack={onBack} />
      {low.isPending ? (
        <>
          <Skeleton height={64} />
          <Skeleton height={64} />
        </>
      ) : low.isError ? (
        <>
          <Text variant="error">{errorMessage(low.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void low.refetch()}
          />
        </>
      ) : low.data.length === 0 ? (
        <Text variant="muted">{t('inventory.lowEmpty')}</Text>
      ) : (
        low.data.map(r => (
          <Pressable
            key={r.variant_id}
            accessibilityRole="button"
            onPress={() => onOpen(r.product_id)}
            style={styles.row}
          >
            <Text variant="label">
              {r.product_name}
              {r.variant_name ? ` · ${r.variant_name}` : ''}
            </Text>
            <View style={styles.line}>
              <Text variant="muted">{r.sku}</Text>
              <Text variant="label">
                {t('inventory.left', {
                  count: formatNumber(r.stock_quantity, lang),
                })}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  row: {
    ...cardStyle,
    padding: spacing.md,
    gap: 2,
    minHeight: 56,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
});
