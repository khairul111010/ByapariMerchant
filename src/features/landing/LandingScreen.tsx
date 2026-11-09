import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { LandingPageDetail, LandingPageRow } from '../../api/schemas/selling';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ImageTooLargeError } from '../../media/prepare';
import { useSession } from '../../store/session';
import { useDebounced } from '../pos/hooks';
import { useProducts } from '../products/hooks';
import { absoluteUrl } from '../products/imageUrl';
import { Button, Field, Skeleton, Text } from '../../ui';
import {
  colors,
  font,
  radius,
  spacing,
  touch,
  cardStyle,
  shadow,
} from '../../ui/theme';
import { landingFields, LandingForm, makeLandingSchema } from './landingForm';
import {
  useDeleteLandingPage,
  useLandingImages,
  useLandingPage,
  useLandingPages,
  useSaveLandingPage,
  useTestimonials,
} from './hooks';
import { ScreenHeader } from '../../ui/ScreenHeader';

function ProductPicker({
  value,
  onPick,
}: {
  value: { id: number; name: string } | null;
  onPick: (p: { id: number; name: string }) => void;
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const results = useProducts({ q: useDebounced(q.trim()) || undefined });
  const rows = (results.data?.pages[0]?.data ?? []).slice(0, 8);
  return (
    <View style={styles.group}>
      <Text variant="label">{t('landing.product')}</Text>
      {value ? (
        <Text>{value.name}</Text>
      ) : (
        <Text variant="muted">{t('landing.pickProduct')}</Text>
      )}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t('landing.searchProduct')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('landing.searchProduct')}
        style={styles.search}
      />
      {rows.map(p => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          onPress={() => onPick({ id: p.id, name: p.name })}
          style={[styles.card, value?.id === p.id && styles.cardOn]}
        >
          <Text>{p.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Editor({
  page,
  onSaved,
  onBack,
}: {
  page: LandingPageDetail | null;
  onSaved: (id: number) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveLandingPage(page?.id ?? null);
  const schema = useMemo(() => makeLandingSchema(t), [t]);
  const [product, setProduct] = useState<{ id: number; name: string } | null>(
    page?.product ?? null,
  );
  const [productError, setProductError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<LandingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: page?.title ?? '',
      headline: page?.headline ?? '',
      subheadline: page?.subheadline ?? '',
      description: page?.description ?? '',
      why_choose_us: page?.why_choose_us ?? '',
      is_active: page?.is_active ?? true,
    },
  });

  const submit = handleSubmit(async v => {
    setFormError(null);
    if (!product) {
      setProductError(t('landing.productRequired'));
      return;
    }
    setProductError(null);
    try {
      const saved = await save.mutateAsync(landingFields(v, product.id));
      onSaved(saved.id);
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [name, messages] of Object.entries(e.fieldErrors)) {
          if (name in v) {
            setError(name as keyof LandingForm, { message: messages[0] });
            shown = true;
          } else if (name === 'product_id') {
            setProductError(messages[0]);
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

  const field = (
    name:
      | 'title'
      | 'headline'
      | 'subheadline'
      | 'description'
      | 'why_choose_us',
    label: string,
    extra?: object,
  ) => (
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
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={page ? t('landing.edit') : t('landing.add')} onBack={onBack} />
      <ProductPicker value={product} onPick={setProduct} />
      {productError ? <Text variant="error">{productError}</Text> : null}
      {field('title', t('landing.pageTitle'))}
      {field('headline', t('landing.headline'))}
      {field('subheadline', t('landing.subheadline'))}
      {field('description', t('landing.description'), { multiline: true })}
      {field('why_choose_us', t('landing.why'), { multiline: true })}
      <Controller
        control={control}
        name="is_active"
        render={({ field: f }) => (
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('landing.active')}</Text>
            <Switch
              value={f.value}
              onValueChange={f.onChange}
              trackColor={{ true: colors.primary }}
            />
          </View>
        )}
      />
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('landing.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
    </ScrollView>
  );
}

function Detail({
  id,
  onBack,
  onEdit,
}: {
  id: number;
  onBack: () => void;
  onEdit: (p: LandingPageDetail) => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const page = useLandingPage(id);
  const images = useLandingImages(id);
  const testimonials = useTestimonials(id);
  const del = useDeleteLandingPage(id);
  const [author, setAuthor] = useState('');
  const [quote, setQuote] = useState('');
  const [confirming, setConfirming] = useState(false);

  if (page.isPending) {
    return (
      <View style={styles.wrap}>
        <ScreenHeader onBack={onBack} />
        <Skeleton height={120} />
      </View>
    );
  }
  if (page.isError) {
    return (
      <View style={styles.wrap}>
        <ScreenHeader onBack={onBack} />
        <Text variant="error">{errorMessage(page.error, t)}</Text>
        <Button title={t('common.retry')} onPress={() => void page.refetch()} />
      </View>
    );
  }
  const p = page.data;
  const imgError = images.add.error ?? images.remove.error;
  const imgMessage = !imgError
    ? null
    : imgError instanceof ImageTooLargeError
    ? t('images.tooLarge')
    : 'kind' in imgError
    ? errorMessage(imgError, t)
    : t('images.failed');
  const tErr = testimonials.add.error ?? testimonials.remove.error;
  const authorErr =
    tErr instanceof ApiError ? tErr.fieldErrors.author_name?.[0] : undefined;
  const quoteErr =
    tErr instanceof ApiError ? tErr.fieldErrors.quote?.[0] : undefined;

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={p.title} onBack={onBack} />
      <Text variant="muted">
        {p.is_active ? t('landing.live') : t('landing.off')} ·{' '}
        {p.product?.name ?? ''}
      </Text>
      <Text>{p.headline}</Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={t('landing.open')}
            kind="secondary"
            onPress={() => void Linking.openURL(p.url)}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title={t('landing.share')}
            kind="secondary"
            onPress={() =>
              void Share.open({ url: p.url, failOnCancel: false }).catch(
                () => undefined,
              )
            }
          />
        </View>
      </View>
      <Button title={t('landing.edit')} onPress={() => onEdit(p)} />

      <Text variant="label">{t('landing.photos')}</Text>
      {p.images.map(img => (
        <View key={img.id} style={styles.row}>
          <Image
            source={{ uri: absoluteUrl(img.card, apiBase) }}
            style={styles.image}
          />
          <View style={styles.flex}>
            <Button
              title={t('landing.remove')}
              kind="secondary"
              disabled={images.remove.isPending}
              onPress={() => images.remove.mutate(img.id)}
            />
          </View>
        </View>
      ))}
      {images.progress !== null ? (
        <Text variant="muted">
          {t('images.uploading', {
            percent: formatNumber(
              `${Math.round(images.progress * 100)}%`,
              lang,
            ),
          })}
        </Text>
      ) : null}
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={t('images.gallery')}
            kind="secondary"
            disabled={images.add.isPending}
            onPress={() => images.add.mutate('library')}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title={t('images.camera')}
            kind="secondary"
            disabled={images.add.isPending}
            onPress={() => images.add.mutate('camera')}
          />
        </View>
      </View>
      {imgMessage ? <Text variant="error">{imgMessage}</Text> : null}

      <Text variant="label">{t('landing.testimonials')}</Text>
      <Text variant="muted">{t('landing.testimonialNote')}</Text>
      {p.testimonials.map(x => (
        <View key={x.id} style={styles.card}>
          <Text>“{x.quote}”</Text>
          <Text variant="muted">— {x.author_name}</Text>
          <Button
            title={t('landing.remove')}
            kind="secondary"
            disabled={testimonials.remove.isPending}
            onPress={() => testimonials.remove.mutate(x.id)}
          />
        </View>
      ))}
      <Field
        label={t('landing.author')}
        value={author}
        onChangeText={setAuthor}
        error={authorErr}
      />
      <Field
        label={t('landing.quote')}
        value={quote}
        onChangeText={setQuote}
        multiline
        error={quoteErr}
      />
      {tErr && !authorErr && !quoteErr ? (
        <Text variant="error">{errorMessage(tErr, t)}</Text>
      ) : null}
      <Button
        title={t('landing.addTestimonial')}
        kind="secondary"
        loading={testimonials.add.isPending}
        onPress={() =>
          testimonials.add.mutate(
            { author_name: author.trim(), quote: quote.trim() },
            {
              onSuccess: () => {
                setAuthor('');
                setQuote('');
              },
            },
          )
        }
      />

      {confirming ? (
        <>
          <Text>{t('landing.confirmDelete')}</Text>
          <Button
            title={t('landing.yesDelete')}
            loading={del.isPending}
            onPress={() => del.mutate(undefined, { onSuccess: onBack })}
          />
          <Button
            title={t('common.cancel')}
            kind="secondary"
            onPress={() => setConfirming(false)}
          />
          {del.error ? (
            <Text variant="error">{errorMessage(del.error, t)}</Text>
          ) : null}
        </>
      ) : (
        <Button
          title={t('landing.delete')}
          kind="secondary"
          onPress={() => setConfirming(true)}
        />
      )}
    </ScrollView>
  );
}

type View_ =
  | { name: 'list' }
  | { name: 'detail'; id: number }
  | { name: 'create' }
  | { name: 'edit'; page: LandingPageDetail };

export function LandingScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [view, setView] = useState<View_>({ name: 'list' });
  const list = useLandingPages();
  const rows: LandingPageRow[] = useMemo(
    () => list.data?.pages.flatMap(p => p.data) ?? [],
    [list.data],
  );

  if (view.name === 'detail') {
    return (
      <Detail
        id={view.id}
        onBack={() => setView({ name: 'list' })}
        onEdit={page => setView({ name: 'edit', page })}
      />
    );
  }
  if (view.name === 'create') {
    return (
      <Editor
        page={null}
        onBack={() => setView({ name: 'list' })}
        onSaved={id => setView({ name: 'detail', id })}
      />
    );
  }
  if (view.name === 'edit') {
    return (
      <Editor
        page={view.page}
        onBack={() => setView({ name: 'detail', id: view.page.id })}
        onSaved={id => setView({ name: 'detail', id })}
      />
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('landing.title')} onBack={onBack} />
      <Button
        title={t('landing.add')}
        onPress={() => setView({ name: 'create' })}
      />
      {list.isPending ? (
        <Skeleton height={72} />
      ) : list.isError && rows.length === 0 ? (
        <>
          <Text variant="error">{errorMessage(list.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void list.refetch()}
          />
        </>
      ) : rows.length === 0 ? (
        <Text variant="muted">{t('landing.empty')}</Text>
      ) : (
        rows.map(r => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            onPress={() => setView({ name: 'detail', id: r.id })}
            style={styles.card}
          >
            <Text variant="label">{r.title}</Text>
            <Text variant="muted">
              {r.is_active ? t('landing.live') : t('landing.off')} ·{' '}
              {r.product?.name ?? ''}
            </Text>
          </Pressable>
        ))
      )}
      {list.hasNextPage ? (
        <Button
          title={t('common.retry')}
          kind="secondary"
          loading={list.isFetchingNextPage}
          onPress={() => void list.fetchNextPage()}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  group: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
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
    gap: spacing.xs,
    minHeight: 48,
  },
  cardOn: {
    borderColor: colors.primary,
    borderWidth: 2.5,
    backgroundColor: colors.surface,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
