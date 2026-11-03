import { invoiceEnvelopeSchema } from '../src/api/schemas/invoice';
import { buildInvoiceHtml, escapeHtml, InvoiceLabels } from '../src/features/invoice/html';
import { invoiceSample } from '../test/samples-payments';

const labels: InvoiceLabels = {
  invoice: 'Invoice', date: 'Date', billTo: 'Bill to', item: 'Item', qty: 'Qty', price: 'Price',
  amount: 'Amount', subtotal: 'Subtotal', discount: 'Discount', delivery: 'Delivery', total: 'Total',
  advancePaid: 'Paid in advance', amountDue: 'Amount due', payment: 'Payment',
  paymentMethod: 'Cash on delivery', paymentStatus: 'Unpaid',
};
const inv = invoiceEnvelopeSchema.parse(invoiceSample).data;

describe('invoice', () => {
  it('accepts the real sample', () => {
    expect(invoiceEnvelopeSchema.safeParse(invoiceSample).success).toBe(true);
  });
  it('renders amounts, number and the amount due', () => {
    const html = buildInvoiceHtml(inv, labels, 'en');
    expect(html).toContain('ORD-000011');
    expect(html).toContain('৳1,560');
    expect(html).toContain('৳1,060');
    expect(html).toContain('3/11/2026');
  });
  it('uses Bangla digits in bn', () => {
    const html = buildInvoiceHtml(inv, labels, 'bn');
    expect(html).toContain('৳১,৫৬০');
    expect(html).toContain('৩/১১/২০২৬');
  });
  it('escapes merchant and buyer text so it cannot inject markup', () => {
    const evil = {
      ...inv,
      store: { ...inv.store, name: '<script>alert(1)</script>' },
      customer: { ...inv.customer, name: '"><img src=x onerror=1>', address: "a & b <i>" },
      items: [{ ...inv.items[0], description: '<b>x</b>' }],
    };
    const html = buildInvoiceHtml(evil, labels, 'en');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('escapeHtml covers the five special characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});
