'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface WelcomeHeaderProps {
  onLoginClick: () => void;
}
export function WelcomeHeader({ onLoginClick }: WelcomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CIMARA Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">CIMARA</h1>
            <p className="text-xs text-white/70">Quality brings reliability</p>
          </div>
        </div>

        <Button
          onClick={onLoginClick}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Button>
      </div>
    </header>
  );
}
