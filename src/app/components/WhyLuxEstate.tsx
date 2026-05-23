'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { WhyLuxEstateContent, DEFAULT_WHY_LUXESTATE } from '@/contexts/CMSContext';

interface Props {
  content?: WhyLuxEstateContent;
}

const STEP_ICONS = ['MagnifyingGlassIcon', 'KeyIcon', 'StarIcon', 'CheckCircleIcon', 'HomeIcon', 'SparklesIcon'] as const;

export default function WhyLuxEstate({ content }: Props) {
  const c = content ?? DEFAULT_WHY_LUXESTATE;
  const steps = c.steps ?? DEFAULT_WHY_LUXESTATE.steps;
  const [activeStep, setActiveStep] = useState<string>(steps[0]?.id ?? '1');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = (entry.target as HTMLElement).getAttribute('data-step-id');
            if (stepId) setActiveStep(stepId);
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    const stepEls = sectionRef.current?.querySelectorAll('[data-step-id]');
    stepEls?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [steps]);

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
    <section ref={sectionRef} className="border-t border-border bg-background py-16 md:py-24">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 animate-on-scroll">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              {c.eyebrow}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
              {c.headline}{' '}
              <span className="text-gold-shimmer">{c.headline_shimmer}</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            {c.subtext}
          </p>
        </div>
      </div>

      {/* Vertical Stepper */}
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-0">
            {steps.map((step, i) => {
              const isActive = activeStep === step.id;
              const isLast = i === steps.length - 1;
              const iconName = STEP_ICONS[i % STEP_ICONS.length];

              return (
                <div
                  key={step.id}
                  data-step-id={step.id}
                  className={`relative flex gap-6 md:gap-10 ${!isLast ? 'pb-12 md:pb-16' : ''}`}
                >
                  {/* Node */}
                  <div className="relative flex-shrink-0 z-10">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 border-2 flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? 'bg-primary border-primary shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                          : 'bg-background border-border'
                      }`}
                    >
                      <Icon
                        name={iconName}
                        size={18}
                        className={`transition-colors duration-500 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                      />
                    </div>
                    {/* Step number badge */}
                    <div className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[9px] font-black transition-all duration-500 ${isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pt-1.5 pb-2 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    {/* Badge */}
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 mb-3 border transition-all duration-500 ${
                      isActive
                        ? 'bg-primary/10 border-primary/30 text-primary' :'bg-muted/30 border-border text-muted-foreground'
                    }`}>
                      {step.badge}
                    </span>

                    <h3 className={`text-xl md:text-2xl font-bold tracking-tighter mb-3 transition-colors duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h3>

                    <p className={`text-sm leading-relaxed transition-all duration-500 ${isActive ? 'text-muted-foreground max-h-96' : 'text-muted-foreground/60 max-h-96'}`}>
                      {step.description}
                    </p>

                    {/* CTA on last step */}
                    {isLast && (
                      <div className="mt-8">
                        <Link
                          href={c.cta_link}
                          className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all duration-300 group">
                          {c.cta_text}
                          <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}