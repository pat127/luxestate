'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function InternationalHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const children = Array.from(contentRef.current.children) as HTMLElement[];
    children.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 400 + i * 150);
    });
  }, []);

  return (
    <section className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://images.unsplash.com/photo-1683041133665-41f7ff45b982"
          alt="Dramatic aerial cityscape of a global metropolis at dusk, glittering skyline reflected in water, cinematic golden hour lighting"
          fill
          priority
          className="object-cover"
          sizes="100vw" />
        
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-16 pt-40">
        <div ref={contentRef} className="flex flex-col gap-6">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" />
            Global Portfolio
          </span>
          <h1 className="text-hero text-foreground max-w-3xl">
            World-Class Properties,{' '}
            <span className="text-gold-shimmer">Every Continent</span>
          </h1>
          <p className="text-foreground/70 text-base md:text-lg max-w-lg leading-relaxed">
            Curated international developments from the world's most sought-after cities — exclusively sourced for UAE-based investors seeking global diversification.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            {[
            { icon: 'GlobeAltIcon', label: '20+ Countries' },
            { icon: 'BuildingOffice2Icon', label: 'Prime City Locations' },
            { icon: 'LockClosedIcon', label: 'Exclusive Access' }].
            map((stat) =>
            <div key={stat.label} className="flex items-center gap-2 text-foreground/80 text-sm">
                <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={14} className="text-primary" />
                {stat.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}