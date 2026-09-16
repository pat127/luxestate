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
  minBedrooms: number | null;
  maxBedrooms: number | null;
  sizeRange: string;
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
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, developer, location_area, handover_date, total_units, starting_price, status, sold_units, project_type, images, description, featured, published, international, min_bedrooms, max_bedrooms, size_range')
          .eq('published', true)
          .eq('international', false)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (error || !data) {
          setDisplayProjects([]);
          return;
        }

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
            priceFrom: p.starting_price ? `AED ${Number(p.starting_price).toLocaleString()}` : '',
            status: p.status || 'Active',
            statusColor: getStatusColor(p.status),
            sold: p.sold_units || 0,
            type: displayType,
            image: coverImage,
            alt: coverAlt,
            description: p.description || '',
            featured: p.featured === true,
            colSpan: p.featured === true ? 'md:col-span-2' : 'md:col-span-1',
            minBedrooms: p.min_bedrooms ?? null,
            maxBedrooms: p.max_bedrooms ?? null,
            sizeRange: p.size_range || '',
          };
        });
        setDisplayProjects(mapped);
      } catch {
        if (!cancelled) setDisplayProjects([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    loadProjects();
    return () => { cancelled = true; };
  }, [supabase]);

  const filtered = displayProjects.filter((p) => activeType === 'All' || p.type === activeType);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reveal = () => {
      section.querySelectorAll('.animate-on-scroll').forEach((el) => {
        (el as HTMLElement).classList.add('visible');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal();
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    if (loaded) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        requestAnimationFrame(reveal);
      }
    }

    return () => observer.disconnect();
  }, [loaded, filtered.length]);

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end items-start mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Developments</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">Active Projects</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
                activeType === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {loaded && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-on-scroll">
          <div className="w-16 h-16 border border-border flex items-center justify-center mb-6">
            <Icon name="BuildingOffice2Icon" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-bold text-xl mb-2">No Projects Available</h3>
          <p className="text-muted-foreground text-sm max-w-sm">Development projects will appear here once added through the admin panel.</p>
        </div>
      )}

      {/* Grid */}
      {loaded && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children animate-on-scroll">
          {filtered.map((project, i) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="animate-on-scroll group cursor-pointer block"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-[320px]">
                {project.image ? (
                  <AppImage
                    src={project.image}
                    alt={project.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <Icon name="BuildingOffice2Icon" size={40} className="text-muted-foreground" />
                  </div>
                )}
                {/* Status badge — top left only */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1.5 backdrop-blur-sm ${project.statusColor}`}>
                    {getDisplayStatus(project.status)}
                  </span>
                </div>
              </div>

              {/* Text block — editorial hierarchy */}
              <div className="pt-4 pb-2">
                {/* Row 1: Developer name — small, uppercase, muted */}
                {project.developer && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                    {project.developer}
                  </p>
                )}

                {/* Row 2: Project name — large, bold headline */}
                <h3 className="text-foreground font-bold text-xl md:text-2xl leading-tight tracking-tight mb-2 group-hover:text-primary transition-colors duration-200">
                  {project.name}
                </h3>

                {/* Row 3: Location — white */}
                {project.location && (
                  <p className="text-white text-xs tracking-wide flex items-center gap-1.5 mb-4">
                    <Icon name="MapPinIcon" size={11} className="text-primary flex-shrink-0" />
                    {project.location}
                  </p>
                )}

                {/* Row 4: Beds / Size / Handover info row */}
                <div className="flex items-center gap-4 mb-4">
                  {(project.minBedrooms !== null || project.maxBedrooms !== null) && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="HomeIcon" size={12} className="text-muted-foreground" />
                      <span className="text-white text-xs font-semibold">
                        {project.minBedrooms === project.maxBedrooms
                          ? `${project.minBedrooms} Bed`
                          : `${project.minBedrooms}–${project.maxBedrooms} Bed`}
                      </span>
                    </div>
                  )}
                  {project.sizeRange && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="Squares2X2Icon" size={12} className="text-muted-foreground" />
                      <span className="text-white text-xs font-semibold">{project.sizeRange}</span>
                    </div>
                  )}
                  {project.completion && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="CalendarIcon" size={12} className="text-muted-foreground" />
                      <div>
                        <span className="text-white text-[10px] uppercase tracking-[0.15em] font-bold">Handover </span>
                        <span className="text-white text-xs font-semibold">{project.completion}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border pt-4 flex items-end justify-between gap-4">
                  {/* Price — prominent */}
                  <div>
                    {project.priceFrom ? (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white font-bold mb-0.5">Starting From</p>
                        <p className="text-foreground font-bold text-xl leading-none">{project.priceFrom}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-xs uppercase tracking-widest">Price on Request</p>
                    )}
                  </div>

                  {/* Explore CTA — Sotheby's style */}
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-foreground/40 text-foreground text-[11px] font-bold uppercase tracking-[0.2em] group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                    Explore
                    <Icon name="ArrowRightIcon" size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
