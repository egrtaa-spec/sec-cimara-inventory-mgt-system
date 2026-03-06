import { NextResponse } from 'next/server';
import { getWarehouseDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic';

export async function getCalculatedWarehouseEquipment() {
    const db = await getWarehouseDb();
    
    // 1. Fetch current equipment state
    const equipment = await db.collection('equipment').find({}).sort({ name: 1 }).toArray();
    
    // 2. Fetch all historical withdrawals
    const withdrawals = await db.collection('withdrawals').find({}).toArray();

    // 3. Calculate dynamic totals for each item
    const calculatedEquipment = equipment
        .filter(item => item && item._id) // ✅ FIX: Safely skip any documents that are missing an _id to prevent a server crash.
        .map(item => {
        // Flatten all items from all withdrawal receipts
        const allWithdrawnItems = withdrawals.flatMap(w => w.items || []);
        
        // Filter withdrawals specifically for this piece of equipment
        const itemWithdrawals = allWithdrawnItems.filter(wItem => 
            wItem.equipmentId === item._id.toString() || wItem.equipmentName === item.name
        );

        // Sum up the quantities withdrawn
        const totalWithdrawn = itemWithdrawals.reduce((sum, w) => 
            sum + (Number(w.quantityWithdrawn) || 0), 0
        );

        return {
            ...item,
            _id: item._id.toString(), // ✅ FIX: Convert ObjectId to string for frontend Select component
            // Real-life logic: Initial = Current (DB) + What was taken (Withdrawn)
            initialStock: (Number(item.quantity) || 0) + totalWithdrawn,
            totalWithdrawn: totalWithdrawn,
            // Real-life logic: DB Quantity IS the Current Stock
            currentStock: Number(item.quantity) || 0
        };
    });

    return calculatedEquipment;
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const calculatedEquipment = await getCalculatedWarehouseEquipment();
        return NextResponse.json(calculatedEquipment);
    } catch (error) {
        console.error('Error fetching warehouse equipment:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

// POST remains the same for adding/updating base stock...

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, serialNumber, quantity, unit, location, condition } = body;

    if (!name || !quantity) {
      return NextResponse.json({ error: 'Equipment name and quantity are required' }, { status: 400 });
    }

    const db = await getWarehouseDb();
    const collection = db.collection('equipment');

    const existingEquipment = await collection.findOne({ name });

    if (existingEquipment) {
      await collection.updateOne(
        { _id: existingEquipment._id },
        { $inc: { quantity: Number(quantity) } }
      );
      return NextResponse.json({ message: 'Equipment quantity updated successfully', equipmentId: existingEquipment._id });
    }

    const result = await collection.insertOne({
      name, category, serialNumber, quantity: Number(quantity), unit,
      location: location || 'Main Warehouse',
      condition, createdAt: new Date(), updatedAt: new Date()
    });
    return NextResponse.json({ message: 'Equipment added successfully', equipmentId: result.insertedId });

  } catch (error) {
    console.error('Error adding warehouse equipment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (session?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getWarehouseDb();
        const { id, updates } = await req.json();

        if (!id || !updates) {
            return NextResponse.json({ error: 'Missing equipment ID or update data' }, { status: 400 });
        }

        const result = await db.collection('equipment').updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (e: any) {
        console.error("Warehouse Equipment Update Error:", e);
        if (e.name === 'BSONError' || e.message.includes('input must be a 24 character hex string')) {
             return NextResponse.json({ error: 'Invalid Equipment ID format' }, { status: 400 });
        }
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
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
            return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
        }

        const db = await getWarehouseDb();

        // Also delete associated withdrawals from the main warehouse
        await db.collection('withdrawals').deleteMany({ "items.equipmentId": id });

        const result = await db.collection('equipment').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Equipment and associated withdrawals deleted' });
    } catch (e: any)
    {
        console.error("Warehouse Equipment Delete Error:", e);
        if (e.name === 'BSONError' || e.message.includes('input must be a 24 character hex string')) {
             return NextResponse.json({ error: 'Invalid Equipment ID format' }, { status: 400 });
        }
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}