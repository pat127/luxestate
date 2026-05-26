'use client';

import React from 'react';
import { useCMS } from '@/contexts/CMSContext';

export default function CMSLoadGate({ children }: { children: React.ReactNode }) {
  const { loaded } = useCMS();

  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transition: loaded ? 'opacity 0.15s ease-in' : 'none',
        visibility: loaded ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
}
