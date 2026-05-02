'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const sectors = [
  { icon: 'BuildingOfficeIcon', label: 'Office', count: '18 Assets', desc: 'Class A towers in CBD locations' },
  { icon: 'ShoppingBagIcon', label: 'Retail', count: '12 Assets', desc: 'Flagship & high-street retail' },
  { icon: 'HomeModernIcon', label: 'Mixed-Use', count: '9 Assets', desc: 'Live-work-play developments' },
  { icon: 'BuildingStorefrontIcon', label: 'Hospitality', count: '6 Assets', desc: 'Boutique hotels & resorts' },
];

const stats = [
  { value: '$2.1B', label: 'Commercial Portfolio Value' },
  { value: '7.2%', label: 'Average Cap Rate' },
  { value: '94%', label: 'Occupancy Rate' },
  { value: '45+', label: 'Active Assets' },
];

export default function CommercialStats() {
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
    <section ref={sectionRef} className="border-y border-border bg-card py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 animate-on-scroll">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center border-r border-border last:border-r-0 px-4">
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter mb-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {sectors.map((sector, i) => (
            <div
              key={sector.label}
              className="animate-on-scroll border border-border bg-background p-6 group hover:border-primary/40 transition-all duration-500 cursor-pointer"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 border border-border flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                <Icon name={sector.icon as Parameters<typeof Icon>[0]['name']} size={18} className="text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-1">{sector.label}</h3>
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">{sector.count}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{sector.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}