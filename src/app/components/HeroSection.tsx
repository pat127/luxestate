'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCMSPage } from '@/contexts/CMSContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// All properties and projects data for search
const ALL_PROPERTIES = [
  { id: 1, title: 'Obsidian Penthouse', location: 'Downtown Dubai', community: 'Burj Khalifa District', type: 'Residential', category: 'property', price: 'AED 28,500,000', href: '/residential' },
  { id: 2, title: 'Meridian Villa', location: 'Palm Jumeirah', community: 'The Fronds', type: 'Residential', category: 'property', price: 'AED 42,000,000', href: '/residential' },
  { id: 3, title: 'Atlas Tower Office', location: 'DIFC', community: 'Gate Village', type: 'Commercial', category: 'property', price: 'AED 12,000,000', href: '/commercial' },
  { id: 4, title: 'The Crescent Retail', location: 'JBR', community: 'Bahar', type: 'Commercial', category: 'property', price: 'AED 8,500,000', href: '/commercial' },
  { id: 5, title: 'Vantage Estate', location: 'Emirates Hills', community: 'Sector E', type: 'Residential', category: 'property', price: 'AED 65,000,000', href: '/residential' },
];

const ALL_PROJECTS = [
  { id: 1, title: 'Skyline Residences', location: 'Downtown Dubai', community: 'Burj Khalifa District', developer: 'Emaar', type: 'Off-Plan', category: 'project', price: 'AED 1.2M+', href: '/projects' },
  { id: 2, title: 'Marina Bay Towers', location: 'Dubai Marina', community: 'Marina Promenade', developer: 'DAMAC', type: 'Off-Plan', category: 'project', price: 'AED 900K+', href: '/projects' },
  { id: 3, title: 'Palm Grove Villas', location: 'Palm Jumeirah', community: 'Garden Homes', developer: 'Nakheel', type: 'Completed', category: 'project', price: 'AED 8M+', href: '/projects' },
  { id: 4, title: 'Creek Horizon', location: 'Dubai Creek', community: 'Creek Horizon', developer: 'Meraas', type: 'Off-Plan', category: 'project', price: 'AED 1.8M+', href: '/projects' },
];

const ALL_LISTINGS = [...ALL_PROPERTIES, ...ALL_PROJECTS];

interface SearchResult {
  id: number;
  title: string;
  location: string;
  community: string;
  type: string;
  category: 'property' | 'project';
  price: string;
  href: string;
  developer?: string;
}

export default function HeroSection() {
  const page = useCMSPage('home');
  const router = useRouter();
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
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

  // Close results on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && !propertyTypeFilter && !priceFilter) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = ALL_LISTINGS.filter((item) => {
      const matchQuery = !q || (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.community.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        ('developer' in item && item.developer?.toLowerCase().includes(q))
      );

      const matchType = !propertyTypeFilter || (
        propertyTypeFilter === 'residential' ? item.type === 'Residential' :
        propertyTypeFilter === 'commercial' ? item.type === 'Commercial' :
        propertyTypeFilter === 'project' ? item.category === 'project' : true
      );

      return matchQuery && matchType;
    });

    setSearchResults(results as SearchResult[]);
    setShowResults(true);
  };

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = val.toLowerCase();
    const results = ALL_LISTINGS.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.community.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      ('developer' in item && item.developer?.toLowerCase().includes(q))
    );
    setSearchResults(results as SearchResult[]);
    setShowResults(results.length > 0);
  };

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
        <div ref={headlineRef} className="mb-8">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">
            <span className="h-px w-10 bg-primary" />
            Curated Luxury Properties
            <span className="h-px w-10 bg-primary" />
          </span>
          <h1 className="text-hero max-w-4xl">
            {(() => {
              const headline = page?.hero_headline || 'Where Architecture Becomes Legacy';
              const words = headline.split(' ');
              const lastWord = words.pop();
              const rest = words.join(' ');
              return (
                <>
                  {rest && <span className="text-foreground">{rest} </span>}
                  <span className="text-gold-shimmer">{lastWord}</span>
                </>
              );
            })()}
          </h1>
        </div>

        <p ref={subRef} className="text-foreground/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          {page?.hero_description || 'Exclusively curated residences, estates, and commercial assets for those who measure value in lifetimes, not years.'}
        </p>

        {/* Inline Search Bar */}
        <div ref={searchRef} className="bg-card/90 backdrop-blur-md border border-border p-4 md:p-5 max-w-3xl mb-16">
          <div ref={searchContainerRef} className="relative">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 border border-border bg-background px-4 py-3">
                <Icon name="MapPinIcon" size={16} className="text-primary flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, location, community, type..."
                  className="bg-transparent text-foreground placeholder-muted-foreground text-sm w-full outline-none" />
              </div>
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer">
                <option value="">Property Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="project">New Development</option>
              </select>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer">
                <option value="">Price Range</option>
                <option value="1m-5m">AED 1M – 5M</option>
                <option value="5m-15m">AED 5M – 15M</option>
                <option value="15m-50m">AED 15M – 50M</option>
                <option value="50m+">AED 50M+</option>
              </select>
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 flex-shrink-0 group">
                Search
                <Icon name="MagnifyingGlassIcon" size={14} className="transition-transform duration-300 group-hover:scale-110" />
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border shadow-2xl mt-1 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No properties or projects found matching your search.
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-border bg-secondary/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    {searchResults.map((result) => (
                      <Link
                        key={`${result.category}-${result.id}`}
                        href={result.href}
                        onClick={() => setShowResults(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 border-b border-border last:border-0 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${result.category === 'project' ? 'bg-blue-500/10' : 'bg-primary/10'}`}>
                            <Icon
                              name={result.category === 'project' ? 'BuildingOffice2Icon' : 'HomeIcon'}
                              size={14}
                              className={result.category === 'project' ? 'text-blue-400' : 'text-primary'}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{result.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Icon name="MapPinIcon" size={10} className="text-primary" />
                              {result.location}{result.community ? ` · ${result.community}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-sm font-bold text-primary">{result.price}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${result.category === 'project' ? 'bg-blue-500/10 text-blue-400' : 'bg-primary/10 text-primary'}`}>
                              {result.category === 'project' ? 'Project' : result.type}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        {(page?.cta_primary_text || page?.cta_secondary_text) && (
          <div className="flex flex-wrap gap-4 mb-12">
            {page?.cta_primary_text && (
              <Link href={page?.cta_primary_link || '#'} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors">
                {page?.cta_primary_text}
              </Link>
            )}
            {page?.cta_secondary_text && (
              <Link href={page?.cta_secondary_link || '#'} className="inline-flex items-center gap-2 border border-primary/40 text-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary transition-colors">
                {page?.cta_secondary_text}
              </Link>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div ref={statsRef} className="flex flex-wrap gap-x-12 gap-y-6">
          {[
            { value: '$4.2B', label: 'Total Transactions' },
            { value: '340+', label: 'Properties Sold' },
            { value: '18', label: 'Years of Excellence' },
            { value: '97%', label: 'Client Satisfaction' },
          ]?.map((stat) => (
            <div key={stat?.label} className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight">{stat?.value}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat?.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-10 z-10 flex flex-col items-center gap-3 scroll-indicator">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground rotate-90 origin-center mb-4">Scroll</span>
        <Icon name="ChevronDownIcon" size={18} className="text-primary" />
      </div>
    </section>
  );
}