'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const listings = [
{
  id: 1, name: 'Obsidian Penthouse', location: 'Manhattan, New York', price: '$28,500,000',
  beds: 5, baths: 6, sqft: '8,200', tag: 'Penthouse', status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ef6e30c9-1772202631090.png",
  alt: 'Ultra-modern Manhattan penthouse, floor-to-ceiling windows, city skyline at night, dark steel and marble',
  featured: true
},
{
  id: 2, name: 'Meridian Villa', location: 'Beverly Hills, CA', price: '$42,000,000',
  beds: 7, baths: 9, sqft: '14,500', tag: 'Villa', status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_177c45a3d-1772197748060.png",
  alt: 'Contemporary Beverly Hills villa, dramatic cantilever architecture, infinity pool at dusk',
  featured: false
},
{
  id: 3, name: 'The Whitmore', location: 'Tribeca, New York', price: '$9,800,000',
  beds: 3, baths: 3, sqft: '3,600', tag: 'Townhouse', status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13ea07da3-1776709679264.png",
  alt: 'Luxury Tribeca townhouse, dark brick and steel, refined architectural detail, moody lighting',
  featured: false
},
{
  id: 4, name: 'Atlas Loft', location: 'Chicago, IL', price: '$6,200,000',
  beds: 2, baths: 2, sqft: '2,800', tag: 'Loft', status: 'Under Offer',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19aea9057-1772230754589.png",
  alt: 'Industrial luxury loft, exposed concrete, dark wood floors, Chicago skyline through large windows',
  featured: false
},
{
  id: 5, name: 'Vantage Estate', location: 'Malibu, CA', price: '$65,000,000',
  beds: 9, baths: 11, sqft: '22,000', tag: 'Estate', status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cca8b9b9-1772907665016.png",
  alt: 'Sprawling Malibu oceanfront estate, cliffside setting, modernist architecture, dramatic shadows',
  featured: true
},
{
  id: 6, name: 'The Crescent', location: 'Miami Beach, FL', price: '$18,500,000',
  beds: 4, baths: 5, sqft: '6,400', tag: 'Residence', status: 'Available',
  image: "https://images.unsplash.com/photo-1670233507518-389adeaf791a",
  alt: 'Miami Beach luxury residence, geometric facade, palm silhouettes at dusk, moody sky',
  featured: false
},
{
  id: 7, name: 'Solstice Manor', location: 'Greenwich, CT', price: '$22,000,000',
  beds: 8, baths: 10, sqft: '18,000', tag: 'Estate', status: 'Available',
  image: "https://images.unsplash.com/photo-1618308722560-8b3897bbd67e",
  alt: 'Grand Connecticut manor estate, sweeping grounds, classical architecture with modern updates, moody overcast sky',
  featured: false
},
{
  id: 8, name: 'Noir Tower Residence', location: 'Downtown Chicago, IL', price: '$11,200,000',
  beds: 4, baths: 4, sqft: '5,100', tag: 'Penthouse', status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_120819c8f-1772202612793.png",
  alt: 'Dark luxury penthouse interior, floor-to-ceiling windows, Chicago city lights at night, dramatic atmospheric lighting',
  featured: false
}];


type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function ResidentialListings() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [activeFilter, setActiveFilter] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);

  const filters = ['All', 'Penthouse', 'Villa', 'Estate', 'Townhouse', 'Loft', 'Residence'];

  const filtered = listings.filter((l) => activeFilter === 'All' || l.tag === activeFilter);

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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-on-scroll">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) =>
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
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
            onChange={(e) => setSortBy(e.target.value as SortKey)}
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

      {/* Grid View */}
      {viewMode === 'grid' &&
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
                  {property.status !== 'Available' &&
              <span className="bg-foreground/20 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-foreground/20">
                      {property.status}
                    </span>
              }
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
      {viewMode === 'list' &&
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
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${property.status === 'Available' ? 'text-primary' : 'text-muted-foreground'}`}>{property.status}</span>
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

      {/* Load More */}
      <div className="flex justify-center mt-12 animate-on-scroll">
        <button className="flex items-center gap-3 border border-border text-muted-foreground px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all duration-300 group">
          Load More Properties
          <Icon name="ChevronDownIcon" size={14} className="transition-transform duration-300 group-hover:translate-y-1" />
        </button>
      </div>
    </section>);

}