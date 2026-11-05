import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Courier } from '../../api/schemas/settings';
import { Button, Field, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { SecretField } from '../settings/SecretField';
import { clearPatch, isEmptyPatch } from '../settings/patch';
import { useCouriers, useSaveCouriers } from './hooks';
import { courierPatch } from './patch';

const fieldLabel = (t: TFunction, key: string) =>
  t(`couriers.field.${key}`, { defaultValue: key });

function CourierCard({
  courier,
  onUpgrade,
}: {
  courier: Courier;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveCouriers();
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(courier.fields).map(([k, v]) => [k, v ?? '']),
    ),
  );
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [gate, setGate] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const disabled = !courier.plan_allows;

  const run = (patch: Record<string, unknown>) => {
    setNote(null);
    setGate(false);
    setFieldErrors({});
    if (isEmptyPatch(patch)) {
      setNote({ text: t('settings.nothingToSave'), ok: true });
      return;
    }
    save.mutate(patch, {
      onSuccess: () => {
        setSecrets({});
        setNote({ text: t('settings.saved'), ok: true });
      },
      onError: e => {
        if (e instanceof ApiError && e.kind === 'plan_gate') {
          setGate(true);
        } else if (
          e instanceof ApiError &&
          e.kind === 'validation' &&
          Object.keys(e.fieldErrors).length > 0
        ) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(e.fieldErrors).map(([k, v]) => [k, v[0]]),
            ),
          );
        } else {
          setNote({ text: errorMessage(e, t), ok: false });
        }
      },
    });
  };

  return (
    <View style={[styles.card, disabled && styles.dim]}>
      <Text variant="label">
        {courier.label} ·{' '}
        {disabled
          ? t('couriers.notInPlan')
          : courier.configured
          ? `✓ ${t('couriers.configured')}`
          : t('couriers.notConfigured')}
      </Text>
      {disabled ? (
        <>
          <Text variant="muted">{t('couriers.upgradeHint')}</Text>
          <Button title={t('staff.seePlans')} onPress={onUpgrade} />
        </>
      ) : (
        <>
          {Object.keys(courier.fields).map(key => (
            <Field
              key={key}
              label={fieldLabel(t, key)}
              value={fields[key] ?? ''}
              onChangeText={v => setFields(f => ({ ...f, [key]: v }))}
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors[key]}
            />
          ))}
          {Object.entries(courier.secrets_set).map(([key, isSet]) => (
            <SecretField
              key={key}
              label={fieldLabel(t, key)}
              isSet={isSet}
              value={secrets[key] ?? ''}
              onChangeText={v => setSecrets(s => ({ ...s, [key]: v }))}
              clearing={save.isPending}
              onClear={() => run(clearPatch(key))}
            />
          ))}
          <Text variant="muted">{t('couriers.secretNote')}</Text>
          {gate ? (
            <>
              <Text variant="error">{t('couriers.notInPlan')}</Text>
              <Button title={t('staff.seePlans')} onPress={onUpgrade} />
            </>
          ) : null}
          {note ? (
            <Text variant={note.ok ? 'body' : 'error'}>{note.text}</Text>
          ) : null}
          <Button
            title={t('couriers.save', { name: courier.label })}
            loading={save.isPending}
            onPress={() => run(courierPatch(courier, fields, secrets))}
          />
        </>
      )}
    </View>
  );
}

export function CouriersScreen({
  onBack,
  onUpgrade,
}: {
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const couriers = useCouriers();
  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('couriers.title')}</Text>
      {couriers.isPending ? (
        <Skeleton height={120} />
      ) : couriers.isError ? (
        <>
          <Text variant="error">{errorMessage(couriers.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void couriers.refetch()}
          />
        </>
      ) : (
        // Drivers the plan does not allow are shown disabled with an upgrade prompt, never hidden.
        couriers.data.map(c => (
          <CourierCard key={c.driver} courier={c} onUpgrade={onUpgrade} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dim: { opacity: 0.75 },
});
