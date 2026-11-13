'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/app/commercial/components/CommercialHero';
import CommercialListings from '@/app/commercial/components/CommercialListings';
import MarketInsights from '@/app/commercial/components/MarketInsights';
import CommercialInquiry from '@/app/commercial/components/CommercialInquiry';
import CommercialStats from '@/app/commercial/components/CommercialStats';
import { useCMSPage } from '@/contexts/CMSContext';

type ListingProps = React.ComponentProps<typeof CommercialListings>;

export default function CommercialPageClient({
  initialListings,
  startingPriceLabel,
}: {
  initialListings: ListingProps['initialListings'];
  startingPriceLabel: string;
}) {
  const page = useCMSPage('commercial');
  const sections = page?.sections ?? {};

  return (
    <main className="bg-background overflow-x-hidden page-enter">
      <Header />
      <CommercialHero />
      {sections?.listings_grid !== false && <CommercialListings initialListings={initialListings} />}
      {sections?.commercial_stats !== false && <CommercialStats />}
      {sections?.market_insights !== false && <MarketInsights />}
      <section aria-label="Commercial advisory pricing" className="max-w-7xl mx-auto px-6 md:px-10 pb-4">
        <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary pl-4">
          <span className="text-foreground font-bold">Commercial advisory services: </span>
          {startingPriceLabel}
        </p>
      </section>
      <CommercialInquiry />
      <Footer />
    </main>
  );
}
