'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectsHero from '@/app/projects/components/ProjectsHero';
import ProjectsGallery from '@/app/projects/components/ProjectsGallery';
import ProjectTimeline from '@/app/projects/components/ProjectTimeline';
import ProjectInquiry from '@/app/projects/components/ProjectInquiry';
import { useCMSPage } from '@/contexts/CMSContext';

export default function ProjectsPage() {
  const page = useCMSPage('projects');
  const sections = page?.sections ?? {};

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <ProjectsHero />
      {sections?.projects_gallery !== false && <ProjectsGallery />}
      {sections?.project_timeline !== false && <ProjectTimeline />}
      {sections?.project_inquiry !== false && <ProjectInquiry />}
      <Footer />
    </main>
  );
}