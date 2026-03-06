'use client';

import { useState, useTransition } from 'react';
import { Header } from '@/components/header';
import { DashboardStats } from '@/components/dashboard-stats';
import { LowStockAlerts } from '@/components/low-stock-alerts';
import { SiteEquipmentForm } from '@/components/site-equipment-form';
import { SiteEquipmentList } from '@/components/site-equipment-list';
import { SiteWithdrawalForm } from '@/components/site-withdrawal-form';
import { EngineerList } from '@/components/engineer-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { ReportsView } from '@/components/reports-view';

const DashboardPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPending, startTransition] = useTransition();

  const [showLowStock, setShowLowStock] = useState(false);
  const [showSiteEquipment, setShowSiteEquipment] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      setRefreshKey((prev) => prev + 1);
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header compact={false} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6 h-auto text-xs lg:text-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="engineers">Engineers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats refreshKey={refreshKey} />
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowLowStock(!showLowStock)}>
                  {showLowStock ? 'Hide Low Stock Alerts' : 'Show Low Stock Alerts'}
                </Button>
                <Button onClick={() => setShowSiteEquipment(!showSiteEquipment)} variant="outline">
                  {showSiteEquipment ? 'Hide Site Equipment' : 'Show Site Equipment'}
                </Button>
              </div>
              {showLowStock && <div className="mt-4"><LowStockAlerts /></div>}
              {showSiteEquipment && (
                <div className="mt-4"><SiteEquipmentList key={`dashboard-equip-${refreshKey}`} /></div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="engineers" className="space-y-6">
            <EngineerList key={refreshKey} />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <SiteEquipmentForm onSuccess={handleRefresh} />
            <SiteEquipmentList key={refreshKey} />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <SiteWithdrawalForm onSuccess={handleRefresh} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
};

export default DashboardPage;
