'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const properties = [
{
  id: 1,
  name: 'Obsidian Penthouse',
  location: 'Manhattan, New York',
  price: '$28,500,000',
  beds: 5,
  baths: 6,
  sqft: '8,200',
  tag: 'Penthouse',
  href: '/residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_120819c8f-1772202612793.png",
  alt: 'Ultra-modern penthouse living room, floor-to-ceiling windows, Manhattan skyline at night, dark steel and marble interior, deep shadows, dramatic architectural lighting',
  featured: true,
  colSpan: 'md:col-span-2',
  rowSpan: ''
},
{
  id: 2,
  name: 'Meridian Villa',
  location: 'Beverly Hills, CA',
  price: '$42,000,000',
  beds: 7,
  baths: 9,
  sqft: '14,500',
  tag: 'Villa',
  href: '/residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1478fdae6-1767987066394.png",
  alt: 'Contemporary Beverly Hills villa exterior at dusk, dramatic cantilever architecture, infinity pool, dark sky, warm interior glow from floor-to-ceiling glass walls',
  featured: false,
  colSpan: 'md:col-span-1',
  rowSpan: 'md:row-span-2'
},
{
  id: 3,
  name: 'The Whitmore',
  location: 'Tribeca, New York',
  price: '$9,800,000',
  beds: 3,
  baths: 3,
  sqft: '3,600',
  tag: 'Townhouse',
  href: '/residential',
  image: "https://images.unsplash.com/photo-1674898298525-21e371887c3b",
  alt: 'Luxury Tribeca townhouse facade, dark brick and steel, moody overcast sky, refined architectural detail, dim street lighting',
  featured: false,
  colSpan: 'md:col-span-1',
  rowSpan: ''
},
{
  id: 4,
  name: 'Atlas Loft',
  location: 'Chicago, IL',
  price: '$6,200,000',
  beds: 2,
  baths: 2,
  sqft: '2,800',
  tag: 'Loft',
  href: '/residential',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e0e19bc4-1772132427610.png",
  alt: 'Industrial luxury loft interior, exposed concrete ceiling, dark wood floors, floor-to-ceiling windows with Chicago skyline, low-key dramatic lighting',
  featured: false,
  colSpan: 'md:col-span-1',
  rowSpan: ''
},
{
  id: 5,
  name: 'Vantage Estate',
  location: 'Malibu, CA',
  price: '$65,000,000',
  beds: 9,
  baths: 11,
  sqft: '22,000',
  tag: 'Estate',
  href: '/residential',
  image: "https://images.unsplash.com/photo-1690136543646-c8b654bcb512",
  alt: 'Sprawling Malibu oceanfront estate, dramatic cliffside setting, dark sky at sunset, geometric modernist architecture, deep shadows and golden light',
  featured: false,
  colSpan: 'md:col-span-2',
  rowSpan: ''
},
{
  id: 6,
  name: 'The Crescent',
  location: 'Miami Beach, FL',
  price: '$18,500,000',
  beds: 4,
  baths: 5,
  sqft: '6,400',
  tag: 'Residence',
  href: '/residential',
  image: "https://images.unsplash.com/photo-1706854188920-fff3284ded9c",
  alt: 'Miami Beach luxury residence, white geometric facade, palm silhouettes at dusk, dark moody sky, warm interior light from large windows',
  featured: false,
  colSpan: 'md:col-span-1',
  rowSpan: ''
}];


function PropertyCard({ property, priority = false }: {property: typeof properties[0];priority?: boolean;}) {
  return (
    <Link href={property.href} className={`property-card relative overflow-hidden block bg-card border border-border group cursor-pointer ${property.rowSpan}`}>
      <div className={`relative overflow-hidden ${property.rowSpan === 'md:row-span-2' ? 'h-full min-h-[500px]' : 'h-64 md:h-72'}`}>
        <AppImage
          src={property.image}
          alt={property.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">
            {property.tag}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
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
    </Link>);

}

export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLElement>(null);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="animate-on-scroll stagger-children">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            Curated Selection
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
            Featured<br />Properties
          </h2>
        </div>
        <div className="animate-on-scroll flex flex-col items-end gap-4">
          <p className="text-muted-foreground text-sm max-w-xs text-right leading-relaxed">
            Each property is personally vetted by our principals for architectural distinction and investment merit.
          </p>
          <Link
            href="/residential"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300">

            View All Properties
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      {/* 
         BENTO GRID MAP (3 cols):
         Row 1: [col-1+2: Obsidian Penthouse cs-2] [col-3: Meridian Villa cs-1 rs-2]
         Row 2: [col-1: The Whitmore cs-1]         [col-2: Atlas Loft cs-1]          [col-3: FILLED by Villa rs-2]
         Row 3: [col-1+2: Vantage Estate cs-2]     [col-3: The Crescent cs-1]
         Placed 6/6 ✓
        */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-on-scroll">
        {/* Row 1 col 1+2 */}
        <div className="md:col-span-2">
          <PropertyCard property={properties[0]} priority />
        </div>
        {/* Row 1 col 3 / Row 2 col 3 — row-span-2 */}
        <div className="md:row-span-2 flex flex-col">
          <PropertyCard property={properties[1]} />
        </div>
        {/* Row 2 col 1 */}
        <div className="md:col-span-1">
          <PropertyCard property={properties[2]} />
        </div>
        {/* Row 2 col 2 */}
        <div className="md:col-span-1">
          <PropertyCard property={properties[3]} />
        </div>
        {/* Row 3 col 1+2 */}
        <div className="md:col-span-2">
          <PropertyCard property={properties[4]} />
        </div>
        {/* Row 3 col 3 */}
        <div className="md:col-span-1">
          <PropertyCard property={properties[5]} />
        </div>
      </div>
    </section>);

}