import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useCategories } from '../products/hooks';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { useReorderCategories } from './hooks';
import { flattenTree, moveSibling } from './tree';
import { ScreenHeader } from '../../ui/ScreenHeader';

export function CategoriesScreen({
  onBack,
  onAdd,
  onEdit,
}: {
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: number) => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const categories = useCategories();
  const reorder = useReorderCategories();
  const list = useMemo(() => categories.data ?? [], [categories.data]);
  const nodes = useMemo(() => flattenTree(list), [list]);

  const move = (id: number, dir: 'up' | 'down') => {
    const ids = moveSibling(list, id, dir);
    if (ids) {
      reorder.mutate(ids);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('categories.title')} onBack={onBack} />
      <Button title={t('categories.add')} onPress={onAdd} />
      {categories.isPending ? (
        <>
          <Skeleton height={72} />
          <Skeleton height={72} />
        </>
      ) : categories.isError ? (
        <>
          <Text variant="error">{errorMessage(categories.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void categories.refetch()}
          />
        </>
      ) : nodes.length === 0 ? (
        <Text variant="muted">{t('categories.empty')}</Text>
      ) : (
        nodes.map(({ category: c, depth }) => (
          <View key={c.id} style={[styles.row, depth === 1 && styles.child]}>
            <View style={styles.flex}>
              <Text variant="label">{c.name}</Text>
              <Text variant="muted">
                {t('categories.products', {
                  count: formatNumber(c.products_count, lang),
                })}
                {c.is_active ? '' : ` · ${t('categories.hidden')}`}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                title="▲"
                disabled={reorder.isPending || !moveSibling(list, c.id, 'up')}
                onPress={() => move(c.id, 'up')}
                kind="secondary"
              />
              <Button
                title="▼"
                disabled={reorder.isPending || !moveSibling(list, c.id, 'down')}
                onPress={() => move(c.id, 'down')}
                kind="secondary"
              />
              <Button
                title={t('categories.edit')}
                onPress={() => onEdit(c.id)}
                kind="secondary"
              />
            </View>
          </View>
        ))
      )}
      {reorder.error ? (
        <Text variant="error">{errorMessage(reorder.error, t)}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  row: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  child: { marginLeft: spacing.xl },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
