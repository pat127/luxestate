'use client';

import React, { useEffect, useRef } from 'react';

import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headlineRef.current, subRef.current, searchRef.current, statsRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.filter = 'blur(8px)';
      setTimeout(() => {
        if (!el) return;
        el.style.transition = 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0px)';
      }, 300 + i * 180);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_17ed54c15-1776778711567.png"
          alt="Dramatic modern mansion at dusk, dark glass facade, infinity pool reflecting city lights, deep shadows, atmospheric low-key architectural lighting"
          fill
          priority
          className="object-cover"
          sizes="100vw" />

        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-20 pt-40">
        {/* Eyebrow */}
        <div ref={headlineRef as React.RefObject<HTMLDivElement>} className="mb-8">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">
            <span className="h-px w-10 bg-primary" />
            Curated Luxury Properties
            <span className="h-px w-10 bg-primary" />
          </span>

          <h1 className="text-hero text-foreground max-w-4xl">
            Where Architecture<br />
            <span className="flex items-center gap-6">
              <span className="h-px w-20 md:w-32 bg-foreground/30 flex-shrink-0" />
              Becomes
            </span>
            <span className="text-gold-shimmer">Legacy</span>
          </h1>
        </div>

        <p ref={subRef} className="text-foreground/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          Exclusively curated residences, estates, and commercial assets for those who measure value in lifetimes, not years.
        </p>

        {/* Inline Search Bar */}
        <div ref={searchRef} className="bg-card/90 backdrop-blur-md border border-border p-4 md:p-5 max-w-3xl mb-16">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 border border-border bg-background px-4 py-3">
              <Icon name="MapPinIcon" size={16} className="text-primary flex-shrink-0" />
              <input
                type="text"
                placeholder="Location, neighborhood, ZIP..."
                className="bg-transparent text-foreground placeholder-muted-foreground text-sm w-full outline-none" />

            </div>
            <select className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer">
              <option value="">Property Type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="project">New Development</option>
            </select>
            <select className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer">
              <option value="">Price Range</option>
              <option value="1m-5m">$1M – $5M</option>
              <option value="5m-15m">$5M – $15M</option>
              <option value="15m-50m">$15M – $50M</option>
              <option value="50m+">$50M+</option>
            </select>
            <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 flex-shrink-0 group">
              Search
              <Icon name="MagnifyingGlassIcon" size={14} className="transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div ref={statsRef} className="flex flex-wrap gap-x-12 gap-y-6">
          {[
          { value: '$4.2B', label: 'Total Transactions' },
          { value: '340+', label: 'Properties Sold' },
          { value: '18', label: 'Years of Excellence' },
          { value: '97%', label: 'Client Satisfaction' }].
          map((stat) =>
          <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight">{stat.value}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-10 z-10 flex flex-col items-center gap-3 scroll-indicator">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground rotate-90 origin-center mb-4">Scroll</span>
        <Icon name="ChevronDownIcon" size={18} className="text-primary" />
      </div>
    </section>);

}