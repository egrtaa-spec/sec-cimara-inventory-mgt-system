"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EQUIPMENT_UNITS } from "@/lib/constants";

interface RequestedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export function MaterialRequestForm({ 
  site: initialSite, 
  engineerName: initialEngineer 
}: { 
  site: string, 
  engineerName: string 
}) {
  // Use state for site and engineer so they can be edited manually
  const [currentSite, setCurrentSite] = useState(initialSite || "");

  const [currentEngineer, setCurrentEngineer] = useState(initialEngineer || "");
  
  const [items, setItems] = useState<RequestedItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState<string>(EQUIPMENT_UNITS[0] || 'pieces');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (!newItemName) return;
    setItems([...items, { id: Date.now().toString(), name: newItemName, quantity: newItemQty, unit: newItemUnit }]);
    setNewItemName("");
    setNewItemQty(1);
    setNewItemUnit(EQUIPMENT_UNITS[0] || 'pieces');
  };

  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const sendRequest = async () => {
    // Validation: ensure site and engineer are filled
    if (!currentSite || !currentEngineer) {
      toast({ 
        title: "Missing Info", 
        description: "Please provide a site name and your name.", 
        variant: "destructive" 
      });
      return;
    }
    if (items.length === 0) return;
    
    setIsSending(true);

    try {
      const response = await fetch("/api/requests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending the manually entered state values
        body: JSON.stringify({ 
          items, 
          site: currentSite, 
          engineerName: currentEngineer 
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Material request sent to Admin." });
        setItems([]);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send request.");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send request.", 
        variant: "destructive" 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">New Material Request</h2>
        <p className="text-sm text-slate-500">Generate an invoice for {currentSite || "your site"}</p>
      </div>

      {/* Manual Input Fields for Site and Engineer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manualSite">Site Name</Label>
          <Input 
            id="manualSite"
            value={currentSite} 
            onChange={(e) => setCurrentSite(e.target.value)} 
            placeholder="Enter site location" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manualEngineer">Engineer Name</Label>
          <Input 
            id="manualEngineer"
            value={currentEngineer} 
            onChange={(e) => setCurrentEngineer(e.target.value)} 
            placeholder="Enter your name" 
          />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Add Item Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label>Item Name</Label>
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Fiber Cable" />
        </div>
        <div className="space-y-2">
          <Label>Qty</Label>
          <Input type="number" value={newItemQty} onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)} />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label>Unit</Label>
            <Select value={newItemUnit} onValueChange={setNewItemUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EQUIPMENT_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={addItem} type="button" variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
            <span>{item.name} (x{item.quantity} {item.unit})</span>
            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
      </div>

      <Button className="w-full gap-2" onClick={sendRequest} disabled={isSending || items.length === 0}>
        {isSending ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />}
        Send Invoice to Admin
      </Button>
    </div>
  );
}