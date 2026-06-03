'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
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

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  Completed: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Launching: 'text-primary border-primary/30 bg-primary/10',
  'On Hold': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
};

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
          // Fallback: fetch without strict boolean filter to handle legacy NULL values
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-card border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 border border-border">
          <Icon name="GlobeAltIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No international projects available at this time.</p>
          <p className="text-muted-foreground text-xs mt-1">Check back soon for new global opportunities.</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
          {filtered.map((project, i) => {
            const soldPct = project.total_units > 0 ? Math.round((project.sold_units / project.total_units) * 100) : 0;
            const isFeatured = project.featured;
            const images = Array.isArray(project.images) ? project.images : [];
            const firstImage = images[0];
            const imgSrc = firstImage?.url || '';
            const imgAlt = firstImage?.alt || project.name;

            return (
              <div
                key={project.id}
                className={`animate-on-scroll property-card bg-card border border-border group cursor-pointer block ${isFeatured ? 'md:col-span-2' : ''}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={`relative overflow-hidden ${isFeatured ? 'h-80' : 'h-64'}`}>
                  <AppImage
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status + Type */}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    {project.project_type && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                        {project.project_type}
                      </span>
                    )}
                    {project.status && (
                      <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 backdrop-blur-sm ${statusColors[project.status] || ''}`}>
                        {project.status}
                      </span>
                    )}
                    {project.country && (
                      <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border flex items-center gap-1">
                        <Icon name="GlobeAltIcon" size={10} className="text-primary" />
                        {project.country}
                      </span>
                    )}
                  </div>

                  {/* Completion */}
                  {project.handover_date && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border">
                        {project.handover_date}
                      </span>
                    </div>
                  )}

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-black text-xl md:text-2xl tracking-tight mb-1">{project.name}</h3>
                    {project.location_area && (
                      <p className="text-white/70 text-xs tracking-widest uppercase flex items-center gap-1">
                        <Icon name="MapPinIcon" size={11} className="text-primary" />
                        {project.location_area}
                      </p>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {project.developer && (
                        <p className="text-muted-foreground text-xs mb-1">
                          <span className="text-foreground font-medium">{project.developer}</span>
                        </p>
                      )}
                      {project.starting_price && (
                        <p className="text-primary font-bold text-lg">{project.starting_price}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold text-sm">{project.total_units} Units</p>
                      <p className="text-muted-foreground text-xs">{project.sold_units} Reserved</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                      <span>Reservation Progress</span>
                      <span>{soldPct}%</span>
                    </div>
                    <div className="h-1 bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />
                      {project.location_area || project.country || ''}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      Enquire <Icon name="ArrowRightIcon" size={11} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
