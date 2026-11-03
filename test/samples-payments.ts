// Copied from docs/samples-payments-courier.md (fake data).
import { orderDetailSample } from './samples';

const base = orderDetailSample.data;

export const bkashPending = {
  data: {
    ...base,
    payment_method: 'manual_bkash',
    payment: { id: 1, method: 'manual_bkash', status: 'pending', amount: '1560.00', reference_number: '9XJ4K2L7QP', paid_at: null },
    courier: { booking: null, available_drivers: ['steadfast'] },
  },
};

export const withAdvance = {
  data: {
    ...base,
    status: 'confirmed',
    advance_paid: '500.00',
    amount_due: '1060.00',
    advance_payments: [
      { id: 2, method: 'manual_bkash', status: 'paid', amount: '500.00', reference_number: '8AB3C9D1ZZ', paid_at: '2026-11-03T06:12:50+00:00' },
    ],
  },
};

export const booked = {
  data: {
    ...base,
    status: 'shipped',
    courier: {
      booking: { driver: 'steadfast', consignment_id: '1234567', tracking_code: 'SF-ABC123', status: 'in_review', booked_at: '2026-11-03T06:12:50+00:00' },
      available_drivers: ['steadfast'],
    },
  },
};

export const invoiceSample = {
  data: {
    invoice_number: 'ORD-000011',
    date: '2026-11-03',
    store: { name: 'Demo Shop', whatsapp_number: null, logo_url: null },
    customer: { name: 'Sample Buyer', phone: '01700000000', address: 'House 1, Road 2, Dhaka' },
    payment: { method: 'cod', method_label: 'Cod', status: 'unpaid' },
    items: [{ description: 'Wireless Earbuds — Black', sku: 'EAR-BLK', unit_price: '750.00', quantity: 2, line_total: '1500.00' }],
    totals: { subtotal: '1500.00', discount: '0.00', coupon_code: null, delivery_charge: '60.00', total: '1560.00', advance_paid: '500.00', amount_due: '1060.00' },
  },
};
