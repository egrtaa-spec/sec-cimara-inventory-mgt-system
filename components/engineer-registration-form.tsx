<<<<<<< HEAD
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CIMARA_SITES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function EngineerRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // API call to the signup route
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast({
        title: "Account Created",
        description: "You can now login with your credentials.",
      });

      // FIX: This triggers the redirect to the login page (root)
      router.push("/"); 
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
=======
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SITES } from '@/lib/sites';

export function EngineerRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    site: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.site) {
      toast({
        title: 'Error',
        description: 'Please select a site',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/engineers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to register');
      }

      toast({
        title: 'Success',
        description: 'Account created successfully. Please login.',
      });
      
      router.push('/login');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
>>>>>>> 4df0c6294e3e080535c7c249acdf9925e78532d3
      });
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
      <div className="space-y-2 text-center mb-4">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-sm text-muted-foreground">Register as a site engineer</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site">Assign to Site</Label>
        <Select name="site" required>
          <SelectTrigger>
            <SelectValue placeholder="Select site..." />
          </SelectTrigger>
          <SelectContent>
            {/* Maps to your MongoDB site structure */}
            {CIMARA_SITES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" placeholder="e.g. Karine" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register Engineer
      </Button>
    </form>
=======
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Engineer Registration</CardTitle>
        <CardDescription>Create an account to manage site inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Assigned Site</Label>
            <Select 
              value={formData.site} 
              onValueChange={(value) => setFormData({...formData, site: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your site" />
              </SelectTrigger>
              <SelectContent>
                {SITES.map((site) => (
                  <SelectItem key={site.key} value={site.key}>
                    {site.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
>>>>>>> 4df0c6294e3e080535c7c249acdf9925e78532d3
  );
}