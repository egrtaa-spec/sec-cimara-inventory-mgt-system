'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <Button
      onClick={() => logout()}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2 bg-transparent"
    >
      <LogOut className="w-4 h-4" />
      {loading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
