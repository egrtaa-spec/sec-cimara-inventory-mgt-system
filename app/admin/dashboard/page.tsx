import { Metadata } from "next"
import { redirect } from "next/navigation"
import { 
  Activity, 
  Package, 
  AlertTriangle, 
  TrendingUp
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getSession } from "@/lib/session"
import { getDb } from "@/lib/mongodb"
import { SITES } from "@/lib/sites"

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

  const totalEquipment = validResults.reduce((acc, r) => acc + r.equipmentCount, 0);
  const totalWithdrawals = validResults.reduce((acc, r) => acc + r.withdrawalCount, 0);
  const totalLowStock = validResults.reduce((acc, r) => acc + r.lowStockCount, 0);

  const allWithdrawals = validResults.flatMap(r => 
    r.recentDocs.map(doc => ({
      ...doc,
      siteName: r.site.label
    }))
  );

  // Sort by date descending
  allWithdrawals.sort((a, b) => new Date(b.withdrawalDate).getTime() - new Date(a.withdrawalDate).getTime());

  return {
    totalEquipment,
    totalWithdrawals,
    totalLowStock,
    siteStats: validResults.map(r => ({
      name: r.site.label,
      equipment: r.equipmentCount,
      withdrawals: r.withdrawalCount,
      lowStock: r.lowStockCount
    })),
    recentWithdrawals: allWithdrawals.slice(0, 10)
  };
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites" disabled>Site Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Equipment
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEquipment}</div>
                <p className="text-xs text-muted-foreground">
                  Across all {SITES.length} sites
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Withdrawals
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWithdrawals}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLowStock}</div>
                <p className="text-xs text-muted-foreground">
                  Items with quantity &lt; 5
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sites
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{SITES.length}</div>
                <p className="text-xs text-muted-foreground">
                  Operational locations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Site Overview</CardTitle>
                <CardDescription>Inventory status per site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.siteStats.map((site) => (
                    <div key={site.name} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{site.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {site.equipment} items • {site.lowStock} low stock
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {site.withdrawals} withdrawals
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest withdrawals across all sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.recentWithdrawals.map((w: any) => (
                    <div key={w._id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{w.engineerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {w.siteName} • {new Date(w.withdrawalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        +{w.items?.length || 0} items
                      </div>
                    </div>
                  ))}
                  {stats.recentWithdrawals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}