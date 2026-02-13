import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { getSiteDb } from '@/lib/mongodb'; 

// ✅ Named export for GET (to refresh the dashboard)
export async function GET() {
  try {
    const session = await getSession();
    // Use UPPERCASE to match your session types
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const siteKey = (session as any).site || 'ENAM';
    const db = await getSiteDb(siteKey);
    const equipment = await db.collection('equipment').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(equipment);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ✅ Named export for POST (to add the equipment)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    
    // 🔐 Role check
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const siteKey = (session as any).site || 'ENAM';
    const db = await getSiteDb(siteKey); // ✅ Connect to specific site DB
    
    const body = await req.json();
    const { name, quantity } = body;

    // 🔢 Ensure quantity is a number to prevent MongoDB math errors
    const numQuantity = Number(quantity);
    if (!name || isNaN(numQuantity)) {
      return NextResponse.json({ error: 'Invalid name or quantity' }, { status: 400 });
    }

    const equipmentCollection = db.collection('equipment');

    // 🔄 Atomic update: Increment if exists, create if new
    await equipmentCollection.updateOne(
      { name },
      { 
        $inc: { quantity: numQuantity },
        $set: { ...body, quantity: numQuantity, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("POST Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}