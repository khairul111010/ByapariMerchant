import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ProductDetail } from '../../api/schemas/catalogue';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ImageTooLargeError } from '../../media/prepare';
import { useSession } from '../../store/session';
import { Button, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';
import { useAddProductImage, useProductImageActions } from './hooks';
import { absoluteUrl } from './imageUrl';

export function ProductImages({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const add = useAddProductImage(product.id);
  const { remove, reorder } = useProductImageActions(product.id);
  const [choosing, setChoosing] = useState(false);
  const busy = add.isPending || remove.isPending || reorder.isPending;
  const ids = product.images.map(i => i.id);

  const error = add.error ?? remove.error ?? reorder.error;
  const message = !error
    ? null
    : error instanceof ImageTooLargeError
    ? t('images.tooLarge')
    : error instanceof Error && error.message && !('kind' in error)
    ? t('images.failed')
    : errorMessage(error, t);

  return (
    <View style={styles.wrap}>
      <Text variant="label">{t('images.title')}</Text>
      {product.images.map((img, index) => (
        <View key={img.id} style={styles.item}>
          <Image
            source={{ uri: absoluteUrl(img.card, apiBase) }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.actions}>
            {index === 0 ? (
              <Text variant="label">{t('images.main')}</Text>
            ) : (
              <Button
                title={t('images.makeMain')}
                kind="secondary"
                disabled={busy}
                onPress={() =>
                  reorder.mutate([img.id, ...ids.filter(i => i !== img.id)])
                }
              />
            )}
            <Button
              title={t('images.remove')}
              kind="secondary"
              disabled={busy}
              onPress={() => remove.mutate(img.id)}
            />
          </View>
        </View>
      ))}
      {add.progress !== null ? (
        <Text variant="muted">
          {t('images.uploading', {
            percent: formatNumber(`${Math.round(add.progress * 100)}%`, lang),
          })}
        </Text>
      ) : null}
      {choosing ? (
        <>
          <Button
            title={t('images.gallery')}
            kind="secondary"
            disabled={busy}
            onPress={() => {
              setChoosing(false);
              add.mutate('library');
            }}
          />
          <Button
            title={t('images.camera')}
            kind="secondary"
            disabled={busy}
            onPress={() => {
              setChoosing(false);
              add.mutate('camera');
            }}
          />
          <Button
            title={t('common.cancel')}
            kind="secondary"
            onPress={() => setChoosing(false)}
          />
        </>
      ) : (
        <Button
          title={t('images.add')}
          loading={add.isPending}
          disabled={busy}
          onPress={() => setChoosing(true)}
        />
      )}
      {message ? <Text variant="error">{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  item: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  actions: { flex: 1, gap: spacing.sm },
});
