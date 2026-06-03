'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { trackFilterSelection, trackSortSelection } from '@/lib/analytics';
import { usePropertyFields } from '@/hooks/usePropertyFields';
import { createClient } from '@/lib/supabase/client';

interface Property {
  id: string;
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  tag: string;
  status: string;
  completion: string;
  image: string;
  alt: string;
  featured: boolean;
}

const RESIDENTIAL_CATEGORIES = ['Residential', 'Apartment', 'Villa', 'Townhouse', 'Penthouse'];

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function ResidentialListings() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [activeFilter, setActiveFilter] = useState('All');
  const [listings, setListings] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pf = usePropertyFields();
  const supabase = useMemo(() => createClient(), []);

  const filters = ['All', ...( pf.residentialTypes.length > 0 ? pf.residentialTypes : ['Apartment', 'Villa', 'Townhouse', 'Penthouse'])];

  useEffect(() => {
    let cancelled = false;

    const loadProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location_area, price_aed, prop_category, availability, completion, bedrooms, bathrooms, area_sqft, image_urls, featured')
          .eq('published', true)
          .in('prop_category', RESIDENTIAL_CATEGORIES)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (error || !data) {
          setListings([]);
          return;
        }

        setListings(data.map((p) => {
          const imgs = Array.isArray(p.image_urls)
            ? p.image_urls
            : typeof p.image_urls === 'string' ? p.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
              : [];
          const rawCategory = p.prop_category || '';
          const displayTag = rawCategory || 'Residential';
          return {
            id: p.id,
            name: p.title || '',
            location: p.location_area || '',
            price: p.price_aed ? `AED ${Number(p.price_aed).toLocaleString()}` : '—',
            beds: p.bedrooms || 0,
            baths: p.bathrooms || 0,
            sqft: p.area_sqft ? Number(p.area_sqft).toLocaleString() : '—',
            tag: displayTag,
            status: p.availability || 'Available',
            completion: p.completion || 'Ready',
            image: imgs.length > 0 ? imgs[0] : '',
            alt: p.title || 'Property image',
            featured: p.featured || false,
          };
        }));
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    loadProperties();
    return () => { cancelled = true; };
  }, [supabase]);

  const filtered = listings.filter((l) => activeFilter === 'All' || l.tag === activeFilter);

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
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-on-scroll">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) =>
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              trackFilterSelection({ filterType: 'property_type', filterValue: f, page: 'residential' });
            }}
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
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortKey);
              trackSortSelection({ sortValue: e.target.value, page: 'residential' });
            }}
            className="bg-background border border-border text-foreground text-xs px-3 py-2 outline-none focus:border-primary transition-colors cursor-pointer">

            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* View Toggle */}
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
            {filtered.length} Properties
          </span>
        </div>
      </div>

      {!loaded && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {loaded && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-on-scroll">
          <div className="w-16 h-16 border border-border flex items-center justify-center mb-6">
            <Icon name="HomeIcon" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-bold text-xl mb-2">No Listings Available</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Residential properties will appear here once added through the admin panel.
          </p>
        </div>
      )}

      {/* Grid View */}
      {loaded && viewMode === 'grid' && filtered.length > 0 &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filtered.map((property, i) =>
        <Link key={property.id} href={`/properties/${property.id}`} className="animate-on-scroll property-card bg-card border border-border group cursor-pointer block" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="relative h-64 overflow-hidden">
                <AppImage
              src={property.image}
              alt={property.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">
                    {property.tag}
                  </span>
                </div>
                {property.featured &&
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
                  <span className="flex items-center gap-1.5"><Icon name="HomeIcon" size={12} className="text-primary" />{property.beds} Beds</span>
                  <span className="flex items-center gap-1.5"><Icon name="SparklesIcon" size={12} className="text-primary" />{property.baths} Baths</span>
                  <span className="flex items-center gap-1.5"><Icon name="ArrowsPointingOutIcon" size={12} className="text-primary" />{property.sqft} sqft</span>
                </div>
              </div>
            </Link>
        )}
        </div>
      }

      {/* List View */}
      {loaded && viewMode === 'list' && filtered.length > 0 &&
      <div className="space-y-3 stagger-children">
          {filtered.map((property, i) =>
        <Link key={property.id} href={`/properties/${property.id}`} className="animate-on-scroll flex flex-col md:flex-row bg-card border border-border group hover:border-primary/30 transition-all duration-300 cursor-pointer block" style={{ transitionDelay: `${i * 40}ms` }}>
              <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                <AppImage src={property.image} alt={property.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{property.tag}</span>
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
                  <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="HomeIcon" size={14} className="text-primary" />{property.beds} Bedrooms</span>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="SparklesIcon" size={14} className="text-primary" />{property.baths} Bathrooms</span>
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
