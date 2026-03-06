"use client";

import Image from "next/image"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { 
  Activity, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw,
  LayoutDashboard,
  Settings,
  FileText,
  Warehouse,
  Menu,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportsView } from "@/components/reports-view"
import { WarehouseOperationsView } from "@/components/warehouse-operations-view"
import { WarehouseStockSummaryReport } from "@/app/admin/dashboard/warehouse-stock-summary"
import { WarehouseWithdrawalHistoryReport } from "@/app/admin/dashboard/warehouse-withdrawal-history"

interface DashboardData {
  warehouse: {
    equipmentCount: number;
    withdrawalCount: number;
    lowStockCount: number;
    recentDocs: any[];
  };
  sites: {
    name: string;
    equipment: number;
    withdrawals: number;
    lowStock: number;
  }[];
}

export function AdminDashboardView({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [view, setView] = useState("main-dashboard");
  const [showWarehouseStock, setShowWarehouseStock] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      setRefreshKey(prev => prev + 1);
      router.refresh(); // Refreshes server-side data (stats cards, recent activity)
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r p-6 flex flex-col gap-8 transition-transform duration-200 ease-in-out
        bg-background md:bg-muted/30
        md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">CIMARA</h1>
            <p className="text-sm text-muted-foreground">Inventory System</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </label>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main-dashboard">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  <span>Main Dashboard</span>
                </div>
              </SelectItem>
              <SelectItem value="warehouse-stock">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Warehouse Equipment</span>
                </div>
              </SelectItem>
              <SelectItem value="overview">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </SelectItem>
              <SelectItem value="sites">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Site Management</span>
                </div>
              </SelectItem>
              <SelectItem value="reports">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Generate Reports</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="border-b bg-background p-4 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Image src="/logo.png" alt="CIMARA Logo" width={40} height={40} className="object-contain" />
            <div>
              <h1 className="text-lg font-bold text-primary">CIMARA</h1>
              <p className="text-xs text-muted-foreground">Quality brings reliability</p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
        {view === "main-dashboard" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Warehouse Operations</h2>
            <WarehouseOperationsView onOperationSuccess={handleRefresh} />
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Warehouse Stock</h3>
                <Button onClick={() => setShowWarehouseStock(!showWarehouseStock)} variant="outline">
                  {showWarehouseStock ? 'Hide Stock List' : 'Show Stock List'}
                </Button>
              </div>
              {showWarehouseStock && (
                <Card>
                  <CardHeader><CardTitle>Equipment List</CardTitle></CardHeader>
                  <CardContent><WarehouseStockSummaryReport refreshTrigger={refreshKey} /></CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {view === "warehouse-stock" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Warehouse Inventory</h2>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Current Stock</CardTitle>
                <CardDescription>
                  Complete list of equipment currently available in the main warehouse.
                </CardDescription>
              </CardHeader>
              <CardContent><WarehouseStockSummaryReport refreshTrigger={refreshKey} /></CardContent>
            </Card>
          </div>
        )}

        {view === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
            </div>
            
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Equipments</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.warehouse.equipmentCount}</div>
                  <p className="text-xs text-muted-foreground">Total items in stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.warehouse.withdrawalCount}</div>
                  <p className="text-xs text-muted-foreground">From Warehouse</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.warehouse.lowStockCount}</div>
                  <p className="text-xs text-muted-foreground">Items {'<'} 5</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.sites.length}</div>
                  <p className="text-xs text-muted-foreground">Connected Sites</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 pt-4">
              <Button onClick={() => setShowWarehouseStock(!showWarehouseStock)} variant="outline">
                {showWarehouseStock ? 'Hide Warehouse Equipment List' : 'Show Warehouse Equipment List'}
              </Button>
              {showWarehouseStock && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Warehouse Stock Summary</CardTitle>
                    <CardDescription>
                      A live summary of all equipment in the main warehouse.
                    </CardDescription>
                  </CardHeader>
                  <CardContent><WarehouseStockSummaryReport refreshTrigger={refreshKey} /></CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Warehouse Activity</CardTitle>
                <CardDescription>Latest transactions in the main warehouse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.warehouse.recentDocs.map((w: any) => (
                    <div key={w._id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{w.engineerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(w.withdrawalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        +{w.items?.length || 0} items
                      </div>
                    </div>
                  ))}
                  {data.warehouse.recentDocs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {view === "sites" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Site Management</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.sites.map((site) => (
                <Card key={site.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-bold">{site.name}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{site.equipment} Items</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.withdrawals} withdrawals - {site.lowStock} low stock alerts
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Generate Reports</h2>
            </div>
            <ReportsView />
          </div>
        )}
        </div>
      </div>
    </div>
  )
}