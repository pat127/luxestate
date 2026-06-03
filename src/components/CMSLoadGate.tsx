'use client';

import React from 'react';

export default function CMSLoadGate({ children }: { children: React.ReactNode }) {
  // Render children immediately — do NOT block rendering while CMS loads.
  // Hiding the entire page until Supabase responds was the primary cause of
  // the 6.6 s LCP on mobile. Individual components handle their own skeletons.
  return <>{children}</>;
}
