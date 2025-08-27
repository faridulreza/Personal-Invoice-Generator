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
