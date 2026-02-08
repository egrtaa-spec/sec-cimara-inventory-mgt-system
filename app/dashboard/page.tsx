'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SetupGuide } from '@/components/setup-guide';
import { DashboardStats } from '@/components/dashboard-stats';
import { LowStockAlerts } from '@/components/low-stock-alerts';
import { EngineerRegistrationForm } from '@/components/engineer-registration-form';
import { EquipmentForm } from '@/components/equipment-form';
import { EquipmentList } from '@/components/equipment-list';
import { WithdrawalForm } from '@/components/withdrawal-form';
import { WithdrawalHistory } from '@/components/withdrawal-history';
import { ReportsView } from '@/components/reports-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkMongoConnection();
  }, []);

  const checkMongoConnection = async () => {
    try {
      const response = await fetch('/api/engineers');
      if (!response.ok && response.status === 500) {
        // Check if it's a MongoDB connection error
        const error = await response.json();
        if (error.error && error.error.includes('MongoDB')) {
          setMongoConnected(false);
        }
      }
    } catch (error) {
      // Network error or server not responding
      console.error('Connection check failed:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Show setup guide if MongoDB is not connected
  if (!checkingConnection && !mongoConnected) {
    return <SetupGuide />;
  }

  if (checkingConnection) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Initializing CIMARA Inventory System...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header siteName={activeSite || undefined} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-2 mb-6 text-xs lg:text-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="engineers">Engineers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats />

            <LowStockAlerts />

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Welcome to CIMARA Inventory Management System</h2>
              <p className="text-muted-foreground mb-4">
                Streamline equipment management, track withdrawals, and generate comprehensive reports.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h3 className="font-semibold mb-2">Engineer Registration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Register engineers and assign them to specific sites
                  </p>
                  <Button onClick={() => setActiveTab('engineers')} className="w-full">
                    Go to Engineers
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h3 className="font-semibold mb-2">Equipment Management</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add equipment to inventory and track quantity
                  </p>
                  <Button onClick={() => setActiveTab('equipment')} className="w-full">
                    Go to Equipment
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h3 className="font-semibold mb-2">Record Withdrawals</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Document equipment withdrawals and track usage
                  </p>
                  <Button onClick={() => setActiveTab('withdrawals')} className="w-full">
                    Go to Withdrawals
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h3 className="font-semibold mb-2">View Reports</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate daily/weekly reports and export data
                  </p>
                  <Button onClick={() => setActiveTab('reports')} className="w-full">
                    Go to Reports
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Engineers Tab */}
          <TabsContent value="engineers" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
            <EngineerRegistrationForm onSuccess={handleRefresh} />
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
            <EquipmentForm onSuccess={handleRefresh} />
            <EquipmentList key={refreshKey} />
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
            <WithdrawalForm onSuccess={handleRefresh} />
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
            <WithdrawalHistory key={refreshKey} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
}
