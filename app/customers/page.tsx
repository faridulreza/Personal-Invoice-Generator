'use client';

import { useEffect, useState } from 'react';

import { Customer } from '@/lib/types';

import CustomerModal from './CustomerModal';
import { Users, Mail, Phone, MapPin, Edit, Trash2, Plus } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        const response = await fetch(`/api/customers/${customer.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete customer');
        await fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingCustomer(null);
    await fetchCustomers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer information</p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first customer</p>
            <button
              onClick={handleAddCustomer}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {customer.name}
                      </h3>
                      {customer.companyName && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {customer.companyName}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        {customer.email}
                      </div>
                      
                      {customer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          {customer.phone}
                        </div>
                      )}
                      
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="mr-2 mt-0.5 flex-shrink-0 h-4 w-4" />
                        <div>
                          <div>{customer.address.line1}</div>
                          {customer.address.line2 && <div>{customer.address.line2}</div>}
                          <div>
                            {customer.address.city}
                            {customer.address.state && `, ${customer.address.state}`}
                            {customer.address.postalCode && ` ${customer.address.postalCode}`}
                          </div>
                          <div>{customer.address.country}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Created: {formatDate(customer.createdAt)}
                      {customer.updatedAt !== customer.createdAt && (
                        <span className="ml-4">
                          Updated: {formatDate(customer.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="inline-flex items-center p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer)}
                      className="inline-flex items-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
