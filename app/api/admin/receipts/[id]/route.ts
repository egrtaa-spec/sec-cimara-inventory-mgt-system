import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getWarehouseDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jsPDF from 'jspdf';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin();
    const db = await getWarehouseDb();

    const w = await db.collection('withdrawals').findOne({ _id: new ObjectId(params.id) });
    if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('CIMARA - Warehouse Dispatch Receipt', pageWidth / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Quality brings reliability', pageWidth / 2, 22, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Receipt ID: ${String(w._id)}`, 14, 34);
    doc.text(`Date: ${w.withdrawalDate}`, 14, 41);
    doc.text(`Site: ${w.siteName}`, 14, 48);
    doc.text(`Receiver: ${w.receiverName}`, 14, 55);
    doc.text(`Sender: ${w.senderName}`, 14, 62);
    doc.text(`Processed By: ${w.processedBy}`, 14, 69);

    doc.text('Items:', 14, 80);
    let y = 88;
    for (const item of w.items || []) {
      doc.text(`- ${item.equipmentName}: ${item.quantityWithdrawn} ${item.unit}`, 16, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 20; }
    }

    const bytes = doc.output('arraybuffer');

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${w._id}.pdf"`,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
