import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { SITES } from '@/lib/sites';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb('WAREHOUSE');
    const withdrawals = await db.collection('withdrawals')
        .find({})
        .sort({ withdrawalDate: -1 })
        .toArray();
    return NextResponse.json(withdrawals);
} catch (error) {
    console.error('Error fetching warehouse withdrawals:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
}
}

export async function POST(req: Request) {
try {
const session = await getSession();
if (!session || (session.role !== 'ADMIN' && session.role !== 'ENGINEER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const body = await req.json();
const { items, receiverName, senderName, notes, withdrawalDate, destinationSite } = body;

if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 });
}

const db = await getDb('WAREHOUSE');

const date = new Date();
const year = date.getFullYear();
const count = await db.collection('withdrawals').countDocuments();
const receiptNumber = `W-RCP-${year}-${(count + 1).toString().padStart(5, '0')}`;

const withdrawal = {
    withdrawalDate: new Date(withdrawalDate || date),
    engineerId: session.user?.id || 'admin',
    engineerName: senderName || session.name,
    siteName: 'Main Warehouse', 
    destinationSiteName: destinationSite,
    receiverName, 
    senderName, 
    items, 
    notes, receiptNumber,
    createdAt: new Date(), updatedAt: new Date(),
};

const result = await db.collection('withdrawals').insertOne(withdrawal);

for (const item of items) {
    if (item.equipmentId) {
    await db.collection('equipment').updateOne({ _id: new ObjectId(item.equipmentId) }, { $inc: { quantity: -Number(item.quantityWithdrawn) } });
    }
}

// Replicate to Destination Site Database
if (destinationSite && destinationSite !== 'Main Warehouse') {
    try {
        // Map the site label (e.g. "SUP'PTIC") to a safe DB name (e.g. "inventory_site_supptic")
        const siteConfig = SITES.find(s => s.label === destinationSite);
        const targetDbName = siteConfig ? `inventory_site_${siteConfig.key.toLowerCase()}` : destinationSite;
        const siteDb = await getDb(targetDbName);
        
        // 1. Log the incoming transfer in the site's history
        await siteDb.collection('withdrawals').insertOne({
            ...withdrawal,
            _id: new ObjectId(), // Generate a new ID for the site DB
            source: 'Main Warehouse',
            type: 'INCOMING_TRANSFER'
        });
        
        // 2. Update the site's equipment inventory
        for (const item of items) {
             await siteDb.collection('equipment').updateOne(
                { name: item.equipmentName },
                { 
                    $inc: { quantity: Number(item.quantityWithdrawn) },
                    $setOnInsert: { 
                        name: item.equipmentName,
                        unit: item.unit,
                        category: 'General',
                        condition: 'Good',
                        createdAt: new Date()
                    }
                },
                { upsert: true }
             );
        }
    } catch (error) {
        console.error(`Failed to sync to site DB ${destinationSite}:`, error);
        // We log the error but don't fail the request since the main warehouse op succeeded
    }
}

return NextResponse.json({ success: true, withdrawalId: result.insertedId, receiptNumber });
} catch (error) {
console.error('Error processing warehouse withdrawal:', error);
return NextResponse.json({ error: 'Database error' }, { status: 500 });
}
}