import { NextResponse } from 'next/server';
import { getDb, getWarehouseDb } from '@/lib/mongodb';
import { requireEngineer } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';
import { parseISO, startOfDay, endOfDay, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const engineer = await requireEngineer();
    let db;

    if (engineer.site === 'WAREHOUSE') {
      db = await getWarehouseDb();
    } else {
      const siteDef = SITES.find(s => s.key === engineer.site);
      if (!siteDef) throw new Error('Invalid site assignment');
      db = await getDb(siteDef.dbName);
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate'); // e.g. "2026-02-21"
    const endDate = searchParams.get('endDate');

    const q: any = {};
    if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      
      // ✅ FIX: Search for both BSON Dates and ISO Strings to find existing data
      q.$or = [
        { withdrawalDate: { $gte: start, $lte: end } },
        { withdrawalDate: { $gte: startDate, $lte: endDate } }
      ];
    }

    const withdrawals = await db.collection('withdrawals').find(q).sort({ withdrawalDate: -1 }).toArray();
    return NextResponse.json(withdrawals);
  } catch (e: any) {
    console.error("GET ERROR:", e);
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const engineer = await requireEngineer();
    let db;

    if (engineer.site === 'WAREHOUSE') {
      db = await getWarehouseDb();
    } else {
      const siteDef = SITES.find(s => s.key === engineer.site);
      if (!siteDef) throw new Error('Invalid site assignment');
      db = await getDb(siteDef.dbName);
    }

    const body = await req.json();
    const { withdrawalDate, items, receiverName, description, notes } = body;

    if (!withdrawalDate || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ FIX: Process stock and generate receipt
    for (const item of items) {
      const eq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      if (!eq || eq.quantity < item.quantityWithdrawn) {
        return NextResponse.json({ error: `Insufficient stock for ${item.equipmentName}` }, { status: 400 });
      }
    }

    // Deduct stock
    for (const item of items) {
      await db.collection('equipment').updateOne(
        { _id: new ObjectId(item.equipmentId) },
        { $inc: { quantity: -Number(item.quantityWithdrawn) } }
      );
    }

    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const result = await db.collection('withdrawals').insertOne({
      withdrawalDate: new Date(withdrawalDate), // Store as proper Date Object
      engineerName: engineer.name,
      receiverName,
      description,
      notes,
      items,
      receiptNumber,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId, receiptNumber });
  } catch (e: any) {
    console.error("POST ERROR DETAILS:", e); // Check your VS Code Terminal for this output!
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}