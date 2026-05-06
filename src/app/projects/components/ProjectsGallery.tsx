'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const projects = [
{
  id: 1,
  name: 'One Obsidian Tower',
  developer: 'Meridian Development Group',
  architect: 'Foster & Partners',
  location: 'Hudson Yards, New York',
  completion: 'Q3 2027',
  units: 84,
  priceFrom: 'From $8,500,000',
  status: 'Selling Now',
  statusColor: 'text-primary border-primary/30 bg-primary/10',
  sold: 62,
  type: 'Residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b6ed9c96-1775545509435.png",
  alt: 'Dramatic architectural rendering of luxury tower, dark glass and steel, Hudson Yards skyline, cinematic dusk lighting, deep shadows',
  description: 'A 62-story residential tower defining the Hudson Yards skyline. Each residence features floor-to-ceiling glass, private sky terraces, and unobstructed river views.',
  featured: true,
  colSpan: 'md:col-span-2'
},
{
  id: 2,
  name: 'Seraphine Residences',
  developer: 'Blackwood Capital',
  architect: 'Zaha Hadid Architects',
  location: 'Beverly Hills, CA',
  completion: 'Q1 2027',
  units: 32,
  priceFrom: 'From $14,000,000',
  status: 'Limited',
  statusColor: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  sold: 28,
  type: 'Residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_199704e74-1776417510556.png",
  alt: 'Futuristic luxury residence rendering, flowing organic architecture, Beverly Hills hillside, dramatic dusk lighting',
  description: '32 ultra-luxury residences with fluid, organic architecture by Zaha Hadid. Private pools, rooftop lounges, and concierge services included.',
  featured: false,
  colSpan: 'md:col-span-1'
},
{
  id: 3,
  name: 'The Monarch',
  developer: 'Sterling Properties',
  architect: 'Bjarke Ingels Group',
  location: 'Miami Beach, FL',
  completion: 'Q4 2026',
  units: 120,
  priceFrom: 'From $4,200,000',
  status: 'Selling Now',
  statusColor: 'text-primary border-primary/30 bg-primary/10',
  sold: 85,
  type: 'Mixed-Use',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ac0cbc6e-1772816226219.png",
  alt: 'Luxury Miami Beach mixed-use development rendering, geometric white facade, palm trees, dramatic ocean backdrop, golden hour lighting',
  description: "BIG\'s signature stacked-volume design creates 120 residences above curated retail and a members-only beach club on the most coveted stretch of Miami Beach.",
  featured: false,
  colSpan: 'md:col-span-1'
},
{
  id: 4,
  name: 'Celestia Office Park',
  developer: 'Vantage Commercial',
  architect: 'Skidmore, Owings & Merrill',
  location: 'Silicon Valley, CA',
  completion: 'Q2 2028',
  units: 3,
  priceFrom: 'From $95,000,000',
  status: 'Pre-Launch',
  statusColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  sold: 0,
  type: 'Commercial',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d42ae87d-1777056039498.png",
  alt: 'Modern tech campus architectural rendering, dark glass buildings, dramatic Silicon Valley dusk lighting, geometric precision',
  description: 'Three interconnected Class A office buildings designed for the next generation of technology companies. Net-zero carbon, LEED Platinum certified.',
  featured: false,
  colSpan: 'md:col-span-2'
},
{
  id: 5,
  name: 'Noir Residences',
  developer: 'Atlas Luxury Group',
  architect: 'Kengo Kuma',
  location: 'Chicago Lakefront, IL',
  completion: 'Q3 2026',
  units: 48,
  priceFrom: 'From $6,800,000',
  status: 'Final Units',
  statusColor: 'text-red-400 border-red-400/30 bg-red-400/10',
  sold: 45,
  type: 'Residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1986b4e27-1777301754164.png",
  alt: 'Dark luxury lakefront residences, Kengo Kuma natural material architecture, Chicago lake at night, dramatic atmospheric lighting',
  description: "Kengo Kuma\'s nature-inspired materiality meets Chicago\'s dramatic lakefront. Only 3 residences remain in this nearly sold-out collection.",
  featured: false,
  colSpan: 'md:col-span-1'
},
{
  id: 6,
  name: 'The Halcyon',
  developer: 'Sovereign Developments',
  architect: 'Rafael Moneo',
  location: 'Greenwich, CT',
  completion: 'Q1 2028',
  units: 22,
  priceFrom: 'From $18,000,000',
  status: 'Pre-Launch',
  statusColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  sold: 0,
  type: 'Residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12cf02981-1777301755433.png",
  alt: 'Elegant luxury estate development rendering, classical modern architecture, Connecticut countryside, dramatic overcast sky',
  description: '22 estate residences on 40 acres of private Greenwich land. Rafael Moneo\'s timeless masonry architecture with private equestrian facilities.',
  featured: false,
  colSpan: 'md:col-span-1'
}];


export default function ProjectsGallery() {
  const [activeType, setActiveType] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);
  const types = ['All', 'Residential', 'Commercial', 'Mixed-Use'];

  const filtered = projects.filter((p) => activeType === 'All' || p.type === activeType);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Developments</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
            Active Projects
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) =>
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
            activeType === t ?
            'bg-primary text-primary-foreground border-primary' :
            'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`
            }>

              {t}
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
        {filtered.map((project, i) =>
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className={`animate-on-scroll property-card bg-card border border-border group cursor-pointer block ${project.colSpan}`}
          style={{ transitionDelay: `${i * 70}ms` }}>

            <div className={`relative overflow-hidden ${project.featured ? 'h-80' : 'h-64'}`}>
              <AppImage
              src={project.image}
              alt={project.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status + Type */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  {project.type}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 backdrop-blur-sm ${project.statusColor}`}>
                  {project.status}
                </span>
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
                    <span className="text-foreground font-medium">{project.architect}</span> · {project.developer}
                  </p>
                  <p className="text-primary font-bold text-lg">{project.priceFrom}</p>
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
                  <span>{project.units > 0 ? Math.round(project.sold / project.units * 100) : 0}%</span>
                </div>
                <div className="h-1 bg-border overflow-hidden">
                  <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${project.units > 0 ? project.sold / project.units * 100 : 0}%` }} />

                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">{project.description}</p>

              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary pb-0.5 w-fit group-hover:gap-4 transition-all duration-300">
                View Project Details
                <Icon name="ArrowRightIcon" size={12} />
              </span>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
