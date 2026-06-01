'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';


interface InternationalProject {
  id: number;
  name: string;
  developer: string;
  location: string;
  country: string;
  type: string;
  status: string;
  units: number;
  sold: number;
  completion: string;
  price: string;
  image: string;
  alt: string;
  featured?: boolean;
  published?: boolean;
  international?: boolean;
}

const PROJECTS_STORAGE_KEY = 'admin_projects';

// Fallback international projects shown when no admin data exists
const fallbackProjects: InternationalProject[] = [
{
  id: 9001,
  name: 'One Obsidian Tower',
  developer: 'Meridian Development Group',
  location: 'Hudson Yards, New York',
  country: 'United States',
  type: 'Residential',
  status: 'Active',
  units: 84,
  sold: 62,
  completion: 'Q3 2027',
  price: 'From $8,500,000',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b6ed9c96-1775545509435.png",
  alt: 'Dramatic architectural rendering of luxury tower, dark glass and steel, Hudson Yards skyline, cinematic dusk lighting',
  featured: true,
  published: true,
  international: true
},
{
  id: 9002,
  name: 'Seraphine Residences',
  developer: 'Blackwood Capital',
  location: 'Beverly Hills, CA',
  country: 'United States',
  type: 'Residential',
  status: 'Active',
  units: 32,
  sold: 28,
  completion: 'Q1 2027',
  price: 'From $14,000,000',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a5a737aa-1778059435159.png",
  alt: 'Futuristic luxury residence rendering, flowing organic architecture, Beverly Hills hillside, dramatic dusk lighting',
  featured: false,
  published: true,
  international: true
},
{
  id: 9003,
  name: 'The Halcyon',
  developer: 'Sovereign Developments',
  location: 'Greenwich, CT',
  country: 'United States',
  type: 'Residential',
  status: 'Launching',
  units: 22,
  sold: 0,
  completion: 'Q1 2028',
  price: 'From $18,000,000',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1faf938f1-1778137755172.png",
  alt: 'Elegant luxury estate development rendering, classical modern architecture, Connecticut countryside, dramatic overcast sky',
  featured: false,
  published: true,
  international: true
},
{
  id: 9004,
  name: 'Noir Residences',
  developer: 'Atlas Luxury Group',
  location: 'Chicago Lakefront, IL',
  country: 'United States',
  type: 'Residential',
  status: 'Active',
  units: 48,
  sold: 45,
  completion: 'Q3 2026',
  price: 'From $6,800,000',
  image: "https://images.unsplash.com/photo-1659356993864-127db75d4df1",
  alt: 'Dark luxury lakefront residences, nature-inspired architecture, Chicago lake at night, dramatic atmospheric lighting',
  featured: false,
  published: true,
  international: true
}];


const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  Completed: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Launching: 'text-primary border-primary/30 bg-primary/10',
  'On Hold': 'text-orange-400 border-orange-400/30 bg-orange-400/10'
};

export default function InternationalGallery() {
  const [projects, setProjects] = useState<InternationalProject[]>([]);
  const [activeCountry, setActiveCountry] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load international projects from admin storage
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        const all: InternationalProject[] = JSON.parse(stored);
        const intl = all.filter((p) => p.international && p.published !== false);
        setProjects(intl.length > 0 ? intl : fallbackProjects);
      } else {
        setProjects(fallbackProjects);
      }
    } catch {
      setProjects(fallbackProjects);
    }
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

  const countries = ['All', ...Array.from(new Set(projects.map((p) => p.country).filter(Boolean)))];
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
        <div className="flex flex-wrap gap-2">
          {countries.map((c) =>
          <button
            key={c}
            onClick={() => setActiveCountry(c)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
            activeCountry === c ?
            'bg-primary text-primary-foreground border-primary' :
            'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`
            }>
            
              {c}
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ?
      <div className="text-center py-20 border border-border">
          <Icon name="GlobeAltIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No international projects available at this time.</p>
          <p className="text-muted-foreground text-xs mt-1">Check back soon for new global opportunities.</p>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
          {filtered.map((project, i) => {
          const soldPct = project.units > 0 ? Math.round(project.sold / project.units * 100) : 0;
          const isFeatured = project.featured;
          return (
            <div
              key={project.id}
              className={`animate-on-scroll property-card bg-card border border-border group cursor-pointer block ${isFeatured ? 'md:col-span-2' : ''}`}
              style={{ transitionDelay: `${i * 70}ms` }}>
              
                <div className={`relative overflow-hidden ${isFeatured ? 'h-80' : 'h-64'}`}>
                  <AppImage
                  src={project.image}
                  alt={project.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw" />
                
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status + Type */}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      {project.type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 backdrop-blur-sm ${statusColors[project.status] || ''}`}>
                      {project.status}
                    </span>
                    {project.country &&
                  <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border flex items-center gap-1">
                        <Icon name="GlobeAltIcon" size={10} className="text-primary" />
                        {project.country}
                      </span>
                  }
                  </div>

                  {/* Completion */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border">
                      {project.completion}
                    </span>
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-black text-xl md:text-2xl tracking-tight mb-1">{project.name}</h3>
                    <p className="text-white/70 text-xs tracking-widest uppercase flex items-center gap-1">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />
                      {project.location}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        <span className="text-foreground font-medium">{project.developer}</span>
                      </p>
                      <p className="text-primary font-bold text-lg">{project.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold text-sm">{project.units} Units</p>
                      <p className="text-muted-foreground text-xs">{project.sold} Reserved</p>
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
                      style={{ width: `${soldPct}%` }} />
                    
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />
                      {project.location}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      Enquire <Icon name="ArrowRightIcon" size={11} />
                    </span>
                  </div>
                </div>
              </div>);

        })}
        </div>
      }
    </section>);

}