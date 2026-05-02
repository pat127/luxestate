'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const insights = [
  {
    category: 'Market Analysis',
    title: 'Manhattan Office Market: Q1 2026 Recovery Signals Renewed Trophy Asset Demand',
    excerpt: 'Class A vacancy rates in Midtown tightened to 11.2% as financial services firms expand footprints. Institutional buyers are repositioning into core assets ahead of anticipated rate cuts.',
    date: 'April 15, 2026',
    readTime: '8 min read',
    tag: 'Office',
  },
  {
    category: 'Investment Insight',
    title: 'Cap Rate Compression in South Florida Hospitality: What Buyers Need to Know Now',
    excerpt: 'Record RevPAR performance in Miami Beach and Palm Beach has driven hospitality cap rates below 6% for premium assets — a 180bps compression from 2024 levels.',
    date: 'April 8, 2026',
    readTime: '6 min read',
    tag: 'Hospitality',
  },
  {
    category: 'Deal Analysis',
    title: 'Mixed-Use Development in Tech Corridors: The Case for Live-Work-Play Assets in 2026',
    excerpt: 'Silicon Valley and Austin mixed-use projects are commanding 15-20% premiums over single-use comparables as remote work normalization drives demand for integrated environments.',
    date: 'March 28, 2026',
    readTime: '10 min read',
    tag: 'Mixed-Use',
  },
];

export default function MarketInsights() {
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
    <section ref={sectionRef} className="py-20 px-6 md:px-10 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6 animate-on-scroll">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Intelligence</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
              Market<br />Insights
            </h2>
          </div>
          <Link
            href="#"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300 flex-shrink-0"
          >
            All Reports
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>

        <div className="divide-y divide-border animate-on-scroll">
          {insights.map((insight, i) => (
            <div
              key={insight.title}
              className="py-8 flex flex-col md:flex-row justify-between gap-6 group cursor-pointer hover:pl-2 transition-all duration-300"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-primary/20">
                    {insight.tag}
                  </span>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-widest">{insight.category}</span>
                </div>
                <h3 className="text-foreground font-bold text-lg md:text-xl mb-3 leading-snug group-hover:text-primary transition-colors duration-300 max-w-2xl">
                  {insight.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{insight.excerpt}</p>
              </div>
              <div className="flex flex-col justify-between items-end flex-shrink-0 min-w-[140px]">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs mb-1">{insight.date}</p>
                  <p className="text-muted-foreground text-xs">{insight.readTime}</p>
                </div>
                <div className="w-8 h-8 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300 mt-4">
                  <Icon name="ArrowRightIcon" size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}