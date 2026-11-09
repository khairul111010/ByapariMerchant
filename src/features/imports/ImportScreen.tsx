import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { formatDateTime, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import {
  CsvTooLargeError,
  useImport,
  useImports,
  useStartImport,
} from './hooks';
import { outcome, progressFraction } from './status';
import { ScreenHeader } from '../../ui/ScreenHeader';

function ImportResult({ id }: { id: number }) {
  const { t } = useTranslation();
  const lang = useLang();
  const q = useImport(id);
  if (q.isPending) {
    return <Skeleton height={64} />;
  }
  if (q.isError) {
    return <Text variant="error">{errorMessage(q.error, t)}</Text>;
  }
  const d = q.data;
  const result = outcome(d.status, d.failed_count);
  const fraction = progressFraction(d.processed_rows, d.total_rows);
  return (
    <View style={styles.card}>
      <Text variant="label">{d.original_filename}</Text>
      {result === 'running' ? (
        <Text variant="muted">
          {t('imports.running')}
          {fraction !== null
            ? ` · ${t('imports.rows', {
                done: formatNumber(d.processed_rows ?? 0, lang),
                total: formatNumber(d.total_rows ?? 0, lang),
              })}`
            : ''}
        </Text>
      ) : result === 'failed' ? (
        <Text variant="error">{t('imports.failed')}</Text>
      ) : result === 'success' ? (
        <Text>
          {t('imports.success', {
            count: formatNumber(d.imported_count ?? 0, lang),
          })}
        </Text>
      ) : (
        <Text>
          {t('imports.partial', {
            ok: formatNumber(d.imported_count ?? 0, lang),
            failed: formatNumber(d.failed_count ?? 0, lang),
          })}
        </Text>
      )}
      {(d.errors ?? []).map((e, i) => (
        <Text key={i} variant="muted">
          {t('imports.rowError', {
            row: formatNumber(e.row, lang),
            sku: e.sku ? ` (${e.sku})` : '',
          })}
          : {e.message}
        </Text>
      ))}
    </View>
  );
}

export function ImportScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const start = useStartImport();
  const recent = useImports();
  const [activeId, setActiveId] = useState<number | null>(null);

  const choose = () =>
    start.mutate(undefined, {
      onSuccess: job => {
        if (job) {
          setActiveId(job.id);
        }
      },
    });

  const message =
    start.error instanceof CsvTooLargeError
      ? t('imports.tooLarge')
      : start.error
      ? errorMessage(start.error, t)
      : null;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('imports.title')} onBack={onBack} />
      <Text variant="muted">{t('imports.hint')}</Text>
      <Button
        title={activeId === null ? t('imports.choose') : t('imports.another')}
        loading={start.isPending}
        onPress={choose}
      />
      {start.progress !== null ? (
        <Text variant="muted">
          {t('imports.uploading', {
            percent: formatNumber(`${Math.round(start.progress * 100)}%`, lang),
          })}
        </Text>
      ) : null}
      {message ? <Text variant="error">{message}</Text> : null}
      {activeId !== null ? <ImportResult id={activeId} /> : null}

      <Text variant="label">{t('imports.recent')}</Text>
      {recent.isPending ? (
        <Skeleton height={48} />
      ) : recent.data && recent.data.length > 0 ? (
        recent.data.map(d => (
          <View key={d.id} style={styles.card}>
            <Text variant="label">{d.original_filename}</Text>
            <Text variant="muted">
              {d.status} · {formatDateTime(d.created_at, lang)}
              {d.imported_count !== null
                ? ` · ${formatNumber(d.imported_count, lang)}`
                : ''}
              {d.failed_count ? ` / ${formatNumber(d.failed_count, lang)}` : ''}
            </Text>
          </View>
        ))
      ) : (
        <Text variant="muted">{t('imports.none')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.xs,
  },
});
