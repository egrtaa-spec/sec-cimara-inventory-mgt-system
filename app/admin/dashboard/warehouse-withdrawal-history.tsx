"use client";

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";

interface Withdrawal {
  _id: string;
  withdrawalDate: string;
  receiptNumber: string;
  destinationSite: string;
  items: { equipmentName: string; quantityWithdrawn: number; unit: string }[];
}

export function WarehouseWithdrawalHistoryReport({ refreshTrigger }: { refreshTrigger?: number }) {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingWithdrawal, setDeletingWithdrawal] = useState<Withdrawal | null>(null);
    const { toast } = useToast();

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const withdrawalRes = await fetch('/api/warehouse/withdrawals');
            if (!withdrawalRes.ok) throw new Error('Failed to fetch withdrawals');

            const withdrawals = await withdrawalRes.json();
            
            if (!Array.isArray(withdrawals)) {
                console.error("Invalid withdrawal data:", withdrawals);
                setWithdrawals([]);
                return;
            }
            
            setWithdrawals(withdrawals);
        } catch (error: any) {
            console.error("Failed to generate stock report", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
            setWithdrawals([]);
        } finally { setLoading(false); }
    }, [toast]);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger, fetchHistory]);

    const handleDeleteConfirm = async () => {
        if (!deletingWithdrawal) return;
        try {
            const response = await fetch(`/api/warehouse/withdrawals?id=${deletingWithdrawal._id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete withdrawal');
            
            toast({
                title: 'Success',
                description: `Withdrawal ${deletingWithdrawal.receiptNumber} deleted and stock restored.`,
            });
            fetchHistory(); // Refresh the list
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setDeletingWithdrawal(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    if (withdrawals.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-lg font-semibold">No Withdrawals Found</h3>
                <p className="text-sm">No withdrawals have been recorded from the warehouse yet.</p>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal._id}>
                            <TableCell>{new Date(withdrawal.withdrawalDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-mono text-xs">{withdrawal.receiptNumber}</TableCell>
                            <TableCell><Badge variant="secondary">{withdrawal.destinationSite}</Badge></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{withdrawal.items.length} items</TableCell>
                            <TableCell className="text-center">
                                <Button variant="destructive" size="icon" onClick={() => setDeletingWithdrawal(withdrawal)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AlertDialog open={!!deletingWithdrawal} onOpenChange={(open) => !open && setDeletingWithdrawal(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete withdrawal receipt <span className="font-mono font-semibold">{deletingWithdrawal?.receiptNumber}</span> and restore the withdrawn stock.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}