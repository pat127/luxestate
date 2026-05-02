import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResidentialHero from '@/app/residential/components/ResidentialHero';
import ResidentialSearch from '@/app/residential/components/ResidentialSearch';
import ResidentialListings from '@/app/residential/components/ResidentialListings';
import TeamSection from '@/app/residential/components/TeamSection';

export default function ResidentialPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <ResidentialHero />
      <ResidentialSearch />
      <ResidentialListings />
      <TeamSection />
      <Footer />
    </main>
  );
}