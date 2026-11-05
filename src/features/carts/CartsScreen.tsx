import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { formatDateTime, formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ContactActions } from '../orders/ContactActions';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { useCarts, useDeleteCart } from './hooks';

export function CartsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const carts = useCarts();
  const del = useDeleteCart();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const rows = useMemo(
    () => carts.data?.pages.flatMap(p => p.data) ?? [],
    [carts.data],
  );

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('carts.title')}</Text>
      <Text variant="muted">{t('carts.note')}</Text>
      {carts.isPending ? (
        <>
          <Skeleton height={110} />
          <Skeleton height={110} />
        </>
      ) : carts.isError && rows.length === 0 ? (
        <>
          <Text variant="error">{errorMessage(carts.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void carts.refetch()}
          />
        </>
      ) : rows.length === 0 ? (
        <Text variant="muted">{t('carts.empty')}</Text>
      ) : (
        rows.map(c => (
          <View key={c.id} style={styles.card}>
            <Text variant="label">{c.name ?? c.phone}</Text>
            <Text>{lang === 'bn' ? formatNumber(c.phone, lang) : c.phone}</Text>
            {c.address ? <Text variant="muted">{c.address}</Text> : null}
            <Text variant="muted">
              {formatDateTime(c.last_activity_at, lang)}
            </Text>
            {c.items.map((it, i) => (
              <View key={i} style={styles.line}>
                <Text style={styles.flex}>
                  {it.product_name}
                  {it.variant_name ? ` · ${it.variant_name}` : ''} ×{' '}
                  {formatNumber(it.quantity, lang)}
                </Text>
                <Text>{formatMoney(it.line_total, lang)}</Text>
              </View>
            ))}
            <View style={styles.line}>
              <Text variant="label">{t('carts.total')}</Text>
              <Text variant="label">{formatMoney(c.total, lang)}</Text>
            </View>
            <ContactActions phone={c.phone} />
            {confirmId === c.id ? (
              <>
                <Text>{t('carts.confirm')}</Text>
                <Button
                  title={t('carts.yes')}
                  loading={del.isPending}
                  onPress={() =>
                    del.mutate(c.id, { onSuccess: () => setConfirmId(null) })
                  }
                />
                <Button
                  title={t('common.cancel')}
                  kind="secondary"
                  onPress={() => setConfirmId(null)}
                />
              </>
            ) : (
              <Button
                title={t('carts.delete')}
                kind="secondary"
                onPress={() => setConfirmId(c.id)}
              />
            )}
          </View>
        ))
      )}
      {del.error ? (
        <Text variant="error">{errorMessage(del.error, t)}</Text>
      ) : null}
      {carts.hasNextPage ? (
        <Button
          title={t('common.retry')}
          kind="secondary"
          loading={carts.isFetchingNextPage}
          onPress={() => void carts.fetchNextPage()}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  flex: { flex: 1 },
});
