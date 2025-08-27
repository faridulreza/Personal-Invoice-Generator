import { ColorTemplate } from './types';

export const COLOR_TEMPLATES: ColorTemplate[] = [
  {
    id: 'purple',
    name: 'Purple Professional',
    description: 'Classic purple theme with modern appeal',
    colors: {
      primary: '#9333ea',
      primaryLight: '#faf5ff',
      secondary: '#374151',
      accent: '#8b5cf6',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Professional blue theme for corporate invoices',
    colors: {
      primary: '#2563eb',
      primaryLight: '#eff6ff',
      secondary: '#374151',
      accent: '#3b82f6',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'green',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    colors: {
      primary: '#059669',
      primaryLight: '#ecfdf5',
      secondary: '#374151',
      accent: '#10b981',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'red',
    name: 'Executive Red',
    description: 'Bold red theme for strong brand presence',
    colors: {
      primary: '#dc2626',
      primaryLight: '#fef2f2',
      secondary: '#374151',
      accent: '#ef4444',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    description: 'Warm orange theme for creative businesses',
    colors: {
      primary: '#ea580c',
      primaryLight: '#fff7ed',
      secondary: '#374151',
      accent: '#fb923c',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    description: 'Sophisticated indigo theme for professional services',
    colors: {
      primary: '#4338ca',
      primaryLight: '#eef2ff',
      secondary: '#374151',
      accent: '#6366f1',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'teal',
    name: 'Modern Teal',
    description: 'Fresh teal theme for tech and modern businesses',
    colors: {
      primary: '#0d9488',
      primaryLight: '#f0fdfa',
      secondary: '#374151',
      accent: '#14b8a6',
      text: '#111827',
      textLight: '#6b7280',
      border: '#e5e7eb',
      background: '#f9fafb'
    }
  },
  {
    id: 'gray',
    name: 'Monochrome',
    description: 'Elegant grayscale theme for minimalist design',
    colors: {
      primary: '#374151',
      primaryLight: '#f9fafb',
      secondary: '#6b7280',
      accent: '#4b5563',
      text: '#111827',
      textLight: '#9ca3af',
      border: '#e5e7eb',
      background: '#f3f4f6'
    }
  }
];

export const getColorTemplate = (id: string): ColorTemplate => {
  const template = COLOR_TEMPLATES.find(t => t.id === id);
  return template || COLOR_TEMPLATES[0]; // Default to purple if not found
};

export const getDefaultColorTemplate = (): ColorTemplate => {
  return COLOR_TEMPLATES[0]; // Purple theme as default
};
