import React, { useCallback, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CodeScanner } from 'react-native-vision-camera-barcode-scanner';
import { useCameraPermission } from 'react-native-vision-camera';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Button, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';
import { lookupSku } from './api';
import { useHardwareBack } from '../../ui/useHardwareBack';

/** A scan is just an exact SKU lookup (there is no barcode column). Opens the product on a hit. */
export function ScanScreen({
  onClose,
  onFound,
}: {
  onClose: () => void;
  onFound: (productId: number) => void;
}) {
  useHardwareBack(onClose);
  const { t } = useTranslation();
  const { hasPermission, canRequestPermission, requestPermission } =
    useCameraPermission();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lastSku = useRef<string | null>(null);

  const onScanned = useCallback(
    async (barcodes: Array<{ rawValue?: string }>) => {
      const sku = barcodes.find(b => b.rawValue)?.rawValue?.trim();
      // Ignore repeats of the same code while a lookup or a message is showing.
      if (!sku || busy || sku === lastSku.current) {
        return;
      }
      lastSku.current = sku;
      setBusy(true);
      setMessage(null);
      try {
        const res = await lookupSku(sku);
        onFound(res.product.id);
      } catch (e) {
        setMessage(
          e instanceof ApiError && e.code === 'sku_not_found'
            ? t('inventory.scanNotFound', { sku })
            : errorMessage(e, t),
        );
        // Allow scanning the same code again after a moment.
        setTimeout(() => (lastSku.current = null), 2000);
      } finally {
        setBusy(false);
      }
    },
    [busy, onFound, t],
  );

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text variant="title">{t('inventory.scanTitle')}</Text>
        <Text>
          {canRequestPermission
            ? t('inventory.scanPermission')
            : t('inventory.scanSettings')}
        </Text>
        {canRequestPermission ? (
          <Button
            title={t('inventory.scanAllow')}
            onPress={() => void requestPermission()}
          />
        ) : (
          <Button
            title={t('inventory.scanAllow')}
            onPress={() => void Linking.openSettings()}
          />
        )}
        <Button
          title={t('inventory.close')}
          kind="secondary"
          onPress={onClose}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CodeScanner
        style={StyleSheet.absoluteFill}
        isActive
        barcodeFormats={['all-formats']}
        onBarcodeScanned={b => void onScanned(b)}
        onError={() => setMessage(t('errors.server'))}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>
          {busy ? t('inventory.scanning') : message ?? t('inventory.scanHint')}
        </Text>
        <Button
          title={t('inventory.close')}
          kind="secondary"
          onPress={onClose}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  hint: { color: '#fff', textAlign: 'center' },
});
