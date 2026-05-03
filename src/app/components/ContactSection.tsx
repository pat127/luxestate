'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ContactContent, DEFAULT_CONTACT } from '@/contexts/CMSContext';

interface Props {
  content?: ContactContent;
}

export default function ContactSection({ content }: Props) {
  const c = content ?? DEFAULT_CONTACT;
  const details = c.details ?? DEFAULT_CONTACT.details;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    propertyType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const headlineWords = c.headline.split(' ');
  const lastWord = headlineWords.pop();
  const restHeadline = headlineWords.join(' ');

  return (
    <section id="contact" ref={sectionRef} className="py-24 px-6 md:px-10 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="animate-on-scroll">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              {c.eyebrow}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none mb-8">
              {restHeadline && <>{restHeadline}<br /></>}
              <span className="text-gold-shimmer">{lastWord || c.headline_shimmer}</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-12 max-w-md">
              {c.description}
            </p>

            <div className="space-y-6">
              {details.map((item) => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-foreground font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 8px rgba(201,168,76,0.6)' }} />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{c.availability_text}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {c.availability_subtext}
              </p>
            </div>
          </div>

          <div className="animate-on-scroll">
            {submitted ? (
              <div className="bg-background border border-primary/30 p-12 text-center gold-glow-animate">
                <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckIcon" size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Inquiry Received</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thank you for reaching out. A LuxEstate principal will contact you personally within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Full Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="Alexandra Whitmore" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Email Address *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="alex@family.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="+1 (212) 000-0000" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Budget Range</label>
                    <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors cursor-pointer">
                      <option value="">Select Range</option>
                      <option value="1m-5m">$1M – $5M</option>
                      <option value="5m-15m">$5M – $15M</option>
                      <option value="15m-50m">$15M – $50M</option>
                      <option value="50m+">$50M+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Property Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Residential', 'Commercial', 'New Development'].map((type) => (
                      <button key={type} type="button" onClick={() => setForm({ ...form, propertyType: type })} className={`py-2.5 text-xs font-bold border transition-all duration-300 ${form.propertyType === type ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Your Vision</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none" placeholder="Tell us about your ideal property — location, architecture, lifestyle requirements..." />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group">
                  Submit Private Inquiry
                  <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="text-muted-foreground text-[10px] text-center leading-relaxed">
                  All inquiries are handled with complete discretion. We never share client information.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}