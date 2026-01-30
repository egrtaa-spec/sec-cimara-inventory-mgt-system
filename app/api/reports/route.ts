import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'daily' or 'weekly'
    const siteName = searchParams.get('siteName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (siteName) query.siteName = siteName;

    let dateField = 'reportDate';
    if (type === 'weekly') {
      dateField = 'weekStartDate';
    }

    if (startDate || endDate) {
      query[dateField] = {};
      if (startDate) query[dateField].$gte = new Date(startDate);
      if (endDate) query[dateField].$lte = new Date(endDate);
    }

    const collection = type === 'weekly' ? 'weeklyReports' : 'dailyReports';
    const reports = await db
      .collection(collection)
      .find(query)
      .sort({ [dateField]: -1 })
      .toArray();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { type, siteName, startDate, endDate } = await request.json();

    if (type === 'daily') {
      return generateDailyReport(db, siteName, new Date(startDate));
    } else if (type === 'weekly') {
      return generateWeeklyReport(
        db,
        siteName,
        new Date(startDate),
        new Date(endDate)
      );
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateDailyReport(db: any, siteName: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const withdrawals = await db
    .collection('withdrawals')
    .find({
      siteName,
      withdrawalDate: { $gte: startOfDay, $lte: endOfDay },
    })
    .toArray();

  const equipmentUsed = new Map();

  for (const withdrawal of withdrawals) {
    for (const item of withdrawal.items) {
      const key = item.equipmentName;
      if (!equipmentUsed.has(key)) {
        equipmentUsed.set(key, {
          equipmentName: item.equipmentName,
          quantityWithdrawn: 0,
          unit: item.unit,
          engineers: [],
        });
      }
      const entry = equipmentUsed.get(key);
      entry.quantityWithdrawn += item.quantityWithdrawn;
      if (!entry.engineers.includes(withdrawal.engineerName)) {
        entry.engineers.push(withdrawal.engineerName);
      }
    }
  }

  const report = {
    reportDate: startOfDay,
    siteName,
    totalWithdrawals: withdrawals.length,
    equipmentUsed: Array.from(equipmentUsed.values()),
    createdAt: new Date(),
  };

  const result = await db.collection('dailyReports').insertOne(report);

  return NextResponse.json({ _id: result.insertedId, ...report }, { status: 201 });
}

async function generateWeeklyReport(
  db: any,
  siteName: string,
  startDate: Date,
  endDate: Date
) {
  const withdrawals = await db
    .collection('withdrawals')
    .find({
      siteName,
      withdrawalDate: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  const dailyBreakdown = new Map();

  for (const withdrawal of withdrawals) {
    const dateKey = withdrawal.withdrawalDate.toISOString().split('T')[0];

    if (!dailyBreakdown.has(dateKey)) {
      dailyBreakdown.set(dateKey, {
        date: new Date(dateKey),
        withdrawals: 0,
        equipmentUsed: new Map(),
      });
    }

    const day = dailyBreakdown.get(dateKey);
    day.withdrawals += 1;

    for (const item of withdrawal.items) {
      const key = item.equipmentName;
      if (!day.equipmentUsed.has(key)) {
        day.equipmentUsed.set(key, {
          equipmentName: item.equipmentName,
          quantityWithdrawn: 0,
          unit: item.unit,
        });
      }
      day.equipmentUsed.get(key).quantityWithdrawn += item.quantityWithdrawn;
    }
  }

  const report = {
    weekStartDate: startDate,
    weekEndDate: endDate,
    siteName,
    totalWithdrawals: withdrawals.length,
    dailyBreakdown: Array.from(dailyBreakdown.values()).map((day: any) => ({
      ...day,
      equipmentUsed: Array.from(day.equipmentUsed.values()),
    })),
    createdAt: new Date(),
  };

  const result = await db.collection('weeklyReports').insertOne(report);

  return NextResponse.json({ _id: result.insertedId, ...report }, { status: 201 });
}
