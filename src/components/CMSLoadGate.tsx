'use client';

import React from 'react';
import { useCMS } from '@/contexts/CMSContext';

export default function CMSLoadGate({ children }: { children: React.ReactNode }) {
  const { loaded } = useCMS();

  // Always render children immediately — the CMS context initialises with
  // DEFAULT_PAGES / DEFAULT_BRANDING so content is never blank.
  // When the server provided initialCmsData, loaded=true on first paint (no delay).
  // When server fetch failed, we still render with defaults rather than blocking
  // FCP with a spinner — the client-side fetch will hydrate content once ready.
  // This eliminates the spinner-induced FCP delay on mobile.
  if (!loaded) {
    // Render children with defaults immediately; a subtle loading indicator
    // is shown only as an overlay so the page content is still visible/measurable.
    return (
      <div className="relative">
        {children}
        <div
          className="fixed top-4 right-4 z-50 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-60 pointer-events-none"
          aria-label="Loading content"
        />
      </div>
    );
  }

  return <>{children}</>;
}
