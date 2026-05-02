import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectsHero from '@/app/projects/components/ProjectsHero';
import ProjectsGallery from '@/app/projects/components/ProjectsGallery';
import ProjectTimeline from '@/app/projects/components/ProjectTimeline';
import ProjectInquiry from '@/app/projects/components/ProjectInquiry';

export default function ProjectsPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <ProjectsHero />
      <ProjectsGallery />
      <ProjectTimeline />
      <ProjectInquiry />
      <Footer />
    </main>
  );
}