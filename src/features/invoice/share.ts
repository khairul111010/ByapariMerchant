import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { api } from '../../api/instance';
import { invoiceEnvelopeSchema } from '../../api/schemas/invoice';
import { Lang } from '../../i18n/format';
import { buildInvoiceHtml, InvoiceLabels } from './html';

export const fetchInvoice = (orderId: number) =>
  api.get(`/orders/${orderId}/invoice`, { schema: invoiceEnvelopeSchema }).then((r) => r.data);

/** Renders the invoice to a PDF on the phone and opens the share sheet (WhatsApp, print, ...). */
export async function shareInvoice(orderId: number, labelsFor: (inv: Awaited<ReturnType<typeof fetchInvoice>>) => InvoiceLabels, lang: Lang) {
  const inv = await fetchInvoice(orderId);
  const safeName = inv.invoice_number.replace(/[^A-Za-z0-9-]/g, '');
  const pdf = await generatePDF({
    html: buildInvoiceHtml(inv, labelsFor(inv), lang),
    fileName: `invoice-${safeName}`,
    width: 595, // A4 at 72 dpi
    height: 842,
  });
  try {
    await Share.open({
      url: `file://${pdf.filePath}`,
      type: 'application/pdf',
      failOnCancel: false,
    });
  } catch {
    // The user dismissing the sheet is not an error.
  }
}
