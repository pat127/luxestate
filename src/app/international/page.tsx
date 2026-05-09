import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InternationalHero from '@/app/international/components/InternationalHero';
import InternationalGallery from '@/app/international/components/InternationalGallery';
import ProjectInquiry from '@/app/projects/components/ProjectInquiry';

export default function InternationalPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <InternationalHero />
      <InternationalGallery />
      <ProjectInquiry />
      <Footer />
    </main>
  );
}
