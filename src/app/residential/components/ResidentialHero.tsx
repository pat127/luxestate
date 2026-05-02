'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ResidentialHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const children = contentRef.current.children;
    Array.from(children).forEach((child, i) => {
      const el = child as HTMLElement;
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
    <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://images.unsplash.com/photo-1585796607580-6a24cd13362c"
          alt="Luxury modern residence exterior, dark glass and steel, dramatic dusk lighting, deep shadows, atmospheric architectural photography"
          fill
          priority
          className="object-cover"
          sizes="100vw" />

        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-16 pt-40">
        <div ref={contentRef} className="flex flex-col gap-6">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" />
            Residential Collection
          </span>
          <h1 className="text-hero text-foreground max-w-3xl">
            Private Residences<br />
            <span className="text-gold-shimmer">Worth Living For</span>
          </h1>
          <p className="text-foreground/70 text-base md:text-lg max-w-lg leading-relaxed">
            Penthouses, estates, villas, and townhouses — each selected for architectural distinction and lifestyle excellence.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            {[
            { icon: 'HomeIcon', label: '120+ Active Listings' },
            { icon: 'MapPinIcon', label: '12 Prime Markets' },
            { icon: 'StarIcon', label: '70% Off-Market' }].
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