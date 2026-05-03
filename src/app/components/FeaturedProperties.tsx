'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { FeaturedPropertiesContent, DEFAULT_FEATURED_PROPERTIES } from '@/contexts/CMSContext';

interface Props {
  content?: FeaturedPropertiesContent;
}

function PropertyCard({ property, priority = false, rowSpan = '' }: {
  property: FeaturedPropertiesContent['properties'][0];
  priority?: boolean;
  rowSpan?: string;
}) {
  return (
    <Link href={property.href} className={`property-card relative overflow-hidden block bg-card border border-border group cursor-pointer ${rowSpan}`}>
      <div className={`relative overflow-hidden ${rowSpan === 'md:row-span-2' ? 'h-full min-h-[500px]' : 'h-64 md:h-72'}`}>
        <AppImage
          src={property.image}
          alt={property.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">
            {property.tag}
          </span>
        </div>
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-5 border-t border-border">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-foreground font-bold text-lg leading-tight">{property.name}</h3>
            <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
              <Icon name="MapPinIcon" size={11} className="text-primary" />
              {property.location}
            </p>
          </div>
          <span className="text-primary font-bold text-sm md:text-base text-right">{property.price}</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1.5">
            <Icon name="HomeIcon" size={12} className="text-primary" />
            {property.beds} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="SparklesIcon" size={12} className="text-primary" />
            {property.baths} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="ArrowsPointingOutIcon" size={12} className="text-primary" />
            {property.sqft} sqft
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProperties({ content }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const c = content ?? DEFAULT_FEATURED_PROPERTIES;
  const props = c.properties ?? DEFAULT_FEATURED_PROPERTIES.properties;

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

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="animate-on-scroll stagger-children">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            {c.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
            {c.headline}<br /><span className="text-gold-shimmer">{c.headline_shimmer}</span>
          </h2>
        </div>
        <div className="animate-on-scroll flex flex-col items-end gap-4">
          <p className="text-muted-foreground text-sm max-w-xs text-right leading-relaxed">
            {c.description}
          </p>
          <Link
            href={c.cta_link}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300">
            {c.cta_text}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-scroll">
        {props[0] && <div className="md:col-span-2"><PropertyCard property={props[0]} priority /></div>}
        {props[1] && <div className="md:row-span-2 flex flex-col"><PropertyCard property={props[1]} rowSpan="md:row-span-2" /></div>}
        {props[2] && <div className="md:col-span-1"><PropertyCard property={props[2]} /></div>}
        {props[3] && <div className="md:col-span-1"><PropertyCard property={props[3]} /></div>}
        {props[4] && <div className="md:col-span-2"><PropertyCard property={props[4]} /></div>}
        {props[5] && <div className="md:col-span-1"><PropertyCard property={props[5]} /></div>}
      </div>
    </section>
  );
}