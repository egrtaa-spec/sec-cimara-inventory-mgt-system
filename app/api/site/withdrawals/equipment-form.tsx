'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// These would likely come from a constants file or an API call
const PREDEFINED_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Safety Gear',
  'Consumables',
  'Heavy Machinery',
];

export function EquipmentForm() {
  // State for the category dropdown
  const [selectedCategory, setSelectedCategory] = useState('');
  // State for the custom "Other" category input
  const [otherCategory, setOtherCategory] = useState('');

  // --- Other form states would go here ---
  // const [name, setName] = useState('');
  // const [quantity, setQuantity] = useState(0);
  // ... etc.

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // If user selects a predefined category, clear the custom input
    if (value !== 'Other') {
      setOtherCategory('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Determine the final category value to be submitted
    // If 'Other' is selected, use the value from the text input; otherwise, use the selected value.
    const finalCategory = selectedCategory === 'Other' ? otherCategory : selectedCategory;

    if (!finalCategory) {
      alert('Please select or specify a category.');
      return;
    }

    const formData = {
      // ...other form data like name, quantity
      category: finalCategory,
    };

    console.log('Submitting new equipment with data:', formData);

    // Example of how you might post this data to your API
    // await fetch('/api/equipment', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Register New Equipment</h2>
      
      {/* Other form fields like name, quantity, etc. would go here */}

      <div>
        <Label htmlFor="category-select">Category</Label>
        <Select onValueChange={handleCategoryChange} value={selectedCategory}>
          <SelectTrigger id="category-select">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
            <SelectItem value="Other">Other (Please specify)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* This input field is conditionally rendered only when "Other" is selected */}
      {selectedCategory === 'Other' && (
        <div className="mt-4">
          <Label htmlFor="other-category-name">Custom Category Name</Label>
          <Input id="other-category-name" placeholder="e.g., Plumbing Supplies" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} required />
        </div>
      )}

      <Button type="submit" className="w-full">Add Equipment</Button>
    </form>
  );
}