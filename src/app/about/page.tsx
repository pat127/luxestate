'use client';

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCMS, DEFAULT_ABOUT_CONTENT, AboutContent } from '@/contexts/CMSContext';

export default function AboutPage() {
  const { getPage } = useCMS();
  const aboutPage = getPage('about');
  const ab: AboutContent = aboutPage.about_content ?? DEFAULT_ABOUT_CONTENT;

  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      const children = Array.from(heroRef.current.children) as HTMLElement[];
      children.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 400 + i * 150);
      });
    }

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
    [storyRef, valuesRef, teamRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AppImage
            src={aboutPage.hero_image || "https://images.unsplash.com/photo-1571907761804-27e376886f3d"}
            alt="Aerial view of Dubai skyline at dusk with glittering towers reflected in the water, warm golden light, cinematic atmosphere"
            fill
            priority
            className="object-cover"
            sizes="100vw" />
          
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pb-16 pt-40">
          <div ref={heroRef} className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              <span className="h-px w-10 bg-primary" />
              Our Story
            </span>
            <h1 className="text-hero text-foreground max-w-3xl">
              {aboutPage.hero_headline || 'Built on Trust,'}{' '}
              <span className="text-gold-shimmer">{aboutPage.hero_subheadline || 'Defined by Excellence'}</span>
            </h1>
            <p className="text-foreground/70 text-base md:text-lg max-w-lg leading-relaxed">
              {aboutPage.hero_description || 'Since 2006, Cove Estates has been the trusted partner for discerning clients seeking the finest properties in Dubai and beyond.'}
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              {ab.hero_stats.map((stat) =>
              <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-black text-primary tracking-tight">{stat.value}</span>
                  <span className="text-xs text-foreground/60 uppercase tracking-widest mt-0.5">{stat.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section ref={storyRef} className="py-20 px-6 md:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">{ab.story_eyebrow}</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter leading-none mb-8">
                {ab.story_headline}<br />
                <span className="text-gold-shimmer">{ab.story_headline_shimmer}</span>
              </h2>
              <div className="space-y-5 text-muted-foreground text-sm leading-relaxed">
                <p>{ab.story_paragraph1}</p>
                <p>{ab.story_paragraph2}</p>
                <p>{ab.story_paragraph3}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="animate-on-scroll">
              <div className="relative pl-6 border-l border-border space-y-8">
                {ab.milestones.map((m, i) =>
                <div key={m.year} className="relative" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className="absolute -left-[25px] w-4 h-4 border border-primary bg-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary" />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">{m.year}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.event}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="py-20 px-6 md:px-10 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 animate-on-scroll">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">{ab.values_eyebrow}</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
                {ab.values_headline}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed text-right">
              {ab.values_subtext}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children animate-on-scroll">
            {ab.values.map((value, i) =>
            <div
              key={value.title}
              className="animate-on-scroll border border-border bg-background p-8 group hover:border-primary/40 transition-all duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}>
              
                <div className="w-12 h-12 border border-border flex items-center justify-center mb-6 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                  <Icon name={value.icon as Parameters<typeof Icon>[0]['name']} size={20} className="text-primary" />
                </div>
                <h3 className="text-foreground font-bold text-xl mb-3 tracking-tight">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Meet Our CEO */}
      <section ref={teamRef} id="team" className="py-20 px-6 md:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 animate-on-scroll">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">{ab.ceo_eyebrow}</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
                {ab.ceo_section_headline}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed text-right">
              {ab.ceo_section_subtext}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center animate-on-scroll">
            {/* CEO Image */}
            <div className="relative group overflow-hidden border border-border hover:border-primary/40 transition-all duration-500">
              <div className="relative h-[520px] overflow-hidden">
                <AppImage
                  src={ab.ceo.image}
                  alt={ab.ceo.alt}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-bold text-2xl leading-tight">{ab.ceo.name}</p>
                  <p className="text-primary text-xs uppercase tracking-widest mt-1">{ab.ceo.role}</p>
                </div>
              </div>
            </div>

            {/* CEO Bio */}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4">
                  {ab.ceo.name}
                </h3>
                <p className="text-primary text-xs font-bold uppercase tracking-[0.25em] mb-6">{ab.ceo.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {ab.ceo.bio}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {ab.ceo.bio2}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {ab.ceo_stats.map((stat) => (
                  <div key={stat.label} className="border border-border p-5 bg-card">
                    <span className="text-2xl font-black text-primary tracking-tight block">{stat.value}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 block">{stat.label}</span>
                  </div>
                ))}
              </div>

              <a
                href={ab.ceo.linkedin}
                className="inline-flex items-center gap-3 border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground hover:border-primary hover:text-primary transition-all duration-300 w-fit"
              >
                <Icon name="UserCircleIcon" size={15} className="text-primary" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 md:px-10 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Get In Touch</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter leading-none mb-6">
                Let's Start a<br />
                <span className="text-gold-shimmer">Conversation</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md">
                Whether you're buying, selling, or investing, our team is ready to provide the expert guidance your real estate decisions deserve.
              </p>
              <div className="space-y-4">
                <a href="tel:+971508862683" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name="PhoneIcon" size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                    <p className="text-foreground text-sm font-medium">+971 50 886 2683</p>
                  </div>
                </a>
                <a href="mailto:admin@coveestates.com" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name="EnvelopeIcon" size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="text-foreground text-sm font-medium">admin@coveestates.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-border flex items-center justify-center">
                    <Icon name="MapPinIcon" size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Office</p>
                    <p className="text-foreground text-sm font-medium">8th Level, Moosa Tower 1, Dubai, UAE</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border p-8 md:p-10">
              <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Send Us a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ContactForm() {
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 border border-primary flex items-center justify-center mx-auto mb-5">
          <Icon name="CheckIcon" size={22} className="text-primary" />
        </div>
        <h4 className="text-lg font-bold text-foreground mb-2">Message Sent</h4>
        <p className="text-muted-foreground text-sm">We'll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
            placeholder="Your name" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
            placeholder="your@email.com" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
          placeholder="+971 50 000 0000" />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Message *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none"
          placeholder="How can we help you?" />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group">
        Send Message
        <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}