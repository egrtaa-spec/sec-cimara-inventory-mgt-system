"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';

interface WithdrawalItem {
  equipmentName: string;
  quantityWithdrawn: number;
  unit: string;
}

interface Withdrawal {
  _id: string;
  withdrawalDate: string;
  engineerName: string; // Person who recorded it (Admin/Warehouse Manager)
  destinationSite: string;
  receiverName?: string;
  receiptNumber: string;
  items: WithdrawalItem[];
  notes?: string;
}

export function WarehouseWithdrawalHistoryReport({ key: refreshKey }: { key?: any }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const response = await fetch('/api/warehouse/withdrawals');
        const data = await response.json();
        setWithdrawals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching warehouse withdrawal history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [refreshKey]);

  const openReceipt = (withdrawal: Withdrawal) => setSelected(withdrawal);

  const printReceipt = () => {
    if (!selected) return;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (printWindow) {
      const receiptContent = document.getElementById('receipt-content')?.innerHTML;
      printWindow.document.write('<html><head><title>Print Receipt</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; } .print-only { display: block; } .no-print { display: none; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(receiptContent || '');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="space-y-4">
        {withdrawals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No withdrawals recorded from the warehouse yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Destination Site</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w._id}>
                  <TableCell>{new Date(w.withdrawalDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{w.receiptNumber}</TableCell>
                  <TableCell><Badge variant="secondary">{w.destinationSite}</Badge></TableCell>
                  <TableCell>{w.engineerName}</TableCell>
                  <TableCell className="text-right font-semibold">{w.items.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openReceipt(w)}>View Receipt</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Withdrawal Receipt: {selected.receiptNumber}</DialogTitle>
                <DialogDescription>
                  Details for withdrawal to {selected.destinationSite} on {new Date(selected.withdrawalDate).toLocaleDateString()}.
                </DialogDescription>
              </DialogHeader>
              <div id="receipt-content" className="space-y-4 p-4 border rounded-lg">
                <div className="text-center border-b pb-4">
                  <Image src="/logo.png" alt="CIMARA Logo" width={50} height={50} className="mx-auto object-contain" />
                  <h2 className="text-2xl font-bold text-primary mt-2">CIMARA</h2>
                  <p className="text-sm text-muted-foreground">Quality brings reliability</p>
                  <p className="font-bold mt-2">WAREHOUSE WITHDRAWAL</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Date:</strong> {new Date(selected.withdrawalDate).toLocaleDateString()}</div>
                  <div><strong>Receipt #:</strong> {selected.receiptNumber}</div>
                  <div><strong>Destination:</strong> {selected.destinationSite}</div>
                  <div><strong>Recorded By:</strong> {selected.engineerName}</div>
                  {selected.receiverName && <div><strong>Receiver:</strong> {selected.receiverName}</div>}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.equipmentName}</TableCell>
                        <TableCell className="text-right">{item.quantityWithdrawn} {item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {selected.notes && (
                  <div className="pt-2">
                    <p className="font-semibold text-sm">Notes:</p>
                    <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">{selected.notes}</p>
                  </div>
                )}
              </div>
              <Button onClick={printReceipt} className="w-full mt-4">Print Receipt</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
