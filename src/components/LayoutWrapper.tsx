'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');

  // Loading indicator for active session determination
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-200">
        <div className="relative flex flex-col items-center gap-4">
          {/* Pulsing golden finance coin */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 shadow-[0_0_60px_rgba(245,158,11,0.2)] border border-amber-500/20 animate-pulse">
            <span className="text-5xl select-none animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            AntiGravity Finance
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Securing your workspace
          </p>
        </div>
      </div>
    );
  }

  // Redirect state or non-authenticated protected page loading protection
  if (!user && !isAuthRoute) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-200">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 shadow-[0_0_60px_rgba(245,158,11,0.2)] border border-amber-500/20 animate-pulse">
            <span className="text-5xl select-none animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            AntiGravity Finance
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Render auth pages with full viewport and design freedom
  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
        {/* Soft background glow nodes */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="w-full flex items-center justify-center z-10">
          {children}
        </div>
      </div>
    );
  }

  // Render dashboard or regular pages with Sidebar and main padding
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-[1400px] mx-auto">
        {children}
      </main>
    </>
  );
}
