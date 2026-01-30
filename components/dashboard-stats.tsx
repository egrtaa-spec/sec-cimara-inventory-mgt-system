'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface Stats {
  totalEngineers: number;
  totalEquipment: number;
  totalWithdrawals: number;
  lowStockItems: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalEngineers: 0,
    totalEquipment: 0,
    totalWithdrawals: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [engineers, equipment, withdrawals] = await Promise.all([
        fetch('/api/engineers').then((r) => r.json()),
        fetch('/api/equipment').then((r) => r.json()),
        fetch('/api/withdrawals').then((r) => r.json()),
      ]);

      const lowStockItems = equipment.filter((e: any) => e.quantity < 5).length;

      setStats({
        totalEngineers: engineers.length,
        totalEquipment: equipment.length,
        totalWithdrawals: withdrawals.length,
        lowStockItems,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Engineers',
      value: stats.totalEngineers,
      color: 'bg-blue-100 text-blue-800',
      icon: '👥',
    },
    {
      title: 'Equipment in Stock',
      value: stats.totalEquipment,
      color: 'bg-green-100 text-green-800',
      icon: '🔧',
    },
    {
      title: 'Total Withdrawals',
      value: stats.totalWithdrawals,
      color: 'bg-purple-100 text-purple-800',
      icon: '📦',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      color: 'bg-red-100 text-red-800',
      icon: '⚠️',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
              {stat.title}
              <span className="text-2xl">{stat.icon}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-block px-4 py-2 rounded-lg ${stat.color}`}>
              <div className="text-4xl font-bold">{stat.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
