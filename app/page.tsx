'use client';

import { useState } from 'react';
import { Slideshow } from '@/components/slideshow';
import { LoginModal } from '@/components/login-modal';
import { Link } from 'lucide-react';


export default function WelcomePage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
 <div className="mt-4 text-center">
  <p className="text-sm text-gray-600">
    Don't have an account?{" "}
    <Link href="/signup" className="text-blue-600 font-medium hover:underline">
      Sign up here
    </Link>
  </p>
</div>
  return (
    <>
      <Slideshow onLoginClick={() => setLoginModalOpen(true)} />
      <LoginModal isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
    
  );
 
}
