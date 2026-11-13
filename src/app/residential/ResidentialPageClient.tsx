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

type ListingProps = React.ComponentProps<typeof ResidentialListings>;

export default function ResidentialPageClient({ initialListings }: { initialListings: ListingProps['initialListings'] }) {
  const page = useCMSPage('residential');
  const sections = page?.sections ?? {};

  return (
    <main className="bg-background overflow-x-hidden page-enter">
      <Header />
      <ResidentialHero />
      {sections?.search_bar !== false && <ResidentialSearch />}
      {sections?.listings_grid !== false && <ResidentialListings initialListings={initialListings} />}
      {sections?.team_section !== false && <TeamSection />}
      <ResidentialInquiry />
      <Footer />
    </main>
  );
}
