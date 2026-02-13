import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getWarehouseDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    requireAdmin();
    const db = await getWarehouseDb();
    const equipment = await db.collection('equipment').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(equipment);
  } catch (e: any) {
    const status = e?.message === 'UNAUTHORIZED' ? 401 : e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: e?.message || 'Error' }, { status });
  }
}

export async function POST(req: Request) {
  try {
    requireAdmin();
    const db = await getWarehouseDb();
    const body = await req.json();

    const { name, category, serialNumber, quantity, unit, location, condition, price } = body;

    if (!name || !unit || !location || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const existing = await db.collection('equipment').findOne({ name });
    if (existing) {
      await db.collection('equipment').updateOne(
        { _id: existing._id },
        { $inc: { quantity }, $set: { price: price ?? existing.price ?? 0 } }
      );
      return NextResponse.json({ success: true, updated: true });
    }

    await db.collection('equipment').insertOne({
      name,
      category: category || 'other',
      serialNumber: serialNumber || '',
      quantity,
      unit,
      location,
      condition: condition || 'good',
      price: price ?? 0,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const status = e?.message === 'UNAUTHORIZED' ? 401 : e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: e?.message || 'Error' }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    requireAdmin();
    const db = await getWarehouseDb();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await db.collection('equipment').updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
