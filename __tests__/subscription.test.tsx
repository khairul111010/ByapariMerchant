import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/i18n';
import { planEnvelopeSchema } from '../src/api/schemas/settings';
import { SignupScreen } from '../src/features/auth/SignupScreen';
import { PlanScreen } from '../src/features/plan/PlanScreen';
import { ProductLimitScreen } from '../src/features/products/ProductLimit';
import { StoreBanner } from '../src/features/shell/StoreBanner';
import { useJump } from '../src/store/jump';
import { settingsSamples as s } from '../test/samples-settings';

const textOf = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root
    .findAll(n => typeof n.props.children === 'string' || typeof n.props.children === 'number')
    .map(n => String(n.props.children))
    .join(' | ');

function render(el: React.ReactElement, seed: Array<[unknown[], unknown]>) {
  const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  for (const [key, data] of seed) {
    qc.setQueryData(key, data);
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    r = ReactTestRenderer.create(<QueryClientProvider client={qc}>{el}</QueryClientProvider>);
  });
  return r;
}

const me = (isOwner: boolean, store: object = {}, limits: object = {}) => ({
  user: { id: 1, name: 'A', email: 'a@example.com', is_owner: isOwner },
  store: { api_base_url: 'https://x', is_pending: false, is_trial: false, storefront_closed: false, ...store },
  limits: {
    max_staff_accounts: 1, can_add_staff_account: true, custom_domain_enabled: false,
    courier_drivers: [], configured_courier_drivers: [],
    max_products: 100, can_add_product: true, max_orders_per_month: 500, order_limit_state: 'ok', ...limits,
  },
  platform: { support_whatsapp_url: 'https://wa.me/8801700000000?text=pay' },
  unread_notifications: 0,
});

const growth = planEnvelopeSchema.parse(s['Plan (Growth)']).data;
const starter = planEnvelopeSchema.parse(s['Plan (Starter)']).data;

describe('Subscription screen', () => {
  it('renders header, usage, plans and history for a trial store', () => {
    const text = textOf(render(<PlanScreen onBack={() => undefined} />, [[['plan'], starter]]));
    for (const part of [
      'Subscription', 'Starter', 'Free trial', 'Pay on WhatsApp', // header
      'Products', '42 / 100', 'Orders this month', '380 / 500', 'Staff accounts', // usage
      "Buyers' orders are never blocked",
      'Plans', 'Choose Growth', 'Choose Business', '1,000 products', '2,000 orders/month', // plans
      'History', 'Free', // history: the trial row
    ]) {
      expect(text).toContain(part);
    }
    expect(text).toContain('days left');
    expect(text).not.toContain('Choose Starter'); // the current plan has no button
  });
  it('an active store renews; history shows the amount, the reference and "Until"', () => {
    const text = textOf(render(<PlanScreen onBack={() => undefined} />, [[['plan'], growth]]));
    for (const part of ['Active', 'Paid until 15 Dec 2026', 'Renew on WhatsApp', '৳8,400', 'Ref: BK8F2K1Q', 'Until 15 Dec 2025', '—']) {
      expect(text).toContain(part);
    }
  });
  it('the empty history state', () => {
    const text = textOf(render(<PlanScreen onBack={() => undefined} />, [[['plan'], { ...starter, history: [] }]]));
    expect(text).toContain('No subscription history yet');
  });
});

describe('Store banner', () => {
  beforeEach(() => useJump.getState().clear());
  it.each([
    ['pending', { is_pending: true, storefront_closed: true }, {}, "Your shop isn't live yet", 'Message us on WhatsApp'],
    ['trial ended', { storefront_closed: true }, {}, 'Your free trial has ended', 'Pay on WhatsApp'],
    ['trial', { is_trial: true, trial_ends_at: new Date(Date.now() + 3.5 * 864e5).toISOString() }, {}, 'Free trial: 3 days left', 'Pay on WhatsApp'],
    ['orders over', {}, { order_limit_state: 'over' }, "You're over your plan's order limit", null],
    ['orders near', {}, { order_limit_state: 'near' }, "You're close to your monthly order limit", null],
  ])('%s', (_name, store, limits, message, button) => {
    const text = textOf(render(<StoreBanner />, [[['me'], me(true, store, limits)]]));
    expect(text).toContain(message);
    if (button) {
      expect(text).toContain(button);
    } else {
      expect(text).not.toContain('WhatsApp');
    }
  });
  it('nothing when the store is paid and under its limits', () => {
    expect(textOf(render(<StoreBanner />, [[['me'], me(true)]]))).toBe('');
  });
  it('owners can tap through to the Subscription screen; staff see no link', () => {
    const owner = render(<StoreBanner />, [[['me'], me(true, {}, { order_limit_state: 'near' })]]);
    const link = owner.root.find(n => n.props.accessibilityHint === 'Opens your subscription' && typeof n.props.onPress === 'function');
    act(() => link.props.onPress());
    expect(useJump.getState().target).toEqual({ tab: 'More', screen: 'plan' });

    const staff = render(<StoreBanner />, [[['me'], me(false, {}, { order_limit_state: 'near' })]]);
    expect(textOf(staff)).toContain("You're close to your monthly order limit");
    expect(staff.root.findAll(n => n.props.accessibilityHint === 'Opens your subscription')).toHaveLength(0);
  });
});

describe('Product limit prompt', () => {
  it('owner: message with the cap and a button to the plans', () => {
    const r = render(<ProductLimitScreen onBack={() => undefined} />, [[['me'], me(true, {}, { can_add_product: false })]]);
    expect(textOf(r)).toContain('Your plan allows 100 products');
    expect(textOf(r)).toContain('See plans');
  });
  it('staff: told to ask the owner, no button', () => {
    const r = render(<ProductLimitScreen onBack={() => undefined} />, [[['me'], me(false, {}, { can_add_product: false })]]);
    expect(textOf(r)).toContain('Ask the shop owner');
    expect(textOf(r)).not.toContain('See plans');
  });
});

describe('Signup plan cards', () => {
  const plan = (key: string, label: string, monthly: number, yearly: number, products: number, orders: number, trial: boolean) => ({
    key, label, blurb: null, price_yearly: yearly, price_monthly_quote: monthly, staff_accounts: 1,
    products, orders_per_month: orders, has_trial: trial, trial_days: trial ? 7 : 0,
    custom_domain_included: !trial, courier_drivers: ['steadfast'],
  });
  it('Starter shows "Free for 7 days"; Growth shows its price and "live once paid"', () => {
    const options = {
      plans: [plan('starter', 'Starter', 350, 4200, 100, 500, true), plan('growth', 'Growth', 700, 8400, 1000, 2000, false)],
      custom_domain_addon_price: 500,
      categories: [],
    };
    const text = textOf(render(<SignupScreen onBackToLogin={() => undefined} />, [[['signup-options'], options]]));
    for (const part of [
      'Free', 'for 7 days', 'Then ৳350/month, billed yearly',
      '৳700/month', '৳8,400 billed yearly · live once paid',
      '100 products · 500 orders/month', '1,000 products · 2,000 orders/month',
    ]) {
      expect(text).toContain(part);
    }
  });
});
