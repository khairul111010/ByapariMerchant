import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { OrderDetail } from '../../api/schemas/orders';
import { formatDateTime, formatMoney } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Choice, Field, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';
import { AdvanceMethod } from './api';
import {
  useAddAdvance,
  useBookCourier,
  useRefreshCourier,
  useRejectPayment,
  useVerifyPayment,
} from './hooks';

const card = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm } as const;

/** Decimal like "300" or "300.50"; the server still decides if it is allowed. */
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

export function PaymentSection({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const lang = useLang();
  const verify = useVerifyPayment(order.id);
  const reject = useRejectPayment(order.id);
  const p = order.payment;
  if (!p) {
    return null;
  }
  const pending = p.status === 'pending';
  const err = verify.error ?? reject.error;
  return (
    <View style={card}>
      <Text variant="label">{t('orders.paymentTitle')}</Text>
      <Text>
        {t(`orders.payment.${p.method}`, { defaultValue: p.method })} · {formatMoney(p.amount, lang)}
      </Text>
      {p.reference_number ? (
        <Text selectable>
          {t('orders.paymentRef')}: {p.reference_number}
        </Text>
      ) : null}
      <Text variant="muted">
        {pending ? t('orders.paymentPending') : t(`orders.paymentStatus.${p.status}`, { defaultValue: p.status })}
        {p.paid_at ? ` · ${formatDateTime(p.paid_at, lang)}` : ''}
      </Text>
      {pending ? (
        <>
          <Button title={t('orders.verify')} loading={verify.isPending} disabled={reject.isPending} onPress={() => verify.mutate()} />
          <Button title={t('orders.reject')} kind="secondary" loading={reject.isPending} disabled={verify.isPending} onPress={() => reject.mutate()} />
        </>
      ) : null}
      {err ? <Text variant="error">{errorMessage(err, t)}</Text> : null}
    </View>
  );
}

export function AdvanceSection({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const lang = useLang();
  const add = useAddAdvance(order.id);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<AdvanceMethod>('cash');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    setLocalError(null);
    if (!AMOUNT_RE.test(amount.trim()) || Number(amount) <= 0) {
      setLocalError(t('errors.validation'));
      return;
    }
    add.mutate(
      { method, amount: amount.trim(), reference_number: method === 'cash' ? undefined : ref.trim() || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount('');
          setRef('');
        },
      },
    );
  };

  // Server message for the amount field (e.g. exceeds the amount due) is shown verbatim.
  const amountError =
    add.error instanceof ApiError && add.error.kind === 'validation' ? add.error.fieldErrors.amount?.[0] : undefined;
  const otherError = add.error && !amountError ? errorMessage(add.error, t) : null;

  return (
    <View style={card}>
      <Text variant="label">{t('orders.advanceTitle')}</Text>
      {order.advance_payments.map((a) => (
        <Text key={a.id}>
          {t(`orders.advanceMethod.${a.method}`, { defaultValue: a.method })} · {formatMoney(a.amount, lang)}
          {a.reference_number ? ` · ${a.reference_number}` : ''}
        </Text>
      ))}
      {!open ? (
        <Button title={t('orders.advanceAdd')} kind="secondary" onPress={() => setOpen(true)} />
      ) : (
        <View style={styles.form}>
          {(['cash', 'manual_bkash', 'manual_nagad'] as const).map((m) => (
            <Choice key={m} label={t(`orders.advanceMethod.${m}`)} selected={method === m} onPress={() => setMethod(m)}>
              <Text>{t(`orders.advanceMethod.${m}`)}</Text>
            </Choice>
          ))}
          <Field
            label={t('orders.advanceAmount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            error={amountError ?? localError ?? undefined}
          />
          {method !== 'cash' ? <Field label={t('orders.advanceRef')} value={ref} onChangeText={setRef} autoCapitalize="characters" /> : null}
          {otherError ? <Text variant="error">{otherError}</Text> : null}
          <Button title={t('orders.advanceSave')} loading={add.isPending} onPress={submit} />
          <Button title={t('common.cancel')} kind="secondary" onPress={() => setOpen(false)} />
        </View>
      )}
    </View>
  );
}

export function CourierSection({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const lang = useLang();
  const book = useBookCourier(order.id);
  const refresh = useRefreshCourier(order.id);
  const booking = order.courier.booking;
  const drivers = order.courier.available_drivers;
  const err = book.error ?? refresh.error;
  return (
    <View style={card}>
      <Text variant="label">{t('orders.courierTitle')}</Text>
      {booking ? (
        <>
          <Text>{booking.driver}</Text>
          {booking.tracking_code ? (
            <Text selectable>
              {t('orders.courierTracking')}: {booking.tracking_code}
            </Text>
          ) : null}
          <Text variant="muted">
            {t('orders.courierStatus')}: {booking.status}
            {booking.booked_at ? ` · ${formatDateTime(booking.booked_at, lang)}` : ''}
          </Text>
          <Button title={t('orders.courierRefresh')} kind="secondary" loading={refresh.isPending} onPress={() => refresh.mutate(booking.driver)} />
        </>
      ) : drivers.length === 0 ? (
        <Text variant="muted">{t('orders.courierNone')}</Text>
      ) : (
        drivers.map((d) => (
          <Button
            key={d}
            title={t('orders.courierBook', { driver: d })}
            loading={book.isPending && book.variables === d}
            disabled={book.isPending}
            onPress={() => book.mutate(d)}
          />
        ))
      )}
      {err ? <Text variant="error">{errorMessage(err, t)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.sm } });
