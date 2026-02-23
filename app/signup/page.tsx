"use client";

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EngineerRegistrationForm } from "@/components/engineer-registration-form"

export default function SignupPage() {
  const router = useRouter();

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
              <h1 className="text-xl font-bold tracking-tight">CIMARA</h1>
              <p className="text-[10px] font-medium opacity-90 uppercase tracking-wider">Quality brings reliability</p>
            </div>
          </Link>
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4 bg-white/10 px-4 py-2 rounded-md transition-colors hover:bg-white/20">
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
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Streamline Your <br/>
                <span className="text-yellow-400">Site Operations</span>
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed mb-8">
                Join the CIMARA engineering team to manage inventory, track equipment withdrawals, and generate reports efficiently.
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-sm text-slate-300">Monitor equipment availability instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Digital Receipts</h3>
                    <p className="text-sm text-slate-300">Generate and print professional receipts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
          <div className="w-full max-w-xl">
            <EngineerRegistrationForm onSuccess={() => router.push('/')} />
            <p className="text-center mt-6 text-sm text-slate-500">
              Already have an account? <Link href="/" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
