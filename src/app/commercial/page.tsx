import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/app/commercial/components/CommercialHero';
import CommercialListings from '@/app/commercial/components/CommercialListings';
import MarketInsights from '@/app/commercial/components/MarketInsights';

export default function CommercialPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <CommercialHero />
      <CommercialListings />
      <MarketInsights />
      <Footer />
    </main>
  );
}