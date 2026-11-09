import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { Theme } from '../../api/schemas/storefront';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ImageTooLargeError } from '../../media/prepare';
import { useSession } from '../../store/session';
import { absoluteUrl } from '../products/imageUrl';
import { Button, Field, Skeleton, Text } from '../../ui';
import { colors, radius, spacing, cardStyle, shadow } from '../../ui/theme';
import { useAppearance, useAppearanceMutations, useThemes } from './hooks';
import { normalizeHex, readableOn } from './color';
import { ScreenHeader } from '../../ui/ScreenHeader';

function Palette({ theme }: { theme: Theme }) {
  const p = theme.preview;
  return (
    <View
      style={styles.palette}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.header, { backgroundColor: p.header }]}>
        <View style={[styles.dot, { backgroundColor: p.accent }]} />
        <Text style={{ color: p.headerText }}>Aa</Text>
      </View>
      <View style={styles.tiles}>
        {p.tiles.map((c, i) => (
          <View key={i} style={[styles.tile, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

export function AppearanceScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const themes = useThemes(true);
  const appearance = useAppearance(true);
  const m = useAppearanceMutations();
  const [accent, setAccent] = useState<string | null>(null);
  const [accentError, setAccentError] = useState<string | null>(null);

  const a = appearance.data;
  const accentText = accent ?? a?.theme_accent_color ?? '';
  const err = m.update.error ?? m.logo.error ?? m.removeLogo.error;
  const message = !err
    ? null
    : err instanceof ImageTooLargeError
    ? t('images.tooLarge')
    : err instanceof ApiError
    ? err.fieldErrors.logo?.[0] ??
      err.fieldErrors.theme?.[0] ??
      errorMessage(err, t)
    : t('images.failed');

  const applyAccent = () => {
    setAccentError(null);
    const hex = normalizeHex(accentText);
    if (!hex) {
      setAccentError(t('appearance.accentInvalid'));
      return;
    }
    m.update.mutate(
      { theme_accent_color: hex },
      {
        onSuccess: () => setAccent(null),
        onError: e =>
          e instanceof ApiError &&
          setAccentError(e.fieldErrors.theme_accent_color?.[0] ?? null),
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={t('appearance.title')} onBack={onBack} />

      {appearance.isPending || themes.isPending ? (
        <>
          <Skeleton height={100} />
          <Skeleton height={100} />
        </>
      ) : appearance.isError || themes.isError || !a || !themes.data ? (
        <>
          <Text variant="error">
            {errorMessage(appearance.error ?? themes.error, t)}
          </Text>
          <Button
            title={t('common.retry')}
            onPress={() => {
              void appearance.refetch();
              void themes.refetch();
            }}
          />
        </>
      ) : (
        <>
          <Text variant="label">{t('appearance.theme')}</Text>
          {themes.data.map(th => (
            <View
              key={th.slug}
              style={[styles.card, th.is_current && styles.cardOn]}
            >
              <Palette theme={th} />
              <Text variant="label">{th.label}</Text>
              <Text variant="muted">{th.blurb}</Text>
              <Text variant="muted">
                {th.is_current ? t('appearance.current') : ''}
                {th.is_current && th.is_category_default ? ' · ' : ''}
                {th.is_category_default ? t('appearance.categoryDefault') : ''}
              </Text>
              {!th.is_current ? (
                <Button
                  title={t('appearance.theme') + ': ' + th.label}
                  kind="secondary"
                  disabled={m.update.isPending}
                  onPress={() => m.update.mutate({ theme: th.slug })}
                />
              ) : null}
            </View>
          ))}
          {a.theme !== null ? (
            <Button
              title={t('appearance.useDefault')}
              kind="secondary"
              disabled={m.update.isPending}
              onPress={() => m.update.mutate({ theme: null })}
            />
          ) : null}

          <Text variant="label">{t('appearance.accent')}</Text>
          <View style={styles.row}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: normalizeHex(accentText) ?? colors.surface },
              ]}
            >
              <Text style={{ color: readableOn(accentText) }}>Aa</Text>
            </View>
            <View style={styles.flex}>
              <Field
                label={t('appearance.accent')}
                value={accentText}
                onChangeText={setAccent}
                autoCapitalize="characters"
                autoCorrect={false}
                error={accentError ?? undefined}
              />
            </View>
          </View>
          <Text variant="muted">{t('appearance.accentHint')}</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                title={t('appearance.applyAccent')}
                loading={m.update.isPending}
                onPress={applyAccent}
              />
            </View>
            {a.theme_accent_color ? (
              <View style={styles.flex}>
                <Button
                  title={t('appearance.resetAccent')}
                  kind="secondary"
                  disabled={m.update.isPending}
                  onPress={() => {
                    setAccent(null);
                    m.update.mutate({ theme_accent_color: null });
                  }}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.switch}>
            <Text style={styles.flex}>{t('appearance.categoryTiles')}</Text>
            <Switch
              value={a.show_category_tiles}
              disabled={m.update.isPending}
              onValueChange={v => m.update.mutate({ show_category_tiles: v })}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('appearance.highlight')}</Text>
            <Switch
              value={a.show_theme_highlight_section}
              disabled={m.update.isPending}
              onValueChange={v =>
                m.update.mutate({ show_theme_highlight_section: v })
              }
              trackColor={{ true: colors.primary }}
            />
          </View>

          <Text variant="label">{t('appearance.logo')}</Text>
          {a.logo_url ? (
            <Image
              source={{ uri: absoluteUrl(a.logo_url, apiBase) }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <Text variant="muted">{t('appearance.noLogo')}</Text>
          )}
          {m.progress !== null ? (
            <Text variant="muted">
              {t('images.uploading', {
                percent: formatNumber(`${Math.round(m.progress * 100)}%`, lang),
              })}
            </Text>
          ) : null}
          <Text variant="muted">{t('appearance.logoNote')}</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                title={
                  a.logo_url
                    ? t('appearance.replaceLogo')
                    : t('appearance.addLogo')
                }
                kind="secondary"
                disabled={m.logo.isPending}
                onPress={() => m.logo.mutate('library')}
              />
            </View>
            <View style={styles.flex}>
              <Button
                title={t('images.camera')}
                kind="secondary"
                disabled={m.logo.isPending}
                onPress={() => m.logo.mutate('camera')}
              />
            </View>
          </View>
          {a.logo_url ? (
            <Button
              title={t('appearance.removeLogo')}
              kind="secondary"
              disabled={m.removeLogo.isPending}
              onPress={() => m.removeLogo.mutate()}
            />
          ) : null}
          {message ? <Text variant="error">{message}</Text> : null}
        </>
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
  cardOn: { borderColor: colors.primary, borderWidth: 2.5 },
  palette: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  tiles: { flexDirection: 'row', height: 28 },
  tile: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  flex: { flex: 1 },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadow.card,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  logo: {
    width: '100%',
    height: 90,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
});
