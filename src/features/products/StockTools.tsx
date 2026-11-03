import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Variant } from '../../api/schemas/catalogue';
import { formatDateTime, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Field, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { useSetStock, useStockHistory } from './hooks';

const WHOLE = /^\d+$/;

export function StockTools({
  productId,
  v,
}: {
  productId: number;
  v: Variant;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const setStock = useSetStock(productId);
  const [counting, setCounting] = useState(false);
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const history = useStockHistory(productId, v.id, showHistory);

  const err = setStock.error;
  // 409 stock_changed: show the real count the server sent; the next save uses the refreshed count.
  const changedTo =
    err instanceof ApiError && err.code === 'stock_changed'
      ? Number(err.extra.stock_quantity)
      : null;

  const save = () => {
    setFieldError(null);
    if (!WHOLE.test(qty.trim())) {
      setFieldError(t('errors.validation'));
      return;
    }
    setStock.mutate(
      {
        variantId: v.id,
        quantity: Number(qty),
        expected: v.stock_quantity,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCounting(false);
          setQty('');
          setNote('');
        },
      },
    );
  };

  return (
    <View style={styles.wrap}>
      {!counting ? (
        <Button
          title={t('inventory.setCount')}
          kind="secondary"
          onPress={() => setCounting(true)}
        />
      ) : (
        <View style={styles.wrap}>
          <Field
            label={t('inventory.countLabel')}
            value={qty}
            onChangeText={setQty}
            keyboardType="number-pad"
            error={fieldError ?? undefined}
          />
          <Field
            label={t('inventory.countNote')}
            value={note}
            onChangeText={setNote}
          />
          {changedTo !== null && Number.isFinite(changedTo) ? (
            <Text variant="error">
              {t('inventory.stockChangedNow', {
                count: formatNumber(changedTo, lang),
              })}
            </Text>
          ) : err ? (
            <Text variant="error">{errorMessage(err, t)}</Text>
          ) : null}
          <Button
            title={t('inventory.countSave')}
            loading={setStock.isPending}
            onPress={save}
          />
          <Button
            title={t('common.cancel')}
            kind="secondary"
            onPress={() => {
              setCounting(false);
              setStock.reset();
            }}
          />
        </View>
      )}
      <Button
        title={
          showHistory ? t('inventory.historyHide') : t('inventory.history')
        }
        kind="secondary"
        onPress={() => setShowHistory(!showHistory)}
      />
      {showHistory ? (
        history.isPending ? (
          <Text variant="muted">{t('common.loading')}</Text>
        ) : history.isError ? (
          <Text variant="error">{errorMessage(history.error, t)}</Text>
        ) : history.data.data.length === 0 ? (
          <Text variant="muted">{t('inventory.historyEmpty')}</Text>
        ) : (
          history.data.data.map(h => (
            <View key={h.id} style={styles.entry}>
              <Text variant="label">
                {h.delta > 0 ? '+' : ''}
                {formatNumber(h.delta, lang)} →{' '}
                {formatNumber(h.balance_after, lang)} · {h.reason_label}
              </Text>
              <Text variant="muted">
                {formatDateTime(h.created_at, lang)}
                {h.user ? ` · ${h.user}` : ''}
                {h.note ? ` · ${h.note}` : ''}
              </Text>
            </View>
          ))
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  entry: { gap: 2 },
});
