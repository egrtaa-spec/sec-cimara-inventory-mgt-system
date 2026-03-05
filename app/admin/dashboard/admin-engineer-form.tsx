"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CIMARA_SITES } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import React from "react"

export function AdminEngineerForm({ onSuccess }: { onSuccess?: () => void }) {
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