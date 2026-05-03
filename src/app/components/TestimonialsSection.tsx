'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const testimonials = [
{
  name: 'Margaret Harrington',
  location: 'Greenwich, Connecticut',
  quote: 'LuxEstate found us a property that wasn\'t on any public listing. The discretion and access they provide is unlike anything we\'ve experienced in twenty years of property ownership.',
  role: 'Private Equity Principal',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b32bbd93-1763299584368.png",
  imageAlt: 'Professional woman in elegant dark blazer, studio portrait',
  rotate: '-rotate-6',
  position: 'left-0 top-1/2 -translate-y-1/2',
  size: 'w-40 h-56'
},
{
  name: 'Thomas Blackwell',
  location: 'Upper East Side, New York',
  quote: 'The caliber of off-market opportunities they surfaced was extraordinary.',
  role: 'Investment Banker',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1bfef8bd5-1763295388609.png",
  imageAlt: 'Professional man in tailored dark suit, confident expression, studio portrait',
  rotate: 'rotate-6',
  position: 'left-16 top-1/3',
  size: 'w-40 h-56'
},
{
  name: 'Priya Mehta',
  location: 'Beverly Hills, California',
  quote: 'From first consultation to keys in hand — LuxEstate handled every detail with precision I\'ve only ever seen in the most elite service firms.',
  role: 'Technology Entrepreneur',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_135fed5ac-1772395890088.png",
  imageAlt: 'Professional woman with elegant styling, warm smile, portrait',
  rotate: '',
  position: 'center',
  size: 'w-20 h-20',
  isCenter: true
},
{
  name: 'James Whitfield',
  location: 'Palm Beach, Florida',
  quote: 'Truly exceptional service.',
  role: 'Family Office Director',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1651cfc0b-1763295052209.png",
  imageAlt: 'Professional man in dark jacket, confident posture, studio portrait',
  rotate: '-rotate-3',
  position: 'right-16 top-1/3',
  size: 'w-40 h-56'
},
{
  name: 'Catherine Novak',
  location: 'Miami, Florida',
  quote: 'The network is unmatched.',
  role: 'Art Collector',
  image: "https://images.unsplash.com/photo-1636200063467-5408d3d08473",
  imageAlt: 'Stylish woman in dark outfit, professional portrait',
  rotate: 'rotate-8',
  position: 'right-0 top-1/2 -translate-y-1/2',
  size: 'w-40 h-56'
}];


const awards = [
{ title: 'Forbes Global Properties', category: 'Top 10 Luxury Brokerages', year: '2025' },
{ title: 'Wall Street Journal', category: 'Real Estate Excellence Award', year: '2024' },
{ title: 'Architectural Digest', category: 'Best in Design-Forward Sales', year: '2023' },
{ title: 'Robb Report', category: 'Luxury Real Estate Innovator', year: '2022' }];


export default function TestimonialsSection() {
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

  const centerTestimonial = testimonials.find((t) => t.isCenter)!;
  const sidePortraits = testimonials.filter((t) => !t.isCenter);

  return (
    <section ref={sectionRef} className="py-24 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-20 animate-on-scroll">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            Client Voices
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter">
            Trusted by Those<br />Who Demand the <span className="text-gold-shimmer">Best</span>
          </h2>
        </div>

        {/* Overlapping Portrait Layout */}
        <div className="relative h-[500px] md:h-[600px] max-w-4xl mx-auto flex items-center justify-center mb-20 animate-on-scroll">
          {/* Left Portrait 1 */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${sidePortraits[0].rotate} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
            <AppImage src={sidePortraits[0].image} alt={sidePortraits[0].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
          </div>

          {/* Left Portrait 2 */}
          <div className={`absolute left-16 top-1/3 ${sidePortraits[1].rotate} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
            <AppImage src={sidePortraits[1].image} alt={sidePortraits[1].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
          </div>

          {/* Center Quote Card */}
          <div className="relative z-10 w-full max-w-md bg-background border border-primary/30 p-10 md:p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] gold-glow-animate">
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto mb-6 overflow-hidden border-2 border-primary shadow-lg">
              <AppImage src={centerTestimonial.image} alt={centerTestimonial.imageAlt} width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-foreground font-bold text-lg mb-1">{centerTestimonial.name}</h4>
            <p className="text-xs text-primary uppercase tracking-[0.2em] mb-2">{centerTestimonial.role}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">{centerTestimonial.location}</p>
            <div className="text-4xl font-black text-primary/40 mb-4 leading-none">"</div>
            <p className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              {centerTestimonial.quote}
            </p>
            <div className="gold-line w-full" />
          </div>

          {/* Right Portrait 1 */}
          <div className={`absolute right-16 top-1/3 ${sidePortraits[2].rotate} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
            <AppImage src={sidePortraits[2].image} alt={sidePortraits[2].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
          </div>

          {/* Right Portrait 2 */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 ${sidePortraits[3].rotate} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
            <AppImage src={sidePortraits[3].image} alt={sidePortraits[3].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
          </div>
        </div>

        {/* Awards List */}
        <div className="border-t border-border animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 pt-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Recognition</span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter">Industry Validated<br /><span className="text-gold-shimmer">Excellence</span></h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs text-right leading-relaxed">
              Our commitment to discretion and results has been recognized by the world's foremost luxury publications.
            </p>
          </div>
          <div className="divide-y divide-border">
            {awards.map((award) =>
            <div key={award.title} className="py-6 flex justify-between items-center group cursor-pointer hover:pl-2 transition-all duration-300">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{award.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{award.category} / {award.year}</p>
                </div>
                <div className="w-8 h-8 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                  <Icon name="StarIcon" size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}

function Icon({ name, size, className }: {name: string;size: number;className?: string;}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {name === 'StarIcon' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
    </svg>);

}