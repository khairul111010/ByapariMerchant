import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { PRODUCT_STATUSES, ProductDetail } from '../../api/schemas/catalogue';
import { Block, blocksToHtml, htmlToBlocks } from '../../richtext/model';
import { RichTextEditor } from '../../richtext/RichTextEditor';
import { Button, Choice, Field, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';
import { useMe } from '../auth/useMe';
import {
  useCategories,
  useCreateProduct,
  useDescribeProduct,
  useUpdateProduct,
} from './hooks';
import {
  CreateForm,
  EditForm,
  makeCreateSchema,
  makeEditSchema,
  toCreatePayload,
  toUpdatePayload,
} from './productForm';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { ProductLimitSheet } from './ProductLimit';

type Props =
  | { mode: 'create'; onBack: () => void; onDone: (id: number) => void }
  | {
      mode: 'edit';
      product: ProductDetail;
      onBack: () => void;
      onDone: (id: number) => void;
    };

export function ProductFormScreen(props: Props) {
  const { t } = useTranslation();
  const editing = props.mode === 'edit' ? props.product : null;
  const categories = useCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct(editing?.id ?? 0);
  const [blocks, setBlocks] = useState<Block[]>(() =>
    htmlToBlocks(editing?.description),
  );
  const [formError, setFormError] = useState<string | null>(null);
  // `403 product_limit_reached`: an upgrade prompt, not a form error. undefined = not shown.
  const [limitMax, setLimitMax] = useState<number | null | undefined>(undefined);
  const aiConfigured = useMe().data?.store.ai_configured === true;
  const describe = useDescribeProduct();
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const writeWithAi = () => {
    setAiMessage(null);
    const { name, category_id } = getValues();
    if (!name.trim()) {
      setAiMessage(t('products.form.aiNeedsName'));
      return;
    }
    describe.mutate(
      { name: name.trim(), categoryId: category_id },
      {
        // Added below what is already there, so nothing the merchant wrote is lost.
        onSuccess: html => setBlocks(b => [...b, ...htmlToBlocks(html)]),
        onError: e => setAiMessage(errorMessage(e, t)),
      },
    );
  };

  const schema = useMemo(
    () => (editing ? makeEditSchema(t) : makeCreateSchema(t)),
    [editing, t],
  );
  const { control, handleSubmit, setError, formState, getValues } =
    useForm<CreateForm>({
      resolver: zodResolver(schema) as never,
      defaultValues: {
        name: editing?.name ?? '',
        status: editing?.status ?? 'draft',
        sku: '',
        price: '',
        compare_at_price: '',
        stock_quantity: '0',
        category_id: editing?.category?.id ?? null,
        brand: editing?.brand ?? '',
        track_inventory: editing?.track_inventory ?? true,
        is_featured: editing?.is_featured ?? false,
      },
    });

  const submit = handleSubmit(async values => {
    setFormError(null);
    const html = blocksToHtml(blocks);
    try {
      if (props.mode === 'edit') {
        await update.mutateAsync(toUpdatePayload(values as EditForm, html));
        props.onDone(props.product.id);
      } else {
        const created = await create.mutateAsync(toCreatePayload(values, html));
        props.onDone(created.id);
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'product_limit_reached') {
        const max = e.extra.max_products;
        setLimitMax(typeof max === 'number' ? max : null);
        return;
      }
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [field, messages] of Object.entries(e.fieldErrors)) {
          if (field in values) {
            setError(field as keyof CreateForm, { message: messages[0] });
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

  const text = (
    name:
      | 'name'
      | 'brand'
      | 'sku'
      | 'price'
      | 'compare_at_price'
      | 'stock_quantity',
    label: string,
    extra?: object,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          value={field.value}
          onChangeText={field.onChange}
          error={fieldState.error?.message}
          {...extra}
        />
      )}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={editing ? t('products.form.editProduct') : t('products.form.newProduct')} onBack={props.onBack} />
      {text('name', t('products.form.name'))}
      {!editing ? (
        <>
          {text('sku', t('products.form.sku'), {
            autoCapitalize: 'characters',
          })}
          {text('price', t('products.form.price'), {
            keyboardType: 'decimal-pad',
          })}
          {text('compare_at_price', t('products.form.compareAt'), {
            keyboardType: 'decimal-pad',
          })}
          {text('stock_quantity', t('products.form.stock'), {
            keyboardType: 'number-pad',
          })}
        </>
      ) : null}
      {text('brand', t('products.form.brand'))}

      <Text variant="label">{t('products.form.status')}</Text>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <View style={styles.group}>
            {PRODUCT_STATUSES.map(s => (
              <Choice
                key={s}
                label={t(`products.status.${s}`)}
                selected={field.value === s}
                onPress={() => field.onChange(s)}
              >
                <Text>{t(`products.status.${s}`)}</Text>
              </Choice>
            ))}
          </View>
        )}
      />

      <Text variant="label">{t('products.form.category')}</Text>
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <View style={styles.group}>
            <Choice
              label={t('products.uncategorised')}
              selected={field.value === null}
              onPress={() => field.onChange(null)}
            >
              <Text>{t('products.uncategorised')}</Text>
            </Choice>
            {(categories.data ?? []).map(c => (
              <Choice
                key={c.id}
                label={c.name}
                selected={field.value === c.id}
                onPress={() => field.onChange(c.id)}
              >
                <Text>{c.parent_id ? `— ${c.name}` : c.name}</Text>
              </Choice>
            ))}
          </View>
        )}
      />

      <Controller
        control={control}
        name="track_inventory"
        render={({ field }) => (
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('products.form.trackInventory')}</Text>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ true: colors.primary }}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="is_featured"
        render={({ field }) => (
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('products.form.featured')}</Text>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ true: colors.primary }}
            />
          </View>
        )}
      />

      <Text variant="label">{t('products.form.description')}</Text>
      {aiConfigured ? (
        <View style={styles.group}>
          <Button
            title={t('products.form.aiDescribe')}
            kind="secondary"
            loading={describe.isPending}
            onPress={writeWithAi}
          />
          <Text variant="muted">{t('products.form.aiNote')}</Text>
          {aiMessage ? <Text variant="error">{aiMessage}</Text> : null}
        </View>
      ) : null}
      <RichTextEditor value={blocks} onChange={setBlocks} />

      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('products.form.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
      <ProductLimitSheet
        visible={limitMax !== undefined}
        max={limitMax ?? null}
        onClose={() => setLimitMax(undefined)}
        onLeave={props.onBack}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  group: { gap: spacing.sm },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  flex: { flex: 1 },
});
