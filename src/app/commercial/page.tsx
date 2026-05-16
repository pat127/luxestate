'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/app/commercial/components/CommercialHero';
import CommercialListings from '@/app/commercial/components/CommercialListings';
import MarketInsights from '@/app/commercial/components/MarketInsights';
import CommercialStats from '@/app/commercial/components/CommercialStats';
import { useCMSPage } from '@/contexts/CMSContext';

export default function CommercialPage() {
  const page = useCMSPage('commercial');
  const sections = page?.sections ?? {};

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <CommercialHero />
      {sections?.listings_grid !== false && <CommercialListings />}
      {sections?.commercial_stats !== false && <CommercialStats />}
      {sections?.market_insights !== false && <MarketInsights />}
      <Footer />
    </main>
  );
}