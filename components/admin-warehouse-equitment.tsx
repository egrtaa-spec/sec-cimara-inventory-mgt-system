"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CIMARA_SITES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

// Exclude 'Main Warehouse' from sites engineers can be assigned to
const engineerSites = CIMARA_SITES.filter(site => site !== 'Main Warehouse');

export function AdminEngineerForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [site, setSite] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Function to generate username from name. e.g. "John Doe" -> "john.doe.42"
  const generateUsername = (fullName: string) => {
    const randomSuffix = Math.floor(Math.random() * 1000);
    return fullName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.') + `.${randomSuffix}`;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !site) {
      toast({
        title: "Missing Information",
        description: "Please enter the engineer's name and assign a site.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    const username = generateUsername(name);
    const password = "password123"; // Default password

    const data = {
      name, // The full name for display
      username, // The generated username for login
      password, // The default password for login
      site,
    };

    try {
      // This API endpoint must be updated to accept "name" along with username, password, and site.
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed. The username might already exist.");
      }

      toast({
        title: "Engineer Registered Successfully",
        description: `Username: ${username} | Default Password: ${password}`,
      });
      
      setName('');
      setSite('');
      onSuccess?.();
      
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Engineer's Full Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="site">Assign to Site</Label>
        <Select value={site} onValueChange={setSite} required>
          <SelectTrigger>
            <SelectValue placeholder="Select site..." />
          </SelectTrigger>
          <SelectContent>
            {engineerSites.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register Engineer
      </Button>
      <p className="text-xs text-center text-muted-foreground pt-2">
        A unique username will be generated and the default password is "password123".
      </p>
    </form>
  );
}