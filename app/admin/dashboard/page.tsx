import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getDb } from "@/lib/mongodb"
import { SITES } from "@/lib/sites"
import { AdminDashboardView } from "@/components/admin-dashboard-view"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "CIMARA Admin Dashboard",
}

// Force dynamic rendering to ensure stats are always up to date
export const dynamic = 'force-dynamic';

async function getAdminStats() {
  const sitePromises = SITES.map(async (site) => {
    try {
      const db = await getDb(site.key);
      
      const [equipmentCount, withdrawalCount, lowStockCount, recentDocs] = await Promise.all([
        db.collection('equipment').countDocuments(),
        db.collection('withdrawals').countDocuments(),
        db.collection('equipment').countDocuments({ quantity: { $lt: 5 } }),
        db.collection('withdrawals')
          .find({})
          .sort({ withdrawalDate: -1 })
          .limit(5)
          .toArray()
      ]);

      return {
        site,
        equipmentCount,
        withdrawalCount,
        lowStockCount,
        recentDocs: recentDocs.map(doc => ({
          ...doc,
          _id: doc._id.toString(),
          withdrawalDate: doc.withdrawalDate, // Keep as date object for sorting later
        }))
      };
    } catch (error) {
      console.error(`Error fetching stats for ${site.key}:`, error);
      return null;
    }
  });

  const results = await Promise.all(sitePromises);
  const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

  // Separate Warehouse Data
  const warehouseData = validResults.find(r => r.site.key === 'WAREHOUSE');
  const sitesData = validResults.filter(r => r.site.key !== 'WAREHOUSE');

  return {
    warehouse: {
      equipmentCount: warehouseData?.equipmentCount || 0,
      withdrawalCount: warehouseData?.withdrawalCount || 0,
      lowStockCount: warehouseData?.lowStockCount || 0,
      recentDocs: warehouseData?.recentDocs || []
    },
    sites: sitesData.map(r => ({
      name: r.site.label,
      equipment: r.equipmentCount,
      withdrawals: r.withdrawalCount,
      lowStock: r.lowStockCount
    }))
  };
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect("/");
  }

  const stats = await getAdminStats();

  return <AdminDashboardView data={stats} />
}