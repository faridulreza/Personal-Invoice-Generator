import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function POST(request: Request) {
  try {
    const { invoiceNumber, excludeId } = await request.json();
    
    if (!invoiceNumber || typeof invoiceNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      );
    }

    const isUnique = await DataManager.isInvoiceNumberUnique(invoiceNumber, excludeId);
    
    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error('Validate invoice number error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invoice number' },
      { status: 500 }
    );
  }
}
