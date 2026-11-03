// Copied from docs/samples.md (fake data).
export const loginSample = {
  token: '1|REDACTED',
  user: { id: 1, name: 'Demo Owner', email: 'owner@example.com', roles: ['owner'], is_owner: true },
  store: {
    name: 'Demo Shop', subdomain: 'demoshop', status: 'trial', is_pending: false, plan: 'growth',
    plan_expires_at: null, plan_overdue: false, storefront_url: 'http://demoshop.bypari.localhost/',
    api_base_url: 'http://demoshop.bypari.localhost/api/v1', ai_configured: false, reviews_enabled: false,
  },
  limits: {
    max_staff_accounts: 3, can_add_staff_account: true, custom_domain_enabled: true,
    courier_drivers: ['steadfast', 'pathao', 'redx'], configured_courier_drivers: [],
  },
  platform: { support_whatsapp: '', support_whatsapp_url: null, support_phone: '', support_email: '' },
  unread_notifications: 1,
};

export const orderRow = {
  id: 1, order_number: 'ORD-000001', status: 'pending', payment_method: 'cod', payment_status: 'unpaid',
  customer_name: 'Sample Buyer', customer_phone: '01700000000', total: '1560.00',
  created_at: '2026-11-03T06:04:48+00:00',
};

export const ordersSample = {
  data: [orderRow],
  links: { first: 'x', last: 'x', prev: null, next: null },
  meta: { current_page: 1, from: 1, last_page: 1, per_page: 20, to: 1, total: 1, path: 'x', links: [] },
};

export const orderDetailSample = {
  data: {
    ...orderRow,
    customer_address: 'House 1, Road 2, Dhaka', delivery_zone: 'inside_dhaka', coupon_code: null,
    subtotal: '1500.00', discount_amount: '0.00', delivery_charge: '60.00', advance_paid: '0.00',
    amount_due: '1560.00', cancelled_at: null,
    items: [{
      id: 1, product_id: null, variant_id: null, product_name: 'Wireless Earbuds', variant_name: 'Black',
      sku: 'EAR-BLK', unit_price: '750.00', quantity: 2, line_total: '1500.00',
    }],
    payment: null, advance_payments: [], courier: { booking: null, available_drivers: [] },
    customer_risk: { total: 0, delivered: 0, cancelled: 0, resolved: 0, cancellation_rate: null, level: 'new' },
  },
};
