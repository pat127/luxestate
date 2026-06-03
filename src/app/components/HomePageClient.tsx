'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroSection from '@/app/components/HeroSection';
import { useCMSPage, DEFAULT_HOMEPAGE_BLOCKS } from '@/contexts/CMSContext';

// Below-fold chunks — loaded after first paint so they don't compete with LCP on mobile
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
const FeaturedProperties = dynamic(() => import('@/app/components/FeaturedProperties'), { ssr: false });
const FeaturedProjects = dynamic(() => import('@/app/components/FeaturedProjects'), { ssr: false });
const WhyLuxEstate = dynamic(() => import('@/app/components/WhyLuxEstate'), { ssr: false });
const TestimonialsSection = dynamic(() => import('@/app/components/TestimonialsSection'), { ssr: false });
const MortgageCalculator = dynamic(() => import('@/app/components/MortgageCalculator'), { ssr: false });
const ContactSection = dynamic(() => import('@/app/components/ContactSection'), { ssr: false });

export default function HomePageClient() {
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
      <Suspense fallback={null}>
        {visibleBlocks.map((block) => renderBlock(block.key))}
      </Suspense>
      <Footer />
    </main>
  );
}
