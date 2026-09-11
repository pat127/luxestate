'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResidentialHero from '@/app/residential/components/ResidentialHero';
import ResidentialSearch from '@/app/residential/components/ResidentialSearch';
import ResidentialListings from '@/app/residential/components/ResidentialListings';
import TeamSection from '@/app/residential/components/TeamSection';
import ResidentialInquiry from '@/app/residential/components/ResidentialInquiry';
import { useCMSPage } from '@/contexts/CMSContext';
import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export default function ResidentialPage() {
  const page = useCMSPage('residential');
  const sections = page?.sections ?? {};

  const listingSchema = generateListingCollectionSchema({
    category: 'residential',
    count: 0,
    url: `${siteUrl}/residential`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        suppressHydrationWarning
      />
      <main className="bg-background overflow-x-hidden page-enter">
        <Header />
        <ResidentialHero />
        {sections?.search_bar !== false && <ResidentialSearch />}
        {sections?.listings_grid !== false && <ResidentialListings />}
        {sections?.team_section !== false && <TeamSection />}
        <ResidentialInquiry />
        <Footer />
      </main>
    </>
  );
}