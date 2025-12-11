'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      
      {/* LEFT SIDE: Branding Area */}
      <div className="relative flex w-full flex-col justify-between bg-black p-10 text-white md:w-1/2 lg:w-2/3">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-bl-full bg-[#E30613] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-tr-full bg-[#F6E71D] opacity-10 blur-3xl"></div>

        <div className="z-10">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#E30613] bg-white p-1">
               <Image src="/logo.png" alt="KVTS Logo" fill className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-[#E30613]">KVTS <span className="text-white">INDUSTRIES</span></h1>
          </div>
        </div>

        <div className="z-10 mb-20 md:mb-0">
          <h2 className="text-5xl font-extrabold leading-tight text-white">
            Manufacturing <br />
            <span className="text-[#E30613]">Excellence.</span>
          </h2>
          <p className="mt-4 max-w-md text-gray-400">
            Secure Enterprise Resource Planning System. 
            Production tracking, Inventory management, and Accounting in one place.
          </p>
          <div className="mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-[#F6E71D] to-[#B7F100]"></div>
        </div>
        
        <div className="z-10 text-xs text-gray-500 flex flex-col gap-1">
          <p>© {new Date().getFullYear()} KVTS Industries. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a 
              href="https://www.africanwitchtech.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#E30613] hover:text-white transition-colors font-semibold"
            >
              African Witch Tech Limited
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 md:w-1/2 lg:w-1/3">
        <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please enter your company credentials
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@kvtsindustries.com"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#E30613] sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle type
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#E30613] sm:text-sm sm:leading-6 transition-all"
                />
                {/* Eye Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-md bg-[#E30613] px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Authenticating...' : 'Sign in'}
            </button>
            
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {errorMessage && (
                <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded w-full text-center border border-red-200">
                  ⚠️ {errorMessage}
                </p>
              )}
            </div>
          </form>

          <p className="text-center text-xs text-gray-400">
            Contact Admin if you forgot your password.
          </p>
        </div>
      </div>
    </div>
  );
}