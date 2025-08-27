import { NextResponse } from 'next/server';
import { DataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const [invoices, customers] = await Promise.all([
      DataManager.getInvoices(),
      DataManager.getCustomers(),
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;

    const stats = {
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      totalRevenue,
      pendingInvoices,
    };

    // Get 5 most recent invoices
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return NextResponse.json({
      stats,
      recentInvoices,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
