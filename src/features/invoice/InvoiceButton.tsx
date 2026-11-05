import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../i18n';
import { Button, Text } from '../../ui';
import { shareInvoice } from './share';

export function InvoiceButton({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await shareInvoice(
        orderId,
        inv => ({
          invoice: t('orders.invoice'),
          date: t('orders.invoiceDate'),
          billTo: t('orders.invoiceBillTo'),
          item: t('orders.invoiceItem'),
          qty: t('orders.invoiceQty'),
          price: t('orders.invoicePrice'),
          amount: t('orders.invoiceAmount'),
          subtotal: t('orders.subtotal'),
          discount: t('orders.discount'),
          delivery: t('orders.delivery'),
          total: t('orders.total'),
          advancePaid: t('orders.advancePaid'),
          amountDue: t('orders.amountDue'),
          payment: t('orders.paymentTitle'),
          paymentMethod: t(`orders.payment.${inv.payment.method}`, {
            defaultValue: inv.payment.method_label,
          }),
          paymentStatus: t(`orders.paymentStatus.${inv.payment.status}`, {
            defaultValue: inv.payment.status,
          }),
        }),
        lang,
      );
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        title={t('orders.invoiceShare')}
        kind="secondary"
        loading={busy}
        onPress={run}
      />
      {failed ? <Text variant="error">{t('orders.invoiceFailed')}</Text> : null}
    </>
  );
}
