'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { DashboardStats } from '@/components/dashboard-stats';
import { LowStockAlerts } from '@/components/low-stock-alerts';
import { SiteEquipmentForm } from '@/components/site-equipment-form';
import { SiteEquipmentList } from '@/components/site-equipment-list';
import { SiteWithdrawalForm } from '@/components/site-withdrawal-form';
import { EngineerList } from '@/components/engineer-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { ReportsView } from '@/components/reports-view';

const DashboardPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic data state for equipment and withdrawals
  const [equipmentData, setEquipmentData] = useState([]);
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  
  const [showEquipment, setShowEquipment] = useState(false);
  const [showWithdrawals, setShowWithdrawals] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  // Fetch Equipment data on button click
  const fetchEquipmentData = async () => {
    const response = await fetch('/api/equipment');
    const data = await response.json();
    setEquipmentData(data);
    setShowEquipment(true);
  };

  // Fetch Withdrawals data on button click
  const fetchWithdrawalsData = async () => {
    const response = await fetch('/api/withdrawals');
    const data = await response.json();
    setWithdrawalsData(data);
    setShowWithdrawals(true);
  };

  // Fetch Low Stock data on button click
  const fetchLowStockData = async () => {
    const response = await fetch('/api/lowStock');
    const data = await response.json();
    setLowStockData(data);
    setShowLowStock(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header compact={false} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-2 mb-6 text-xs lg:text-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="engineers">Engineers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats refreshKey={refreshKey} />
            {/* Add buttons to fetch data dynamically */}
            <div className="space-y-4">
              <div>
                <Button onClick={fetchEquipmentData}>Show Equipment</Button>
                {showEquipment && (
                  <div>
                    <h4>Equipment Data:</h4>
                    <ul>
                      {equipmentData.map((equipment: any) => (
                        <li key={equipment._id}>
                          {equipment.name}: {equipment.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <Button onClick={fetchWithdrawalsData}>Show Withdrawals</Button>
                {showWithdrawals && (
                  <div>
                    <h4>Withdrawals Data:</h4>
                    <ul>
                      {withdrawalsData.map((withdrawal: any) => (
                        <li key={withdrawal._id}>
                          {withdrawal.name}: {withdrawal.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <Button onClick={fetchLowStockData}>Show Low Stock</Button>
                {showLowStock && (
                  <div>
                    <h4>Low Stock Data:</h4>
                    <ul>
                      {lowStockData.map((stock: any) => (
                        <li key={stock._id}>
                          {stock.name}: {stock.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engineers" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">Refresh</Button>
            </div>
            <EngineerList key={refreshKey} />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">Refresh</Button>
            </div>
            <SiteEquipmentForm onSuccess={handleRefresh} />
            <SiteEquipmentList key={refreshKey} />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">Refresh</Button>
            </div>
            <SiteWithdrawalForm onSuccess={handleRefresh} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">Refresh</Button>
            </div>
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
};

export default DashboardPage;
