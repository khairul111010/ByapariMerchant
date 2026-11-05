import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { DeliveryZone } from '../../api/schemas/selling';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { Button, Field, Skeleton, Text } from '../../ui';
import { colors, spacing, cardStyle } from '../../ui/theme';
import { useUpdateZone, useZones } from './hooks';
import { makeZoneSchema, toZonePayload, ZoneForm } from './zoneForm';

function ZoneEditor({
  zone,
  onClose,
}: {
  zone: DeliveryZone;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const update = useUpdateZone();
  const schema = useMemo(() => makeZoneSchema(t), [t]);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<ZoneForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      base_charge: zone.base_charge.replace(/\.00$/, ''),
      base_weight_grams: String(zone.base_weight_grams),
      per_kg_charge: zone.per_kg_charge.replace(/\.00$/, ''),
      estimated_delivery_note: zone.estimated_delivery_note ?? '',
    },
  });

  const submit = handleSubmit(async v => {
    setFormError(null);
    try {
      await update.mutateAsync({ zone: zone.zone, body: toZonePayload(v) });
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [name, messages] of Object.entries(e.fieldErrors)) {
          if (name in v) {
            setError(name as keyof ZoneForm, { message: messages[0] });
            shown = true;
          }
        }
        if (shown) {
          return;
        }
      }
      // A 403 here means a staff token reached an owner-only action; errorMessage covers it.
      setFormError(errorMessage(e, t));
    }
  });

  const field = (name: keyof ZoneForm, label: string, extra?: object) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f, fieldState }) => (
        <Field
          label={label}
          value={f.value}
          onChangeText={f.onChange}
          error={fieldState.error?.message}
          {...extra}
        />
      )}
    />
  );
  return (
    <View style={styles.form}>
      {field('base_charge', t('zones.baseCharge'), {
        keyboardType: 'decimal-pad',
      })}
      {field('base_weight_grams', t('zones.baseWeight'), {
        keyboardType: 'number-pad',
      })}
      {field('per_kg_charge', t('zones.perKg'), {
        keyboardType: 'decimal-pad',
      })}
      {field('estimated_delivery_note', t('zones.note'))}
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('zones.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
      <Button title={t('common.cancel')} kind="secondary" onPress={onClose} />
    </View>
  );
}

export function ZonesScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { isOwner } = useRole();
  const zones = useZones();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('zones.title')}</Text>
      {!isOwner ? <Text variant="muted">{t('zones.ownerOnly')}</Text> : null}
      {zones.isPending ? (
        <Skeleton height={100} />
      ) : zones.isError ? (
        <>
          <Text variant="error">{errorMessage(zones.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void zones.refetch()}
          />
        </>
      ) : (
        zones.data.map(z => (
          <View key={z.zone} style={styles.card}>
            <Text variant="label">
              {t(`zones.${z.zone}`, { defaultValue: z.zone })}
            </Text>
            {editing === z.zone ? (
              <ZoneEditor zone={z} onClose={() => setEditing(null)} />
            ) : (
              <>
                <Text>
                  {t('zones.summary', {
                    charge: formatMoney(z.base_charge, lang),
                    grams: formatNumber(z.base_weight_grams, lang),
                    perkg: formatMoney(z.per_kg_charge, lang),
                  })}
                </Text>
                {z.estimated_delivery_note ? (
                  <Text variant="muted">{z.estimated_delivery_note}</Text>
                ) : null}
                {isOwner ? (
                  <Button
                    title={t('zones.edit')}
                    kind="secondary"
                    onPress={() => setEditing(z.zone)}
                  />
                ) : null}
              </>
            )}
          </View>
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
  form: { gap: spacing.sm },
});
