import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb('WAREHOUSE');
        const equipment = await db.collection('equipment').find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(equipment);
    } catch (error) {
        console.error('Error fetching warehouse equipment:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

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

    const db = await getDb('WAREHOUSE');
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