import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getDb } from "@/lib/mongodb"
import { SITES } from "@/lib/sites"
import { AdminDashboardView } from "@/components/admin-dashboard-view"
import { getCalculatedWarehouseEquipment } from "@/app/api/warehouse/equipment/route"
import { getWarehouseWithdrawals } from "@/app/api/warehouse/withdrawals/route"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "CIMARA Admin Dashboard",
}

// Force dynamic rendering to ensure stats are always up to date
export const dynamic = 'force-dynamic';

async function getAdminStats() {
  // ✅ FIX: Fetch warehouse data directly via function calls for robustness. This avoids network issues and config errors.
  const [warehouseEquipment, warehouseWithdrawals] = await Promise.all([
    getCalculatedWarehouseEquipment(),
    getWarehouseWithdrawals()
  ]);

  const warehouseStats = {
    equipmentCount: warehouseEquipment.length,
    withdrawalCount: warehouseWithdrawals.length,
    lowStockCount: warehouseEquipment.filter(item => item.currentStock < 5).length,
    recentDocs: warehouseWithdrawals
      .sort((a, b) => new Date(b.withdrawalDate).getTime() - new Date(a.withdrawalDate).getTime())
      .slice(0, 5)
      .map(doc => ({
        ...doc,
        _id: doc._id.toString(),
        withdrawalDate: doc.withdrawalDate,
      }))
  };

  // Fetch data for other sites directly from DB
  const sitePromises = SITES.map(async (site) => {
    try {
      const db = await getDb(site.key);
      
      const [equipmentCount, withdrawalCount, lowStockCount] = await Promise.all([
        db.collection('equipment').countDocuments(),
        db.collection('withdrawals').countDocuments(),
        db.collection('equipment').countDocuments({ quantity: { $lt: 5 } }),
      ]);

      return {
        name: site.label,
        equipment: equipmentCount,
        withdrawals: withdrawalCount,
        lowStock: lowStockCount
      };
    } catch (error) {
      console.error(`Error fetching stats for ${site.key}:`, error);
      return null;
    }
  });
  const siteResults = await Promise.all(sitePromises);
  const validSiteResults = siteResults.filter((r): r is NonNullable<typeof r> => r !== null);

  return {
    warehouse: warehouseStats,
    sites: validSiteResults
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