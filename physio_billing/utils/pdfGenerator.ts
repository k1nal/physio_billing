import jsPDF from 'jspdf';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Invoice, Patient, Service } from '@/types';

interface InvoicePDFData {
  invoice: Invoice;
  patient: Patient;
  services: Service[];
  clinicInfo: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
}

export const generateInvoicePDF = async (data: InvoicePDFData): Promise<string> => {
  const { invoice, patient, services, clinicInfo } = data;
  
  // Create new PDF document
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Helper function to add text with automatic line wrapping
  const addText = (text: string, x: number, y: number, options?: any) => {
    pdf.text(text, x, y, options);
    return y + (options?.fontSize || 12) * 0.5;
  };

  // Header - Clinic Info
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText(clinicInfo.name, margin, yPosition, { fontSize: 20 });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(clinicInfo.address, margin, yPosition + 5);
  yPosition = addText(`Phone: ${clinicInfo.phone}`, margin, yPosition + 5);
  if (clinicInfo.email) {
    yPosition = addText(`Email: ${clinicInfo.email}`, margin, yPosition + 5);
  }

  // Invoice Title
  yPosition += 20;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('INVOICE', margin, yPosition, { fontSize: 18 });

  // Invoice Details
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const invoiceDate = new Date(invoice.issuedOn).toLocaleDateString();
  yPosition = addText(`Invoice #: ${invoice.id.slice(-8).toUpperCase()}`, margin, yPosition);
  yPosition = addText(`Date: ${invoiceDate}`, margin, yPosition + 5);
  yPosition = addText(`Status: ${invoice.status.toUpperCase()}`, margin, yPosition + 5);

  // Patient Info
  yPosition += 15;
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Bill To:', margin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(patient.name, margin, yPosition + 5);
  yPosition = addText(`Phone: ${patient.phone}`, margin, yPosition + 5);
  yPosition = addText(`Age: ${patient.age}`, margin, yPosition + 5);

  // Services Table
  yPosition += 20;
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Services:', margin, yPosition);

  // Table headers
  yPosition += 10;
  const tableStartY = yPosition;
  const colWidths = [80, 30, 30, 40];
  const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];

  pdf.setFontSize(10);
  pdf.text('Service', colPositions[0], yPosition);
  pdf.text('Qty', colPositions[1], yPosition);
  pdf.text('Rate', colPositions[2], yPosition);
  pdf.text('Amount', colPositions[3], yPosition);

  // Draw table header line
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  let subtotal = 0;

  invoice.items.forEach((item) => {
    const service = services.find(s => s.id === item.serviceId);
    const serviceName = service?.name || 'Unknown Service';
    const amount = item.quantity * item.unitPrice;
    subtotal += amount;

    pdf.text(serviceName, colPositions[0], yPosition);
    pdf.text(item.quantity.toString(), colPositions[1], yPosition);
    pdf.text(`₹${item.unitPrice.toFixed(2)}`, colPositions[2], yPosition);
    pdf.text(`₹${amount.toFixed(2)}`, colPositions[3], yPosition);
    yPosition += 15;
  });

  // Draw line before totals
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Totals
  const totalsX = pageWidth - 100;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', totalsX - 40, yPosition);
  pdf.text(`₹${subtotal.toFixed(2)}`, totalsX, yPosition);
  yPosition += 15;

  if (invoice.discount > 0) {
    const discountAmount = subtotal * (invoice.discount / 100);
    pdf.text(`Discount (${invoice.discount}%):`, totalsX - 40, yPosition);
    pdf.text(`-₹${discountAmount.toFixed(2)}`, totalsX, yPosition);
    yPosition += 15;
  }

  if (invoice.taxRate > 0) {
    const taxableAmount = subtotal - (subtotal * (invoice.discount / 100));
    const taxAmount = taxableAmount * (invoice.taxRate / 100);
    pdf.text(`Tax (${invoice.taxRate}%):`, totalsX - 40, yPosition);
    pdf.text(`₹${taxAmount.toFixed(2)}`, totalsX, yPosition);
    yPosition += 15;
  }

  // Total
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total:', totalsX - 40, yPosition);
  pdf.text(`₹${invoice.total.toFixed(2)}`, totalsX, yPosition);

  // Payment status
  yPosition += 25;
  pdf.setFontSize(12);
  if (invoice.status === 'paid' && invoice.paidOn) {
    pdf.setTextColor(0, 150, 0);
    pdf.text(`PAID on ${new Date(invoice.paidOn).toLocaleDateString()}`, margin, yPosition);
  } else {
    pdf.setTextColor(255, 100, 0);
    pdf.text('PAYMENT PENDING', margin, yPosition);
  }

  // Footer
  yPosition = pdf.internal.pageSize.height - 40;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', margin, yPosition);
  
  // Signature space
  yPosition += 20;
  pdf.text('Signature: ________________________', margin, yPosition);

  // Generate PDF as base64
  const pdfBase64 = pdf.output('datauristring').split(',')[1];
  
  // Save to device
  const fileName = `invoice_${invoice.id.slice(-8)}_${Date.now()}.pdf`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

export const shareInvoicePDF = async (fileUri: string) => {
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
