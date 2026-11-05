import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import {
  HomeSection,
  HomeSectionDetail,
  SECTION_SOURCES,
} from '../../api/schemas/storefront';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useDebounced } from '../pos/hooks';
import { useCategories, useProducts } from '../products/hooks';
import { Button, Choice, Field, Skeleton, Text } from '../../ui';
import {
  colors,
  font,
  radius,
  spacing,
  touch,
  cardStyle,
  shadow,
} from '../../ui/theme';
import {
  usePickMutations,
  usePreview,
  useSection,
  useSectionMutations,
  useSections,
} from './hooks';
import {
  makeSectionSchema,
  SectionForm,
  toSectionPayload,
} from './sectionForm';

const sourceLabel = (t: (k: string) => string, key: string) =>
  t(`sections.source_.${key}`);

function SectionFormView({
  section,
  onDone,
  onBack,
}: {
  section: HomeSection | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const m = useSectionMutations();
  const categories = useCategories();
  const schema = useMemo(() => makeSectionSchema(t), [t]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { control, handleSubmit, setError, watch, formState } =
    useForm<SectionForm>({
      resolver: zodResolver(schema) as never,
      defaultValues: {
        title: section?.title ?? '',
        title_bn: section?.title_bn ?? '',
        subtitle: section?.subtitle ?? '',
        source: (SECTION_SOURCES as readonly string[]).includes(
          section?.source ?? '',
        )
          ? (section?.source as SectionForm['source'])
          : 'manual',
        category_id: section?.category?.id ?? null,
        product_limit: String(section?.product_limit ?? 8),
        is_active: section?.is_active ?? true,
      },
    });
  const source = watch('source');

  const submit = handleSubmit(async v => {
    setFormError(null);
    try {
      const body = toSectionPayload(v);
      if (section) {
        await m.update.mutateAsync({ id: section.id, body });
      } else {
        await m.create.mutateAsync(body);
      }
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [name, messages] of Object.entries(e.fieldErrors)) {
          if (name in v) {
            setError(name as keyof SectionForm, { message: messages[0] });
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
    name: 'title' | 'title_bn' | 'subtitle' | 'product_limit',
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
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">
        {section ? t('sections.edit') : t('sections.add')}
      </Text>
      {text('title', t('sections.sectionTitle'))}
      {text('title_bn', t('sections.titleBn'))}
      {text('subtitle', t('sections.subtitle'))}
      <Text variant="label">{t('sections.source')}</Text>
      <Controller
        control={control}
        name="source"
        render={({ field }) => (
          <View style={styles.group}>
            {SECTION_SOURCES.map(s => (
              <Choice
                key={s}
                label={sourceLabel(t, s)}
                selected={field.value === s}
                onPress={() => field.onChange(s)}
              >
                <Text>{sourceLabel(t, s)}</Text>
              </Choice>
            ))}
          </View>
        )}
      />
      {source === 'category' ? (
        <Controller
          control={control}
          name="category_id"
          render={({ field, fieldState }) => (
            <View style={styles.group}>
              <Text variant="label">{t('sections.category')}</Text>
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
              {fieldState.error ? (
                <Text variant="error">{fieldState.error.message}</Text>
              ) : null}
            </View>
          )}
        />
      ) : null}
      {text('product_limit', t('sections.limit'), {
        keyboardType: 'number-pad',
      })}
      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('sections.active')}</Text>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ true: colors.primary }}
            />
          </View>
        )}
      />
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('sections.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
      {section ? (
        confirming ? (
          <>
            <Text>{t('sections.confirmDelete')}</Text>
            <Button
              title={t('sections.yesDelete')}
              loading={m.remove.isPending}
              onPress={() => m.remove.mutate(section.id, { onSuccess: onDone })}
            />
            <Button
              title={t('common.cancel')}
              kind="secondary"
              onPress={() => setConfirming(false)}
            />
            {m.remove.error ? (
              <Text variant="error">{errorMessage(m.remove.error, t)}</Text>
            ) : null}
          </>
        ) : (
          <Button
            title={t('sections.delete')}
            kind="secondary"
            onPress={() => setConfirming(true)}
          />
        )
      ) : null}
    </ScrollView>
  );
}

function PickSearch({
  onPick,
  picked,
}: {
  onPick: (id: number) => void;
  picked: Set<number>;
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const results = useProducts({ q: useDebounced(q.trim()) || undefined });
  const rows = (results.data?.pages[0]?.data ?? [])
    .filter(p => !picked.has(p.id))
    .slice(0, 6);
  return (
    <View style={styles.group}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t('sections.searchProduct')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('sections.searchProduct')}
        style={styles.search}
      />
      {rows.map(p => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          onPress={() => onPick(p.id)}
          style={styles.card}
        >
          <Text>{p.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SectionDetail({
  id,
  maxPicks,
  onBack,
  onEdit,
}: {
  id: number;
  maxPicks: number;
  onBack: () => void;
  onEdit: (s: HomeSectionDetail) => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const section = useSection(id);
  const preview = usePreview(id);
  const picks = usePickMutations(id);
  const back = (
    <Button title={t('common.back')} kind="secondary" onPress={onBack} />
  );

  if (section.isPending) {
    return (
      <View style={styles.wrap}>
        {back}
        <Skeleton height={120} />
      </View>
    );
  }
  if (section.isError) {
    return (
      <View style={styles.wrap}>
        {back}
        <Text variant="error">{errorMessage(section.error, t)}</Text>
        <Button
          title={t('common.retry')}
          onPress={() => void section.refetch()}
        />
      </View>
    );
  }
  const s = section.data;
  const manual = s.source === 'manual';
  const full = s.picks.length >= maxPicks;
  const err = picks.add.error ?? picks.remove.error ?? picks.move.error;
  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      {back}
      <Text variant="title">{s.title}</Text>
      <Text variant="muted">
        {sourceLabel(t, s.source)}
        {s.category ? ` · ${s.category.name}` : ''}
        {s.is_active ? '' : ` · ${t('sections.hidden')}`}
      </Text>
      <Button
        title={t('sections.edit')}
        kind="secondary"
        onPress={() => onEdit(s)}
      />

      {manual ? (
        <>
          <Text variant="label">
            {t('sections.picks')} ({formatNumber(s.picks.length, lang)}/
            {formatNumber(maxPicks, lang)})
          </Text>
          {s.picks.map((p, i) => (
            <View key={p.id} style={styles.card}>
              <Text variant="label">{p.product.name}</Text>
              {p.product.default_variant ? (
                <Text variant="muted">
                  {formatMoney(p.product.default_variant.price, lang)}
                </Text>
              ) : null}
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Button
                    title="▲"
                    kind="secondary"
                    disabled={i === 0 || picks.move.isPending}
                    onPress={() =>
                      picks.move.mutate({ pickId: p.id, dir: 'up' })
                    }
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title="▼"
                    kind="secondary"
                    disabled={i === s.picks.length - 1 || picks.move.isPending}
                    onPress={() =>
                      picks.move.mutate({ pickId: p.id, dir: 'down' })
                    }
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title={t('sections.remove')}
                    kind="secondary"
                    disabled={picks.remove.isPending}
                    onPress={() => picks.remove.mutate(p.id)}
                  />
                </View>
              </View>
            </View>
          ))}
          <Text variant="label">{t('sections.addProduct')}</Text>
          {full ? (
            <Text variant="muted">
              {t('sections.full', { max: formatNumber(maxPicks, lang) })}
            </Text>
          ) : (
            <PickSearch
              picked={new Set(s.picks.map(p => p.product.id))}
              onPick={pid => picks.add.mutate(pid)}
            />
          )}
        </>
      ) : null}
      {err ? <Text variant="error">{errorMessage(err, t)}</Text> : null}

      <Text variant="label">{t('sections.preview')}</Text>
      {preview.isPending ? (
        <Skeleton height={60} />
      ) : preview.isError ? (
        <Text variant="error">{errorMessage(preview.error, t)}</Text>
      ) : preview.data.length === 0 ? (
        <Text variant="muted">{t('sections.previewEmpty')}</Text>
      ) : (
        preview.data.map(p => (
          <Text key={p.id}>
            {p.name}
            {p.default_variant
              ? ` · ${formatMoney(p.default_variant.price, lang)}`
              : ''}
          </Text>
        ))
      )}
    </ScrollView>
  );
}

type V =
  | { name: 'list' }
  | { name: 'detail'; id: number }
  | { name: 'form'; section: HomeSection | null };

export function SectionsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const sections = useSections();
  const m = useSectionMutations();
  const [view, setView] = useState<V>({ name: 'list' });
  const maxPicks = sections.data?.limits.max_picks ?? 24;

  if (view.name === 'form') {
    return (
      <SectionFormView
        section={view.section}
        onDone={() => setView({ name: 'list' })}
        onBack={() => setView({ name: 'list' })}
      />
    );
  }
  if (view.name === 'detail') {
    return (
      <SectionDetail
        id={view.id}
        maxPicks={maxPicks}
        onBack={() => setView({ name: 'list' })}
        onEdit={s => setView({ name: 'form', section: s })}
      />
    );
  }
  const list = sections.data?.data ?? [];
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('sections.title')}</Text>
      {sections.data ? (
        <Text variant="muted">
          {t('sections.note', {
            max: formatNumber(sections.data.limits.max_visible, lang),
          })}
        </Text>
      ) : null}
      <Button
        title={t('sections.add')}
        onPress={() => setView({ name: 'form', section: null })}
      />
      {sections.isPending ? (
        <Skeleton height={90} />
      ) : sections.isError ? (
        <>
          <Text variant="error">{errorMessage(sections.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void sections.refetch()}
          />
        </>
      ) : list.length === 0 ? (
        <>
          <Text variant="muted">{t('sections.empty')}</Text>
          <Text variant="muted">
            {t('sections.featuredHint', {
              count: formatNumber(sections.data.featured_products_count, lang),
            })}
          </Text>
        </>
      ) : (
        list.map((s, i) => (
          <View key={s.id} style={[styles.card, !s.is_active && styles.dim]}>
            <Text variant="label">
              {s.title}
              {s.is_active ? '' : ` · ${t('sections.hidden')}`}
            </Text>
            <Text variant="muted">
              {sourceLabel(t, s.source)}
              {s.category ? ` · ${s.category.name}` : ''}
              {s.source === 'manual'
                ? ` · ${t('sections.picksCount', {
                    count: formatNumber(s.picks_count, lang),
                  })}`
                : ''}
            </Text>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button
                  title="▲"
                  kind="secondary"
                  disabled={i === 0 || m.move.isPending}
                  onPress={() => m.move.mutate({ id: s.id, dir: 'up' })}
                />
              </View>
              <View style={styles.flex}>
                <Button
                  title="▼"
                  kind="secondary"
                  disabled={i === list.length - 1 || m.move.isPending}
                  onPress={() => m.move.mutate({ id: s.id, dir: 'down' })}
                />
              </View>
              <View style={styles.flex}>
                <Button
                  title={t('sections.open')}
                  kind="secondary"
                  onPress={() => setView({ name: 'detail', id: s.id })}
                />
              </View>
            </View>
          </View>
        ))
      )}
      {m.move.error ? (
        <Text variant="error">{errorMessage(m.move.error, t)}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  group: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  search: {
    minHeight: touch,
    backgroundColor: colors.card,
    ...shadow.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.text,
  },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dim: { opacity: 0.6 },
});
