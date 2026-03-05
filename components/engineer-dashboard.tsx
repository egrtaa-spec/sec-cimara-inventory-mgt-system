import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { SiteWithdrawalForm } from './site-withdrawal-form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2 } from 'lucide-react';

export function EngineerDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ withdrawals: [], equipment: [], user: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/engineer-site-data');
        const result = await res.json();
        setData(result);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const generateReport = () => {
    if (!data.withdrawals || data.withdrawals.length === 0) {
      toast({
        title: "No Data",
        description: "There are no withdrawals to report.",
      });
      return;
    }

    const reportData = data.withdrawals.flatMap((withdrawal: any) =>
      withdrawal.items.map((item: any) => ({
        withdrawalDate: withdrawal.withdrawalDate,
        engineerName: withdrawal.engineerName,
        description: withdrawal.description,
        equipmentName: item.equipmentName,
        quantityWithdrawn: item.quantityWithdrawn,
        unit: item.unit,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Withdrawals Report');
    XLSX.writeFile(wb, 'engineer_withdrawals_report.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Engineer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {data.user?.name || 'Engineer'}. Site: {data.user?.site || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SiteWithdrawalForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Withdrawals</CardTitle>
              <Button onClick={generateReport} variant="outline" size="sm" disabled={loading || !data.withdrawals?.length}>
                Download Report
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Receiver</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.withdrawals?.slice(0, 10).map((w: any) => (
                      w.items.map((item: any, index: number) => (
                        <TableRow key={`${w._id}-${index}`}>
                          <TableCell>{index === 0 ? new Date(w.withdrawalDate).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{item.equipmentName}</TableCell>
                          <TableCell>{item.quantityWithdrawn}</TableCell>
                          <TableCell>{index === 0 ? w.receiverName : ''}</TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              )}
              {data.withdrawals?.length === 0 && !loading && <p className="text-center text-muted-foreground py-4">No withdrawals recorded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
