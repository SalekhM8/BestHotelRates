import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';
import { getTransferAdminStats } from '@/lib/admin-stats';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getTransferAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin transfer stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}




