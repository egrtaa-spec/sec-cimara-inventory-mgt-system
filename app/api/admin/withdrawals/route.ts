import { NextResponse } from 'next/server';
import { getWarehouseDb, getSiteDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { getSiteDef } from '@/lib/sites';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { withdrawalDate, items, receiverName, senderName, destinationSite, notes } = body;

    const warehouseDb = await getWarehouseDb();
    const siteDef = getSiteDef(destinationSite); 

    for (const item of items) {
      const oid = new ObjectId(item.equipmentId);
      
      // 1. Deduct from Warehouse
      await warehouseDb.collection('equipment').updateOne(
        { _id: oid },
        { $inc: { quantity: -Number(item.quantityWithdrawn) } }
      );

      // 2. Add to Destination Site
      if (siteDef) {
        const siteDb = await getSiteDb(siteDef.dbName);
        await siteDb.collection('equipment').updateOne(
          { name: item.equipmentName },
          { 
            $inc: { quantity: Number(item.quantityWithdrawn) },
            $setOnInsert: { unit: item.unit, createdAt: new Date() } 
          },
          { upsert: true }
        );
      }
    }

    // ✅ 3. THE MISSING STEP: Save the transaction record
    // This is what populates your Atlas "withdrawals" collection and Dashboard
    const count = await warehouseDb.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const result = await warehouseDb.collection('withdrawals').insertOne({
      withdrawalDate: new Date(withdrawalDate),
      receiverName,
      senderName: senderName || session.name,
      destinationSite,
      items: items.map((i: any) => ({
        ...i,
        quantityWithdrawn: Number(i.quantityWithdrawn)
      })),
      receiptNumber,
      notes: notes || '',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, receiptNumber, id: result.insertedId });
  } catch (e: any) {
    console.error("POST ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}