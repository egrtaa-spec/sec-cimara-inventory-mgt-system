import { NextResponse } from 'next/server';
import { getDb, getWarehouseDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function getWarehouseWithdrawals() {
    const db = await getWarehouseDb();
    const withdrawals = await db.collection('withdrawals').find({}).sort({ withdrawalDate: -1 }).toArray();
    return withdrawals;
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const db = await getWarehouseDb();
        const filter: any = {};

        if (startDate) {
            const start = startOfDay(parseISO(startDate));
            const end = endDate ? endOfDay(parseISO(endDate)) : endOfDay(parseISO(startDate));
            filter.withdrawalDate = { $gte: start, $lte: end };
        }

        const withdrawals = await db.collection('withdrawals').find(filter).sort({ withdrawalDate: -1 }).toArray();
        return NextResponse.json(withdrawals);
    } catch (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let db;

    if (session.role === 'ADMIN' || session.site === 'WAREHOUSE') {
      db = await getWarehouseDb();
    } else {
      const siteDef = SITES.find(s => s.key === session.site);
      if (!siteDef) return NextResponse.json({ error: 'Invalid site assignment' }, { status: 400 });
      db = await getDb(siteDef.dbName);
    }

    const body = await req.json();
    const { withdrawalDate, items: rawItems, receiverName, senderName, description, notes, destinationSite } = body;

    if (!withdrawalDate || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ FIX: Sanitize items to ensure quantities are numbers
    const items = rawItems.map((item: any) => ({
      ...item,
      quantityWithdrawn: Number(item.quantityWithdrawn)
    }));

    // 1. Validate Stock for ALL items first (Real-life logic: Check if items exist on shelf)
    for (const item of items) {
      const eq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      
      if (isNaN(item.quantityWithdrawn) || item.quantityWithdrawn <= 0) {
        return NextResponse.json({ error: `Invalid quantity for ${item.equipmentName}` }, { status: 400 });
      }
      
      // In real-life logic, DB quantity IS the current stock
      const currentStock = eq ? Number(eq.quantity) : 0;

      if (!eq || currentStock < item.quantityWithdrawn) {
        return NextResponse.json({ error: `Insufficient stock for ${item.equipmentName}. Available: ${currentStock}` }, { status: 400 });
      }
    }

    // 2. Deduct Stock (Real-life logic: Remove items from shelf)
    for (const item of items) {
      await db.collection('equipment').updateOne(
        { _id: new ObjectId(item.equipmentId) },
        { $inc: { quantity: -item.quantityWithdrawn } }
      );
    }

    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const result = await db.collection('withdrawals').insertOne({
      withdrawalDate: new Date(withdrawalDate), // Store as proper Date Object
      engineerName: senderName || session.user?.name || session.name || 'Admin',
      receiverName,
      description,
      destinationSite,
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