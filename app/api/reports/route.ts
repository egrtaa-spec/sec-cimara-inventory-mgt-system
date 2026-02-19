
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession} from '@/lib/session';
import { SITES, siteLabel, SiteKey } from '@/lib/sites';

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
    const siteParam = searchParams.get('site') || searchParams.get('siteName') || 'all';

   // api/reports/route.ts

const query: any = {};

if (startDate && endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // This looks for either field to ensure data is caught
  query.$or = [
    { withdrawalDate: { $gte: start, $lte: end } },
    { createdAt: { $gte: start, $lte: end } }
  ];
}
    

    let allWithdrawals: any[] = [];

    const fetchFromSite = async (siteKey: SiteKey) => {
      try {
         const db = await getDb(siteKey);
         const withdrawals = await db.collection('withdrawals')
             .find(query)
             .sort({ withdrawalDate: -1 })
             .toArray();
         return withdrawals.map(w => ({ ...w, siteName: siteLabel(siteKey) }));
      } catch (error) {
         console.error(`Failed to fetch from ${siteKey}`, error);
         return [];
      }
    };

    if (siteParam && siteParam !== 'all') {
      const siteDef = SITES.find(s => s.key === siteParam || s.label === siteParam);
      if (siteDef) {
         allWithdrawals = await fetchFromSite(siteDef.key);
      }
    } else {
      for (const site of SITES) {
         const siteWithdrawals = await fetchFromSite(site.key);
         allWithdrawals.push(...siteWithdrawals);
      }
    }

    return NextResponse.json(allWithdrawals);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
