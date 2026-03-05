"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function WarehouseWithdrawalForm() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [items, setItems] = useState([{ equipmentId: "", quantityWithdrawn: 1, equipmentName: "" }]);
  const [receiverName, setReceiverName] = useState(""); // Match backend key
  const [destinationSite, setDestinationSite] = useState(""); // Match backend key
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState("");

  // Fetch equipment specifically from the warehouse inventory
  useEffect(() => {
    fetch('/api/warehouse/equipment')
      .then(res => res.json())
      .then(data => setEquipment(data))
      .catch(err => console.error("Error loading equipment:", err));
  }, []);

  const addItem = () => {
    setItems([...items, { equipmentId: "", quantityWithdrawn: 1, equipmentName: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleWithdrawal = async (data: any) => {
    try {
      // ✅ POINT TO THE NEW PLURALIZED WAREHOUSE ROUTE
      const response = await fetch('/api/warehouse/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalDate: data.date,
          items: data.items, // Ensure this contains equipmentId and quantityWithdrawn
          receiverName: data.receiverName,
          senderName: "Mrs Karine", // Hardcoded or from session
          destinationSite: data.destinationSite, // e.g., 'ISMP'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Withdrawal Successful! Receipt: ${result.receiptNumber}`);
        // Refresh the dashboard data here
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Receiver Name</Label>
          <Input 
            value={receiverName} 
            onChange={(e) => setReceiverName(e.target.value)} 
            placeholder="e.g. Tah Gizete" // Match image UI
          />
        </div>
        <div className="space-y-2">
          <Label>Destination Site</Label>
          <Select onValueChange={setDestinationSite}>
            <SelectTrigger><SelectValue placeholder="Select Site" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ISMP">ISMP</SelectItem>
              <SelectItem value="MINFOPRA">MINFOPRA</SelectItem>
              <SelectItem value="SUP'PTIC">SUP'PTIC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Items to Withdraw</Label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <Select onValueChange={(val) => {
                const eq = equipment.find(e => e._id === val);
                const newItems = [...items];
                newItems[index] = { ...newItems[index], equipmentId: val, equipmentName: eq?.name || "" };
                setItems(newItems);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq._id} value={eq._id}>
                      {eq.name} (In Stock: {eq.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input 
                type="number" 
                value={item.quantityWithdrawn}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].quantityWithdrawn = parseInt(e.target.value);
                  setItems(newItems);
                }}
              />
            </div>
            {items.length > 1 && (
              <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={addItem} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
        onClick={handleWithdrawal}
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Record Withdrawal"}
      </Button>
      {/* Success Signal Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Recorded!</h3>
            <p className="text-slate-600 mb-6">
                Receipt <span className="font-mono font-bold text-blue-600">{lastReceipt}</span> has been generated and stock levels updated.
            </p>
            <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setShowSuccess(false)}
            >
                Continue
            </Button>
            </div>
        </div>
        )}
    </div>
  );
}