'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportWithdrawalsByMultipleSites } from '@/lib/excel-export';
import { CIMARA_SITES } from '@/lib/constants';

interface Engineer {
  _id: string;
  siteName: string;
}

export function ReportsView() {
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [siteName, setSiteName] = useState<string>('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to 1 month ago to ensure data is visible
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const sites = CIMARA_SITES; // Declare the sites variable

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const response = await fetch('/api/engineers', {
        credentials: 'include',
      });
      const data = await response.json();
      setEngineers(data);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  const generateReport = async () => {
  if (!siteName) {
    toast({
      title: 'Error',
      description: 'Please select a site',
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `/api/reports?type=${reportType}&siteName=${siteName}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    const data = await response.json();
    setReports(data); // Set the reports data

    if (data.length === 0) {
      toast({
        title: 'No Records Found',
        description: 'Try expanding your date range.',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Success',
        description: `Found ${data.length} records.`,
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate report',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

  const exportToExcel = () => {
    if (reports.length === 0) {
      toast({ title: 'Error', description: 'No data to export', variant: 'destructive' });
      return;
    }

    // 1. Prepare and Flatten Data
// Inside exportToExcel in components/report-view.tsx

    const data = reports.flatMap((report: any) => 
      report.items.map((item: any) => ({
        // Uses withdrawalDate if available, otherwise falls back to createdAt
        'Date/Time': new Date(report.withdrawalDate || report.createdAt).toLocaleString(),
        'Equipment Name': item.equipmentName,
        'Quantity': item.quantityWithdrawn,
        'Description': item.description || 'No description provided',
        'Engineer': report.engineerName || report.name, // Matches 'name' field from your MongoDB screenshot
        'Site': report.siteName || report.site
      }))
    );

    const wb = XLSX.utils.book_new();
    const heading = [[`Inventory Report: ${siteName} (${startDate} to ${endDate})`]];
    const ws = XLSX.utils.aoa_to_sheet(heading);

    // 2. Define Headers
    const headers = ['Date & Time', 'Receipt #', 'Engineer', 'Site', 'Equipment Name', 'Quantity', 'Unit', 'Description', 'Receiver'];
    
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: -1 });
    XLSX.utils.sheet_add_json(ws, data, { header: headers, skipHeader: true, origin: -1 });

    XLSX.utils.book_append_sheet(wb, ws, 'Withdrawals');
    XLSX.writeFile(wb, `Report-${siteName}-${reportType}.xlsx`);
  };

  const exportToPDF = () => {
  if (reports.length === 0) return;

  const doc = new jsPDF('landscape'); // Switch to landscape for more columns
  const tableData = reports.flatMap((report: any) => 
    report.items.map((item: any) => [
      new Date(report.withdrawalDate).toLocaleString(),
      item.equipmentName,
      item.quantityWithdrawn,
      item.unit,
      item.description || 'N/A',
      report.engineerName
    ])
  );

  (doc as any).autoTable({
    head: [['Date/Time', 'Equipment', 'Qty', 'Unit', 'Description', 'Engineer']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 }, // Smaller font to fit description
  });

  doc.save(`Report-${siteName}.pdf`);
};

  const exportToWord = () => {
    if (reports.length === 0) {
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    let htmlContent = `
      <h1>CIMARA - Equipment Withdrawal Report</h1>
      <p><strong>Quality brings reliability</strong></p>
      <p><strong>Site:</strong> ${siteName}</p>
      <p><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
      <table border="1" cellpadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Receipt</th>
            <th>Engineer</th>
            <th>Equipment</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
    `;

    reports.forEach((report: any) => {
      report.items.forEach((item: any) => {
        htmlContent += `
          <tr>
            <td>${new Date(report.withdrawalDate).toLocaleDateString()}</td>
            <td>${report.receiptNumber || '-'}</td>
            <td>${report.engineerName}</td>
            <td>${item.equipmentName}</td>
            <td>${item.quantityWithdrawn} ${item.unit}</td>
          </tr>
        `;
      });
    });

    htmlContent += `
        </tbody>
      </table>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${siteName}.doc`;
    link.click();

    toast({
      title: 'Success',
      description: 'Exported to Word successfully',
    });
  };

  const exportAllSitesToExcel = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reports?site=all&startDate=${startDate}&endDate=${endDate}&type=${reportType}`,
        { method: 'GET' }
      );
      const withdrawals = await response.json();

      if (withdrawals.length === 0) {
        toast({
          title: 'Error',
          description: 'No withdrawal data available',
          variant: 'destructive',
        });
        return;
      }

      exportWithdrawalsByMultipleSites(withdrawals, startDate, endDate);

      toast({
        title: 'Success',
        description: 'Exported all sites to Excel successfully (5 sheets)',
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Equipment Withdrawal Reports</CardTitle>
        <CardDescription>View and export daily or weekly reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Generation Section */}
        <div className="border-b pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Tabs
                value={reportType}
                onValueChange={(value) => setReportType(value as 'daily' | 'weekly')}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Select Site</Label>
              <Select value={siteName} onValueChange={setSiteName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {CIMARA_SITES.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {reportType === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button onClick={generateReport} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="font-semibold">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Export Current Report:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button onClick={exportToExcel} variant="outline" className="w-full bg-transparent text-xs">
                  Excel
                </Button>
                <Button onClick={exportToPDF} variant="outline" className="w-full bg-transparent text-xs">
                  PDF
                </Button>
                <Button onClick={exportToWord} variant="outline" className="w-full bg-transparent text-xs">
                  Word
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Export All 5 Sites (Excel):</p>
              <Button
                onClick={exportAllSitesToExcel}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground"
              >
                {loading ? 'Exporting...' : 'Multi-Site Report (5 Sheets)'}
              </Button>
              <p className="text-xs text-muted-foreground">Creates separate sheet for each site</p>
            </div>
          </div>
        </div>

        {/* Reports Display */}
        {reports.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Report Data ({reports.length} records)</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3">Date/Time</th>
                      <th className="p-3">Receipt</th>
                      <th className="p-3">Equipment Details</th>
                      <th className="p-3">Engineer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((report, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{new Date(report.withdrawalDate).toLocaleString()}</td>
                        <td className="p-3">{report.receiptNumber}</td>
                        <td className="p-3">
                          {report.items.map((item: any, i: number) => (
                            <div key={i} className="mb-2 border-b last:border-0 pb-1">
                              <div className="font-bold">{item.equipmentName}</div>
                              <div className="text-xs text-muted-foreground">
                                Qty: {item.quantityWithdrawn} {item.unit} | {item.description}
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="p-3">{report.engineerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reports.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Generate a report to view data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
