import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ImageTooLargeError, PreparedImage } from '../../media/prepare';
import { useSession } from '../../store/session';
import { absoluteUrl } from '../products/imageUrl';
import { useCategories } from '../products/hooks';
import { Button, Choice, Field, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';
import {
  chooseCategoryImage,
  useDeleteCategory,
  useSaveCategory,
} from './hooks';
import { parentOptions } from './tree';

export function CategoryFormScreen({
  id,
  onBack,
  onDone,
}: {
  id: number | null;
  onBack: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const apiBase = useSession(s => s.apiBaseUrl);
  const categories = useCategories();
  const list = categories.data ?? [];
  const editing = id === null ? null : list.find(c => c.id === id) ?? null;
  const save = useSaveCategory(id);
  const del = useDeleteCategory();

  const [name, setName] = useState(editing?.name ?? '');
  const [parentId, setParentId] = useState<number | null>(
    editing?.parent_id ?? null,
  );
  const [description, setDescription] = useState(editing?.description ?? '');
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const parents = parentOptions(list, id);
  const currentImage =
    !removeImage && !image ? absoluteUrl(editing?.image, apiBase) : undefined;

  const pick = async (source: 'library' | 'camera') => {
    setMessage(null);
    try {
      const picked = await chooseCategoryImage(source);
      if (picked) {
        setImage(picked);
        setRemoveImage(false);
      }
    } catch (e) {
      setMessage(
        e instanceof ImageTooLargeError
          ? t('images.tooLarge')
          : t('images.failed'),
      );
    }
  };

  const submit = () => {
    setNameError(null);
    setParentError(null);
    setMessage(null);
    if (!name.trim()) {
      setNameError(t('categories.nameRequired'));
      return;
    }
    save.mutate(
      {
        values: { name, parentId, description, isActive },
        image: image ?? undefined,
        removeImage,
      },
      {
        onSuccess: onDone,
        onError: e => {
          const nameMsg =
            e instanceof ApiError ? e.fieldErrors.name?.[0] : undefined;
          const parentMsg =
            e instanceof ApiError ? e.fieldErrors.parent_id?.[0] : undefined;
          if (nameMsg || parentMsg) {
            // Show the server's own message next to the field it is about.
            setNameError(nameMsg ?? null);
            setParentError(parentMsg ?? null);
          } else {
            setMessage(errorMessage(e, t));
          }
        },
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">
        {editing ? t('categories.edit') : t('categories.add')}
      </Text>
      <Field
        label={t('categories.name')}
        value={name}
        onChangeText={setName}
        error={nameError ?? undefined}
      />
      <Field
        label={t('categories.description')}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text variant="label">{t('categories.parent')}</Text>
      <Choice
        label={t('categories.noParent')}
        selected={parentId === null}
        onPress={() => setParentId(null)}
      >
        <Text>{t('categories.noParent')}</Text>
      </Choice>
      {parents.map(p => (
        <Choice
          key={p.id}
          label={p.name}
          selected={parentId === p.id}
          onPress={() => setParentId(p.id)}
        >
          <Text>{p.name}</Text>
        </Choice>
      ))}
      {parentError ? <Text variant="error">{parentError}</Text> : null}

      <View style={styles.switch}>
        <Text style={styles.flex}>{t('categories.active')}</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <Text variant="label">{t('categories.image')}</Text>
      {image ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : currentImage ? (
        <Image source={{ uri: currentImage }} style={styles.image} />
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
            title={t('images.gallery')}
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
      {editing?.image && !removeImage && !image ? (
        <Button
          title={t('categories.removeImage')}
          kind="secondary"
          onPress={() => setRemoveImage(true)}
        />
      ) : null}

      {message ? <Text variant="error">{message}</Text> : null}
      <Button
        title={t('categories.save')}
        onPress={submit}
        loading={save.isPending}
      />

      {editing ? (
        confirming ? (
          <>
            <Text>{t('categories.confirmDelete', { name: editing.name })}</Text>
            <Button
              title={t('categories.yesDelete')}
              loading={del.isPending}
              onPress={() => del.mutate(editing.id, { onSuccess: onDone })}
            />
            <Button
              title={t('common.cancel')}
              kind="secondary"
              onPress={() => {
                setConfirming(false);
                del.reset();
              }}
            />
            {del.error ? (
              <Text variant="error">{errorMessage(del.error, t)}</Text>
            ) : null}
          </>
        ) : (
          <Button
            title={t('categories.delete')}
            kind="secondary"
            onPress={() => setConfirming(true)}
          />
        )
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
  image: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
