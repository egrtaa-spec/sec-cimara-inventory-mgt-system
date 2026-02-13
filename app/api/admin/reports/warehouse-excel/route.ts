import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getWarehouseDb } from '@/lib/mongodb';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    requireAdmin();
    const db = await getWarehouseDb();

    const equipment = await db.collection('equipment').find({}).toArray();
    const withdrawals = await db.collection('withdrawals').find({}).sort({ createdAt: -1 }).toArray();

    const ws1 = XLSX.utils.json_to_sheet(equipment.map((e: any) => ({
      Name: e.name,
      Category: e.category,
      Quantity: e.quantity,
      Unit: e.unit,
      Location: e.location,
      Condition: e.condition,
      Price: e.price ?? 0,
    })));

    const ws2 = XLSX.utils.json_to_sheet(withdrawals.map((w: any) => ({
      Date: w.withdrawalDate,
      Site: w.siteName,
      Receiver: w.receiverName,
      Sender: w.senderName,
      ProcessedBy: w.processedBy,
      Items: (w.items || []).map((i: any) => `${i.equipmentName} (${i.quantityWithdrawn} ${i.unit})`).join('; ')
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Warehouse Stock');
    XLSX.utils.book_append_sheet(wb, ws2, 'Warehouse Dispatch');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="warehouse-report.xlsx"',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
