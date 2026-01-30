import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Withdrawal, InventoryLog } from '@/lib/db-schemas';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const siteName = searchParams.get('siteName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (siteName) query.siteName = siteName;
    if (startDate || endDate) {
      query.withdrawalDate = {};
      if (startDate) query.withdrawalDate.$gte = new Date(startDate);
      if (endDate) query.withdrawalDate.$lte = new Date(endDate);
    }

    const withdrawals = await db
      .collection('withdrawals')
      .find(query)
      .sort({ withdrawalDate: -1 })
      .toArray();

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Withdrawal = await request.json();
    const { db } = await connectToDatabase();

    if (!body.engineerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate receipt number
    const count = await db.collection('withdrawals').countDocuments();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const withdrawal = {
      ...body,
      withdrawalDate: new Date(body.withdrawalDate),
      status: 'completed' as const,
      receiptNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create withdrawal
    const withdrawalResult = await db
      .collection('withdrawals')
      .insertOne(withdrawal);

    // Update equipment quantities and create inventory logs
    for (const item of body.items) {
      // Update equipment quantity
      await db.collection('equipment').updateOne(
        { _id: new ObjectId(item.equipmentId) },
        {
          $inc: { quantity: -item.quantityWithdrawn },
          $set: { updatedAt: new Date() },
        }
      );

      // Create inventory log
      const equipment = await db.collection('equipment').findOne({
        _id: new ObjectId(item.equipmentId),
      });

      if (equipment) {
        await db.collection('inventoryLogs').insertOne({
          equipmentId: item.equipmentId,
          equipmentName: item.equipmentName,
          previousQuantity: equipment.quantity,
          newQuantity: equipment.quantity - item.quantityWithdrawn,
          change: -item.quantityWithdrawn,
          type: 'withdrawal',
          withdrawalId: withdrawalResult.insertedId.toString(),
          performedBy: body.engineerName,
          timestamp: new Date(),
        });
      }
    }

    return NextResponse.json(
      { _id: withdrawalResult.insertedId, ...withdrawal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
}
