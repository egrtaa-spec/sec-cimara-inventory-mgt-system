'use client';

import Image from 'next/image';
import { LogoutButton } from '@/components/logout-button';

interface HeaderProps {
  siteName?: string;
  compact?: boolean;
}

export function Header({ siteName, compact = false }: HeaderProps) {
  if (compact) {
    return (
      <div className="flex items-start justify-between p-2 bg-white">
        <div className="flex items-start gap-2">
          <Image
            src="/logo.png"
            alt="CIMARA Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div>
            <h1 className="text-sm font-bold text-primary">CIMARA</h1>
            <p className="text-xs text-muted-foreground">Quality brings reliability</p>
            {siteName && <p className="text-xs font-semibold text-primary">Site: {siteName}</p>}
          </div>
        </div>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="bg-primary text-primary-foreground py-6 px-6 border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CIMARA Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold">CIMARA</h1>
            <p className="text-sm opacity-90">Quality brings reliability</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          {siteName && (
            <div className="text-right">
              <p className="text-lg font-semibold">{siteName}</p>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
