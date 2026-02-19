import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { equipmentName } = await req.json();

    if (!equipmentName) {
      return NextResponse.json({ error: 'Equipment name is required' }, { status: 400 });
    }

    const db = await getDb(session.site);
    const existingEquipment = await db.collection('equipment').findOne({ name: equipmentName });

    if (existingEquipment) {
      return NextResponse.json({ exists: true, quantity: existingEquipment.quantity });
    }
    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking equipment:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
