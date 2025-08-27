import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const customers = await DataManager.getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const customerData = await request.json();
    const newCustomer = await DataManager.addCustomer(customerData);
    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
