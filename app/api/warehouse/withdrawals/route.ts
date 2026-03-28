import { NextResponse } from 'next/server';
import { getDb, getWarehouseDb, connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic';

// This function is imported by the admin dashboard page
export async function getWarehouseWithdrawals() {
    const db = await getWarehouseDb();
    const withdrawals = await db.collection('withdrawals').find({}).sort({ withdrawalDate: -1 }).toArray();
    return withdrawals;
}

export async function GET() {
    try {
        const session = await getSession();
        if (session?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const withdrawals = await getWarehouseWithdrawals();
        
        // Map results to ensure ObjectIds are converted to strings for the frontend
        const serializedWithdrawals = withdrawals.map(w => ({
            ...w,
            _id: w._id.toString(),
            items: w.items.map((item: any) => ({
                ...item,
                equipmentId: item.equipmentId?.toString()
            }))
        }));

        return NextResponse.json(serializedWithdrawals, {
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (error: any) {
        console.error("Warehouse Withdrawals Fetch Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const client = await connectToDatabase();
    const db = await getWarehouseDb();
    const transactionSession = client.startSession();

    try {
        const session = await getSession();
        if (session?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { withdrawalDate, items: rawItems, receiverName, senderName, destinationSite } = body;

        if (!withdrawalDate || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0 || !destinationSite) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const items = rawItems.map((item: any) => ({
            ...item,
            quantityWithdrawn: Number(item.quantityWithdrawn)
        }));

        const { insertedId, receiptNumber } = await transactionSession.withTransaction(async (session) => {
            // 1. Validate Stock and Deduct
            for (const item of items) {
                if (isNaN(item.quantityWithdrawn) || item.quantityWithdrawn <= 0) {
                    throw new Error(`Invalid quantity for ${item.equipmentName}`);
                }

                const updateResult = await db.collection('equipment').updateOne(
                    { _id: new ObjectId(item.equipmentId), quantity: { $gte: item.quantityWithdrawn } },
                    { $inc: { quantity: -item.quantityWithdrawn } },
                    { session }
                );

                if (updateResult.modifiedCount === 0) {
                    const eq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) }, { session });
                    throw new Error(`Insufficient stock for ${item.equipmentName}. Available: ${eq?.quantity || 0}`);
                }
            }

            // 2. Record Withdrawal
            const count = await db.collection('withdrawals').countDocuments({}, { session });
            const newReceiptNumber = `RCP-WH-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

            const result = await db.collection('withdrawals').insertOne({
                withdrawalDate: new Date(withdrawalDate),
                engineerName: senderName, // In warehouse context, engineer is the sender
                receiverName,
                senderName,
                destinationSite,
                items,
                receiptNumber: newReceiptNumber,
                createdAt: new Date()
            }, { session });

            // 3. Create/Update equipment in the destination site's DB
            const siteDef = SITES.find(s => s.label === destinationSite);
            if (siteDef) {
                const siteDb = await getDb(siteDef.dbName);
                for (const item of items) {
                    const siteEq = await siteDb.collection('equipment').findOne({ name: item.equipmentName }, { session });
                    if (siteEq) {
                        await siteDb.collection('equipment').updateOne(
                            { _id: siteEq._id },
                            { $inc: { quantity: item.quantityWithdrawn } },
                            { session }
                        );
                    } else {
                        const warehouseEq = await db.collection('equipment').findOne({ _id: new ObjectId(item.equipmentId) }, { session });
                        await siteDb.collection('equipment').insertOne({
                            name: item.equipmentName,
                            category: warehouseEq?.category,
                            unit: warehouseEq?.unit,
                            condition: 'good',
                            quantity: item.quantityWithdrawn,
                            createdAt: new Date(),
                        }, { session });
                    }
                }
            }

            return { insertedId: result.insertedId, receiptNumber: newReceiptNumber };
        });

        return NextResponse.json({ success: true, id: insertedId, receiptNumber });

    } catch (error: any) {
        console.error("Warehouse Withdrawal Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        await transactionSession.endSession();
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (session?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 });
        }

        const db = await getWarehouseDb();
        
        const withdrawal = await db.collection('withdrawals').findOne({ _id: new ObjectId(id) });
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        // Restore stock for each item in the warehouse
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
        console.error("Warehouse Withdrawal Delete Error:", error);
        if (error.name === 'BSONError' || error.message.includes('input must be a 24 character hex string')) {
             return NextResponse.json({ error: 'Invalid Withdrawal ID format' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}