'use client';

import { useState } from 'react';
import { Slideshow } from '@/components/slideshow';
import { LoginModal } from '@/components/login-modal';
import Link from 'next/link';


export default function WelcomePage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  return (
    <>
      <Slideshow onLoginClick={() => setLoginModalOpen(true)} />
      <LoginModal isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
      <div className="absolute bottom-8 left-0 right-0 text-center z-30">
        <p className="text-sm text-white/90 drop-shadow-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-300 font-medium hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </>
    
  );
 
}
