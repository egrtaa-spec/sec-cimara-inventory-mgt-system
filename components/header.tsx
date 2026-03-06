'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { AdminLoginModal } from '@/components/admin-login-modal';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MaterialRequestForm } from '@/components/material-request-form';

interface HeaderProps {
  siteName?: string;
  compact?: boolean;
  showAdminButton?: boolean;
}

export function Header({ siteName: propSiteName, compact = false, showAdminButton = true }: HeaderProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [engineerName, setEngineerName] = useState('');
  const [activeSite, setActiveSite] = useState(''); // New state to hold the dynamic site

  useEffect(() => {
    // Note: Your terminal showed 404 for /api/auth/session. 
    // Ensure your endpoint is exactly /api/session as written below.
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        const name = data.user?.name || data.name || data.username;
        const site = data.user?.site || data.site; // Fetch site from session data
        
        if (name) setEngineerName(name);
        if (site) setActiveSite(site); // Set the site name dynamically
      })
      .catch(() => {});
  }, []);

  // Determine which site name to use: the prop passed in, or the one from the session
  const displaySite = propSiteName || activeSite || 'General Warehouse';

  const AdminBtn = showAdminButton ? (
    <>
      <Button
        variant="outline"
        size="sm"
        className="bg-transparent"
        onClick={() => setAdminOpen(true)}
      >
        Admin Panel
      </Button>
      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  ) : null;

  const RequestMaterialBtn = (
    <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={compact ? "" : "bg-transparent border-white/40 hover:bg-white/10 hover:text-white text-white"}
        >
          Request Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl text-slate-900">
        <MaterialRequestForm 
          // Use the siteName prop passed from the parent dashboard
          site={displaySite} 
          // Use the engineerName fetched from /api/session in the useEffect
          engineerName={engineerName || ''} 
        />
      </DialogContent>
    </Dialog>
  );
  if (compact) {
    return (
      <div className="flex items-start justify-between p-2 bg-white">
        <div className="flex items-start gap-2">
          <Image src="/logo.png" alt="CIMARA Logo" width={40} height={40} className="object-contain" />
          <div>
            <h1 className="text-sm font-bold text-primary">CIMARA</h1>
            <p className="text-xs text-muted-foreground">Quality brings reliability</p>
            {displaySite !== 'General Warehouse' && <p className="text-xs font-semibold text-primary">Site: {displaySite}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {AdminBtn}
          {RequestMaterialBtn}
          <LogoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-primary-foreground py-4 px-4 md:py-6 md:px-6 border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <Image src="/logo.png" alt="CIMARA Logo" width={60} height={60} className="object-contain w-12 h-12 md:w-[60px] md:h-[60px]" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">CIMARA</h1>
            <p className="text-xs md:text-sm opacity-90">Quality brings reliability</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 md:pt-0 w-full md:w-auto">
          {displaySite !== 'General Warehouse' && (
            <div className="text-center md:text-right">
              <p className="text-base md:text-lg font-semibold">{displaySite}</p>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {AdminBtn}
            {RequestMaterialBtn}
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}