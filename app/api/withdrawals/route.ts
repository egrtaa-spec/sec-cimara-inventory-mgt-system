import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession, SiteKey } from '@/lib/session';
import { siteLabel } from '@/lib/sites';

export const dynamic = 'force-dynamic';

// GET: Fetch withdrawals for the current session's site
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb(session.site);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (startDate && endDate) {
      query.withdrawalDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const withdrawals = await db.collection('withdrawals')
      .find(query)
      .sort({ withdrawalDate: -1 })
      .toArray();

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST: Record a new withdrawal
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, receiverName, senderName, notes, withdrawalDate } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const db = await getDb(session.site);
    const date = new Date();
    const year = date.getFullYear();
    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${year}-${(count + 1).toString().padStart(5, '0')}`;

    const withdrawal = {
      withdrawalDate: new Date(withdrawalDate || date),
      engineerId: session.user?.id || 'unknown',
      engineerName: session.name || session.username,
      siteName: siteLabel(session.site as SiteKey), 
      receiverName,
      senderName,
      items,
      notes,
      receiptNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('withdrawals').insertOne(withdrawal);

    for (const item of items) {
      const filter = item.equipmentId ? { _id: item.equipmentId } : { name: item.equipmentName };
      if (filter) {
        await db.collection('equipment').updateOne(filter, { $inc: { quantity: -Number(item.quantityWithdrawn) } });
      }
    }

    return NextResponse.json({ success: true, withdrawalId: result.insertedId, receiptNumber });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
