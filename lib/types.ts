export interface BusinessInfo {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customer: Customer;
  businessInfo: BusinessInfo;
  items: InvoiceItem[];
  subtotal: number;
  tax?: {
    rate: number;
    amount: number;
  };
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorTemplate {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string; // Main brand color (used for headers, titles)
    primaryLight: string; // Light version (used for backgrounds)
    secondary: string; // Secondary color for text/accents
    accent: string; // Accent color for highlights
    text: string; // Main text color
    textLight: string; // Light text color
    border: string; // Border color
    background: string; // Background color for cards/sections
  };
}

export interface AppData {
  businessInfo: BusinessInfo;
  customers: Customer[];
  invoices: Invoice[];
  settings: {
    nextInvoiceNumber: number;
    taxRate: number;
    currency: string;
    colorTemplate: string; // ID of selected color template
  };
}
