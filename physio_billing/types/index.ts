export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  notes?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface InvoiceItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  items: InvoiceItem[];
  discount: number;
  taxRate: number;
  subtotal: number;
  total: number;
  status: 'paid' | 'unpaid';
  issuedOn: Date;
  paidOn?: Date;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  outstandingAmount: number;
  totalPatients: number;
  totalInvoices: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  status?: 'paid' | 'unpaid' | 'all';
}
