'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectsHero from '@/app/projects/components/ProjectsHero';
import ProjectsGallery from '@/app/projects/components/ProjectsGallery';
import ProjectTimeline from '@/app/projects/components/ProjectTimeline';
import ProjectInquiry from '@/app/projects/components/ProjectInquiry';
import { useCMSPage } from '@/contexts/CMSContext';
import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export default function ProjectsPageClient() {
  const page = useCMSPage('projects');
  const sections = page?.sections ?? {};

  const listingSchema = generateListingCollectionSchema({
    category: 'projects',
    count: 0,
    url: `${siteUrl}/projects`,
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
        <ProjectsHero />
        {sections?.projects_gallery !== false && <ProjectsGallery />}
        {sections?.project_timeline !== false && <ProjectTimeline />}
        {sections?.project_inquiry !== false && <ProjectInquiry />}
        <Footer />
      </main>
    </>
  );
}
