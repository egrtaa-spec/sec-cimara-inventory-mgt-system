import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getWarehouseDb, getSiteDb } from '@/lib/mongodb';
import { SITES } from '@/lib/sites';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    requireAdmin();
    const db = await getWarehouseDb();
    const withdrawals = await db.collection('withdrawals').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(withdrawals);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const warehouse = await getWarehouseDb();
    const body = await req.json();

    const { siteName, withdrawalDate, receiverName, senderName, notes, items } = body;

    const isValidSite = SITES.some(s => s.key === siteName || s.label === siteName);
    if (!siteName || !isValidSite || !withdrawalDate || !receiverName || !senderName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const item of items) {
      const eq = await warehouse.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      if (!eq) return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
      if (item.quantityWithdrawn > eq.quantity) {
        return NextResponse.json({ error: `Insufficient warehouse stock for ${eq.name}` }, { status: 400 });
      }
    }

    const siteDb = await getSiteDb(siteName);

    for (const item of items) {
      const eq = await warehouse.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      await warehouse.collection('equipment').updateOne({ _id: new ObjectId(item.equipmentId) }, { $inc: { quantity: -Number(item.quantityWithdrawn) } });

      const existingSite = await siteDb.collection('equipment').findOne({ name: eq?.name });
      if (existingSite) {
        await siteDb.collection('equipment').updateOne({ _id: existingSite._id }, { $inc: { quantity: Number(item.quantityWithdrawn) } });
      } else {
        await siteDb.collection('equipment').insertOne({
          name: eq?.name,
          category: eq?.category || 'other',
          serialNumber: eq?.serialNumber || '',
          quantity: Number(item.quantityWithdrawn),
          unit: eq?.unit || item.unit,
          location: 'Site Store',
          condition: 'good',
          createdAt: new Date(),
        });
      }
    }

    const result = await warehouse.collection('withdrawals').insertOne({
      withdrawalDate,
      siteName,
      receiverName,
      senderName,
      notes: notes || '',
      items: items.map((i: any) => ({
        equipmentId: i.equipmentId,
        equipmentName: i.equipmentName,
        quantityWithdrawn: Number(i.quantityWithdrawn),
        unit: i.unit,
      })),
      processedBy: admin.name,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: String(result.insertedId) });
  } catch (e: any) {
    const status = e?.message === 'UNAUTHORIZED' ? 401 : e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: e?.message || 'Error' }, { status });
  }
}
