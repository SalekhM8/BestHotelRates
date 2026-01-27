import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';
import { getHotelAdminStats } from '@/lib/admin-stats';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getHotelAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin hotel stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}




