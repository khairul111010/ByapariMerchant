import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLock } from '../../store/lock';
import { useSession } from '../../store/session';
import { Button, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { authenticate } from './biometric';

export function LockScreen() {
  const { t } = useTranslation();
  const unlock = useLock((s) => s.unlock);
  const signOut = useSession((s) => s.signOut);
  const [failed, setFailed] = useState(false);

  const prompt = useCallback(async () => {
    setFailed(false);
    if (await authenticate(t('lock.prompt'))) {
      unlock();
    } else {
      setFailed(true);
    }
  }, [t, unlock]);

  useEffect(() => {
    void prompt();
  }, [prompt]);

  return (
    <View style={styles.wrap}>
      <Text variant="title">{t('lock.title')}</Text>
      {failed ? <Text variant="error">{t('lock.failed')}</Text> : null}
      <Button title={t('lock.unlock')} onPress={prompt} />
      {/* Escape hatch if the fingerprint was removed or the sensor is broken. */}
      <Button title={t('common.signOut')} kind="secondary" onPress={() => void signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.md },
});
