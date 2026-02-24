"use client";

import Image from "next/image";
import Link from "next/link";
import { EngineerRegistrationForm } from "@/components/engineer-registration-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-white p-1 rounded-full">
              <Image 
                src="/logo.png" 
                alt="CIMARA Logo" 
                width={40} 
                height={40} 
                className="object-contain" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">CIMARA</h1>
              <p className="text-[10px] font-medium opacity-90 uppercase tracking-wider text-white">Quality brings reliability</p>
            </div>
          </Link>
          <Link href="/" className="text-sm font-medium hover:underline bg-white/10 px-4 py-2 rounded-md text-white">
            Back to Login
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - Visuals */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <Image
            src="/inventory.jpeg"
            alt="Inventory Management"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white h-full">
            <h2 className="text-4xl font-bold mb-6">
              Streamline Your <br/>
              <span className="text-yellow-400">Site Operations</span>
            </h2>
            <p className="text-lg text-slate-200 mb-8">
              Join the CIMARA engineering team to manage inventory and track equipment withdrawals efficiently.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            {/* The redirect logic is inside this component */}
            <EngineerRegistrationForm />
            <p className="text-center mt-6 text-sm text-slate-500">
              Already have an account? <Link href="/" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}