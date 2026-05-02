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

export default function HomePage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <HeroSection />
      <FeaturedProperties />
      <FeaturedProjects />
      <WhyLuxEstate />
      <TestimonialsSection />
      <MortgageCalculator />
      <ContactSection />
      <Footer />
    </main>
  );
}