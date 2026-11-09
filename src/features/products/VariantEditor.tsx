import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Variant } from '../../api/schemas/catalogue';
import { Button, Field, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { useVariantMutations } from './hooks';
import {
  makeNewVariantSchema,
  makeVariantSchema,
  NewVariantForm,
  toNewVariantPayload,
  toVariantUpdatePayload,
} from './productForm';
import { useHardwareBack } from '../../ui/useHardwareBack';

type Mode = { kind: 'add' } | { kind: 'edit'; variant: Variant };

/** Add or edit one variant. Editing never touches stock (use the stock tools); it sends stock_quantity_was. */
export function VariantEditor({
  productId,
  mode,
  onClose,
}: {
  productId: number;
  mode: Mode;
  onClose: () => void;
}) {
  useHardwareBack(onClose);
  const { t } = useTranslation();
  const m = useVariantMutations(productId);
  const [formError, setFormError] = useState<string | null>(null);
  const editing = mode.kind === 'edit' ? mode.variant : null;
  const schema = useMemo(
    () => (editing ? makeVariantSchema(t) : makeNewVariantSchema(t)),
    [editing, t],
  );
  const { control, handleSubmit, setError, formState } =
    useForm<NewVariantForm>({
      resolver: zodResolver(schema) as never,
      defaultValues: {
        sku: editing?.sku ?? '',
        name: editing?.name ?? '',
        price: editing?.price ?? '',
        compare_at_price: editing?.compare_at_price ?? '',
        low_stock_threshold: editing?.low_stock_threshold?.toString() ?? '',
        stock_quantity: '0',
      },
    });

  const submit = handleSubmit(async v => {
    setFormError(null);
    try {
      if (editing) {
        await m.update.mutateAsync({
          id: editing.id,
          body: toVariantUpdatePayload(v, editing),
        });
      } else {
        await m.create.mutateAsync(toNewVariantPayload(v));
      }
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [field, messages] of Object.entries(e.fieldErrors)) {
          if (field in v) {
            setError(field as keyof NewVariantForm, { message: messages[0] });
            shown = true;
          }
        }
        if (shown) {
          return;
        }
      }
      setFormError(errorMessage(e, t));
    }
  });

  const field = (name: keyof NewVariantForm, label: string, extra?: object) => (
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
    <View style={styles.wrap}>
      {field('sku', t('products.form.sku'), { autoCapitalize: 'characters' })}
      {field('name', t('products.form.variantName'))}
      {field('price', t('products.form.price'), {
        keyboardType: 'decimal-pad',
      })}
      {field('compare_at_price', t('products.form.compareAt'), {
        keyboardType: 'decimal-pad',
      })}
      {field('low_stock_threshold', t('products.form.lowThreshold'), {
        keyboardType: 'number-pad',
      })}
      {!editing
        ? field('stock_quantity', t('products.form.stock'), {
            keyboardType: 'number-pad',
          })
        : null}
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('products.form.saveVariant')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
      <Button title={t('common.cancel')} kind="secondary" onPress={onClose} />
    </View>
  );
}

export function DeleteVariant({
  productId,
  variant,
}: {
  productId: number;
  variant: Variant;
}) {
  const { t } = useTranslation();
  const { remove } = useVariantMutations(productId);
  const [confirming, setConfirming] = useState(false);
  return (
    <View style={styles.wrap}>
      {confirming ? (
        <>
          <Text>{t('products.form.confirmDelete')}</Text>
          <Button
            title={t('products.form.yesDelete')}
            loading={remove.isPending}
            onPress={() =>
              remove.mutate(variant.id, {
                onSuccess: () => setConfirming(false),
              })
            }
          />
          <Button
            title={t('common.cancel')}
            kind="secondary"
            onPress={() => setConfirming(false)}
          />
        </>
      ) : (
        <Button
          title={t('products.form.deleteVariant')}
          kind="secondary"
          onPress={() => setConfirming(true)}
        />
      )}
      {remove.error ? (
        <Text variant="error">{errorMessage(remove.error, t)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.sm } });
