'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface InternationalProject {
  id: string;
  name: string;
  developer: string | null;
  location_area: string | null;
  country: string | null;
  project_type: string | null;
  status: string | null;
  total_units: number;
  sold_units: number;
  handover_date: string | null;
  starting_price: string | null;
  images: { url: string; alt?: string }[] | null;
  featured: boolean;
}

export default function InternationalGallery() {
  const [projects, setProjects] = useState<InternationalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, developer, location_area, country, project_type, status, total_units, sold_units, handover_date, starting_price, images, featured')
          .eq('international', true)
          .eq('published', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProjects(data as InternationalProject[]);
        } else if (error) {
          const { data: fallbackData } = await supabase
            .from('projects')
            .select('id, name, developer, location_area, country, project_type, status, total_units, sold_units, handover_date, starting_price, images, featured, international, published')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });
          if (fallbackData) {
            setProjects(
              (fallbackData as (InternationalProject & { international: boolean | null; published: boolean | null })[])
                .filter((p) => p.international === true && p.published === true) as InternationalProject[]
            );
          }
        }
      } catch {
        // silent fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const countries = ['All', ...Array.from(new Set(projects.map((p) => p.country).filter(Boolean) as string[]))];
  const filtered = projects.filter((p) => activeCountry === 'All' || p.country === activeCountry);

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end items-start mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">International Developments</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
            Global Projects
          </h2>
        </div>
        {!loading && countries.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCountry(c)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
                  activeCountry === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-on-scroll">
          <div className="w-16 h-16 border border-border flex items-center justify-center mb-6">
            <Icon name="GlobeAltIcon" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-bold text-xl mb-2">No International Projects</h3>
          <p className="text-muted-foreground text-sm max-w-sm">No international projects available at this time. Check back soon for new global opportunities.</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
          {filtered.map((project, i) => {
            const isFeatured = project.featured;
            const images = Array.isArray(project.images) ? project.images : [];
            const firstImage = images[0];
            const imgSrc = firstImage?.url || '';
            const imgAlt = firstImage?.alt || project.name;
            const priceFrom = project.starting_price
              ? `AED ${Number(project.starting_price).toLocaleString()}+`
              : '';

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`animate-on-scroll property-card bg-card border border-border group cursor-pointer block ${isFeatured ? 'md:col-span-2' : ''}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={`relative overflow-hidden ${isFeatured ? 'h-80' : 'h-64'}`}>
                  {imgSrc ? (
                    <AppImage
                      src={imgSrc}
                      alt={imgAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Icon name="GlobeAltIcon" size={40} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Country label only */}
                  {project.country && (
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        {project.country}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-foreground font-bold text-xl leading-tight">{project.name}</h3>
                      <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                        <Icon name="MapPinIcon" size={11} className="text-primary" />
                        {project.location_area || project.country || ''}
                      </p>
                    </div>
                    {priceFrom && (
                      <span className="text-primary font-bold text-sm text-right">{priceFrom}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="text-primary font-bold text-base">{project.developer || ''}</span>
                    {project.handover_date && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="CalendarIcon" size={11} className="text-primary" />
                        {project.handover_date}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      View Project <Icon name="ArrowRightIcon" size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
