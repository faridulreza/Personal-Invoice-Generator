import { promises as fs } from 'fs';
import path from 'path';
import { BusinessInfo, Customer, Invoice } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

export class DataManager {
  private static async readJsonFile<T>(filename: string): Promise<T> {
    try {
      const filePath = path.join(DATA_DIR, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      throw error;
    }
  }

  private static async writeJsonFile<T>(filename: string, data: T): Promise<void> {
    try {
      const filePath = path.join(DATA_DIR, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw error;
    }
  }

  // Business Info
  static async getBusinessInfo(): Promise<BusinessInfo> {
    return this.readJsonFile<BusinessInfo>('business-info.json');
  }

  static async updateBusinessInfo(businessInfo: BusinessInfo): Promise<void> {
    await this.writeJsonFile('business-info.json', businessInfo);
  }

  // Customers
  static async getCustomers(): Promise<Customer[]> {
    return this.readJsonFile<Customer[]>('customers.json');
  }

  static async addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customers = await this.getCustomers();
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: `customer-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    customers.push(newCustomer);
    await this.writeJsonFile('customers.json', customers);
    return newCustomer;
  }

  static async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> {
    const customers = await this.getCustomers();
    const customerIndex = customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return null;
    
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.writeJsonFile('customers.json', customers);
    return customers[customerIndex];
  }

  static async deleteCustomer(id: string): Promise<boolean> {
    const customers = await this.getCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    if (filteredCustomers.length === customers.length) return false;
    
    await this.writeJsonFile('customers.json', filteredCustomers);
    return true;
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === id) || null;
  }

  // Invoices
  static async getInvoices(): Promise<Invoice[]> {
    return this.readJsonFile<Invoice[]>('invoices.json');
  }

  static async addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    invoices.push(newInvoice);
    await this.writeJsonFile('invoices.json', invoices);
    return newInvoice;
  }

  static async updateInvoice(id: string, updates: Partial<Omit<Invoice, 'id' | 'createdAt'>>): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    const invoiceIndex = invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) return null;
    
    invoices[invoiceIndex] = {
      ...invoices[invoiceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.writeJsonFile('invoices.json', invoices);
    return invoices[invoiceIndex];
  }

  static async deleteInvoice(id: string): Promise<boolean> {
    const invoices = await this.getInvoices();
    const filteredInvoices = invoices.filter(i => i.id !== id);
    if (filteredInvoices.length === invoices.length) return false;
    
    await this.writeJsonFile('invoices.json', filteredInvoices);
    return true;
  }

  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    return invoices.find(i => i.id === id) || null;
  }

  static async isInvoiceNumberUnique(invoiceNumber: string, excludeId?: string): Promise<boolean> {
    const invoices = await this.getInvoices();
    return !invoices.some(i => i.invoiceNumber === invoiceNumber && i.id !== excludeId);
  }

  // Settings
  static async getSettings(): Promise<{ nextInvoiceNumber: number; taxRate: number; currency: string; colorTemplate: string }> {
    const settings = await this.readJsonFile('settings.json');
    // Ensure colorTemplate exists, default to 'purple' if not present
    return {
      ...settings,
      colorTemplate: settings.colorTemplate || 'purple'
    };
  }

  static async updateSettings(settings: { nextInvoiceNumber: number; taxRate: number; currency: string; colorTemplate: string }): Promise<void> {
    await this.writeJsonFile('settings.json', settings);
  }

  static async getNextInvoiceNumber(): Promise<string> {
    const settings = await this.getSettings();
    const invoiceNumber = `A${String(settings.nextInvoiceNumber).padStart(5, '0')}`;
    
    // Increment for next time
    await this.updateSettings({
      ...settings,
      nextInvoiceNumber: settings.nextInvoiceNumber + 1,
    });
    
    return invoiceNumber;
  }
}

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateInvoiceTotal = (items: { quantity: number; rate: number }[], taxRate: number = 0): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};
