'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResidentialHero from '@/app/residential/components/ResidentialHero';
import ResidentialSearch from '@/app/residential/components/ResidentialSearch';
import ResidentialListings from '@/app/residential/components/ResidentialListings';
import TeamSection from '@/app/residential/components/TeamSection';
import { useCMSPage } from '@/contexts/CMSContext';

export default function ResidentialPage() {
  const page = useCMSPage('residential');
  const sections = page?.sections ?? {};

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <ResidentialHero />
      {sections?.search_bar !== false && <ResidentialSearch />}
      {sections?.listings_grid !== false && <ResidentialListings />}
      {sections?.team_section !== false && <TeamSection />}
      <Footer />
    </main>
  );
}