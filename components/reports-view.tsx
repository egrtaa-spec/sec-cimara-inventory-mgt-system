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
import { SITES, SiteKey } from '@/lib/sites';
import { Session } from '@/lib/session';

interface Engineer {
  _id: string;
  siteName: string;
}

export function ReportsView() {
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [siteKey, setSiteKey] = useState<string>('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to 1 month ago to ensure data is visible
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Helper for safe date formatting
  const safeFormatDateTime = (dateInput: any) => {
    const date = new Date(dateInput);
    return date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleString() : 'N/A';
  };

  const safeFormatDateOnly = (dateInput: any) => {
    const date = new Date(dateInput);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString()
      : 'N/A';
  };
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
          if (sessionData?.role === 'ENGINEER') {
            setSiteKey(sessionData.site);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };
    fetchSession();
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const response = await fetch('/api/engineers', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        setEngineers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  const generateReport = async () => {
    // 1. Validate inputs
    if (!siteKey || !startDate || !endDate) {
      toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // 2. Prepare parameters
      const params = new URLSearchParams({
        type: reportType,
        site: siteKey,
        startDate: startDate,
        endDate: endDate, // Ensure this matches what the backend expects
      });

      // 3. Fetch data
      const response = await fetch(`/api/reports?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      // 4. Handle results
      if (Array.isArray(data) && data.length > 0) {
        setReports(data); // Assuming backend returns normalized items now
        toast({ title: 'Success', description: `Found ${data.length} records.` });
      } else {
        setReports([]);
        toast({ title: 'No Records Found', description: 'Try expanding your date range.', variant: 'default' });
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      toast({ title: 'Error', description: 'Check server connection.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reports.length) return;

    const selectedSite = SITES.find(s => s.key === (siteKey as SiteKey));
    const siteLabel = siteKey === 'all' ? 'All Sites' : selectedSite?.label || siteKey;

    const data = reports.flatMap((report: any) =>
      (report.items || []).map((item: any) => ({
        'Date': safeFormatDateOnly(report.withdrawalDate || report.createdAt || report.date),
        'Receipt #': report.receiptNumber || 'N/A',
        'Engineer': report.engineerName || report.senderName || 'Staff',
        'Site': report.siteName || report.destinationSiteName || '-',
        'Item': item.equipmentName,
        'Qty': item.quantityWithdrawn,
        'Receiver': report.receiverName || '-'
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Withdrawals");
    XLSX.writeFile(wb, `CIMARA_Report_${siteLabel}_${startDate}.xlsx`);
  };

  const exportToPDF = () => {
    if (reports.length === 0) return;

    const selectedSite = SITES.find(s => s.key === (siteKey as SiteKey));
    const siteLabel = siteKey === 'all' ? 'All Sites' : selectedSite?.label || siteKey;

    const doc = new jsPDF('landscape');
    const tableData = reports.flatMap((report: any) =>
      (report.items || []).map((item: any) => [
        safeFormatDateTime(report.withdrawalDate),
        report.destinationSiteName || '-',
        item.equipmentName,
        item.quantityWithdrawn,
        item.unit,
        item.description || 'N/A',
        report.engineerName || report.senderName || '-',
      ])
    );
    (doc as any).autoTable({
      head: [['Date/Time', 'Site', 'Equipment', 'Qty', 'Unit', 'Description', 'Engineer']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
    });

    doc.save(`Report-${siteLabel}.pdf`);
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

    const selectedSite = SITES.find(s => s.key === (siteKey as SiteKey));
    const siteLabel = siteKey === 'all' ? 'All Sites' : selectedSite?.label || siteKey;

    let htmlContent = `
      <h1>CIMARA - Equipment Withdrawal Report</h1>
      <p><strong>Quality brings reliability</strong></p>
      <p><strong>Site:</strong> ${siteLabel}</p>
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
      (report.items || []).forEach((item: any) => {
        htmlContent += `
          <tr>
            <td>${safeFormatDateOnly(report.withdrawalDate)}</td>
            <td>${report.receiptNumber || '-'}</td>
            <td>${report.engineerName || report.senderName || '-'}</td>
            <td>${item.equipmentName}</td>
            <td>${item.quantityWithdrawn}</td>
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
    link.download = `${reportType}-report-${siteLabel}.doc`;
    link.click();

    toast({
      title: 'Success',
      description: 'Exported to Word successfully',
    });
  };

  const exportAllSitesToExcel = async () => {
    try {
      setLoading(true);

      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      const adjustedEndDate = end.toISOString().split('T')[0];

      const params = new URLSearchParams({
        site: 'all',
        startDate,
        endDate: endDate,
        type: reportType,
      });

      const response = await fetch(`/api/reports?${params.toString()}`, { method: 'GET' });
      const withdrawals = await response.json();

      if (withdrawals.length === 0) {
        toast({
          title: 'Error',
          description: 'No withdrawal data available',
          variant: 'destructive',
        });
        return;
      }

      // Normalize data to ensure a consistent structure before exporting
      const normalizedWithdrawals = withdrawals.map((report: any) => {
        if (Array.isArray(report.items)) {
          return report; // Already in the correct format
        }
        // If not, assume a flat structure and create the 'items' array
        return {
          ...report,
          items: [{
            equipmentName: report.equipmentName,
            quantityWithdrawn: report.quantityWithdrawn,
            unit: report.unit,
            description: report.description,
          }]
        };
      });

      exportWithdrawalsByMultipleSites(normalizedWithdrawals, startDate, endDate);

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
              <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'daily' | 'weekly')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Select Site</Label>
              <Select value={siteKey} onValueChange={setSiteKey} disabled={session?.role === 'ENGINEER'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {SITES.map((site) => (
                    <SelectItem key={site.key} value={site.key}>
                      {site.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            {reportType === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
              <p className="text-sm text-muted-foreground font-medium">Export All Sites & Warehouse (Excel):</p>
              <Button onClick={exportAllSitesToExcel} disabled={loading} className="w-full bg-primary text-primary-foreground">
                {loading ? 'Exporting...' : 'Multi-Site Report'}
              </Button>
              <p className="text-xs text-muted-foreground">Creates a separate sheet for each site and the warehouse.</p>
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
                      <th className="p-3">Destination Site</th>
                      <th className="p-3">Equipment Details</th>
                      <th className="p-3">Receiver</th>
                      <th className="p-3">Engineer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((report, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{safeFormatDateTime(report.withdrawalDate)}</td>
                        <td className="p-3">{report.receiptNumber}</td>
                        <td className="p-3">{report.destinationSiteName || '-'}</td>
                        <td className="p-3">
                          {(report.items || []).map((item: any, i: number) => (
                            <div key={i} className="mb-2 border-b last:border-0 pb-1">
                              <div className="font-bold">{item.equipmentName}</div>
                              <div className="text-xs text-muted-foreground">
                                Qty: {item.quantityWithdrawn} {item.unit} | {item.description}
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="p-3">{report.receiverName || '-'}</td>
                        <td className="p-3">{report.engineerName || report.senderName || '-'}</td>
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
