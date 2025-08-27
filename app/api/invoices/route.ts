import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const invoices = await DataManager.getInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const invoiceData = await request.json();
    
    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await DataManager.getNextInvoiceNumber();
    }
    
    const newInvoice = await DataManager.addInvoice(invoiceData);
    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
