"use client";

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function WarehouseWithdrawalHistoryReport({ refreshTrigger }: { refreshTrigger?: number }) {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateReport() {
            try {
                const withdrawalRes = await fetch('/api/warehouse/withdrawals');
                if (!withdrawalRes.ok) throw new Error('Failed to fetch withdrawals');

                const withdrawals = await withdrawalRes.json();
                
                if (!Array.isArray(withdrawals)) {
                    console.error("Invalid withdrawal data:", withdrawals);
                    return;
                }
                
                const data = withdrawals
                    .filter(w => w && Array.isArray(w.items) && w.withdrawalDate) // Ensure withdrawal and its core properties are valid
                    .flatMap((w: any) => 
                        w.items.map((item: any) => ({
                        equipmentName: item.equipmentName,
                        quantityWithdrawn: item.quantityWithdrawn,
                        unit: item.unit,
                        withdrawalDate: w.withdrawalDate,
                        destinationSiteName: w.destinationSite || w.destinationSiteName || 'N/A',
                        receiverName: w.receiverName || 'N/A',
                        }))
                    )
                    .sort((a, b) => new Date(b.withdrawalDate).getTime() - new Date(a.withdrawalDate).getTime());

                setReportData(data);
            } catch (error) {
                console.error("Failed to generate stock report", error);
            } finally { setLoading(false); }
        }
        generateReport();
    }, [refreshTrigger]);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Equipment Name</TableHead><TableHead>Quantity Withdrawn</TableHead><TableHead>Recorded Date</TableHead><TableHead>Withdrawn To Site</TableHead><TableHead>Receiver</TableHead></TableRow></TableHeader>
            <TableBody>
                {reportData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.equipmentName}</TableCell>
                        <TableCell>{row.quantityWithdrawn} {row.unit}</TableCell>
                        <TableCell>{new Date(row.withdrawalDate).toLocaleDateString()}</TableCell>
                        <TableCell>{row.destinationSiteName}</TableCell>
                        <TableCell>{row.receiverName}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}