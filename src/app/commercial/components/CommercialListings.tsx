'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Property {
  id: number;
  name: string;
  location: string;
  price: string;
  type: 'Residential' | 'Commercial';
  status: string;
  sqft: string;
  image: string;
  alt: string;
  agent?: string;
  propertyType?: string;
  featuredProperty?: boolean;
  published?: boolean;
  capRate?: string;
  occupancy?: string;
}

const PROPERTIES_STORAGE_KEY = 'admin_properties';
const IMPORT_STORAGE_KEY = 'imported_properties';

function loadCommercialProperties(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Property[];
    let base: Property[] = stored ? JSON.parse(stored) : [];
    const existingIds = new Set(base.map((p) => p.id));
    const newImports = imported.filter((p) => !existingIds.has(p.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
    }
    return base.filter((p) => p.type === 'Commercial');
  } catch {
    return [];
  }
}

function getCommercialType(p: Property): string {
  return p.propertyType || 'Commercial';
}

export default function CommercialListings() {
  const [activeType, setActiveType] = useState('All');
  const [listings, setListings] = useState<Property[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setListings(loadCommercialProperties());
  }, []);

  const types = ['All', 'Office', 'Retail', 'Mixed-Use', 'Hospitality', 'Warehouse', 'Land'];

  const filtered = listings.filter((l) => activeType === 'All' || getCommercialType(l) === activeType);

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

  if (listings.length === 0) {
    return (
      <section className="py-16 px-6 md:px-10 max-w-7xl mx-auto text-center">
        <div className="border border-border bg-card p-16">
          <Icon name="BuildingOfficeIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-bold text-xl mb-2">No Commercial Listings Yet</h3>
          <p className="text-muted-foreground text-sm">Commercial properties added in the admin panel will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Investment Grade</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
            Commercial<br />Portfolio
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

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filtered.map((listing, i) =>
          <Link
            key={listing.id}
            href={`/properties/${listing.id}`}
            className="animate-on-scroll property-card bg-card border border-border group cursor-pointer block"
            style={{ transitionDelay: `${i * 70}ms` }}>

            <div className="relative h-56 overflow-hidden">
              <AppImage
                src={listing.image}
                alt={listing.alt || listing.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  {getCommercialType(listing)}
                </span>
                {listing.featuredProperty &&
                  <span className="bg-background/80 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-primary/30">
                    Featured
                  </span>
                }
              </div>
              {listing.status !== 'Available' &&
                <div className="absolute top-4 right-4">
                  <span className="bg-foreground/20 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-foreground/20">
                    {listing.status}
                  </span>
                </div>
              }
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-foreground font-bold text-lg leading-tight">{listing.name}</h3>
                  <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                    <Icon name="MapPinIcon" size={11} className="text-primary" />
                    {listing.location}
                  </p>
                </div>
                <span className="text-primary font-bold text-sm text-right">{listing.price}</span>
              </div>

              {/* Investment Metrics */}
              <div className="grid grid-cols-3 gap-3 border border-border p-3 mb-4 bg-background">
                <div className="text-center">
                  <p className="text-primary font-bold text-sm">{listing.capRate || 'N/A'}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Cap Rate</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-primary font-bold text-sm">{listing.occupancy || 'N/A'}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Occupied</p>
                </div>
                <div className="text-center">
                  <p className="text-primary font-bold text-sm">{listing.sqft}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Sq Ft</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full border-t border-border pt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                View Property Details
                <Icon name="ArrowRightIcon" size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Inquiry CTA */}
      <div className="mt-16 border border-border bg-card p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8 animate-on-scroll">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tighter mb-3">
            Looking for Off-Market<br />Commercial Opportunities?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Over 60% of our commercial transactions occur before properties reach any public listing. Speak with our investment team directly.
          </p>
        </div>
        <Link
          href="#contact"
          className="flex items-center gap-3 bg-primary text-primary-foreground px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group flex-shrink-0">
          Talk to Investment Team
          <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
