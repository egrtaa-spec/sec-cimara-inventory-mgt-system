'use client';

import Link from "next/link"
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CIMARA_SITES } from '@/lib/constants';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [site, setSite] = useState<string>(CIMARA_SITES[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, site })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.error || 'Login failed');
        return;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="font-bold text-blue-600">C</span>
            </div>
            <div>
              <CardTitle className="text-2xl">CIMARA</CardTitle>
              <CardDescription className="text-blue-100">Quality brings reliability</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  {CIMARA_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} className="border-gray-300" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="border-gray-300" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading || !username || !password} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">Admin login</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p>Use the <span className="font-semibold">Admin Panel</span> button on the dashboard to login as admin.</p>
            </div>
          </div>
          <div style={{ marginTop: "16px", textAlign: "center" }}>
          <p style={{ fontSize: "14px" }}>
            Don&apos;t have an account?{" "}
            <a href="/signup">
            <span
              style={{
                color: "#2563eb",
                fontWeight: 500,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Sign up here
              </span>
            </a>
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
