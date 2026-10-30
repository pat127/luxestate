'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import { TestimonialsContent, DEFAULT_TESTIMONIALS } from '@/contexts/CMSContext';

interface Props {
  content?: TestimonialsContent;
}

function StarIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const ROTATIONS = ['-rotate-6', 'rotate-6', '', '-rotate-3', 'rotate-8'];

export default function TestimonialsSection({ content }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const c = content ?? DEFAULT_TESTIMONIALS;
  const testimonials = c.testimonials ?? DEFAULT_TESTIMONIALS.testimonials;
  const awards = c.awards ?? DEFAULT_TESTIMONIALS.awards;

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

  const centerTestimonial = testimonials.find((t) => t.isCenter) ?? testimonials[Math.floor(testimonials.length / 2)];
  const sidePortraits = testimonials.filter((t) => !t.isCenter);

  const headlineWords = c.headline.split(' ');
  const lastWord = headlineWords.pop();
  const restHeadline = headlineWords.join(' ');

  return (
    <section ref={sectionRef} className="py-24 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-left md:text-center mb-20 animate-on-scroll">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            {c.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter">
            {restHeadline} <span key={lastWord} className="text-gold-shimmer">{lastWord || c.headline_shimmer}</span>
          </h2>
        </div>

        {/* Overlapping Portrait Layout */}
        <div className="relative h-[500px] md:h-[600px] max-w-4xl mx-auto flex items-center justify-center mb-20 animate-on-scroll">
          {sidePortraits[0] && (
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${ROTATIONS[0]} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
              <AppImage src={sidePortraits[0].image} alt={sidePortraits[0].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
            </div>
          )}
          {sidePortraits[1] && (
            <div className={`absolute left-16 top-1/3 ${ROTATIONS[1]} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
              <AppImage src={sidePortraits[1].image} alt={sidePortraits[1].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
            </div>
          )}

          {centerTestimonial && (
            <div className="relative z-10 w-full max-w-md bg-background border border-primary/30 p-10 md:p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] gold-glow-animate">
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
          )}

          {sidePortraits[2] && (
            <div className={`absolute right-16 top-1/3 ${ROTATIONS[3]} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
              <AppImage src={sidePortraits[2].image} alt={sidePortraits[2].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
            </div>
          )}
          {sidePortraits[3] && (
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 ${ROTATIONS[4]} w-36 h-52 md:w-44 md:h-64 overflow-hidden border border-border shadow-2xl hidden md:block`}>
              <AppImage src={sidePortraits[3].image} alt={sidePortraits[3].imageAlt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="200px" />
            </div>
          )}
        </div>

        {/* Awards */}
        <div className="border-t border-border animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 pt-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">{c.awards_eyebrow}</span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter">
                {c.awards_headline}<br /><span key={c.awards_headline_shimmer} className="text-gold-shimmer">{c.awards_headline_shimmer}</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs text-left leading-relaxed">
              {c.awards_subtext}
            </p>
          </div>
          <div className="divide-y divide-border">
            {awards.map((award) => (
              <div key={award.title} className="py-6 flex justify-between items-center group cursor-pointer hover:pl-2 transition-all duration-300">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{award.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{award.category} / {award.year}</p>
                </div>
                <div className="w-8 h-8 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                  <StarIcon size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
