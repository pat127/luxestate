'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import FeaturedProperties from '@/app/components/FeaturedProperties';
import FeaturedProjects from '@/app/components/FeaturedProjects';
import WhyLuxEstate from '@/app/components/WhyLuxEstate';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import MortgageCalculator from '@/app/components/MortgageCalculator';
import ContactSection from '@/app/components/ContactSection';
import { useCMSPage } from '@/contexts/CMSContext';

const BLOCK_COMPONENTS: Record<string, React.ComponentType> = {
  featured_properties: FeaturedProperties,
  featured_projects: FeaturedProjects,
  why_luxestate: WhyLuxEstate,
  testimonials: TestimonialsSection,
  mortgage_calculator: MortgageCalculator,
  contact_section: ContactSection,
};

export default function HomePage() {
  const homePage = useCMSPage('home');

  // Use homepage_blocks for ordered, manageable rendering
  const blocks = homePage?.homepage_blocks;

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <HeroSection />
      {blocks && blocks.length > 0 ? (
        // Render blocks in CMS-defined order, respecting visibility
        [...blocks]
          .sort((a, b) => a.order - b.order)
          .filter((block) => block.visible !== false)
          .map((block) => {
            const Component = BLOCK_COMPONENTS[block.key];
            if (!Component) return null;
            return <Component key={block.key} />;
          })
      ) : (
        // Fallback: render all blocks in default order
        <>
          <FeaturedProperties />
          <FeaturedProjects />
          <WhyLuxEstate />
          <TestimonialsSection />
          <MortgageCalculator />
          <ContactSection />
        </>
      )}
      <Footer />
    </main>
  );
}