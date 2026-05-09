'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { FeaturedProjectsContent, DEFAULT_FEATURED_PROJECTS, ProjectItem } from '@/contexts/CMSContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
  content?: FeaturedProjectsContent;
}

function ProjectCard({ project, priority = false, wide = false }: {
  project: FeaturedProjectsContent['projects'][0];
  priority?: boolean;
  wide?: boolean;
}) {
  const { convertPrice } = useCurrency();
  return (
    <Link href={`/projects/${project.id}`} className={`project-card-3d relative overflow-hidden block bg-card border border-border group cursor-pointer hover:border-primary/30 transition-all duration-500`}>
      <div className={`relative overflow-hidden ${wide ? 'h-72 md:h-80' : 'h-64 md:h-80'}`}>
        {project.image ? (
          <AppImage
            src={project.image}
            alt={project.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority} />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Icon name="BuildingOffice2Icon" size={48} className="text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">{project.type}</span>
          <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-white/20">{project.tag}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{project.name}</h3>
              <p className="text-white/70 text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                <Icon name="MapPinIcon" size={11} className="text-primary" />
                {project.location} · {project.developer}
              </p>
            </div>
            <div className="text-right">
              <span className="text-primary font-bold text-base">{convertPrice(project.price)}</span>
              <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">Starting From</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/60 border-t border-white/10 pt-3">
            <span className="flex items-center gap-1.5">
              <Icon name="BuildingOffice2Icon" size={11} className="text-primary" />
              {project.units} Units
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="CalendarIcon" size={11} className="text-primary" />
              {project.completion}
            </span>
            {project.sold > 0 && (
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${project.sold}%` }} />
                </div>
                <span className="text-primary font-semibold">{project.sold}% Sold</span>
              </div>
            )}
            {project.sold === 0 && <span className="text-primary font-semibold">Register Interest</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function loadFeaturedProjects(): ProjectItem[] {
  try {
    const stored = localStorage.getItem('admin_projects');
    if (!stored) return [];
    const adminProjects = JSON.parse(stored) as Array<{
      id: number; name: string; developer: string; location: string;
      type: string; completion: string; price: string; units: number;
      sold: number; image: string; alt: string; featured?: boolean; published?: boolean;
      international?: boolean; images?: Array<{ url?: string; src?: string; caption?: string; alt?: string }>;
    }>;
    // First try featured=true, fallback to published=true
    const featured = adminProjects.filter((p) => p.featured === true);
    const source = featured.length > 0 ? featured : adminProjects.filter((p) => p.published === true || p.published === undefined);
    return source.map((p) => {
      // Resolve image: prefer first item in images array, then cover image
      let img = '';
      let imgAlt = p.alt || p.name || '';
      if (Array.isArray(p.images) && p.images.length > 0) {
        const first = p.images[0];
        img = first?.url || first?.src || '';
        imgAlt = first?.caption || first?.alt || imgAlt;
      }
      if (!img && p.image) img = p.image;
      return {
        id: p.id,
        name: p.name,
        developer: p.developer,
        location: p.location,
        type: p.type,
        completion: p.completion,
        price: p.price,
        units: p.units,
        sold: p.sold,
        image: img,
        alt: imgAlt,
        tag: p.type === 'Completed' ? 'Completed' : 'Off-Plan',
      };
    });
  } catch {
    return [];
  }
}

export default function FeaturedProjects({ content }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const c = content ?? DEFAULT_FEATURED_PROJECTS;

  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAllProjects(loadFeaturedProjects());
    setLoaded(true);

    // Re-load when admin saves data in another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_projects') {
        setAllProjects(loadFeaturedProjects());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.animate-on-scroll').forEach((el) => {
              (el as HTMLElement).classList.add('visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const projects = allProjects;

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-8">
        <div className="animate-on-scroll stagger-children">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            {c.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
            {c.headline}<br /><span key={c.headline_shimmer} className="text-gold-shimmer">{c.headline_shimmer}</span>
          </h2>
        </div>
        <div className="animate-on-scroll flex flex-col items-start md:items-end gap-4">
          <p className="text-muted-foreground text-sm max-w-xs text-left md:text-right leading-relaxed">
            {c.description}
          </p>
          <Link
            href={c.cta_link}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300">
            {c.cta_text}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>

      {loaded && projects.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="BuildingOffice2Icon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No featured projects available yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Add projects in the admin panel to display them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-scroll">
          {projects[0] && (
            <div className="md:col-span-2">
              <ProjectCard project={projects[0]} priority wide />
            </div>
          )}
          <div className="md:col-span-1 flex flex-col gap-4">
            {projects[1] && <ProjectCard project={projects[1]} />}
            {projects[2] && <ProjectCard project={projects[2]} />}
          </div>
        </div>
      )}
    </section>
  );
}