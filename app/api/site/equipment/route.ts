import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb(session.site);
    const equipment = await db.collection('equipment').find({}).sort({ _id: -1 }).toArray();

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name || body.equipmentName;
    const { category, serialNumber, quantity, unit, location, condition } = body;

    if (!name || !quantity) {
      return NextResponse.json({ error: 'Equipment name and quantity are required' }, { status: 400 });
    }

    const db = await getDb(session.site);
    const collection = db.collection('equipment');

    // Check if equipment exists
    const existingEquipment = await collection.findOne({ name });

    if (existingEquipment) {
      // Update existing quantity
      await collection.updateOne(
        { _id: existingEquipment._id },
        { $inc: { quantity: Number(quantity) } }
      );
      return NextResponse.json({ 
        message: 'Equipment quantity updated successfully', 
        equipmentId: existingEquipment._id,
        updated: true 
      });
    }

    // Insert new equipment
    const result = await collection.insertOne({
      name,
      category,
      serialNumber,
      quantity: Number(quantity),
      unit,
      location,
      condition,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      message: 'Equipment added successfully', 
      equipmentId: result.insertedId,
      updated: false
    });

  } catch (error) {
    console.error('Error adding equipment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}