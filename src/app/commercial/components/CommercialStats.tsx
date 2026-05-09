'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const PROPERTIES_STORAGE_KEY = 'admin_properties';

interface ComputedStats {
  portfolioValue: string;
  avgCapRate: string;
  avgOccupancy: string;
  totalAssets: number;
}

interface SectorCount {
  icon: string;
  label: string;
  count: string;
  desc: string;
}

const SECTOR_META: Record<string, { icon: string; desc: string }> = {
  Office: { icon: 'BuildingOfficeIcon', desc: 'Class A towers in CBD locations' },
  Retail: { icon: 'ShoppingBagIcon', desc: 'Flagship & high-street retail' },
  'Mixed-Use': { icon: 'HomeModernIcon', desc: 'Live-work-play developments' },
  Hospitality: { icon: 'BuildingStorefrontIcon', desc: 'Boutique hotels & resorts' },
  Commercial: { icon: 'BuildingOffice2Icon', desc: 'Commercial properties' },
  Warehouse: { icon: 'ArchiveBoxIcon', desc: 'Industrial & warehouse space' },
};

export default function CommercialStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stats, setStats] = useState<ComputedStats | null>(null);
  const [sectors, setSectors] = useState<SectorCount[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        const commercial = all.filter((p: any) =>
          p.published !== false &&
          ['Commercial', 'Office', 'Retail', 'Mixed-Use', 'Hospitality', 'Warehouse'].includes(p.category || p.type || '')
        );

        if (commercial.length > 0) {
          // Compute stats
          const sectorMap: Record<string, number> = {};
          commercial.forEach((p: any) => {
            const t = p.type || p.category || 'Commercial';
            sectorMap[t] = (sectorMap[t] || 0) + 1;
          });

          const sectorList: SectorCount[] = Object.entries(sectorMap).map(([label, count]) => ({
            icon: SECTOR_META[label]?.icon || 'BuildingOfficeIcon',
            label,
            count: `${count} Asset${count !== 1 ? 's' : ''}`,
            desc: SECTOR_META[label]?.desc || 'Commercial properties',
          }));

          setStats({
            portfolioValue: '—',
            avgCapRate: '—',
            avgOccupancy: '—',
            totalAssets: commercial.length,
          });
          setSectors(sectorList);
        }
      }
    } catch {
      // no data
    }
  }, []);

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

  if (!stats && sectors.length === 0) return null;

  return (
    <section ref={sectionRef} className="border-y border-border bg-card py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 animate-on-scroll">
            <div className="text-center border-r border-border last:border-r-0 px-4">
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter mb-2">{stats.totalAssets}+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Active Assets</p>
            </div>
          </div>
        )}

        {/* Sector Grid */}
        {sectors.length > 0 && (
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
        )}
      </div>
    </section>
  );
}