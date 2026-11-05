import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { REVIEW_STATUSES } from '../../api/schemas/selling';
import { formatDateTime, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle, shadow } from '../../ui/theme';
import { ReviewStatus } from './api';
import { useDeleteReview, useModerateReview, useReviews } from './hooks';

export function ReviewsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [status, setStatus] = useState<ReviewStatus>('pending');
  const reviews = useReviews(status);
  const moderate = useModerateReview();
  const del = useDeleteReview();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const rows = useMemo(
    () => reviews.data?.pages.flatMap(p => p.data) ?? [],
    [reviews.data],
  );
  const first = reviews.data?.pages[0];
  const busy = moderate.isPending || del.isPending;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('reviews.title')}</Text>
      <Text variant="muted">{t('reviews.note')}</Text>
      {first && !first.reviews_enabled ? (
        <Text variant="muted">{t('reviews.off')}</Text>
      ) : null}
      <View style={styles.chips}>
        {REVIEW_STATUSES.map(s => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityState={{ selected: status === s }}
            onPress={() => setStatus(s)}
            style={[styles.chip, status === s && styles.chipOn]}
          >
            <Text
              variant="label"
              style={status === s ? styles.chipTextOn : undefined}
            >
              {t(`reviews.${s}`)}
              {first ? ` (${formatNumber(first.counts[s], lang)})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      {reviews.isPending ? (
        <Skeleton height={110} />
      ) : reviews.isError && rows.length === 0 ? (
        <>
          <Text variant="error">{errorMessage(reviews.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void reviews.refetch()}
          />
        </>
      ) : rows.length === 0 ? (
        <Text variant="muted">{t('reviews.empty')}</Text>
      ) : (
        rows.map(r => (
          <View key={r.id} style={styles.card}>
            <Text variant="label">
              {r.product?.name ?? ''} ·{' '}
              {t('reviews.rating', { n: formatNumber(r.rating, lang) })}
            </Text>
            {r.comment ? <Text>{r.comment}</Text> : null}
            <Text variant="muted">
              {r.customer_name}
              {r.is_verified_buyer ? ` · ${t('reviews.verified')}` : ''} ·{' '}
              {formatDateTime(r.created_at, lang)}
            </Text>
            {r.status !== 'approved' ? (
              <Button
                title={t('reviews.approve')}
                disabled={busy}
                onPress={() =>
                  moderate.mutate({ id: r.id, status: 'approved' })
                }
              />
            ) : null}
            {r.status === 'pending' ? (
              <Button
                title={t('reviews.reject')}
                kind="secondary"
                disabled={busy}
                onPress={() =>
                  moderate.mutate({ id: r.id, status: 'rejected' })
                }
              />
            ) : null}
            {r.status === 'approved' ? (
              <Button
                title={t('reviews.unpublish')}
                kind="secondary"
                disabled={busy}
                onPress={() =>
                  moderate.mutate({ id: r.id, status: 'rejected' })
                }
              />
            ) : null}
            {confirmId === r.id ? (
              <>
                <Text>{t('reviews.confirmDelete')}</Text>
                <Button
                  title={t('reviews.yesDelete')}
                  loading={del.isPending}
                  onPress={() =>
                    del.mutate(r.id, { onSuccess: () => setConfirmId(null) })
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
                title={t('reviews.delete')}
                kind="secondary"
                disabled={busy}
                onPress={() => setConfirmId(r.id)}
              />
            )}
          </View>
        ))
      )}
      {moderate.error || del.error ? (
        <Text variant="error">
          {errorMessage(moderate.error ?? del.error, t)}
        </Text>
      ) : null}
      {reviews.hasNextPage ? (
        <Button
          title={t('common.retry')}
          kind="secondary"
          loading={reviews.isFetchingNextPage}
          onPress={() => void reviews.fetchNextPage()}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
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
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
