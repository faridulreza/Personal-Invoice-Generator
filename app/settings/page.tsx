'use client';

import { useState, useEffect } from 'react';

import { BusinessInfo, ColorTemplate } from '@/lib/types';
import { COLOR_TEMPLATES, getColorTemplate } from '@/lib/color-templates';
import { Building, Mail, Phone, MapPin, Settings as SettingsIcon, Save, Palette } from 'lucide-react';


interface AppSettings {
  nextInvoiceNumber: number;
  taxRate: number;
  currency: string;
  colorTemplate: string;
}

export default function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchBusinessInfo(), fetchAppSettings()]);
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch('/api/business');
      if (!response.ok) throw new Error('Failed to fetch business info');
      const data = await response.json();
      setBusinessInfo(data);
    } catch (error) {
      console.error('Error fetching business info:', error);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setAppSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!businessInfo) return;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev!,
        address: {
          ...prev!.address,
          [addressField]: value,
        },
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleColorTemplateChange = (templateId: string) => {
    if (!appSettings) return;
    setAppSettings(prev => ({
      ...prev!,
      colorTemplate: templateId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessInfo || !appSettings) return;

    setSaving(true);
    setSaved(false);

    try {
      // Save business info
      const businessResponse = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessInfo),
      });
      if (!businessResponse.ok) throw new Error('Failed to update business info');

      // Save app settings
      const settingsResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appSettings),
      });
      if (!settingsResponse.ok) throw new Error('Failed to update settings');

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!businessInfo || !appSettings) {
    return (
      <div className="text-center py-12">
        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
        <p className="text-gray-500">Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600">Manage your business information and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <Building className="mr-3 h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Business/Individual Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={businessInfo.name}
                onChange={handleBusinessChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="flex space-x-2 mr-3">
              <Mail className="h-4 w-4 text-gray-600" />
              <Phone className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={businessInfo.email}
                onChange={handleBusinessChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={businessInfo.phone}
                onChange={handleBusinessChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <MapPin className="mr-3 h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Business Address</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="address.line1"
                name="address.line1"
                value={businessInfo.address.line1}
                onChange={handleBusinessChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                id="address.line2"
                name="address.line2"
                value={businessInfo.address.line2 || ''}
                onChange={handleBusinessChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={businessInfo.address.city}
                  onChange={handleBusinessChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={businessInfo.address.state || ''}
                  onChange={handleBusinessChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={businessInfo.address.postalCode}
                  onChange={handleBusinessChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={businessInfo.address.country}
                onChange={handleBusinessChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Color Template Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <Palette className="mr-3 h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Invoice Color Theme</h2>
          </div>
          
          <p className="text-gray-600 mb-6">Choose a color theme for your invoices</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COLOR_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleColorTemplateChange(template.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  appSettings.colorTemplate === template.id
                    ? 'border-purple-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  {appSettings.colorTemplate === template.id && (
                    <div className="text-purple-600 text-xs font-medium">Selected</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h3>
                  <p className="text-gray-500 text-xs leading-tight">{template.description}</p>
                </div>
                
                <div className="flex space-x-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: template.colors.primaryLight }}
                  />
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: template.colors.background }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Theme Preview:</h3>
            <div className="space-y-2">
              <div 
                className="p-3 rounded text-white text-sm font-medium"
                style={{ backgroundColor: getColorTemplate(appSettings.colorTemplate).colors.primary }}
              >
                Invoice Header - {getColorTemplate(appSettings.colorTemplate).name}
              </div>
              <div 
                className="p-3 rounded text-gray-800 text-sm"
                style={{ backgroundColor: getColorTemplate(appSettings.colorTemplate).colors.primaryLight }}
              >
                Business Information Section
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-purple-50 p-4 rounded-lg text-sm">
            <div className="font-semibold text-purple-900">{businessInfo.name}</div>
            <div className="mt-2 space-y-1 text-purple-900">
              <div>{businessInfo.address.line1}</div>
              {businessInfo.address.line2 && <div>{businessInfo.address.line2}</div>}
              <div>
                {businessInfo.address.city}
                {businessInfo.address.state && `, ${businessInfo.address.state}`}
              </div>
              <div>
                {businessInfo.address.country} - {businessInfo.address.postalCode}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-purple-900">
              <div>Email: {businessInfo.email}</div>
              <div>Phone: {businessInfo.phone}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This is how your business information will appear on invoices.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Settings updated successfully!
          </div>
        )}
      </form>
    </div>
  );
}
