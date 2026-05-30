'use client';


import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/app/commercial/components/CommercialHero';
import CommercialListings from '@/app/commercial/components/CommercialListings';
import MarketInsights from '@/app/commercial/components/MarketInsights';
import CommercialStats from '@/app/commercial/components/CommercialStats';
import { useCMSPage } from '@/contexts/CMSContext';
import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export default function CommercialPage() {
  const page = useCMSPage('commercial');
  const sections = page?.sections ?? {};

  const listingSchema = generateListingCollectionSchema({
    category: 'commercial',
    count: 0,
    url: `${siteUrl}/commercial`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        suppressHydrationWarning
      />
      <main className="bg-background overflow-x-hidden">
        <Header />
        <CommercialHero />
        {sections?.listings_grid !== false && <CommercialListings />}
        {sections?.commercial_stats !== false && <CommercialStats />}
        {sections?.market_insights !== false && <MarketInsights />}
        <Footer />
      </main>
    </>
  );
}