import { NextResponse } from 'next/server';
import { requireEngineer } from '@/lib/session';
import { getDb, getWarehouseDb } from '@/lib/mongodb';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  try {
    const db = await getWarehouseDb();
    const equipment = await db.collection('equipment').find({}).toArray();
    const withdrawals = await db.collection('withdrawals').find({}).toArray();

    const equipmentWorksheet = XLSX.utils.json_to_sheet(equipment);
    const withdrawalsWorksheet = XLSX.utils.json_to_sheet(withdrawals);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, equipmentWorksheet, 'Equipment');
    XLSX.utils.book_append_sheet(wb, withdrawalsWorksheet, 'Withdrawals');

    // Send file for download
    return new NextResponse(
      XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }),
      {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=report.xlsx',
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse('Error exporting data', { status: 500 });
  }
}
