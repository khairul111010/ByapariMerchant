import React, { useCallback, useRef } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CodeScanner } from 'react-native-vision-camera-barcode-scanner';
import { useCameraPermission } from 'react-native-vision-camera';
import { Button, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';

/** Camera that reports each distinct scanned value once, then ignores repeats for a moment. */
export function SkuScanner({
  onSku,
  onClose,
  hint,
}: {
  onSku: (sku: string) => void;
  onClose: () => void;
  hint?: string;
}) {
  const { t } = useTranslation();
  const { hasPermission, canRequestPermission, requestPermission } =
    useCameraPermission();
  const last = useRef<{ sku: string; at: number } | null>(null);

  const onScanned = useCallback(
    (barcodes: Array<{ rawValue?: string }>) => {
      const sku = barcodes.find(b => b.rawValue)?.rawValue?.trim();
      if (!sku) {
        return;
      }
      const now = Date.now();
      if (
        last.current &&
        last.current.sku === sku &&
        now - last.current.at < 2500
      ) {
        return;
      }
      last.current = { sku, at: now };
      onSku(sku);
    },
    [onSku],
  );

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>
          {canRequestPermission
            ? t('inventory.scanPermission')
            : t('inventory.scanSettings')}
        </Text>
        <Button
          title={t('inventory.scanAllow')}
          onPress={() =>
            canRequestPermission
              ? void requestPermission()
              : void Linking.openSettings()
          }
        />
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
        onBarcodeScanned={b => onScanned(b)}
        onError={() => undefined}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>{hint ?? t('inventory.scanHint')}</Text>
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
