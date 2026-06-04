'use client';

import React from 'react';
import { useCMS } from '@/contexts/CMSContext';

export default function CMSLoadGate({ children }: { children: React.ReactNode }) {
  const { loaded } = useCMS();

  // Server-hydrated CMS marks loaded=true on first paint. This gate only
  // covers the rare case where server fetch failed and we must wait for client.
  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
