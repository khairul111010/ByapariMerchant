import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Button, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { useDeleteProduct } from './hooks';

/** Two-step delete. Needs a connection by design (deletes are never queued). */
export function DeleteProduct({
  id,
  name,
  onDeleted,
}: {
  id: number;
  name: string;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const del = useDeleteProduct(id);
  const [confirming, setConfirming] = useState(false);
  const offline = del.error instanceof ApiError && del.error.kind === 'network';

  return (
    <View style={styles.wrap}>
      {confirming ? (
        <>
          <Text>{t('products.form.confirmDeleteProduct', { name })}</Text>
          <Button
            title={t('products.form.yesDeleteProduct')}
            loading={del.isPending}
            onPress={() => del.mutate(undefined, { onSuccess: onDeleted })}
          />
          <Button
            title={t('common.cancel')}
            kind="secondary"
            disabled={del.isPending}
            onPress={() => {
              setConfirming(false);
              del.reset();
            }}
          />
        </>
      ) : (
        <Button
          title={t('products.form.deleteProduct')}
          kind="secondary"
          onPress={() => setConfirming(true)}
        />
      )}
      {del.error ? (
        <Text variant="error">
          {offline
            ? t('products.form.deleteNeedsConnection')
            : errorMessage(del.error, t)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.sm } });
