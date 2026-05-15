'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface DisplayProject {
  id: string;
  name: string;
  developer: string;
  location: string;
  completion: string;
  units: number;
  priceFrom: string;
  status: string;
  statusColor: string;
  sold: number;
  type: string;
  image: string;
  alt: string;
  description: string;
  featured: boolean;
  colSpan: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    case 'Launching': return 'text-primary border-primary/30 bg-primary/10';
    case 'Completed': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    case 'On Hold': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
    default: return 'text-primary border-primary/30 bg-primary/10';
  }
}

function getDisplayStatus(status: string): string {
  if (status === 'Active') return 'Selling Now';
  return status;
}

export default function ProjectsGallery() {
  const supabase = useMemo(() => createClient(), []);
  const [activeType, setActiveType] = useState('All');
  const [displayProjects, setDisplayProjects] = useState<DisplayProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const types = ['All', 'Residential', 'Commercial', 'Mixed-Use'];

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, developer, location_area, handover_date, total_units, starting_price, status, sold_units, project_type, images, description, featured, published, international')
      .eq('published', true)
      .eq('international', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped: DisplayProject[] = data.map((p: any) => {
            const imgs = Array.isArray(p.images) ? p.images : [];
            const coverImage = imgs[0]?.url || imgs[0]?.src || '';
            const coverAlt = imgs[0]?.caption || imgs[0]?.alt || p.name || '';
            let displayType = p.project_type || 'Residential';
            if (displayType === 'Off-Plan' || displayType === 'Under Construction') displayType = 'Residential';
            return {
              id: p.id,
              name: p.name || '',
              developer: p.developer || '',
              location: p.location_area || '',
              completion: p.handover_date || '',
              units: p.total_units || 0,
              priceFrom: p.starting_price ? `AED ${Number(p.starting_price).toLocaleString()}+` : '',
              status: p.status || 'Active',
              statusColor: getStatusColor(p.status),
              sold: p.sold_units || 0,
              type: displayType,
              image: coverImage,
              alt: coverAlt,
              description: p.description || '',
              featured: p.featured === true,
              colSpan: p.featured === true ? 'md:col-span-2' : 'md:col-span-1',
            };
          });
          setDisplayProjects(mapped);
        }
        setLoaded(true);
      });
  }, []);

  const filtered = displayProjects.filter((p) => activeType === 'All' || p.type === activeType);

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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Developments</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">Active Projects</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} onClick={() => setActiveType(t)} className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${activeType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      {!loaded && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {loaded && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-on-scroll">
          <div className="w-16 h-16 border border-border flex items-center justify-center mb-6">
            <Icon name="BuildingOffice2Icon" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-bold text-xl mb-2">No Projects Available</h3>
          <p className="text-muted-foreground text-sm max-w-sm">Development projects will appear here once added through the admin panel.</p>
        </div>
      )}

      {loaded && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
          {filtered.map((project, i) => (
            <Link key={project.id} href={`/projects/${project.id}`} className={`animate-on-scroll property-card bg-card border border-border group cursor-pointer block ${project.colSpan}`} style={{ transitionDelay: `${i * 70}ms` }}>
              <div className={`relative overflow-hidden ${project.featured ? 'h-80' : 'h-64'}`}>
                {project.image ? (
                  <AppImage src={project.image} alt={project.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <Icon name="BuildingOffice2Icon" size={40} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">{project.type}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 backdrop-blur-sm ${project.statusColor}`}>{getDisplayStatus(project.status)}</span>
                </div>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-foreground font-bold text-xl leading-tight">{project.name}</h3>
                    <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />{project.location}
                    </p>
                  </div>
                  {project.priceFrom && <span className="text-primary font-bold text-sm text-right">{project.priceFrom}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="text-primary font-bold text-base">{project.developer}</span>
                  {project.completion && <span className="flex items-center gap-1.5"><Icon name="CalendarIcon" size={11} className="text-primary" />{project.completion}</span>}
                  <span className="flex items-center gap-1.5 text-primary font-bold">View Project <Icon name="ArrowRightIcon" size={11} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
