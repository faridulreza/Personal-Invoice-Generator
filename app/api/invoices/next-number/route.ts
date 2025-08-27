import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const nextNumber = await DataManager.getNextInvoiceNumber();
    return NextResponse.json({ invoiceNumber: nextNumber });
  } catch (error) {
    console.error('Get next invoice number error:', error);
    return NextResponse.json(
      { error: 'Failed to get next invoice number' },
      { status: 500 }
    );
  }
}
