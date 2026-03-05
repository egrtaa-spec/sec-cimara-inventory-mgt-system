import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';

/**
 * Helper function to get the current user's session and site information.
 * It centralizes authorization and site validation logic.
 */
async function getSiteFromSession() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized', status: 401, session: null, siteDef: null };
  }

  const siteKey = session.site || session.user?.site;
  const siteDef = SITES.find(s => s.key === siteKey);

  // This endpoint is for construction sites only, not the main warehouse.
  if (!siteKey || siteKey === 'WAREHOUSE' || !siteDef) {
    return { error: 'Invalid site assignment for this operation', status: 400, session, siteDef: null };
  }

  return { session, siteDef, error: null, status: 200 };
}

/**
 * GET handler to fetch all equipment for the engineer's assigned site.
 */
export async function GET() {
    try {
        const { error, status, siteDef } = await getSiteFromSession();
        if (error || !siteDef) {
            return NextResponse.json({ error }, { status: status || 500 });
        }

        const db = await getDb(siteDef.dbName);
        const equipment = await db.collection('equipment').find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(equipment);
    } catch (e: any) {
        console.error("Site Equipment Fetch Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST handler to add new equipment or update stock for existing equipment at a site.
 */
export async function POST(req: Request) {
    try {
        const { error, status, siteDef, session } = await getSiteFromSession();
        if (error || !siteDef || !session) {
            return NextResponse.json({ error }, { status: status || 500 });
        }

        const db = await getDb(siteDef.dbName);
        const body = await req.json();

        const { name, serialNumber, quantity } = body;

        if (!name || quantity == null) {
            return NextResponse.json({ error: 'Name and quantity are required' }, { status: 400 });
        }

        // To prevent duplicates, check if equipment with the same name/serial already exists.
        const existingQuery: any = { name: name };
        if (serialNumber) {
            existingQuery.serialNumber = serialNumber;
        }
        const existingEquipment = await db.collection('equipment').findOne(existingQuery);

        if (existingEquipment) {
            // If it exists, just increase the stock quantity.
            await db.collection('equipment').updateOne(
                { _id: existingEquipment._id },
                { $inc: { quantity: Number(quantity) } }
            );
            return NextResponse.json({ success: true, updated: true, id: existingEquipment._id });
        } else {
            // If it's new, create a new equipment document.
            const result = await db.collection('equipment').insertOne({
                ...body,
                quantity: Number(body.quantity),
                createdAt: new Date(),
                createdBy: session.user?.name || 'System'
            });
            return NextResponse.json({ success: true, updated: false, id: result.insertedId });
        }

    } catch (e: any) {
        console.error("Site Equipment Add Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT handler to update the details of a specific piece of equipment.
 */
export async function PUT(req: Request) {
    try {
        const { error, status, siteDef } = await getSiteFromSession();
        if (error || !siteDef) {
            return NextResponse.json({ error }, { status: status || 500 });
        }

        const db = await getDb(siteDef.dbName);
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
        console.error("Site Equipment Update Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE handler to remove a piece of equipment from the site's inventory.
 */
export async function DELETE(req: Request) {
    try {
        const { error, status, siteDef } = await getSiteFromSession();
        if (error || !siteDef) {
            return NextResponse.json({ error }, { status: status || 500 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Equipment ID is required for deletion' }, { status: 400 });
        }

        const db = await getDb(siteDef.dbName);

        // Delete any withdrawals associated with this equipment
        await db.collection('withdrawals').deleteMany({ "items.equipmentId": id });

        const result = await db.collection('equipment').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Equipment not found or already deleted' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (e: any) {
        console.error("Site Equipment Delete Error:", e);
        if (e.name === 'BSONError' || e.message.includes('input must be a 24 character hex string')) {
             return NextResponse.json({ error: 'Invalid Equipment ID format' }, { status: 400 });
        }
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}