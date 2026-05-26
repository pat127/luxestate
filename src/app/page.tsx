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
import { useCMSPage, DEFAULT_HOMEPAGE_BLOCKS } from '@/contexts/CMSContext';

export default function HomePage() {
  const homePage = useCMSPage('home');

  const blocks = homePage?.homepage_blocks?.length
    ? homePage.homepage_blocks
    : DEFAULT_HOMEPAGE_BLOCKS;

  const visibleBlocks = [...blocks]
    .sort((a, b) => a.order - b.order)
    .filter((block) => block.visible === true);

  const renderBlock = (key: string) => {
    switch (key) {
      case 'featured_properties':
        return <FeaturedProperties key="featured_properties" content={homePage?.featured_properties_content} />;
      case 'featured_projects':
        return <FeaturedProjects key="featured_projects" content={homePage?.featured_projects_content} />;
      case 'why_luxestate':
        return <WhyLuxEstate key="why_luxestate" content={homePage?.why_luxestate_content} />;
      case 'testimonials':
        return <TestimonialsSection key="testimonials" content={homePage?.testimonials_content} />;
      case 'mortgage_calculator':
        return <MortgageCalculator key="mortgage_calculator" content={homePage?.mortgage_content} />;
      case 'contact_section':
        return <ContactSection key="contact_section" content={homePage?.contact_content} />;
      default:
        return null;
    }
  };

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <HeroSection />
      {visibleBlocks.map((block) => renderBlock(block.key))}
      <Footer />
    </main>
  );
}
