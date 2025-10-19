import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const STORAGE_KEYS = {
  PATIENTS: 'physio_patients',
  SERVICES: 'physio_services',
  INVOICES: 'physio_invoices',
};

export const useBillingStore = create((set, get) => ({
  // Initial state
  patients: [],
  services: [],
  invoices: [],
  isLoading: false,

  // Patient actions
  addPatient: async (patientData) => {
    // Create and persist a new patient record
    const patient = {
      ...patientData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    set((state) => ({ patients: [...state.patients, patient] }));
    await get().saveData();
  },

  updatePatient: async (id, updates) => {
    // Update a patient by id and persist changes
    set((state) => ({
      patients: state.patients.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    await get().saveData();
  },

  deletePatient: async (id) => {
    // Remove a patient by id and persist changes
    set((state) => ({
      patients: state.patients.filter(p => p.id !== id)
    }));
    await get().saveData();
  },

  searchPatients: (query) => {
    // Case-insensitive search by name or phone
    const { patients } = get();
    if (!query.trim()) return patients;
    
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.phone.includes(query)
    );
  },

  // Service actions
  addService: async (serviceData) => {
    // Create and persist a new service
    const service = {
      ...serviceData,
      id: generateId(),
    };
    
    set((state) => ({ services: [...state.services, service] }));
    await get().saveData();
  },

  updateService: async (id, updates) => {
    // Update a service by id and persist changes
    set((state) => ({
      services: state.services.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
    await get().saveData();
  },

  deleteService: async (id) => {
    // Remove a service by id and persist changes
    set((state) => ({
      services: state.services.filter(s => s.id !== id)
    }));
    await get().saveData();
  },

  searchServices: (query) => {
    // Case-insensitive search by service name
    const { services } = get();
    if (!query.trim()) return services;
    
    const lowercaseQuery = query.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Invoice actions
  createInvoice: async (invoiceData) => {
    // Compute totals, create invoice, persist and return id
    const { calculateInvoiceTotal } = get();
    const { subtotal, total } = calculateInvoiceTotal(
      invoiceData.items, 
      invoiceData.discount, 
      invoiceData.taxRate
    );
    
    const invoice = {
      ...invoiceData,
      id: generateId(),
      issuedOn: new Date(),
      subtotal,
      total,
    };
    
    set((state) => ({ invoices: [...state.invoices, invoice] }));
    await get().saveData();
    return invoice.id;
  },

  updateInvoice: async (id, updates) => {
    // Update an invoice by id and persist changes
    set((state) => ({
      invoices: state.invoices.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
    await get().saveData();
  },

  deleteInvoice: async (id) => {
    // Remove an invoice by id and persist changes
    set((state) => ({
      invoices: state.invoices.filter(i => i.id !== id)
    }));
    await get().saveData();
  },

  markInvoicePaid: async (id) => {
    // Mark an invoice as paid and set paid date
    set((state) => ({
      invoices: state.invoices.map(i =>
        i.id === id ? { ...i, status: 'paid', paidOn: new Date() } : i
      )
    }));
    await get().saveData();
  },

  // Utility functions
  calculateInvoiceTotal: (items, discount, taxRate) => {
    // Calculate subtotal and total with discount and tax
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = subtotal * (discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;
    
    return { subtotal, total };
  },

  getDashboardStats: () => {
    // Aggregate stats used on the dashboard
    const { patients, invoices } = get();
    
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    
    const outstandingAmount = invoices
      .filter(i => i.status === 'unpaid')
      .reduce((sum, i) => sum + i.total, 0);
    
    return {
      totalRevenue,
      outstandingAmount,
      totalPatients: patients.length,
      totalInvoices: invoices.length,
    };
  },

  getPatientById: (id) => {
    // Find a patient by id
    return get().patients.find(p => p.id === id);
  },

  getServiceById: (id) => {
    // Find a service by id
    return get().services.find(s => s.id === id);
  },

  // Persistence
  loadData: async () => {
    // Load persisted data from AsyncStorage
    set({ isLoading: true });
    
    try {
      const [patientsData, servicesData, invoicesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PATIENTS),
        AsyncStorage.getItem(STORAGE_KEYS.SERVICES),
        AsyncStorage.getItem(STORAGE_KEYS.INVOICES),
      ]);

      set({
        patients: patientsData ? JSON.parse(patientsData) : [],
        services: servicesData ? JSON.parse(servicesData) : [],
        invoices: invoicesData ? JSON.parse(invoicesData) : [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  saveData: async () => {
    // Persist current data to AsyncStorage
    const { patients, services, invoices } = get();
    
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients)),
        AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services)),
        AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)),
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },
}));

