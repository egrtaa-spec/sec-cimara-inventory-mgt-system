"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, EQUIPMENT_UNITS, CIMARA_SITES } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import React from "react"

export function WarehouseInventoryForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // ✅ FIX: Ensure quantity is sent as a number, not a string
        if (data.quantity) data.quantity = Number(data.quantity);

        try {
            const response = await fetch('/api/warehouse/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add equipment');
            }

            toast({ title: "Success", description: "Equipment added to warehouse successfully." });
            event.currentTarget.reset();
            onSuccess?.();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="site">Site / Location</Label>
                    <Select name="site" defaultValue="Main Warehouse">
                        <SelectTrigger><SelectValue placeholder="Select location..." /></SelectTrigger>
                        <SelectContent>{CIMARA_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="name">Equipment Name</Label><Input id="name" name="name" required /></div>
                <div className="space-y-2"><Label htmlFor="serialNumber">Serial Number</Label><Input id="serialNumber" name="serialNumber" /></div>
                <div className="space-y-2"><Label htmlFor="category">Category</Label><Select name="category"><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger><SelectContent>{EQUIPMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" name="quantity" type="number" required /></div>
                <div className="space-y-2"><Label htmlFor="unit">Unit</Label><Select name="unit"><SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger><SelectContent>{EQUIPMENT_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="condition">Condition</Label><Select name="condition"><SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger><SelectContent>{EQUIPMENT_CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add to Warehouse</Button>
        </form>
    )
}