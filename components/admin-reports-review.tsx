import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

export function AdminReportsView() {
  const generateReport = async () => {
    const res = await fetch('/api/reports/warehouse-excel');
    const data = await res.blob();
    const file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileURL = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = 'warehouse_report.xlsx';
    a.click();
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">Admin Reports</h3>
      <Button onClick={generateReport} className="mt-4">
        Download Warehouse Report
      </Button>
      <h3 className="font-semibold">Admin Reports</h3>
      <Button onClick={generateReport} className="mt-4">
        site reports
      </Button>
    </div>
  );
}
