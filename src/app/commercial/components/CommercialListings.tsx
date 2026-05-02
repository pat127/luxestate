'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const commercialListings = [
{
  id: 1,
  name: 'The Meridian Tower',
  location: 'Midtown Manhattan, NY',
  price: '$185,000,000',
  type: 'Office',
  sqft: '320,000',
  capRate: '6.8%',
  occupancy: '97%',
  status: 'Available',
  image: "https://images.unsplash.com/photo-1647018122189-3a39fede3b82",
  alt: 'Dramatic glass office tower in Manhattan, dark steel facade, city skyline at dusk, financial district atmosphere',
  featured: true
},
{
  id: 2,
  name: 'Obsidian Plaza',
  location: 'Chicago Loop, IL',
  price: '$92,000,000',
  type: 'Mixed-Use',
  sqft: '180,000',
  capRate: '7.4%',
  occupancy: '94%',
  status: 'Available',
  image: "https://images.unsplash.com/photo-1572108671593-e8f73b218b64",
  alt: 'Modern mixed-use development interior, dark architectural finishes, dramatic lighting, urban luxury atmosphere',
  featured: false
},
{
  id: 3,
  name: 'Vantage Commerce Center',
  location: 'Beverly Hills, CA',
  price: '$68,000,000',
  type: 'Retail',
  sqft: '95,000',
  capRate: '5.9%',
  occupancy: '100%',
  status: 'Under Offer',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e50c1021-1772213701753.png",
  alt: 'Luxury retail flagship space, dark marble and glass interior, dramatic architectural lighting, high-end boutique atmosphere',
  featured: false
},
{
  id: 4,
  name: 'The Blackstone Hotel',
  location: 'South Beach, Miami FL',
  price: '$145,000,000',
  type: 'Hospitality',
  sqft: '210,000',
  capRate: '8.1%',
  occupancy: '88%',
  status: 'Available',
  image: "https://images.unsplash.com/photo-1713825773839-060039446a57",
  alt: 'Dramatic luxury hotel exterior at night, dark sky, illuminated facade, South Beach architectural photography',
  featured: true
},
{
  id: 5,
  name: 'Sovereign Office Park',
  location: 'Silicon Valley, CA',
  price: '$220,000,000',
  type: 'Office',
  sqft: '450,000',
  capRate: '6.2%',
  occupancy: '95%',
  status: 'Available',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d80d0038-1773206094376.png",
  alt: 'Modern tech campus office buildings, dark glass facades, dramatic dusk lighting, Silicon Valley architecture',
  featured: false
},
{
  id: 6,
  name: 'Zenith Mixed-Use Tower',
  location: 'Downtown Dallas, TX',
  price: '$78,000,000',
  type: 'Mixed-Use',
  sqft: '155,000',
  capRate: '7.8%',
  occupancy: '91%',
  status: 'Available',
  image: "https://images.unsplash.com/photo-1678986423236-2c57c44f4d99",
  alt: 'Modern mixed-use tower in Dallas, dark glass and steel, dramatic city skyline backdrop, architectural photography',
  featured: false
}];


export default function CommercialListings() {
  const [activeType, setActiveType] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);
  const types = ['All', 'Office', 'Retail', 'Mixed-Use', 'Hospitality'];

  const filtered = commercialListings.filter((l) => activeType === 'All' || l.type === activeType);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-on-scroll">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Investment Grade</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
            Commercial<br />Portfolio
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) =>
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
            activeType === t ?
            'bg-primary text-primary-foreground border-primary' :
            'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`
            }>

              {t}
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filtered.map((listing, i) =>
        <div
          key={listing.id}
          className="animate-on-scroll property-card bg-card border border-border group cursor-pointer"
          style={{ transitionDelay: `${i * 70}ms` }}>

            <div className="relative h-56 overflow-hidden">
              <AppImage
              src={listing.image}
              alt={listing.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  {listing.type}
                </span>
                {listing.featured &&
              <span className="bg-background/80 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-primary/30">
                    Featured
                  </span>
              }
              </div>
              {listing.status !== 'Available' &&
            <div className="absolute top-4 right-4">
                  <span className="bg-foreground/20 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-foreground/20">
                    {listing.status}
                  </span>
                </div>
            }
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-foreground font-bold text-lg leading-tight">{listing.name}</h3>
                  <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1 flex items-center gap-1">
                    <Icon name="MapPinIcon" size={11} className="text-primary" />
                    {listing.location}
                  </p>
                </div>
                <span className="text-primary font-bold text-sm text-right">{listing.price}</span>
              </div>

              {/* Investment Metrics */}
              <div className="grid grid-cols-3 gap-3 border border-border p-3 mb-4 bg-background">
                <div className="text-center">
                  <p className="text-primary font-bold text-sm">{listing.capRate}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Cap Rate</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-primary font-bold text-sm">{listing.occupancy}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Occupied</p>
                </div>
                <div className="text-center">
                  <p className="text-primary font-bold text-sm">{listing.sqft}</p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Sq Ft</p>
                </div>
              </div>

              <Link
              href="#contact"
              className="flex items-center justify-between w-full border-t border-border pt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">

                Request Investment Memo
                <Icon name="ArrowRightIcon" size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry CTA */}
      <div className="mt-16 border border-border bg-card p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8 animate-on-scroll">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tighter mb-3">
            Looking for Off-Market<br />Commercial Opportunities?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Over 60% of our commercial transactions occur before properties reach any public listing. Speak with our investment team directly.
          </p>
        </div>
        <Link
          href="#contact"
          className="flex items-center gap-3 bg-primary text-primary-foreground px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group flex-shrink-0">

          Talk to Investment Team
          <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>);

}