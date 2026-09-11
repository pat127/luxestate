'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCMSPage, DEFAULT_PAGES } from '@/contexts/CMSContext';
import { isSiteAssetsUrl } from '@/lib/cmsImages';
import Link from 'next/link';

const DEFAULT_COMMERCIAL_HERO =
  DEFAULT_PAGES.find((p) => p.key === 'commercial')?.hero_image ||
  'https://images.unsplash.com/photo-1715568162669-1772f6e7a81d?auto=format&fit=crop&w=1920&q=80';

export default function CommercialHero() {
  const page = useCMSPage('commercial');
  const heroSrc = page.hero_image?.trim() || DEFAULT_COMMERCIAL_HERO;
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
    <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AppImage
          src={heroSrc}
          alt={page.hero_headline || 'Commercial hero'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          fallbackSrc={DEFAULT_COMMERCIAL_HERO}
          unoptimized={isSiteAssetsUrl(heroSrc)}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-16 pt-40">
        <div ref={contentRef} className="flex flex-col gap-6">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" />
            {page.hero_subheadline}
          </span>
          <h1 className="text-hero text-foreground max-w-3xl">
            {(() => {
              const headline = page.hero_headline || '';
              const words = headline.split(' ');
              const lastWord = words.pop();
              const rest = words.join(' ');
              return (
                <>
                  {rest && <span>{rest} </span>}
                  <span className="text-gold-shimmer">{lastWord}</span>
                </>
              );
            })()}
          </h1>
          <p className="text-foreground/70 text-base md:text-lg max-w-lg leading-relaxed">
            {page.hero_description}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {page.cta_primary_text && (
              page.cta_primary_download_url ? (
                <a
                  href={page.cta_primary_download_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors"
                >
                  <Icon name="ArrowDownTrayIcon" size={14} />
                  {page.cta_primary_text}
                </a>
              ) : (
                <Link href={page.cta_primary_link || '#'} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors">
                  {page.cta_primary_text}
                </Link>
              )
            )}
            {page.cta_secondary_text && (
              page.cta_secondary_download_url ? (
                <a
                  href={page.cta_secondary_download_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-primary/40 text-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary transition-colors"
                >
                  <Icon name="ArrowDownTrayIcon" size={14} />
                  {page.cta_secondary_text}
                </a>
              ) : (
                <Link href={page.cta_secondary_link || '#'} className="inline-flex items-center gap-2 border border-primary/40 text-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary transition-colors">
                  {page.cta_secondary_text}
                </Link>
              )
            )}
          </div>
          {page.sections?.commercial_stats !== false && (
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { icon: 'BuildingOfficeIcon', label: '45+ Commercial Assets' },
              { icon: 'CurrencyDollarIcon', label: 'Avg. 7.2% Cap Rate' },
              { icon: 'GlobeAltIcon', label: '8 Major Markets' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-foreground/80 text-sm">
                <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={14} className="text-primary" />
                {stat.label}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}