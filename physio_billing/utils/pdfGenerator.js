import { printToFileAsync } from 'expo-print';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// Plain JS: expects an object with { invoice, patient, services, clinicInfo }
export const generateInvoicePDF = async (data) => {
  const { invoice, patient, services, clinicInfo } = data;

  const invoiceDate = new Date(invoice.issuedOn).toLocaleDateString();

  const subtotal = invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  // Totals are computed directly in rows below; remove unused intermediate variables

  let logoSrc = '';
  if (clinicInfo.logoBase64) {
    logoSrc = `data:image/png;base64,${clinicInfo.logoBase64}`;
  } else if (clinicInfo.logoUrl) {
    logoSrc = clinicInfo.logoUrl;
  } else {
    try {
      const asset = Asset.fromModule(require('../assets/images/physiospire logo.png'));
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      const b64 = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 });
      logoSrc = `data:image/png;base64,${b64}`;
    } catch (e) {
      // ignore if asset not available
    }
  }

  let backgroundSrc = '';
  try {
    const bgAsset = Asset.fromModule(require('../invoice format.jpeg'));
    if (!bgAsset.localUri) {
      await bgAsset.downloadAsync();
    }
    const bg64 = await FileSystem.readAsStringAsync(bgAsset.localUri, { encoding: FileSystem.EncodingType.Base64 });
    backgroundSrc = `data:image/jpeg;base64,${bg64}`;
  } catch (e) {}

  const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Invoice - ${clinicInfo.name || 'Clinic'}</title>
<!-- External fonts removed for offline safety; using system fonts -->
<style>
  :root{ --accent:#e85b1a; --dark:#111; --muted:#666; --paper:#fff; --border:#e6e6e6; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:var(--dark); }
  body{ margin:0; background:#ffffff; -webkit-print-color-adjust:exact; }
  .bg{ position:fixed; inset:0; width:100%; height:100%; z-index:-1; object-fit:cover; }
  .invoice-wrapper{ max-width:820px; margin:28px auto; background:transparent; padding:34px 48px; box-shadow:none; border-radius:0; border-top:0; }
  .header{ display:flex; align-items:center; justify-content:center; gap:18px; margin-bottom:10px; }
  .logo{ width:86px; height:86px; display:flex; align-items:center; justify-content:center; border-radius:6px; overflow:hidden; }
  .clinic-name{ text-align:center; }
  .clinic-name h1{ margin:0; font-size:20px; font-weight:700; letter-spacing:.2px; }
  .clinic-name p{ margin:4px 0 0 0; color:var(--muted); font-size:12px; }
  .meta{ display:flex; gap:28px; margin-top:18px; margin-bottom:20px; }
  .meta .col{ flex:1; min-width:180px; }
  .meta label{ display:block; font-weight:600; font-size:13px; margin-bottom:6px; }
  .meta .value{ color:var(--muted); font-size:13px; white-space:pre-line; }
  .invoice-title{ text-align:center; font-weight:700; margin:6px 0 14px 0; font-size:18px; }
  .items{ width:100%; border-collapse:collapse; margin-bottom:14px; font-size:13px; }
  .items thead th{ text-align:left; font-weight:600; padding:8px 6px; border-bottom:2px solid var(--border); }
  .items tbody td{ padding:10px 6px; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
  .items .text-right{ text-align:right; }
  .items .qty{ width:64px; text-align:center; }
  .items .price,.items .total{ width:110px; text-align:right; }
  .totals{ display:flex; justify-content:flex-end; margin-top:6px; }
  .totals table{ width:320px; border-collapse:collapse; font-size:13px; }
  .totals td{ padding:6px 8px; }
  .totals .label{ color:var(--muted); text-align:left; }
  .totals .value{ text-align:right; font-weight:700; }
  .totals .grand{ font-size:15px; border-top:2px solid var(--border); padding-top:10px; }
  .rule{ height:1px; background:#000; opacity:.6; margin:8px 0 0 0; }
  .rule-double{ height:3px; background:#000; opacity:.9; margin:2px 0 10px 0; }
  .footer{ margin-top:34px; border-top:2px solid var(--border); padding-top:10px; display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:12px; color:var(--muted); }
  .contact{ display:flex; gap:12px; align-items:center; }
  .contact div{ display:flex; align-items:center; gap:8px; }
  .color-bar{ width:140px; height:12px; border-radius:2px; background:linear-gradient(90deg,var(--accent) 0%, #000000 100%); }
  @media (max-width:720px){ .invoice-wrapper{ padding:20px; margin:16px; } .meta{ flex-direction:column; gap:12px; } .totals table{ width:100%; } }
  @media print{ body{ background:#fff; } .invoice-wrapper{ box-shadow:none; margin:0; border-radius:0; border-top:0; } a[href]:after{ content:''; } }
</style>
</head>
<body>
  ${backgroundSrc ? `<img class="bg" src="${backgroundSrc}" alt="background"/>` : ''}
  <div class="invoice-wrapper" role="document">
    <header class="header" aria-label="Invoice header">
      <div class="logo">
        ${logoSrc ? `<img src="${logoSrc}" alt="${clinicInfo.name || 'Clinic'} logo" style="width:100%;height:100%;object-fit:contain;"/>` : ''}
      </div>
      <div class="clinic-name" style="min-width:280px">
        <h1>${clinicInfo.name || 'Clinic'}</h1>
        <p>${clinicInfo.tagline || 'Sports Rehab and Physiotherapy clinic'}</p>
      </div>
    </header>
    <section class="meta" aria-label="Invoice information">
      <div class="col">
        <label>Registration Id</label><div class="value">${invoice.id.slice(-8).toUpperCase()}</div>
        <label style="margin-top:10px">Bill No</label><div class="value">${invoice.id.slice(-4).toUpperCase()}</div>
        <label style="margin-top:10px">Patient Name</label><div class="value">${patient.name}</div>
        <label style="margin-top:10px">Guardian Name</label><div class="value">${patient.guardian || ''}</div>
        <label style="margin-top:10px">Address</label><div class="value">${clinicInfo.address || ''}</div>
        <label style="margin-top:10px">Mobile No</label><div class="value">${patient.phone || ''}</div>
        <label style="margin-top:10px">Age / Sex</label><div class="value">${patient.age || ''} / ${patient.sex || '-'}</div>
      </div>
      <div class="col">
        <label>Date</label><div class="value">${invoiceDate}</div>
        <label style="margin-top:10px">Time</label><div class="value">${new Date().toLocaleTimeString()}</div>
        <label style="margin-top:10px">Consultant</label><div class="value">${clinicInfo.consultant || ''}</div>
        <label style="margin-top:10px">Payment Mode</label><div class="value">${invoice.paymentMode || clinicInfo.paymentMode || '—'}</div>
        <label style="margin-top:10px">Department</label><div class="value">${clinicInfo.department || ''}</div>
      </div>
    </section>
    <div class="invoice-title">Invoice</div>
    <div class="rule"></div>
    <div class="rule-double"></div>
    <table class="items" aria-label="Invoice items">
      <thead>
        <tr>
          <th style="width:48px">Sl No</th>
          <th>Product name / Description</th>
          <th class="qty">Qty</th>
          <th class="price">Price</th>
          <th class="total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((it, idx) => {
          const svc = services.find(s => s.id === it.serviceId);
          const name = (svc && svc.name) ? svc.name : 'Unknown Service';
          const line = (it.quantity * it.unitPrice);
          return `<tr>
            <td>${idx + 1}</td>
            <td>${name}</td>
            <td class="qty">${it.quantity}</td>
            <td class="price">₹${it.unitPrice.toFixed(2)}</td>
            <td class="total">₹${line.toFixed(2)}</td>
          </tr>`; }).join('')}
      </tbody>
    </table>
    <div class="rule"></div>
    <div class="rule-double"></div>
    <div class="totals" role="note" aria-label="Invoice totals">
      <table><tbody>
        <tr><td class="label">Total</td><td class="value">₹ ${subtotal.toFixed(2)}</td></tr>
        <tr><td class="label">Due Amount</td><td class="value">₹ ${(invoice.status === 'paid' ? 0 : subtotal).toFixed(2)}</td></tr>
        <tr class="grand"><td class="label">Received Amount</td><td class="value">₹ ${(invoice.status === 'paid' ? invoice.total : 0).toFixed(2)}</td></tr>
      </tbody></table>
    </div>
    <footer class="footer" aria-label="Invoice footer">
      <div class="contact"><div><strong>Address:</strong><span style="margin-left:6px">${clinicInfo.address || ''}</span></div></div>
      <div class="contact" style="flex-direction:column;align-items:flex-end">
        <div><span style="margin-right:10px">${clinicInfo.email || ''}</span> • <span style="margin-left:10px">${clinicInfo.phone || ''}</span></div>
        <div style="margin-top:8px"><div class="color-bar" aria-hidden="true"></div></div>
      </div>
    </footer>
  </div>
</body>
</html>`;

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
