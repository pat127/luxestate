'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const milestones = [
  {
    phase: 'Phase 1',
    title: 'Pre-Launch Registration',
    description: 'Gain exclusive access to architectural plans, developer presentations, and pre-public pricing. Priority registrants secure first right of refusal on unit selection.',
    status: 'Open Now',
    icon: 'ClipboardDocumentListIcon',
  },
  {
    phase: 'Phase 2',
    title: 'Private Sales Launch',
    description: 'Invitation-only sales events for registered clients. Contracts executed at pre-market pricing with developer incentives. Typical 15-25% below anticipated completion value.',
    status: 'Q2 2026',
    icon: 'KeyIcon',
  },
  {
    phase: 'Phase 3',
    title: 'Construction & Progress Reports',
    description: 'Monthly construction updates, site visits, and milestone reporting. Our project management team monitors progress on your behalf and maintains developer accountability.',
    status: 'Ongoing',
    icon: 'BuildingOffice2Icon',
  },
  {
    phase: 'Phase 4',
    title: 'Completion & Handover',
    description: 'White-glove completion inspections, snagging management, and settlement coordination. We remain with you through to key handover and post-completion support.',
    status: 'Varies by Project',
    icon: 'HomeModernIcon',
  },
];

const TIMELINE_CONTENT = {
  eyebrow: 'Off-Plan Journey',
  headline: 'The Acquisition',
  headline_line2: 'Process',
  phases: milestones,
};

export default function ProjectTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const content = TIMELINE_CONTENT;

  const statusColors: Record<string, string> = {
    'Open Now': 'text-primary',
    'Ongoing': 'text-foreground/60',
    'Varies by Project': 'text-foreground/60',
  };

  function getStatusColor(status: string): string {
    return statusColors[status] ?? 'text-yellow-400';
  }

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
    <section ref={sectionRef} className="py-20 px-6 md:px-10 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start mb-16 gap-6 animate-on-scroll">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">{content.eyebrow}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
              {content.headline}<br />{content.headline_line2}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed text-left md:text-right">
            Our structured process protects your investment at every stage of the off-plan acquisition journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-on-scroll stagger-children">
          {content.phases.map((milestone, i) => (
            <div
              key={milestone.phase}
              className="animate-on-scroll relative border border-border bg-background p-6 group hover:border-primary/40 transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {i < content.phases.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-[1px] w-4 h-px bg-border z-10" />
              )}

              <div className="w-12 h-12 border border-border flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                <Icon name={milestone.icon as Parameters<typeof Icon>[0]['name']} size={20} className="text-primary" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground block mb-2">{milestone.phase}</span>

              <h3 className="text-foreground font-bold text-lg mb-3 leading-snug">{milestone.title}</h3>

              <span className={`text-xs font-bold uppercase tracking-widest ${getStatusColor(milestone.status)} block mb-4`}>
                {milestone.status}
              </span>

              <p className="text-muted-foreground text-xs leading-relaxed">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
