import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export function EngineerDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ withdrawals: [], equipment: [] });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/engineer-site-data');
      const result = await res.json();
      setData(result);
    };
    fetchData();
  }, []);

  const generateReport = () => {
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
    <div className="p-4 border rounded">
      <h3 className="font-semibold">Engineer Dashboard</h3>
      <p className="text-sm text-gray-500">Generate a report for your site’s withdrawals.</p>
      <Button onClick={generateReport} className="mt-4" disabled={loading}>
        {loading ? 'Loading...' : 'Download Report'}
      </Button>
    </div>
  );
}
