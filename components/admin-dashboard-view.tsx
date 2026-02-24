"use client";

import Image from "next/image"
import { useState } from "react"
import { 
  Activity, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  LayoutDashboard,
  Settings,
  FileText,
  Warehouse
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
import { ReportsView } from "@/components/reports-view"
import { WarehouseOperationsView } from "@/components/warehouse-operations-view"

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
  const [view, setView] = useState("main-dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">CIMARA</h1>
          <p className="text-sm text-muted-foreground">Inventory System</p>
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
        <div className="border-b bg-background p-4 px-8 flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="CIMARA Logo" width={40} height={40} className="object-contain" />
          <div>
            <h1 className="text-lg font-bold text-primary">CIMARA</h1>
            <p className="text-xs text-muted-foreground">Quality brings reliability</p>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
        {view === "main-dashboard" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Warehouse Operations</h2>
            <WarehouseOperationsView />
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
                  <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.warehouse.equipmentCount}</div>
                  <p className="text-xs text-muted-foreground">In Main Warehouse</p>
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