'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { WhyLuxEstateContent, DEFAULT_WHY_LUXESTATE } from '@/contexts/CMSContext';

interface Props {
  content?: WhyLuxEstateContent;
}

const BADGE_COLORS = [
  'text-primary border-primary/30 bg-primary/10',
  'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  'text-purple-400 border-purple-400/30 bg-purple-400/10',
];

const STEP_ICONS = ['MagnifyingGlassIcon', 'KeyIcon', 'StarIcon'] as const;

export default function WhyLuxEstate({ content }: Props) {
  const c = content ?? DEFAULT_WHY_LUXESTATE;
  const steps = c.steps ?? DEFAULT_WHY_LUXESTATE.steps;

  const workflowStepsRef = useRef<NodeListOf<Element> | null>(null);
  const stepTriggersRef = useRef<NodeListOf<Element> | null>(null);
  const workflowImagesRef = useRef<NodeListOf<Element> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    workflowStepsRef.current = containerRef.current.querySelectorAll('.workflow-step-content');
    stepTriggersRef.current = containerRef.current.querySelectorAll('.step-trigger');
    workflowImagesRef.current = containerRef.current.querySelectorAll('.workflow-img');

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = (entry.target as HTMLElement).getAttribute('data-step');
            stepTriggersRef.current?.forEach((trigger) => {
              const line = trigger.querySelector('.step-indicator') as HTMLElement;
              const text = trigger.querySelector('.step-text') as HTMLElement;
              const title = trigger.querySelector('h3') as HTMLElement;
              if (trigger.getAttribute('data-step') === index) {
                if (line) line.style.height = '100%';
                if (text) text.classList.add('active');
                if (title) { title.classList.add('text-primary'); title.classList.remove('text-muted-foreground'); }
              } else {
                if (line) line.style.height = '0%';
                if (text) text.classList.remove('active');
                if (title) { title.classList.remove('text-primary'); title.classList.add('text-muted-foreground'); }
              }
            });
            workflowImagesRef.current?.forEach((img) => {
              if (img.getAttribute('data-step') === index) {
                img.classList.add('active-img');
              } else {
                img.classList.remove('active-img');
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    workflowStepsRef.current?.forEach((step) => stepObserver.observe(step));
    return () => stepObserver.disconnect();
  }, [steps]);

  const headlineWords = c.headline.split(' ');
  const lastHeadlineWord = headlineWords.pop();
  const restHeadline = headlineWords.join(' ');

  return (
    <section className="border-t border-border bg-background py-0" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              {c.eyebrow}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
              {restHeadline && <>{restHeadline}<br /></>}
              <span key={lastHeadlineWord} className="text-gold-shimmer">{lastHeadlineWord || c.headline_shimmer}</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            {c.subtext}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row">
          {/* Sticky Left */}
          <div className="lg:w-1/2 lg:h-screen lg:sticky top-0 flex flex-col justify-center py-12 lg:py-0 lg:pr-16 border-r border-border/0 lg:border-border">
            <div className="text-2xl md:text-4xl font-bold tracking-tighter mb-10">
              <span className="text-gold-shimmer">{c.left_title}</span>
              <br />
              <span className="text-muted-foreground">{c.left_subtitle}</span>
            </div>

            <div className="hidden lg:block border-l border-border mb-10 pl-6 relative space-y-6">
              <div className="vertical-beam" />
              {steps.map((step) => (
                <div key={step.id} className="step-trigger flex items-center gap-4 cursor-pointer" data-step={step.id}>
                  <div
                    className="step-indicator absolute top-0 left-[-1px] w-[2px] bg-primary h-0 transition-all duration-500"
                    style={{ boxShadow: '0 0 12px rgba(201,168,76,0.8)' }} />
                  <div>
                    <h3 className="text-lg uppercase tracking-widest font-bold transition-colors duration-500 text-muted-foreground font-sans">
                      {step.number} / {step.title}
                    </h3>
                    <p className="step-text text-sm text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full aspect-video bg-card border border-border relative overflow-hidden hidden lg:block">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className="workflow-img absolute inset-0 flex items-center justify-center bg-card z-20"
                  data-step={step.id}>
                  <AppImage
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    className="object-cover opacity-50"
                    sizes="50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="relative z-10 text-center">
                    <Icon name={STEP_ICONS[i % STEP_ICONS.length]} size={48} className="text-foreground mb-4 mx-auto drop-shadow-lg" />
                    <span className={`text-xs font-bold uppercase tracking-widest border px-3 py-1 backdrop-blur-md ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>
                      {step.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scrolling Right */}
          <div className="lg:w-1/2">
            <div className="h-[10vh] hidden lg:block" />
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`workflow-step-content min-h-[40vh] lg:min-h-[60vh] flex flex-col justify-center px-0 lg:px-16 py-12 lg:py-16 relative ${i < steps.length - 1 ? 'border-b border-border' : ''}`}
                data-step={step.id}>
                <div className="absolute left-0 lg:left-6 top-12 bottom-0 w-8 hidden lg:block">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path d="M 1 0 V 45 C 1 80 30 80 40 80" className="noodle-line" vectorEffect="non-scaling-stroke" />
                    <path
                      d="M 1 0 V 45 C 1 80 30 80 40 80"
                      className="noodle-beam-path"
                      vectorEffect="non-scaling-stroke"
                      style={{ animationDelay: `${i}s` }} />
                  </svg>
                </div>

                <div className="relative lg:pl-10">
                  <span className="text-7xl text-foreground/5 font-black absolute -left-2 -top-8 select-none">
                    {step.number}
                  </span>

                  <div className="w-full aspect-video bg-card border border-border relative overflow-hidden mb-8 block lg:hidden">
                    <AppImage src={step.image} alt={step.imageAlt} fill className="object-cover opacity-60" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="relative z-10 flex items-end h-full p-4">
                      <span className={`text-xs font-bold uppercase tracking-widest border px-3 py-1 ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>
                        {step.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tighter relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 relative z-10 text-sm md:text-base">
                    {step.description}
                  </p>

                  {i === steps.length - 1 && (
                    <Link
                      href={c.cta_link}
                      className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all duration-300 group">
                      {c.cta_text}
                      <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}