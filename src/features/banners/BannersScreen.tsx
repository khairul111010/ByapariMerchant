import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Banner } from '../../api/schemas/storefront';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ImageTooLargeError, PreparedImage } from '../../media/prepare';
import { useSession } from '../../store/session';
import { absoluteUrl } from '../products/imageUrl';
import { Button, Field, Skeleton, Text } from '../../ui';
import { colors, radius, spacing, cardStyle } from '../../ui/theme';
import {
  chooseBannerImage,
  useBanners,
  useBannerActions,
  useSaveBanner,
} from './hooks';
import { isSafeBannerLink, moveId } from './logic';
import { ScreenHeader } from '../../ui/ScreenHeader';

function BannerForm({
  banner,
  onDone,
  onBack,
}: {
  banner: Banner | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const save = useSaveBanner(banner?.id ?? null);
  const actions = useBannerActions();
  const [title, setTitle] = useState(banner?.title ?? '');
  const [link, setLink] = useState(banner?.link_url ?? '');
  const [active, setActive] = useState(banner?.is_active ?? true);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [errors, setErrors] = useState<{
    link?: string;
    image?: string;
    message?: string;
  }>({});
  const [confirming, setConfirming] = useState(false);

  const pick = async (source: 'library' | 'camera') => {
    setErrors(e => ({ ...e, image: undefined, message: undefined }));
    try {
      const picked = await chooseBannerImage(source);
      if (picked) {
        setImage(picked);
      }
    } catch (e) {
      setErrors(x => ({
        ...x,
        message:
          e instanceof ImageTooLargeError
            ? t('images.tooLarge')
            : t('images.failed'),
      }));
    }
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!isSafeBannerLink(link)) {
      next.link = t('banners.linkInvalid');
    }
    if (!banner && !image) {
      next.image = t('banners.imageRequired');
    }
    setErrors(next);
    if (next.link || next.image) {
      return;
    }
    save.mutate(
      { values: { title, linkUrl: link, isActive: active }, image },
      {
        onSuccess: onDone,
        onError: e => {
          if (e instanceof ApiError && e.kind === 'validation') {
            // The server's own words for link_url and image go on their fields.
            setErrors({
              link: e.fieldErrors.link_url?.[0],
              image: e.fieldErrors.image?.[0],
              message:
                e.fieldErrors.link_url || e.fieldErrors.image
                  ? undefined
                  : errorMessage(e, t),
            });
          } else {
            setErrors({ message: errorMessage(e, t) });
          }
        },
      },
    );
  };

  const preview = image ? image.uri : absoluteUrl(banner?.image, apiBase);
  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={banner ? t('banners.edit') : t('banners.add')} onBack={onBack} />
      <Text variant="label">{t('banners.image')}</Text>
      {preview ? (
        <Image
          source={{ uri: preview }}
          style={styles.preview}
          resizeMode="cover"
        />
      ) : null}
      {save.progress !== null ? (
        <Text variant="muted">
          {t('images.uploading', {
            percent: formatNumber(`${Math.round(save.progress * 100)}%`, lang),
          })}
        </Text>
      ) : null}
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={
              banner || image ? t('banners.replaceImage') : t('images.gallery')
            }
            kind="secondary"
            onPress={() => void pick('library')}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title={t('images.camera')}
            kind="secondary"
            onPress={() => void pick('camera')}
          />
        </View>
      </View>
      {errors.image ? <Text variant="error">{errors.image}</Text> : null}
      <Field
        label={t('banners.bannerTitle')}
        value={title}
        onChangeText={setTitle}
      />
      <Field
        label={t('banners.link')}
        value={link}
        onChangeText={setLink}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        error={errors.link}
      />
      <Text variant="muted">{t('banners.linkHint')}</Text>
      <View style={styles.switch}>
        <Text style={styles.flex}>{t('banners.active')}</Text>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ true: colors.primary }}
        />
      </View>
      {errors.message ? <Text variant="error">{errors.message}</Text> : null}
      <Button
        title={t('banners.save')}
        onPress={submit}
        loading={save.isPending}
      />
      {banner ? (
        confirming ? (
          <>
            <Text>{t('banners.confirmDelete')}</Text>
            <Button
              title={t('banners.yesDelete')}
              loading={actions.remove.isPending}
              onPress={() =>
                actions.remove.mutate(banner.id, { onSuccess: onDone })
              }
            />
            <Button
              title={t('common.cancel')}
              kind="secondary"
              onPress={() => setConfirming(false)}
            />
            {actions.remove.error ? (
              <Text variant="error">
                {errorMessage(actions.remove.error, t)}
              </Text>
            ) : null}
          </>
        ) : (
          <Button
            title={t('banners.delete')}
            kind="secondary"
            onPress={() => setConfirming(true)}
          />
        )
      ) : null}
    </ScrollView>
  );
}

export function BannersScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const apiBase = useSession(s => s.apiBaseUrl);
  const banners = useBanners();
  const actions = useBannerActions();
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const list = banners.data ?? [];
  const ids = list.map(b => b.id);

  if (editing) {
    return (
      <BannerForm
        banner={editing === 'new' ? null : editing}
        onDone={() => setEditing(null)}
        onBack={() => setEditing(null)}
      />
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('banners.title')} onBack={onBack} />
      <Button title={t('banners.add')} onPress={() => setEditing('new')} />
      {banners.isPending ? (
        <Skeleton height={140} />
      ) : banners.isError ? (
        <>
          <Text variant="error">{errorMessage(banners.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void banners.refetch()}
          />
        </>
      ) : list.length === 0 ? (
        <Text variant="muted">{t('banners.empty')}</Text>
      ) : (
        list.map(b => {
          const up = moveId(ids, b.id, 'up');
          const down = moveId(ids, b.id, 'down');
          return (
            <View key={b.id} style={[styles.card, !b.is_active && styles.dim]}>
              <Image
                source={{ uri: absoluteUrl(b.image, apiBase) }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <Text variant="label">
                {b.title ?? ''}
                {b.is_active ? '' : ` · ${t('banners.hidden')}`}
              </Text>
              {b.link_url ? <Text variant="muted">{b.link_url}</Text> : null}
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Button
                    title="▲"
                    kind="secondary"
                    disabled={!up || actions.reorder.isPending}
                    onPress={() => up && actions.reorder.mutate(up)}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title="▼"
                    kind="secondary"
                    disabled={!down || actions.reorder.isPending}
                    onPress={() => down && actions.reorder.mutate(down)}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title={b.is_active ? t('banners.hide') : t('banners.show')}
                    kind="secondary"
                    disabled={actions.toggle.isPending}
                    onPress={() =>
                      actions.toggle.mutate({ id: b.id, active: !b.is_active })
                    }
                  />
                </View>
              </View>
              <Button
                title={t('banners.edit')}
                kind="secondary"
                onPress={() => setEditing(b)}
              />
            </View>
          );
        })
      )}
      {actions.reorder.error || actions.toggle.error ? (
        <Text variant="error">
          {errorMessage(actions.reorder.error ?? actions.toggle.error, t)}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dim: { opacity: 0.6 },
  thumb: {
    width: '100%',
    height: 110,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
