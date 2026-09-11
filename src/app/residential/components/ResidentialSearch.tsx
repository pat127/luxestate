'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { usePropertyFields } from '@/hooks/usePropertyFields';

export default function ResidentialSearch() {
  const pf = usePropertyFields();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [beds, setBeds] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-card border-y border-border py-8 px-6 md:px-10 sticky top-[72px] z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Location */}
          <div className="flex-1 flex items-center gap-3 border border-border bg-background px-4 py-3 focus-within:border-primary transition-colors">
            <Icon name="MapPinIcon" size={16} className="text-primary flex-shrink-0" />
            <input
              type="text"
              placeholder="Location, neighborhood, ZIP..."
              value={location}
              onChange={(e) => setLocation(e?.target?.value)}
              className="bg-transparent text-foreground placeholder-muted-foreground text-sm w-full outline-none"
            />
          </div>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e?.target?.value)}
            className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer min-w-[160px]"
          >
            <option value="">Property Type</option>
            {pf?.types?.map(t => <option key={t} value={t?.toLowerCase()}>{t}</option>)}
          </select>

          {/* Beds */}
          <select
            value={beds}
            onChange={(e) => setBeds(e?.target?.value)}
            className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="">Bedrooms</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
            <option value="7">7+</option>
          </select>

          {/* Price Min */}
          <select
            value={priceMin}
            onChange={(e) => setPriceMin(e?.target?.value)}
            className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="">Min Price</option>
            <option value="1000000">$1M</option>
            <option value="5000000">$5M</option>
            <option value="10000000">$10M</option>
            <option value="25000000">$25M</option>
          </select>

          {/* Price Max */}
          <select
            value={priceMax}
            onChange={(e) => setPriceMax(e?.target?.value)}
            className="bg-background border border-border text-foreground text-sm px-4 py-3 outline-none focus:border-primary transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="">Max Price</option>
            <option value="5000000">$5M</option>
            <option value="15000000">$15M</option>
            <option value="50000000">$50M</option>
            <option value="100000000">$100M+</option>
          </select>

          {/* Advanced Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 border border-border text-muted-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-300 flex-shrink-0"
          >
            <Icon name="AdjustmentsHorizontalIcon" size={14} />
            Filters
          </button>

          {/* Search */}
          <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 flex-shrink-0 group">
            Search
            <Icon name="MagnifyingGlassIcon" size={14} className="transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Advanced Filters */}
        {expanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            {[
              { label: 'Min Sqft', options: ['1,000', '2,500', '5,000', '10,000', '20,000'] },
              { label: 'Bathrooms', options: ['2+', '3+', '4+', '5+', '6+'] },
              { label: 'Garage', options: ['1+', '2+', '3+', '4+'] },
              { label: 'Year Built', options: ['2020+', '2015+', '2010+', '2000+'] },
            ]?.map((filter) => (
              <div key={filter?.label}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{filter?.label}</label>
                <select className="w-full bg-background border border-border text-foreground text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer">
                  <option value="">Any</option>
                  {filter?.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}