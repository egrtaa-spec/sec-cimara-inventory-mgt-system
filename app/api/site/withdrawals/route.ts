import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteKey = session.site || session.user?.site;
    const siteDef = SITES.find(s => s.key === siteKey);

    if (!siteKey || siteKey === 'WAREHOUSE' || !siteDef) {
      return NextResponse.json({ error: 'Invalid site assignment for this operation' }, { status: 400 });
    }

    const db = await getDb(siteDef.dbName);
    const withdrawals = await db.collection('withdrawals').find({}).sort({ withdrawalDate: -1 }).toArray();

    return NextResponse.json(withdrawals);

  } catch (error: any) {
    console.error("Site Withdrawals Fetch Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the user has a valid site assignment (not WAREHOUSE)
    // Defensively check both session.site and session.user.site due to potential session inconsistencies
    const siteKey = session.site || session.user?.site;
    const siteDef = SITES.find(s => s.key === siteKey);

    // Also explicitly block if the site is WAREHOUSE, as this endpoint is only for construction sites.
    if (!siteKey || siteKey === 'WAREHOUSE' || !siteDef) {
      return NextResponse.json({ error: 'Invalid site assignment for this operation' }, { status: 400 });
    }

    const db = await getDb(siteDef.dbName);
    const body = await req.json();
    const { withdrawalDate, items: rawItems, receiverName, description } = body;

    if (!withdrawalDate || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize items
    const items = rawItems.map((item: any) => ({
      ...item,
      quantityWithdrawn: Number(item.quantityWithdrawn)
    }));

    // 1. Validate Stock
    for (const item of items) {
      const eq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) });
      
      if (isNaN(item.quantityWithdrawn) || item.quantityWithdrawn <= 0) {
        return NextResponse.json({ error: `Invalid quantity for ${item.equipmentName}` }, { status: 400 });
      }
      
      const currentStock = eq ? Number(eq.quantity) : 0;

      if (!eq || currentStock < item.quantityWithdrawn) {
        return NextResponse.json({ error: `Insufficient stock for ${item.equipmentName}. Available: ${currentStock}` }, { status: 400 });
      }
    }

    // 2. Deduct Stock
    for (const item of items) {
      await db.collection('equipment').updateOne(
        { _id: new ObjectId(item.equipmentId) },
        { $inc: { quantity: -item.quantityWithdrawn } }
      );
    }

    // 3. Record Withdrawal
    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${siteKey}-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const result = await db.collection('withdrawals').insertOne({
      withdrawalDate: new Date(withdrawalDate),
      engineerName: session.user?.name || session.name || 'Engineer',
      receiverName,
      description,
      destinationSite: 'Used on Site',
      items,
      receiptNumber,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId, receiptNumber });

  } catch (error: any) {
    console.error("Site Withdrawal Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteKey = session.site || session.user?.site;
    const siteDef = SITES.find(s => s.key === siteKey);

    if (!siteKey || siteKey === 'WAREHOUSE' || !siteDef) {
      return NextResponse.json({ error: 'Invalid site assignment for this operation' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 });
    }

    const db = await getDb(siteDef.dbName);
    
    // Get the withdrawal to restore stock
    const withdrawal = await db.collection('withdrawals').findOne({ _id: new ObjectId(id) });

    if (!withdrawal) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Restore stock for each item
    if (withdrawal.items && Array.isArray(withdrawal.items)) {
        for (const item of withdrawal.items) {
            if (item.equipmentId && item.quantityWithdrawn) {
                await db.collection('equipment').updateOne(
                    { _id: new ObjectId(item.equipmentId) },
                    { $inc: { quantity: Number(item.quantityWithdrawn) } }
                );
            }
        }
    }

    await db.collection('withdrawals').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Withdrawal deleted and stock restored' });

  } catch (error: any) {
    console.error("Site Withdrawal Delete Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}