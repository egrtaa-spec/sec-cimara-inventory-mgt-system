'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_UNITS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Pencil } from 'lucide-react';

interface CalculatedEquipment {
  _id: string;
  name: string;
  category: string;
  unit: string;
  initialStock: number;
  totalWithdrawn: number;
  currentStock: number;
}

function EditEquipmentForm({
  equipment,
  onSuccess,
  onCancel,
}: {
  equipment: CalculatedEquipment;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: equipment.name,
    category: equipment.category,
    unit: equipment.unit,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming a PUT endpoint exists to handle updates.
      const response = await fetch(`/api/warehouse/equipment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: equipment._id,
          updates: formData,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update equipment');
      }
      toast({
        title: 'Success',
        description: 'Equipment updated successfully.',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Equipment Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{EQUIPMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Select name="unit" value={formData.unit} onValueChange={(v) => handleSelectChange('unit', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{EQUIPMENT_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function WarehouseStockSummaryReport() {
  const [equipment, setEquipment] = useState<CalculatedEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editingEquipment, setEditingEquipment] = useState<CalculatedEquipment | null>(null);

  const fetchAllEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/warehouse/equipment');
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch warehouse stock summary.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllEquipment();
  }, [fetchAllEquipment]);

  const handleEditClick = (item: CalculatedEquipment) => {
    setEditingEquipment(item);
  };

  const handleEditSuccess = () => {
    setEditingEquipment(null);
    fetchAllEquipment();
  };

  if (loading) {
    return <p>Loading warehouse stock report...</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Initial Stock</TableHead>
            <TableHead className="text-right">Total Withdrawn</TableHead>
            <TableHead className="text-right font-bold">Current Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">{item.initialStock}</TableCell>
              <TableCell className="text-right">{item.totalWithdrawn}</TableCell>
              <TableCell className="text-right font-bold">{item.currentStock}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell className="text-center">
                <Button variant="outline" size="icon" onClick={() => handleEditClick(item)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingEquipment && (
        <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit: {editingEquipment.name}</DialogTitle>
              <DialogDescription>
                Update equipment details. Stock levels are adjusted via inventory entries or withdrawals.
              </DialogDescription>
            </DialogHeader>
            <EditEquipmentForm equipment={editingEquipment} onSuccess={handleEditSuccess} onCancel={() => setEditingEquipment(null)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}