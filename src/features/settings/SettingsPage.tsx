import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';

/** Shared frame for a settings group: back button, title, skeleton, error with retry. */
export function SettingsPage<T>({
  title,
  onBack,
  query,
  children,
}: {
  title: string;
  onBack: () => void;
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{title}</Text>
      {query.isPending ? (
        <>
          <Skeleton height={60} />
          <Skeleton height={60} />
        </>
      ) : query.isError ? (
        <>
          <Text variant="error">{errorMessage(query.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void query.refetch()}
          />
        </>
      ) : (
        children(query.data as T)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
});
