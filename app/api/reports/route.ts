import { NextResponse } from 'next/server';
import { getWarehouseDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

function groupDaily(withdrawals: any[], siteName: string, date: string) {
  const daily = withdrawals.filter(w => w.siteName === siteName && w.withdrawalDate === date);
  const equipmentUsedMap = new Map<string, any>();

  for (const w of daily) {
    for (const item of w.items || []) {
      const key = item.equipmentName;
      const existing = equipmentUsedMap.get(key) || { equipmentName: key, quantityWithdrawn: 0, unit: item.unit };
      existing.quantityWithdrawn += Number(item.quantityWithdrawn);
      equipmentUsedMap.set(key, existing);
    }
  }

  return {
    reportDate: date,
    siteName,
    totalWithdrawals: daily.length,
    equipmentUsed: Array.from(equipmentUsedMap.values()),
  };
}

export async function GET(req: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'daily';
    const siteName = searchParams.get('siteName') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || startDate;

    const db = await getWarehouseDb();
    const q: any = {};
    if (startDate && endDate) q.withdrawalDate = { $gte: startDate, $lte: endDate };
    if (siteName) q.siteName = siteName;

    const withdrawals = await db.collection('withdrawals').find(q).toArray();

    if (type === 'daily') {
      if (!startDate || !siteName) return NextResponse.json([]);
      return NextResponse.json([groupDaily(withdrawals, siteName, startDate)]);
    }

    const total = withdrawals.length;
    return NextResponse.json([
      {
        weekStartDate: startDate,
        weekEndDate: endDate,
        siteName,
        totalWithdrawals: total,
        equipmentUsed: [],
      },
    ]);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
