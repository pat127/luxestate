'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { FeaturedProjectsContent, DEFAULT_FEATURED_PROJECTS } from '@/contexts/CMSContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { createClient } from '@/lib/supabase/client';

interface Props {
  content?: FeaturedProjectsContent;
}

interface ProjectItem {
  id: string;
  name: string;
  developer: string;
  location: string;
  type: string;
  completion: string;
  price: string;
  units: number;
  sold: number;
  image: string;
  alt: string;
  tag: string;
}

function ProjectCard({ project, priority = false, wide = false }: {
  project: ProjectItem;
  priority?: boolean;
  wide?: boolean;
}) {
  const { convertPrice } = useCurrency();
  return (
    <Link href={`/projects/${project.id}`} className="project-card-3d relative overflow-hidden block bg-card border border-border group cursor-pointer hover:border-primary/30 transition-all duration-500 h-full">
      <div className="relative overflow-hidden h-full min-h-[260px]">
        {project.image ? (
          <AppImage src={project.image} alt={project.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 50vw" priority={priority} />
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
              <p className="text-primary font-bold text-base mt-1">
                {project.developer}
              </p>
              <p className="text-white/70 text-xs tracking-widest uppercase mt-0.5 flex items-center gap-1">
                <Icon name="MapPinIcon" size={11} className="text-primary" />{project.location}
              </p>
            </div>
            <div className="text-right">
              <span className="text-primary font-bold text-base">{convertPrice(project.price)}</span>
              <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">Starting From</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/60 border-t border-white/10 pt-3">
            {project.completion && <span className="flex items-center gap-1.5"><Icon name="CalendarIcon" size={11} className="text-primary" />{project.completion}</span>}
            <span className="text-primary font-semibold">Register Interest</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProjects({ content }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const sectionRef = useRef<HTMLElement>(null);
  const c = content ?? DEFAULT_FEATURED_PROJECTS;

  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, developer, location_area, project_type, handover_date, starting_price, total_units, sold_units, images, featured, published')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setAllProjects(data.map((p: any) => {
            const imgs = Array.isArray(p.images) ? p.images : [];
            const img = imgs[0]?.url || imgs[0]?.src || '';
            const imgAlt = imgs[0]?.caption || imgs[0]?.alt || p.name || '';
            const soldPct = p.total_units > 0 ? Math.round((p.sold_units / p.total_units) * 100) : 0;
            return {
              id: p.id,
              name: p.name,
              developer: p.developer || '',
              location: p.location_area || '',
              type: p.project_type || 'Off-Plan',
              completion: p.handover_date || '',
              price: p.starting_price ? `AED ${Number(p.starting_price).toLocaleString()}+` : 'Price on Request',
              units: p.total_units || 0,
              sold: soldPct,
              image: img,
              alt: imgAlt,
              tag: p.project_type === 'Completed' ? 'Completed' : 'Off-Plan',
            };
          }));
        }
        setLoaded(true);
      });
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
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">{c.eyebrow}</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
            {c.headline}<br /><span key={c.headline_shimmer} className="text-gold-shimmer">{c.headline_shimmer}</span>
          </h2>
        </div>
        <div className="animate-on-scroll flex flex-col items-start md:items-end gap-4">
          <p className="text-muted-foreground text-sm max-w-xs text-left md:text-right leading-relaxed">{c.description}</p>
          <Link href={c.cta_link} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300">
            {c.cta_text}<Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loaded && projects.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="BuildingOffice2Icon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No featured projects available yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Add projects in the admin panel to display them here.</p>
        </div>
      ) : (
        <div className="animate-on-scroll">
          {projects.length === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <ProjectCard project={projects[0]} priority wide />
            </div>
          )}
          {projects.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProjectCard project={projects[0]} priority wide />
              <ProjectCard project={projects[1]} wide />
            </div>
          )}
          {projects.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
              {projects[0] && <div className="md:col-span-2 md:row-span-2"><ProjectCard project={projects[0]} priority wide /></div>}
              {projects[1] && <div className="md:col-span-1 md:row-span-1"><ProjectCard project={projects[1]} /></div>}
              {projects[2] && <div className="md:col-span-1 md:row-span-1"><ProjectCard project={projects[2]} /></div>}
              {projects[3] && <div className="md:col-span-1 md:row-span-1"><ProjectCard project={projects[3]} /></div>}
              {projects[4] && <div className="md:col-span-2 md:row-span-1"><ProjectCard project={projects[4]} wide /></div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}