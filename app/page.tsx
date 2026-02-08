'use client';

import { useState } from 'react';
import { Slideshow } from '@/components/slideshow';
import { LoginModal } from '@/components/login-modal';


export default function WelcomePage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <>
      <Slideshow onLoginClick={() => setLoginModalOpen(true)} />
      <LoginModal isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
