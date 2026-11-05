import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { StaffMember } from '../../api/schemas/settings';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { contactLabel } from '../auth/contact';
import { useMe } from '../auth/useMe';
import { Button, Choice, Field, Skeleton, Text } from '../../ui';
import { colors, radius, spacing, cardStyle } from '../../ui/theme';
import { useStaff, useStaffMutations } from './hooks';
import {
  CreateStaffForm,
  makeCreateStaffSchema,
  makeEditStaffSchema,
  toCreateStaffPayload,
  toEditStaffPayload,
  willSignOut,
} from './staffForm';

/** A plan-limit refusal is a prompt to look at plans, not a form error. */
function UpgradePrompt({ onUpgrade }: { onUpgrade: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.prompt}>
      <Text style={styles.promptText}>{t('staff.limit')}</Text>
      <Button title={t('staff.seePlans')} onPress={onUpgrade} />
    </View>
  );
}

function StaffForm({
  member,
  onDone,
  onBack,
  onUpgrade,
}: {
  member: StaffMember | null;
  onDone: () => void;
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const m = useStaffMutations();
  const schema = useMemo(
    () => (member ? makeEditStaffSchema(t) : makeCreateStaffSchema(t)),
    [member, t],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [limit, setLimit] = useState(false);
  const { control, handleSubmit, setError, watch, formState } =
    useForm<CreateStaffForm>({
      resolver: zodResolver(schema) as never,
      defaultValues: {
        name: member?.name ?? '',
        email: member?.email ?? '',
        role: member?.role ?? 'staff',
        password: '',
        password_confirmation: '',
      },
    });
  const password = watch('password');

  const submit = handleSubmit(async v => {
    setFormError(null);
    setLimit(false);
    try {
      if (member) {
        await m.update.mutateAsync({
          id: member.id,
          body: toEditStaffPayload(v),
        });
      } else {
        await m.create.mutateAsync(toCreateStaffPayload(v));
      }
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'plan_gate') {
        setLimit(true);
      } else if (
        e instanceof ApiError &&
        e.kind === 'validation' &&
        Object.keys(e.fieldErrors).length > 0
      ) {
        for (const [name, messages] of Object.entries(e.fieldErrors)) {
          if (name in v) {
            setError(name as keyof CreateStaffForm, { message: messages[0] });
          }
        }
      } else {
        setFormError(errorMessage(e, t));
      }
    }
  });

  const text = (
    name: 'name' | 'email' | 'password' | 'password_confirmation',
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
      <Text variant="title">{member ? t('staff.edit') : t('staff.add')}</Text>
      {limit ? <UpgradePrompt onUpgrade={onUpgrade} /> : null}
      {text('name', t('staff.name'))}
      {text('email', t('login.email'), {
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}
      <Text variant="label">{t('staff.role')}</Text>
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <View style={styles.group}>
            {(['staff', 'owner'] as const).map(r => (
              <Choice
                key={r}
                label={t(`staff.${r}`)}
                selected={field.value === r}
                onPress={() => field.onChange(r)}
              >
                <Text>{t(`staff.${r}`)}</Text>
              </Choice>
            ))}
            <Text variant="muted">{t('staff.ownerNote')}</Text>
          </View>
        )}
      />
      {text('password', member ? t('staff.newPassword') : t('staff.password'), {
        secureTextEntry: true,
        autoCapitalize: 'none',
        autoComplete: 'off',
      })}
      {text('password_confirmation', t('staff.confirmPassword'), {
        secureTextEntry: true,
        autoCapitalize: 'none',
        autoComplete: 'off',
      })}
      {member && willSignOut({ password }) ? (
        <Text variant="muted">{t('staff.signsOut')}</Text>
      ) : null}
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('staff.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
    </ScrollView>
  );
}

export function StaffScreen({
  onBack,
  onUpgrade,
}: {
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const staff = useStaff();
  const me = useMe();
  const m = useStaffMutations();
  const [editing, setEditing] = useState<StaffMember | 'new' | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const myId = me.data?.user.id;

  if (editing) {
    return (
      <StaffForm
        member={editing === 'new' ? null : editing}
        onDone={() => setEditing(null)}
        onBack={() => setEditing(null)}
        onUpgrade={onUpgrade}
      />
    );
  }
  const d = staff.data;
  const removeError = m.remove.error;
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('staff.title')}</Text>
      {staff.isPending ? (
        <Skeleton height={90} />
      ) : staff.isError || !d ? (
        <>
          <Text variant="error">{errorMessage(staff.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void staff.refetch()}
          />
        </>
      ) : (
        <>
          <Text variant="muted">
            {d.max_staff_accounts === null
              ? t('staff.seatsUnlimited', {
                  used: formatNumber(d.data.length, lang),
                })
              : t('staff.seats', {
                  used: formatNumber(d.data.length, lang),
                  max: formatNumber(d.max_staff_accounts, lang),
                })}
          </Text>
          {d.can_add_staff_account ? (
            <Button title={t('staff.add')} onPress={() => setEditing('new')} />
          ) : (
            <UpgradePrompt onUpgrade={onUpgrade} />
          )}
          {d.data.map(s => (
            <View key={s.id} style={styles.card}>
              <Text variant="label">
                {s.name} {s.id === myId ? t('staff.you') : ''}
              </Text>
              <Text variant="muted">
                {contactLabel(s)} · {t(`staff.${s.role}`)}
              </Text>
              <Button
                title={t('staff.edit')}
                kind="secondary"
                onPress={() => setEditing(s)}
              />
              {s.id !== myId ? (
                confirmId === s.id ? (
                  <>
                    <Text>{t('staff.confirmRemove', { name: s.name })}</Text>
                    <Button
                      title={t('staff.yesRemove')}
                      loading={m.remove.isPending}
                      onPress={() =>
                        m.remove.mutate(s.id, {
                          onSuccess: () => setConfirmId(null),
                        })
                      }
                    />
                    <Button
                      title={t('common.cancel')}
                      kind="secondary"
                      onPress={() => setConfirmId(null)}
                    />
                  </>
                ) : (
                  <Button
                    title={t('staff.remove')}
                    kind="secondary"
                    onPress={() => setConfirmId(s.id)}
                  />
                )
              ) : null}
            </View>
          ))}
          {removeError ? (
            <Text variant="error">{errorMessage(removeError, t)}</Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  group: { gap: spacing.sm },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  prompt: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  promptText: { color: colors.warningText },
});
