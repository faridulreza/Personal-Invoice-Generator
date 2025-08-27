import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const businessInfo = await DataManager.getBusinessInfo();
    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error('Get business info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business info' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const businessInfo = await request.json();
    await DataManager.updateBusinessInfo(businessInfo);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update business info error:', error);
    return NextResponse.json(
      { error: 'Failed to update business info' },
      { status: 500 }
    );
  }
}
