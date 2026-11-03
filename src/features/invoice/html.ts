import type { Invoice } from '../../api/schemas/invoice';
import { formatMoney, formatNumber, Lang } from '../../i18n/format';

export const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface InvoiceLabels {
  invoice: string;
  date: string;
  billTo: string;
  item: string;
  qty: string;
  price: string;
  amount: string;
  subtotal: string;
  discount: string;
  delivery: string;
  total: string;
  advancePaid: string;
  amountDue: string;
  payment: string;
  paymentMethod: string;
  paymentStatus: string;
}

/** `2026-11-03` -> `3/11/2026`, with Bangla digits in bn. No timezone maths: it is already a date. */
function invoiceDate(date: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return m ? formatNumber(`${Number(m[3])}/${Number(m[2])}/${m[1]}`, lang) : escapeHtml(date);
}

/** Everything that comes from the merchant or a buyer is escaped before it enters the HTML. */
export function buildInvoiceHtml(inv: Invoice, labels: InvoiceLabels, lang: Lang): string {
  const e = escapeHtml;
  const money = (v: string) => e(formatMoney(v, lang));
  const rows = inv.items
    .map(
      (it) => `<tr>
        <td>${e(it.description)}${it.sku ? `<div class="muted">${e(it.sku)}</div>` : ''}</td>
        <td class="r">${e(formatNumber(it.quantity, lang))}</td>
        <td class="r">${money(it.unit_price)}</td>
        <td class="r">${money(it.line_total)}</td>
      </tr>`,
    )
    .join('');
  const t = inv.totals;
  const line = (label: string, value: string, strong = false) =>
    `<tr class="${strong ? 'strong' : ''}"><td colspan="3" class="r">${e(label)}</td><td class="r">${value}</td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:sans-serif;font-size:13px;color:#101820;padding:8px}
    h1{font-size:20px;margin:0}
    .muted{color:#4a5561;font-size:11px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:6px 4px;border-bottom:1px solid #c9d0d8;text-align:left;vertical-align:top}
    .r{text-align:right}.strong td{font-weight:bold}
    .head{display:flex;justify-content:space-between}
  </style></head><body>
    <div class="head">
      <div><h1>${e(inv.store.name)}</h1>${inv.store.whatsapp_number ? `<div class="muted">${e(formatNumber(inv.store.whatsapp_number, lang))}</div>` : ''}</div>
      <div class="r"><strong>${e(labels.invoice)} ${e(inv.invoice_number)}</strong><div class="muted">${e(labels.date)}: ${invoiceDate(inv.date, lang)}</div></div>
    </div>
    <p><strong>${e(labels.billTo)}</strong><br>${e(inv.customer.name)}<br>${e(formatNumber(inv.customer.phone, lang))}${inv.customer.address ? `<br>${e(inv.customer.address)}` : ''}</p>
    <table>
      <tr><th>${e(labels.item)}</th><th class="r">${e(labels.qty)}</th><th class="r">${e(labels.price)}</th><th class="r">${e(labels.amount)}</th></tr>
      ${rows}
      ${line(labels.subtotal, money(t.subtotal))}
      ${line(labels.discount + (t.coupon_code ? ` (${t.coupon_code})` : ''), money(t.discount))}
      ${line(labels.delivery, money(t.delivery_charge))}
      ${line(labels.total, money(t.total), true)}
      ${line(labels.advancePaid, money(t.advance_paid))}
      ${line(labels.amountDue, money(t.amount_due), true)}
    </table>
    <p class="muted">${e(labels.payment)}: ${e(labels.paymentMethod)} · ${e(labels.paymentStatus)}</p>
  </body></html>`;
}
