import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { offlineQueue } from '../../offline/instance';
import { useOrderJobs } from '../../offline/useQueue';
import { Button, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';

/** Shows queued / sending / failed state for this order's saved offline changes. */
export function QueueNotice({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const jobs = useOrderJobs(orderId);
  if (jobs.length === 0) {
    return null;
  }
  return (
    <View style={styles.wrap}>
      {jobs.map((j) => (
        <View key={j.id} style={styles.item}>
          <Text style={styles.text}>
            {j.state === 'failed'
              ? t('queue.failed', { reason: t(`errors.codes.${j.error}`, { defaultValue: t(`errors.${j.error}`, { defaultValue: j.error }) }) })
              : j.state === 'syncing'
                ? t('queue.syncing')
                : t('queue.queued')}
          </Text>
          {j.state === 'failed' ? (
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button title={t('queue.retry')} kind="secondary" onPress={() => { offlineQueue.retry(j.id); void offlineQueue.flush(); }} />
              </View>
              <View style={styles.flex}>
                <Button title={t('queue.discard')} kind="secondary" onPress={() => offlineQueue.discard(j.id)} />
              </View>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  item: { gap: spacing.sm },
  text: { color: colors.warningText },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
