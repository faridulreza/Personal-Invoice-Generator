import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const settings = await DataManager.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json();
    await DataManager.updateSettings(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
