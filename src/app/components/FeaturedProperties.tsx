'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { FeaturedPropertiesContent, DEFAULT_FEATURED_PROPERTIES } from '@/contexts/CMSContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { createClient } from '@/lib/supabase/client';

interface Props {
  content?: FeaturedPropertiesContent;
}

interface PropertyItem {
  id: string;
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  tag: string;
  href: string;
  image: string;
  alt: string;
}

function PropertyCard({ property, priority = false, rowSpan = '' }: {
  property: PropertyItem;
  priority?: boolean;
  rowSpan?: string;
}) {
  const { convertPrice } = useCurrency();
  const isTall = rowSpan === 'md:row-span-2';
  return (
    <Link href={`/properties/${property.id}`} className={`property-card relative overflow-hidden block bg-card border border-border group cursor-pointer h-full ${isTall ? 'flex flex-col' : ''}`}>
      <div className={`relative overflow-hidden ${isTall ? 'flex-1 min-h-[300px]' : 'h-64 md:h-72'}`}>
        <AppImage src={property.image} alt={property.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">{property.tag}</span>
        </div>
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-5 border-t border-border">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-foreground font-bold text-lg leading-tight">{property.name}</h3>
            <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
              <Icon name="MapPinIcon" size={11} className="text-primary" />{property.location}
            </p>
          </div>
          <span className="text-primary font-bold text-sm md:text-base text-right">{convertPrice(property.price)}</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-border pt-3">
          {property.beds > 0 && <span className="flex items-center gap-1.5"><Icon name="HomeIcon" size={12} className="text-primary" />{property.beds} Beds</span>}
          {property.baths > 0 && <span className="flex items-center gap-1.5"><Icon name="SparklesIcon" size={12} className="text-primary" />{property.baths} Baths</span>}
          {property.sqft && <span className="flex items-center gap-1.5"><Icon name="ArrowsPointingOutIcon" size={12} className="text-primary" />{property.sqft} sqft</span>}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProperties({ content }: Props) {
  const supabase = createClient();
  const sectionRef = useRef<HTMLElement>(null);
  const c = content ?? DEFAULT_FEATURED_PROPERTIES;

  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, title, location_area, price_aed, bedrooms, bathrooms, area_sqft, image_urls, availability, featured, published')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) {
          setAllProperties(data.map((p: any) => {
            const imgs = p.image_urls ? p.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean) : [];
            return {
              id: p.id,
              name: p.title,
              location: p.location_area || '',
              price: p.price_aed ? `AED ${p.price_aed}` : 'Price on Request',
              beds: parseInt(p.bedrooms) || 0,
              baths: parseInt(p.bathrooms) || 0,
              sqft: p.area_sqft || '',
              tag: p.availability || 'For Sale',
              href: `/properties/${p.id}`,
              image: imgs[0] || '',
              alt: p.title,
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

  const props = allProperties;

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 md:mb-16 gap-6 md:gap-8">
        <div className="animate-on-scroll stagger-children">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">{c.eyebrow}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter leading-none">
            {c.headline}<br /><span key={c.headline_shimmer} className="text-gold-shimmer">{c.headline_shimmer}</span>
          </h2>
        </div>
        <div className="animate-on-scroll flex flex-col items-start md:items-end gap-4">
          <p className="text-muted-foreground text-sm max-w-xs text-left md:text-right leading-relaxed">{c.description}</p>
          <Link href={c.cta_link} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300 py-1">
            {c.cta_text}<Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>

      {loaded && props.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="HomeIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No featured properties available yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Add properties in the admin panel to display them here.</p>
        </div>
      ) : !loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto animate-on-scroll">
          {props[0] && <div className="md:col-span-2 md:row-span-1"><PropertyCard property={props[0]} priority /></div>}
          {props[1] && <div className="md:col-span-1 md:row-span-2" style={{ minHeight: 0 }}><PropertyCard property={props[1]} rowSpan="md:row-span-2" /></div>}
          {props[2] && <div className="md:col-span-1 md:row-span-1"><PropertyCard property={props[2]} /></div>}
          {props[3] && <div className="md:col-span-1 md:row-span-1"><PropertyCard property={props[3]} /></div>}
          {props[4] && <div className="md:col-span-2 md:row-span-1"><PropertyCard property={props[4]} /></div>}
          {props[5] && <div className="md:col-span-1 md:row-span-1"><PropertyCard property={props[5]} /></div>}
        </div>
      )}
    </section>
  );
}