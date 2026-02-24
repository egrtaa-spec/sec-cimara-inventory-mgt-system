import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { SITES, siteLabel, SiteKey, getSiteDef } from '@/lib/sites';
import { parseISO, startOfDay, endOfDay, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const siteParam = searchParams.get('site') || 'all';

    console.log('Query Parameters:', { startDate, endDate, siteParam });

    const query: any = {};

    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      query.$or = [
        { withdrawalDate: { $gte: startOfDay(start), $lte: endOfDay(end) } },
        { withdrawalDate: { $gte: startDate, $lte: endDate } }
      ];
    }

    let allWithdrawals: any[] = [];

   const fetchFromSite = async (siteDef: typeof SITES[0]) => {
    try {
      const db = await getDb(siteDef.dbName);
      const withdrawals = await db.collection('withdrawals')
        .find(query)
        .sort({ withdrawalDate: -1 })
        .toArray();
      return withdrawals.map((w: any) => ({ ...w, siteName: siteDef.label }));
    } catch (error) {
      console.error(`Failed to fetch from ${siteDef.key}`, error);
      return [];
    }
  };


    if (siteParam !== 'all') {
      const siteDef = getSiteDef(siteParam);
      if (siteDef) {
        allWithdrawals = await fetchFromSite(siteDef);
      }
    } else {
      for (const site of SITES) {
        const siteWithdrawals = await fetchFromSite(site);
        allWithdrawals.push(...siteWithdrawals);
      }
    }

    console.log('All Withdrawals:', allWithdrawals); // Check if data is correctly fetched

    return NextResponse.json(allWithdrawals);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
