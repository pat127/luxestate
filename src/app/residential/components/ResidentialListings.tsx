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
  type: string;
  status: string;
  beds?: number;
  baths?: number;
  sqft: string;
  image: string;
  alt: string;
  agent?: string;
  propertyType?: string;
  featuredProperty?: boolean;
  published?: boolean;
}

const STORAGE_KEY = 'admin_properties';
const IMPORT_KEY = 'imported_properties';

function readAllProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base: Property[] = raw ? JSON.parse(raw) : [];
    const importedRaw = localStorage.getItem(IMPORT_KEY);
    const imported: Property[] = importedRaw ? JSON.parse(importedRaw) : [];
    const existingIds = new Set(base.map((p) => p.id));
    const merged = [...base, ...imported.filter((p) => !existingIds.has(p.id))];
    return merged;
  } catch {
    return [];
  }
}

function getTag(p: Property): string {
  return p.propertyType || 'Residential';
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function ResidentialListings() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [activeFilter, setActiveFilter] = useState('All');
  const [listings, setListings] = useState<Property[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  function refresh() {
    const all = readAllProperties();
    const residential = all.filter(
      (p) => (p.type || '').toLowerCase() === 'residential'
    );
    setListings(residential);
  }

  useEffect(() => {
    refresh();

    // Listen for storage changes from other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === IMPORT_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);

    // Poll every 2 seconds to catch same-tab admin changes
    const interval = setInterval(refresh, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const filters = ['All', 'Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Duplex', 'Studio', 'Land'];

  const filtered = listings.filter((l) => activeFilter === 'All' || getTag(l) === activeFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
      return pa - pb;
    }
    if (sortBy === 'price-desc') {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
      return pb - pa;
    }
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

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
          <Icon name="HomeIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-bold text-xl mb-2">No Residential Listings Yet</h3>
          <p className="text-muted-foreground text-sm">Residential properties added in the admin panel will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-on-scroll">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) =>
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
                activeFilter === f ?
                'bg-primary text-primary-foreground border-primary' :
                'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`
              }>
              {f}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-background border border-border text-foreground text-xs px-3 py-2 outline-none focus:border-primary transition-colors cursor-pointer">
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          <div className="flex border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors duration-300 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon name="Squares2X2Icon" size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors duration-300 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon name="ListBulletIcon" size={16} />
            </button>
          </div>

          <span className="text-muted-foreground text-xs">
            {sorted.length} Properties
          </span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' &&
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {sorted.map((property, i) =>
            <Link key={property.id} href={`/properties/${property.id}`} className="animate-on-scroll property-card bg-card border border-border group cursor-pointer block" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="relative h-64 overflow-hidden">
                <AppImage
                  src={property.image}
                  alt={property.alt || property.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">
                    {getTag(property)}
                  </span>
                  {property.status !== 'Available' &&
                    <span className="bg-foreground/20 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-foreground/20">
                      {property.status}
                    </span>
                  }
                </div>
                {property.featuredProperty &&
                  <div className="absolute top-4 right-4">
                    <span className="bg-background/80 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-primary/30">
                      Featured
                    </span>
                  </div>
                }
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-foreground font-bold text-lg leading-tight">{property.name}</h3>
                    <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />
                      {property.location}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-sm">{property.price}</span>
                </div>
                <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-border pt-3">
                  {property.beds !== undefined && <span className="flex items-center gap-1.5"><Icon name="HomeIcon" size={12} className="text-primary" />{property.beds} Beds</span>}
                  {property.baths !== undefined && <span className="flex items-center gap-1.5"><Icon name="SparklesIcon" size={12} className="text-primary" />{property.baths} Baths</span>}
                  <span className="flex items-center gap-1.5"><Icon name="ArrowsPointingOutIcon" size={12} className="text-primary" />{property.sqft} sqft</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      }

      {/* List View */}
      {viewMode === 'list' &&
        <div className="space-y-3 stagger-children">
          {sorted.map((property, i) =>
            <Link key={property.id} href={`/properties/${property.id}`} className="animate-on-scroll flex flex-col md:flex-row bg-card border border-border group hover:border-primary/30 transition-all duration-300 cursor-pointer block" style={{ transitionDelay: `${i * 40}ms` }}>
              <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                <AppImage src={property.image} alt={property.alt || property.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{getTag(property)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${property.status === 'Available' ? 'text-primary' : 'text-muted-foreground'}`}>{property.status}</span>
                    </div>
                    <h3 className="text-foreground font-bold text-xl mb-1">{property.name}</h3>
                    <p className="text-muted-foreground text-xs tracking-widest uppercase flex items-center gap-1">
                      <Icon name="MapPinIcon" size={11} className="text-primary" />
                      {property.location}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-xl">{property.price}</span>
                </div>
                <div className="flex items-center gap-8 mt-4 pt-4 border-t border-border">
                  {property.beds !== undefined && <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="HomeIcon" size={14} className="text-primary" />{property.beds} Bedrooms</span>}
                  {property.baths !== undefined && <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="SparklesIcon" size={14} className="text-primary" />{property.baths} Bathrooms</span>}
                  <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="ArrowsPointingOutIcon" size={14} className="text-primary" />{property.sqft} sqft</span>
                  <div className="ml-auto">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary pb-0.5">
                      View Details <Icon name="ArrowRightIcon" size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      }
    </section>
  );
}
