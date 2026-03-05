"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CIMARA_SITES } from "@/lib/constants"
import { Loader2, Plus, Trash } from "lucide-react"
import React from "react"

export function WarehouseWithdrawalForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [items, setItems] = useState([{ equipmentId: '', equipmentName: '', quantityWithdrawn: '', unit: '' }]);
    const [destinationSite, setDestinationSite] = useState('');
    const [senderName, setSenderName] = useState('');

    const fetchData = async () => {
        try {
            // ✅ FIX: Fetch only equipment (API now provides calculated currentStock) and session
            const [equipRes, sessionRes] = await Promise.all([
                fetch('/api/warehouse/equipment'),
                fetch('/api/session')
            ]);

            if (equipRes.ok) {
                const data = await equipRes.json();
                if (Array.isArray(data)) {
                    // ✅ FIX: Use the 'currentStock' directly from the API response
                    setEquipmentList(data.map(e => ({ ...e, available: e.currentStock })));
                }
            }
            
            if (sessionRes.ok) {
                const session = await sessionRes.json();
                const name = session.user?.name || session.name;
                if (name) setSenderName(name);
            }
        } catch (error) { console.error("Failed to fetch initial data", error); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        const selectedEquipment = equipmentList.find(e => e._id === value);
        if (field === 'equipmentId' && selectedEquipment) {
            newItems[index].equipmentId = selectedEquipment._id;
            newItems[index].equipmentName = selectedEquipment.name;
            newItems[index].unit = selectedEquipment.unit;
        } else { (newItems[index] as any)[field] = value; }
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { equipmentId: '', equipmentName: '', quantityWithdrawn: '', unit: '' }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!destinationSite) {
            toast({ title: "Error", description: "Please select a destination site", variant: "destructive" });
            return;
        }

        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data = { 
            receiverName: formData.get('receiverName'), 
            senderName: formData.get('senderName'), 
            withdrawalDate: formData.get('withdrawalDate'), 
            destinationSite: destinationSite, // ✅ FIX: Send 'destinationSite' to match backend expectation
            items: items
                .filter(item => item.equipmentId && item.quantityWithdrawn)
                .map(item => ({
                    ...item,
                    quantityWithdrawn: Number(item.quantityWithdrawn)
                }))
        };

        try {
            // ✅ FIX: Point to the correct warehouse withdrawal API route which contains the database logic.
            const response = await fetch('/api/warehouse/withdrawals', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(data) 
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Failed to record withdrawal");
            
            toast({ 
                title: "Success", 
                description: `Withdrawal recorded successfully. Receipt #: ${result.receiptNumber}`,
                duration: 5000
            });
            event.currentTarget.reset();
            setItems([{ equipmentId: '', equipmentName: '', quantityWithdrawn: '', unit: '' }]);
            setDestinationSite('');
            await fetchData(); // Refresh equipment list to show updated stock
            onSuccess?.();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Input name="receiverName" placeholder="Receiver's Name" required />
                <Input name="senderName" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Sender's Name (Admin)" required />
                <Select name="destinationSite" value={destinationSite} onValueChange={setDestinationSite} required><SelectTrigger><SelectValue placeholder="Destination Site..." /></SelectTrigger><SelectContent>{CIMARA_SITES.filter(s => s !== 'Main Warehouse').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <Input name="withdrawalDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            {items.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                    <Select value={item.equipmentId} onValueChange={(value) => handleItemChange(index, 'equipmentId', value)}><SelectTrigger><SelectValue placeholder="Select Equipment..." /></SelectTrigger><SelectContent>{equipmentList.map(e => <SelectItem key={e._id} value={e._id}>{e.name} (Available: {e.available})</SelectItem>)}</SelectContent></Select>
                    <Input type="number" placeholder="Quantity" value={item.quantityWithdrawn} onChange={e => handleItemChange(index, 'quantityWithdrawn', e.target.value)} required min="1" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}><Trash className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record Withdrawal</Button>
        </form>
    );
}