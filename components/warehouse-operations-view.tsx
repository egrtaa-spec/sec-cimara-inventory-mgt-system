"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, EQUIPMENT_UNITS, CIMARA_SITES } from "@/lib/constants"
import { Loader2, Plus, Trash } from "lucide-react"
import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function WarehouseInventoryForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

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

function AdminEngineerForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const engineerSites = CIMARA_SITES.filter(site => site !== 'Main Warehouse');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // Trim username to prevent login issues with trailing spaces
        if (data.username && typeof data.username === 'string') data.username = data.username.trim();

        try {
            const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register engineer');
            }
            toast({ title: "Success", description: "Engineer registered successfully." });
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
                <div className="space-y-2"><Label htmlFor="name">Engineer Name</Label><Input id="name" name="name" required /></div>
                <div className="space-y-2"><Label htmlFor="username">Username / ID</Label><Input id="username" name="username" required /></div>
                <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" name="department" /></div>
                <div className="space-y-2"><Label htmlFor="site">Assign to Site</Label><Select name="site" required><SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger><SelectContent>{engineerSites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
            </div>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Register Engineer</Button>
        </form>
    )
}

function WarehouseWithdrawalForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [items, setItems] = useState([{ equipmentId: '', equipmentName: '', quantityWithdrawn: '', unit: '' }]);
    const [destinationSite, setDestinationSite] = useState('');

    useEffect(() => {
        async function fetchWarehouseEquipment() {
            try {
                const response = await fetch('/api/warehouse/equipment');
                if (response.ok) setEquipmentList(await response.json());
            } catch (error) { console.error("Failed to fetch warehouse equipment", error); }
        }
        fetchWarehouseEquipment();
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
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data = { 
            receiverName: formData.get('receiverName'), 
            senderName: formData.get('senderName'), 
            withdrawalDate: formData.get('withdrawalDate'), 
            destinationSite: destinationSite,
            items: items.filter(item => item.equipmentId && item.quantityWithdrawn) 
        };

        try {
            const response = await fetch('/api/warehouse/withdrawals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error("Failed to record withdrawal");
            toast({ title: "Success", description: "Warehouse withdrawal recorded." });
            event.currentTarget.reset();
            setItems([{ equipmentId: '', equipmentName: '', quantityWithdrawn: '', unit: '' }]);
            setDestinationSite('');
            onSuccess?.();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Input name="receiverName" placeholder="Receiver's Name" required />
                <Input name="senderName" placeholder="Sender's Name (Admin)" required />
                <Select name="destinationSite" value={destinationSite} onValueChange={setDestinationSite} required><SelectTrigger><SelectValue placeholder="Destination Site..." /></SelectTrigger><SelectContent>{CIMARA_SITES.filter(s => s !== 'Main Warehouse').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <Input name="withdrawalDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            {items.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                    <Select onValueChange={(value) => handleItemChange(index, 'equipmentId', value)}><SelectTrigger><SelectValue placeholder="Select Equipment..." /></SelectTrigger><SelectContent>{equipmentList.map(e => <SelectItem key={e._id} value={e._id}>{e.name} (In Stock: {e.quantity})</SelectItem>)}</SelectContent></Select>
                    <Input type="number" placeholder="Quantity" value={item.quantityWithdrawn} onChange={e => handleItemChange(index, 'quantityWithdrawn', e.target.value)} required />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}><Trash className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record Withdrawal</Button>
        </form>
    );
}

function WarehouseStockSummaryReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateReport() {
            try {
                const [equipRes, withdrawalRes] = await Promise.all([fetch('/api/warehouse/equipment'), fetch('/api/warehouse/withdrawals')]);
                const equipment: any[] = await equipRes.json();
                const withdrawals: any[] = await withdrawalRes.json();
                const withdrawalMap = new Map<string, number>();
                for (const w of withdrawals) {
                    for (const item of w.items) {
                        const current = withdrawalMap.get(item.equipmentName) || 0;
                        withdrawalMap.set(item.equipmentName, current + Number(item.quantityWithdrawn));
                    }
                }
                const data = equipment.map(e => ({ name: e.name, totalWithdrawn: withdrawalMap.get(e.name) || 0, currentStock: e.quantity, initialStock: e.quantity + (withdrawalMap.get(e.name) || 0) }));
                setReportData(data);
            } catch (error) {
                console.error("Failed to generate stock report", error);
            } finally { setLoading(false); }
        }
        generateReport();
    }, []);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Equipment Name</TableHead><TableHead>Initial Stock (Calculated)</TableHead><TableHead>Total Withdrawn</TableHead><TableHead>Current Stock</TableHead></TableRow></TableHeader>
            <TableBody>
                {reportData.map(row => (
                    <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.initialStock}</TableCell>
                        <TableCell>{row.totalWithdrawn}</TableCell>
                        <TableCell>{row.currentStock}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function WarehouseWithdrawalHistoryReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateReport() {
            try {
                const withdrawalRes = await fetch('/api/warehouse/withdrawals');
                const withdrawals: any[] = await withdrawalRes.json();
                
                const data = withdrawals.flatMap(w => 
                    w.items.map((item: any) => ({
                        equipmentName: item.equipmentName,
                        quantityWithdrawn: item.quantityWithdrawn,
                        unit: item.unit,
                        withdrawalDate: w.withdrawalDate,
                        destinationSiteName: w.destinationSiteName || 'N/A',
                    }))
                ).sort((a, b) => new Date(b.withdrawalDate).getTime() - new Date(a.withdrawalDate).getTime());

                setReportData(data);
            } catch (error) {
                console.error("Failed to generate stock report", error);
            } finally { setLoading(false); }
        }
        generateReport();
    }, []);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Equipment Name</TableHead><TableHead>Quantity Withdrawn</TableHead><TableHead>Recorded Date</TableHead><TableHead>Withdrawn To Site</TableHead></TableRow></TableHeader>
            <TableBody>
                {reportData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.equipmentName}</TableCell>
                        <TableCell>{row.quantityWithdrawn} {row.unit}</TableCell>
                        <TableCell>{new Date(row.withdrawalDate).toLocaleDateString()}</TableCell>
                        <TableCell>{row.destinationSiteName}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function WarehouseOperationsView() {
    const [refreshKey, setRefreshKey] = useState(0);
    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    return (
        <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="inventory">Enter Warehouse Inventory</TabsTrigger>
                <TabsTrigger value="engineers">Register Engineers</TabsTrigger>
                <TabsTrigger value="withdrawals">Record Warehouse Withdrawals</TabsTrigger>
                <TabsTrigger value="report">Stock Report</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Equipment to Warehouse</CardTitle>
                        <CardDescription>Fill in the details for new materials or equipment.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseInventoryForm onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="engineers">
                <Card>
                    <CardHeader>
                        <CardTitle>Register a New Engineer</CardTitle>
                        <CardDescription>Create an account for a site engineer.</CardDescription>
                    </CardHeader>
                    <CardContent><AdminEngineerForm onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="withdrawals">
                 <Card>
                    <CardHeader>
                        <CardTitle>Record a Withdrawal from the Warehouse</CardTitle>
                        <CardDescription>This is for transferring equipment from the main warehouse to a site or person.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseWithdrawalForm key={refreshKey} onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="report">
                 <Card>
                     <CardHeader>
                        <CardTitle>Warehouse Stock Report</CardTitle>
                        <CardDescription>A summary of stock levels and withdrawal history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="summary">Stock Summary</TabsTrigger>
                                <TabsTrigger value="history">Withdrawal History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="summary"><Card><CardContent className="pt-6"><WarehouseStockSummaryReport key={refreshKey} /></CardContent></Card></TabsContent>
                            <TabsContent value="history"><Card><CardContent className="pt-6"><WarehouseWithdrawalHistoryReport key={refreshKey} /></CardContent></Card></TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
