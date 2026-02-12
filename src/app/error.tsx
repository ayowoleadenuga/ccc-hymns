'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    toast.error('Something went wrong. Please try again.');
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 flex flex-col font-sans">
      
      {/* Header - Replicated from src/app/page.tsx */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Image 
                            src="/logo.png" 
                            alt="CCC Logo" 
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-100 hidden sm:block">CCC Hymns</h1>
            </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-lg">
            We encountered an unexpected error while loading this page.
        </p>
        
        <div className="flex gap-4">
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20"
            >
                Try again
            </button>
            <Link
                href="/"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
