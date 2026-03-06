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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_UNITS, EQUIPMENT_CONDITIONS } from '@/lib/constants';
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
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash } from 'lucide-react';

// Assuming this type based on project documentation
interface Equipment {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
}

function EditSiteEquipmentForm({
  equipment,
  onSuccess,
  onCancel,
}: {
  equipment: Equipment;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: equipment.name,
    category: equipment.category,
    unit: equipment.unit,
    condition: equipment.condition,
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
      // The API endpoint for site equipment updates
      const response = await fetch(`/api/site/equipment`, {
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
      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select name="condition" value={formData.condition} onValueChange={(v) => handleSelectChange('condition', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{EQUIPMENT_CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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

export function SiteEquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch('/api/site/equipment');
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch site equipment list.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleEditClick = (item: Equipment) => {
    setEditingEquipment(item);
  };

  const handleEditSuccess = () => {
    setEditingEquipment(null);
    setLoading(true);
    fetchEquipment();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEquipment) return;

    try {
      const response = await fetch(`/api/site/equipment?id=${deletingEquipment._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete equipment');
      }

      toast({
        title: 'Success',
        description: `Equipment "${deletingEquipment.name}" has been deleted.`,
      });

      setDeletingEquipment(null);
      fetchEquipment(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingEquipment(null);
    }
  };

  if (loading) {
    return <p>Loading equipment...</p>;
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.condition}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setDeletingEquipment(item)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingEquipment && (
        <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit: {editingEquipment.name}</DialogTitle>
              <DialogDescription>
                Update equipment details. Quantity is managed via entries and withdrawals.
              </DialogDescription>
            </DialogHeader>
            <EditSiteEquipmentForm equipment={editingEquipment} onSuccess={handleEditSuccess} onCancel={() => setEditingEquipment(null)} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deletingEquipment} onOpenChange={(open) => !open && setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the equipment
              <span className="font-semibold"> "{deletingEquipment?.name}" </span>
              from your site's inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}