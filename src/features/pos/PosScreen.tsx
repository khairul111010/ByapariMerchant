import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { OrderDetail } from '../../api/schemas/orders';
import { PosProduct } from '../../api/schemas/selling';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { InvoiceButton } from '../invoice/InvoiceButton';
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
import { searchPos } from './api';
import {
  addToCart,
  CartLine,
  cartTotal,
  lineTotal,
  maxQuantity,
  setQuantity,
  toSaleItems,
  unitPrice,
} from './cart';
import { useCreateSale, useDebounced, usePosSearch } from './hooks';
import { SkuScanner } from './SkuScanner';
import { ScreenHeader } from '../../ui/ScreenHeader';

const PHONE = /^01\d{9}$/;

function Receipt({ order, onNew }: { order: OrderDetail; onNew: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text variant="title">{t('pos.done')}</Text>
      <Text variant="label">{order.order_number}</Text>
      {order.items.map(it => (
        <View key={it.id} style={styles.line}>
          <Text style={styles.flex}>
            {it.product_name}
            {it.variant_name ? ` · ${it.variant_name}` : ''} ×{' '}
            {formatNumber(it.quantity, lang)}
          </Text>
          <Text>{formatMoney(it.line_total, lang)}</Text>
        </View>
      ))}
      <View style={styles.line}>
        <Text variant="label">{t('pos.total')}</Text>
        <Text variant="label">{formatMoney(order.total, lang)}</Text>
      </View>
      <InvoiceButton orderId={order.id} />
      <Button title={t('pos.newSale')} onPress={onNew} />
    </ScrollView>
  );
}

export function PosScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderDetail | null>(null);
  const search = usePosSearch(useDebounced(q.trim()));
  const sale = useCreateSale();

  const add = useCallback((p: PosProduct) => {
    setMessage(null);
    setCart(c => addToCart(c, p));
  }, []);

  const onSku = useCallback(
    async (sku: string) => {
      setMessage(null);
      try {
        const found = await searchPos(sku);
        const hit = found.find(p => p.sku.toLowerCase() === sku.toLowerCase());
        if (hit) {
          add(hit);
        } else {
          setMessage(t('inventory.scanNotFound', { sku }));
        }
      } catch (e) {
        setMessage(errorMessage(e, t));
      }
    },
    [add, t],
  );

  const reset = () => {
    setCart([]);
    setName('');
    setPhone('');
    setQ('');
    setMessage(null);
    setReceipt(null);
    sale.reset();
  };

  const charge = () => {
    setMessage(null);
    setPhoneError(null);
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone && !PHONE.test(cleanPhone)) {
      setPhoneError(t('pos.phoneInvalid'));
      return;
    }
    sale.mutate(
      {
        items: toSaleItems(cart),
        customer_name: name.trim() || undefined,
        customer_phone: cleanPhone || undefined,
      },
      {
        onSuccess: order => setReceipt(order),
        onError: e => {
          if (e instanceof ApiError && e.code === 'insufficient_stock') {
            // Show the real count and cap that line to it so the next try can succeed.
            const variantId = Number(e.extra.variant_id);
            const real = Number(e.extra.stock_quantity);
            const line = cart.find(l => l.product.variant_id === variantId);
            setMessage(
              t('pos.stockOnly', {
                name: line?.product.product_name ?? '',
                count: formatNumber(real, lang),
              }),
            );
            if (Number.isFinite(real)) {
              setCart(c => setQuantity(c, variantId, real));
            }
          } else if (e instanceof ApiError && e.kind === 'network') {
            setMessage(t('pos.needsConnection'));
          } else {
            setMessage(errorMessage(e, t));
          }
        },
      },
    );
  };

  if (receipt) {
    return <Receipt order={receipt} onNew={reset} />;
  }
  if (scanning) {
    return (
      <SkuScanner
        onSku={s => void onSku(s)}
        onClose={() => setScanning(false)}
        hint={t('pos.scanHint')}
      />
    );
  }

  const results = search.data ?? [];
  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={t('pos.title')} onBack={onBack} />
      <View style={styles.row}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('pos.search')}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('pos.search')}
          style={[styles.search, styles.flex]}
        />
        <Button
          title={t('pos.scan')}
          kind="secondary"
          onPress={() => setScanning(true)}
        />
      </View>

      {q.trim() ? (
        search.isFetching && !search.data ? (
          <Skeleton height={64} />
        ) : results.length === 0 ? (
          <Text variant="muted">{t('pos.noResults')}</Text>
        ) : (
          <>
            <Text variant="muted">{t('pos.results')}</Text>
            {results.map(p => {
              const out = p.tracks_inventory && p.stock_quantity <= 0;
              return (
                <Pressable
                  key={p.variant_id}
                  accessibilityRole="button"
                  disabled={out}
                  onPress={() => add(p)}
                  style={[styles.result, out && styles.dim]}
                >
                  <Text variant="label">
                    {p.product_name}
                    {p.variant_name ? ` · ${p.variant_name}` : ''}
                  </Text>
                  <Text>
                    {formatMoney(p.price, lang)} · {p.sku}
                  </Text>
                  <Text variant="muted">
                    {p.tracks_inventory
                      ? out
                        ? t('pos.soldOut')
                        : t('pos.inStock', {
                            count: formatNumber(p.stock_quantity, lang),
                          })
                      : ''}
                    {p.price_tiers
                      .map(
                        tier =>
                          ` · ${t('pos.tier', {
                            qty: formatNumber(tier.min_quantity, lang),
                            price: formatMoney(tier.price, lang),
                          })}`,
                      )
                      .join('')}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )
      ) : null}

      <Text variant="label">{t('pos.cart')}</Text>
      {cart.length === 0 ? (
        <Text variant="muted">{t('pos.emptyCart')}</Text>
      ) : (
        cart.map(l => {
          const id = l.product.variant_id;
          return (
            <View key={id} style={styles.cartLine}>
              <View style={styles.flex}>
                <Text variant="label">
                  {l.product.product_name}
                  {l.product.variant_name ? ` · ${l.product.variant_name}` : ''}
                </Text>
                <Text variant="muted">
                  {formatNumber(l.quantity, lang)} ×{' '}
                  {formatMoney(unitPrice(l.product, l.quantity), lang)} ={' '}
                  {formatMoney(lineTotal(l), lang)}
                </Text>
              </View>
              <View style={styles.qty}>
                <Button
                  title="−"
                  kind="secondary"
                  onPress={() =>
                    setCart(c => setQuantity(c, id, l.quantity - 1))
                  }
                />
                <Button
                  title="+"
                  kind="secondary"
                  disabled={l.quantity >= maxQuantity(l.product)}
                  onPress={() => setCart(c => addToCart(c, l.product))}
                />
              </View>
            </View>
          );
        })
      )}

      {cart.length > 0 ? (
        <>
          <View style={styles.line}>
            <Text variant="label">{t('pos.total')}</Text>
            <Text variant="label">{formatMoney(cartTotal(cart), lang)}</Text>
          </View>
          <Text variant="muted">{t('pos.estimate')}</Text>
          <Field
            label={t('pos.customerName')}
            value={name}
            onChangeText={setName}
          />
          <Field
            label={t('pos.customerPhone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={phoneError ?? undefined}
          />
          <Text variant="muted">{t('pos.cashOnly')}</Text>
        </>
      ) : null}

      {message ? <Text variant="error">{message}</Text> : null}
      <Button
        title={t('pos.charge')}
        onPress={charge}
        disabled={cart.length === 0}
        loading={sale.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  flex: { flex: 1 },
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
  result: {
    ...cardStyle,
    padding: spacing.md,
    gap: 2,
    minHeight: touch,
  },
  dim: { opacity: 0.5 },
  cartLine: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    ...cardStyle,
    padding: spacing.md,
  },
  qty: { flexDirection: 'row', gap: spacing.xs },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
