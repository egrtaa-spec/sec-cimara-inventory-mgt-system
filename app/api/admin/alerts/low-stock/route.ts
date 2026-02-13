import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getSiteDb } from '@/lib/mongodb';
import { SITES } from '@/lib/sites';

export async function GET() {
  try {
    requireAdmin();

    const alerts: any[] = [];

    for (const s of SITES) {
      const db = await getSiteDb(s.key);
      const items = await db.collection('equipment').find({ quantity: { $lt: 5 } }).toArray();
      for (const it of items) {
        alerts.push({ site: s.label, name: it.name, quantity: it.quantity, unit: it.unit });
      }
    }

    return NextResponse.json(alerts);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
