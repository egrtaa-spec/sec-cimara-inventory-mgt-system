import { NextResponse } from 'next/server';
import { getDb, getWarehouseDb } from '@/lib/mongodb';
import { requireEngineer } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES, getSiteDef } from '@/lib/sites';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const engineer = await requireEngineer();
    if (!engineer) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    let db;
    if (engineer.site === 'WAREHOUSE') {
      db = await getWarehouseDb();
    } else {
      const siteDef = getSiteDef(engineer.site);
      if (!siteDef) throw new Error('Invalid site assignment');
      db = await getDb(siteDef.dbName);
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const q: any = {};
    if (startDate && endDate) {
      // Fix: Ensure we match both BSON Date objects and ISO Strings
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      
      q.$or = [
        { withdrawalDate: { $gte: start, $lte: end } },
        { withdrawalDate: { $gte: startDate, $lte: endDate } }
      ];
    }

    const withdrawals = await db.collection('withdrawals')
      .find(q)
      .sort({ withdrawalDate: -1 })
      .toArray();

    return NextResponse.json(withdrawals);
  } catch (e: any) {
    console.error("GET WITHDRAWALS ERROR:", e);
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const engineer = await requireEngineer();
    if (!engineer) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    let db;
    if (engineer.site === 'WAREHOUSE') {
      db = await getWarehouseDb();
    } else {
      const siteDef = getSiteDef(engineer.site);
      if (!siteDef) throw new Error('Invalid site assignment');
      db = await getDb(siteDef.dbName);
    }

    const body = await req.json();
    const { withdrawalDate, description, notes, items, receiverName } = body;

    // Validation: Ensure all required fields exist
    if (!withdrawalDate || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing Date or Items' }, { status: 400 });
    }

    // Step 1: Stock Validation
    for (const item of items) {
      if (!item.equipmentId) {
        return NextResponse.json({ error: `Missing ID for ${item.equipmentName}` }, { status: 400 });
      }
      const eq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      if (!eq) return NextResponse.json({ error: `Item ${item.equipmentName} not found` }, { status: 404 });
      
      if (Number(item.quantityWithdrawn) > Number(eq.quantity)) {
        return NextResponse.json({ error: `Insufficient stock for ${eq.name}` }, { status: 400 });
      }
    }

    // Step 2: Deduct Stock
    for (const item of items) {
      await db.collection('equipment').updateOne(
        { _id: new ObjectId(item.equipmentId) },
        { $inc: { quantity: -Number(item.quantityWithdrawn) } }
      );
    }

    // Step 3: Generate Receipt Number
    const date = new Date();
    const year = date.getFullYear();
    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${year}-${(count + 1).toString().padStart(5, '0')}`;

    // Resolve site details for the record
    const siteDef = getSiteDef(engineer.site);

    // Step 4: Save Record
    const result = await db.collection('withdrawals').insertOne({
      withdrawalDate: new Date(withdrawalDate), // Store as proper Date object
      siteName: siteDef ? siteDef.label : engineer.site, // Save the site name explicitly
      siteKey: siteDef ? siteDef.key : engineer.site,    // Save the site key explicitly
      engineerName: engineer.name,
      receiverName: receiverName || '',
      description: description || '',
      notes: notes || '',
      receiptNumber,
      items: items.map((i: any) => ({
        equipmentId: i.equipmentId,
        equipmentName: i.equipmentName,
        quantityWithdrawn: Number(i.quantityWithdrawn),
        unit: i.unit,
      })),
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      id: String(result.insertedId), 
      receiptNumber 
    });

  } catch (e: any) {
    // Crucial: Log the actual error to your terminal to find the specific cause
    console.error('POST WITHDRAWAL ERROR DETAILS:', e);
    return NextResponse.json({ 
      error: e?.message || 'Internal Database Error' 
    }, { status: 500 });
  }
}