'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCMSPage, DEFAULT_HERO_STATS } from '@/contexts/CMSContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UAE_LOCATIONS } from '@/lib/uaeLocations';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationSuggestion {
  label: string;
  type: 'area' | 'community';
  emirate: string;
}

function buildLocationSuggestions(): LocationSuggestion[] {
  const suggestions: LocationSuggestion[] = [];
  UAE_LOCATIONS.forEach((loc) => {
    suggestions.push({ label: loc.area, type: 'area', emirate: loc.emirate });
    loc.communities.forEach((c) => {
      suggestions.push({ label: c, type: 'community', emirate: loc.emirate });
    });
  });
  return suggestions;
}

const ALL_LOCATION_SUGGESTIONS = buildLocationSuggestions();

export default function HeroSection() {
  const page = useCMSPage('home');
  const router = useRouter();
  const { t } = useLanguage();
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headlineRef?.current, subRef?.current, searchRef?.current, statsRef?.current];
    els?.forEach((el, i) => {
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = val.toLowerCase();
    const results = ALL_LOCATION_SUGGESTIONS.filter(
      (s) => s.label.toLowerCase().includes(q)
    ).slice(0, 8);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.label);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    const q = searchQuery.trim();
    if (q) {
      router.push(`/residential?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/residential');
    }
  };

  const heroImage = page?.hero_image || 'https://img.rocket.new/generatedImages/rocket_gen_img_17ed54c15-1776778711567.png';
  const heroEyebrow = page?.hero_eyebrow || 'Curated Luxury Properties';
  const heroHeadline = page?.hero_headline || 'Where Architecture Becomes Legacy';
  const heroDescription = page?.hero_description || 'Exclusively curated residences, estates, and commercial assets for those who measure value in lifetimes, not years.';
  const ctaPrimaryText = page?.cta_primary_text || 'Explore Properties';
  const ctaPrimaryLink = page?.cta_primary_link || '/residential';
  const ctaSecondaryText = page?.cta_secondary_text || 'Book Consultation';
  const ctaSecondaryLink = page?.cta_secondary_link || '/#contact';
  const stats = page?.hero_stats ?? DEFAULT_HERO_STATS;

  const headlineWords = heroHeadline.split(' ');
  const lastWord = headlineWords.pop();
  const restHeadline = headlineWords.join(' ');

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src={heroImage}
          alt="Dramatic modern mansion at dusk, dark glass facade, infinity pool reflecting city lights"
          fill
          priority
          className="object-cover"
          sizes="100vw" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pb-0 pt-28 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          {/* Eyebrow + Headline */}
          <div ref={headlineRef} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 md:mb-6">
              <span className="h-px w-8 md:w-10 bg-primary" />
              {heroEyebrow}
              <span className="h-px w-8 md:w-10 bg-primary" />
            </span>
            <h1 className="text-hero max-w-4xl">
              {restHeadline && <span className="text-foreground">{restHeadline} </span>}
              <span key={lastWord} className="text-gold-shimmer">{lastWord}</span>
            </h1>
          </div>

          <p ref={subRef} className="text-foreground/70 text-base md:text-xl max-w-xl leading-relaxed mb-7 md:mb-10">
            {heroDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-7 md:mb-10">
            <Link
              href={ctaPrimaryLink}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group min-h-[52px]">
              {ctaPrimaryText}
              <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href={ctaSecondaryLink}
              className="flex items-center justify-center gap-2 border border-foreground/30 text-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-colors duration-300 min-h-[52px]">
              {ctaSecondaryText}
            </Link>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="bg-card/90 backdrop-blur-md border border-border p-3 md:p-5 max-w-3xl mb-12 md:mb-16">
            <div ref={searchContainerRef} className="relative">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <div className="flex-1 flex items-center gap-3 border border-border bg-background px-4 py-3">
                  <Icon name="MagnifyingGlassIcon" size={16} className="text-primary flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim() && suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSuggestions(false);
                    }}
                    placeholder={t('hero.search_placeholder')}
                    className="bg-transparent text-foreground placeholder-muted-foreground text-sm w-full outline-none"
                    suppressHydrationWarning />
                </div>
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 md:px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 flex-shrink-0 group min-h-[48px]">
                  {t('hero.search_button')}
                  <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 z-50 bg-card border border-border shadow-2xl mb-1 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-border bg-secondary/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Communities &amp; Areas
                    </span>
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 border-b border-border last:border-0 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-primary/10">
                        <Icon
                          name={s.type === 'area' ? 'MapIcon' : 'MapPinIcon'}
                          size={13}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.emirate} · {s.type === 'area' ? 'Area' : 'Community'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats — full width strip */}
        {stats.length > 0 && (
          <div ref={statsRef} className="w-full border-t border-border/40 bg-background/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-5 md:py-6 grid grid-cols-2 md:flex md:items-center md:justify-between gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="border-l border-primary/30 pl-4 first:border-l-0 first:pl-0 md:flex-1">
                  <p className="text-xl md:text-2xl font-black text-primary tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}