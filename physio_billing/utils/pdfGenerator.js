import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
// Plain JS: expects an object with { invoice, patient, services, clinicInfo }
export const generateInvoicePDF = async (data) => {
  const { invoice, patient, services, clinicInfo } = data;

  const invoiceDate = new Date(invoice.issuedOn).toLocaleDateString();
  const paidInfo = invoice.status === 'paid' && invoice.paidOn
    ? `<div class="paid">PAID on ${new Date(invoice.paidOn).toLocaleDateString()}</div>`
    : `<div class="unpaid">PAYMENT PENDING</div>`;

  const serviceRows = invoice.items.map((item) => {
    const svc = services.find(s => s.id === item.serviceId);
    const name = (svc && svc.name) ? svc.name : 'Unknown Service';
    const amount = (item.quantity * item.unitPrice).toFixed(2);
    return `
      <tr>
        <td>${name}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">₹${item.unitPrice.toFixed(2)}</td>
        <td class="right">₹${amount}</td>
      </tr>
    `;
  }).join('');

  const subtotal = invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const discountAmount = subtotal * (invoice.discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (invoice.taxRate / 100);

  const html = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 28px 32px; color: #1C1C1E; }
        .top { text-align: center; margin-bottom: 16px; }
        .brand { display: inline-flex; align-items: center; gap: 10px; }
        .brand img { height: 46px; width: 46px; object-fit: contain; }
        .brand-name { font-size: 18px; font-weight: 700; letter-spacing: .4px; }
        .brand-sub { font-size: 10px; color: #666; margin-top: 2px; }

        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 11px; margin-top: 10px; }
        .meta .kv { display: grid; grid-template-columns: 120px 1fr; gap: 6px; }
        .right { text-align: right; }

        .title { text-align: center; margin: 14px 0 8px; font-size: 14px; font-weight: 700; }

        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead th { border-bottom: 1px solid #000; padding: 8px 6px; font-weight: 700; }
        tbody td { border-bottom: 1px solid #ddd; padding: 10px 6px; }
        .num { text-align: right; }
        .sn { width: 48px; text-align: center; }
        .desc { width: auto; }
        .qty { width: 60px; }
        .rate { width: 80px; }
        .amt { width: 100px; }

        .summary { margin-top: 6px; font-size: 11px; width: 260px; margin-left: auto; }
        .summary .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .summary .row.total { border-top: 1px solid #000; margin-top: 4px; padding-top: 8px; font-weight: 700; }
        .summary .row.final { font-weight: 700; }
        .paid { color: #34C759; font-weight: 600; }
        .unpaid { color: #FF9500; font-weight: 600; }

        .address { margin-top: 18px; font-size: 10px; color: #444; border-top: 1px solid #ccc; padding-top: 8px; }
        .bar { margin-top: 8px; height: 18px; background: linear-gradient(90deg, #e05a2a 0%, #f38c4a 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; gap: 24px; }
      </style>
    </head>
    <body>
      <div class="top">
        <div class="brand">
          ${clinicInfo.logoUrl ? `<img src="${clinicInfo.logoUrl}" />` : ''}
          <div>
            <div class="brand-name">${clinicInfo.name}</div>
            <div class="brand-sub">Sports rehab and physiotherapy clinic</div>
          </div>
        </div>
      </div>

      <div class="meta">
        <div class="kv">
          <div>Registration Id</div><div>${invoice.id.slice(-8).toUpperCase()}</div>
          <div>Bill No</div><div>${invoice.id.slice(-4).toUpperCase()}</div>
          <div>Patient Name</div><div>${patient.name}</div>
          <div>Address</div><div>${clinicInfo.address || '-'}</div>
          <div>Mobile No</div><div>${patient.phone || '-'}</div>
          <div>Age/Sex</div><div>${patient.age || '-'} / -</div>
        </div>
        <div class="kv">
          <div>Date</div><div class="right">${invoiceDate}</div>
          <div>Time</div><div class="right">${new Date().toLocaleTimeString()}</div>
          <div>Consultant</div><div class="right">${clinicInfo.consultant || '-'}</div>
          <div>Payment mode</div><div class="right">${invoice.status === 'paid' ? 'Cash' : '—'}</div>
          <div>Department</div><div class="right">${clinicInfo.department || '-'}</div>
        </div>
      </div>

      <div class="title">Invoice</div>

      <table>
        <thead>
          <tr>
            <th class="sn">Sl No</th>
            <th class="desc">Product/Service Name</th>
            <th class="qty num">Qty</th>
            <th class="rate num">Price</th>
            <th class="amt num">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, idx) => {
            const svc = services.find(s => s.id === item.serviceId);
            const name = (svc && svc.name) ? svc.name : 'Unknown Service';
            const amount = (item.quantity * item.unitPrice).toFixed(2);
            return `
              <tr>
                <td class="sn">${idx + 1}</td>
                <td class="desc">${name}</td>
                <td class="qty num">${item.quantity}</td>
                <td class="rate num">₹${item.unitPrice.toFixed(2)}</td>
                <td class="amt num">₹${amount}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="row total"><div>Total</div><div>₹${subtotal.toFixed(2)}</div></div>
        <div class="row"><div>Due Amount</div><div>₹${invoice.status === 'paid' ? '0.00' : subtotal.toFixed(2)}</div></div>
        <div class="row final"><div>Received Amount</div><div>₹${invoice.status === 'paid' ? invoice.total.toFixed(2) : '0.00'}</div></div>
        ${paidInfo}
      </div>

      <div class="address">
        ${clinicInfo.address || ''}
      </div>
      <div class="bar">
        ${clinicInfo.email ? `<span>${clinicInfo.email}</span>` : ''}
        ${clinicInfo.phone ? `<span>${clinicInfo.phone}</span>` : ''}
        ${clinicInfo.instagram ? `<span>@${clinicInfo.instagram}</span>` : ''}
      </div>
    </body>
    </html>
  `;

  const { uri } = await printToFileAsync({ html });
  return uri;
};

export const shareInvoicePDF = async (fileUri) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Invoice',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
};

export const getDefaultClinicInfo = () => ({
  name: 'Physiotherapy Clinic',
  address: '123 Health Street, Medical District, City - 123456',
  phone: '+91 98765 43210',
  email: 'info@physioclinic.com',
});
