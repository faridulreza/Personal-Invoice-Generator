'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Customer, InvoiceItem, BusinessInfo } from '@/lib/types';
import { calculateInvoiceTotal } from '@/lib/utils';

import { format } from 'date-fns';
import InvoiceDisplay from '@/components/InvoiceDisplay';
import { Eye, Save, Trash2, Plus } from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 14 days from now
    items: [] as InvoiceItem[],
    notes: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, businessResponse] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/business'),
        ]);
        
        if (!customersResponse.ok || !businessResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [customersData, businessData] = await Promise.all([
          customersResponse.json(),
          businessResponse.json(),
        ]);
        
        setCustomers(customersData);
        setBusinessInfo(businessData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const updateItem = (itemId: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const totals = calculateInvoiceTotal(formData.items);

  const generatePreviewInvoice = () => {
    if (!selectedCustomer || !businessInfo) return null;
    
    return {
      id: 'preview',
      invoiceNumber: 'PREVIEW',
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      customerId: formData.customerId,
      customer: selectedCustomer,
      businessInfo: businessInfo,
      items: formData.items,
      subtotal: totals.subtotal,
      tax: totals.tax > 0 ? { rate: 0, amount: totals.tax } : undefined,
      total: totals.total,
      status: formData.status,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!selectedCustomer || formData.items.length === 0) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    setSaving(true);
    try {
      const newInvoice = {
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        customerId: formData.customerId,
        customer: selectedCustomer,
        businessInfo: businessInfo,
        items: formData.items,
        subtotal: totals.subtotal,
        tax: totals.tax > 0 ? { rate: 0, amount: totals.tax } : undefined,
        total: totals.total,
        status: status,
        notes: formData.notes,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });
      
      if (!response.ok) throw new Error('Failed to create invoice');
      
      const savedInvoice = await response.json();
      router.push(`/invoices/${savedInvoice.id}`);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice');
    } finally {
      setSaving(false);
    }
  };

  const isValid = formData.customerId && formData.items.length > 0 && 
                  formData.items.every(item => item.name && item.quantity > 0 && item.rate >= 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
          <div className="space-x-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving || !isValid}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save & Send'}
            </button>
          </div>
        </div>
        
        {selectedCustomer && businessInfo && (
          <InvoiceDisplay 
            invoice={generatePreviewInvoice()!} 
            className="border border-gray-200 rounded-lg"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Create a new invoice for your customer</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            disabled={!isValid}
            className="inline-flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !isValid}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('sent')}
            disabled={saving || !isValid}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName ? `${customer.companyName} - ${customer.name}` : customer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <button
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                        rows={2}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                        min="1"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-full p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-700">
                  No items added yet. Click &quot;Add Item&quot; to get started.
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              placeholder="Additional notes or terms (optional)"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              rows={4}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {totals.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax:</span>
                  <span className="font-medium">${totals.tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg text-gray-900">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedCustomer && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h2>
              <div className="text-sm space-y-2">
                <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                {selectedCustomer.companyName && (
                  <div className="text-gray-700">{selectedCustomer.companyName}</div>
                )}
                <div className="text-gray-700">{selectedCustomer.email}</div>
                {selectedCustomer.phone && (
                  <div className="text-gray-700">{selectedCustomer.phone}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
