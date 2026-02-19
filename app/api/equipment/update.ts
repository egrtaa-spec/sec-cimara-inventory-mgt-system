import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { equipmentName, quantity } = await req.json();

    if (!equipmentName || quantity === undefined) {
      return NextResponse.json({ error: 'Equipment name and quantity are required' }, { status: 400 });
    }

    const db = await getDb(session.site);
    const result = await db.collection('equipment').updateOne(
      { name: equipmentName },
      { $set: { quantity: quantity } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Quantity updated successfully' });
  } catch (error) {
    console.error('Error updating equipment quantity:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
