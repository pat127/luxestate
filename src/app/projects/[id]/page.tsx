'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROJECT = {
  id: 1,
  name: 'One Obsidian Tower',
  tagline: 'Redefining the Dubai Skyline',
  developer: 'Meridian Development Group',
  architect: 'Foster & Partners',
  location: 'Business Bay, Dubai',
  address: 'One Obsidian Tower, Business Bay, Dubai, UAE',
  completion: 'Q3 2027',
  units: 84,
  floors: 62,
  priceFrom: 'AED 8,500,000',
  priceTo: 'AED 95,000,000',
  status: 'Selling Now',
  sold: 62,
  type: 'Residential',
  reference: 'CE-OOT-001',
  description: `One Obsidian Tower is a landmark 62-story residential tower rising above Business Bay — Dubai's most dynamic address. Designed by the legendary Foster & Partners, the tower's dark glass facade captures and reflects the city's ever-changing light, creating a living sculpture on the skyline.\n\nWith only 84 residences across 62 floors, One Obsidian Tower offers an unmatched level of exclusivity. Each home features floor-to-ceiling glass, private sky terraces, and panoramic views of the Burj Khalifa, Dubai Creek, and the Arabian Gulf.\n\nResidents enjoy a curated collection of amenities spanning three dedicated floors — from the infinity sky pool on the 55th floor to the private cinema, members' lounge, and a world-class spa.`,
  highlights: [
  'Only 84 residences across 62 floors',
  'Foster & Partners architecture',
  'Sky infinity pool on 55th floor',
  'Private sky terraces on all units',
  'Panoramic Burj Khalifa views',
  'Dedicated concierge & lifestyle team',
  'Smart home automation throughout',
  'LEED Gold certified building'],

  unitTypes: [
  { type: '1 Bedroom', area: '1,200 – 1,800 sqft', price: 'From AED 8,500,000', available: 8 },
  { type: '2 Bedroom', area: '2,100 – 3,200 sqft', price: 'From AED 14,000,000', available: 6 },
  { type: '3 Bedroom', area: '3,800 – 5,500 sqft', price: 'From AED 24,000,000', available: 5 },
  { type: 'Sky Villa', area: '7,200 – 9,800 sqft', price: 'From AED 55,000,000', available: 3 },
  { type: 'Penthouse', area: '12,000 – 18,000 sqft', price: 'From AED 85,000,000', available: 2 }],

  paymentPlan: [
  { phase: 'Booking', percent: 10, label: 'On Signing SPA', icon: 'PencilSquareIcon' },
  { phase: '1st Instalment', percent: 20, label: 'Within 30 Days', icon: 'CalendarIcon' },
  { phase: 'Construction', percent: 40, label: 'During Construction (4 Instalments)', icon: 'BuildingOfficeIcon' },
  { phase: 'Handover', percent: 30, label: 'On Completion Q3 2027', icon: 'KeyIcon' }],

  amenities: [
  { icon: 'SparklesIcon', label: 'Sky Infinity Pool' },
  { icon: 'HomeIcon', label: 'Private Beach Club' },
  { icon: 'ShieldCheckIcon', label: '24/7 Concierge' },
  { icon: 'StarIcon', label: 'Members Lounge' },
  { icon: 'BoltIcon', label: 'Smart Home' },
  { icon: 'TrophyIcon', label: 'Fitness & Wellness' },
  { icon: 'GlobeAltIcon', label: 'Spa & Hammam' },
  { icon: 'BuildingOfficeIcon', label: 'Business Centre' },
  { icon: 'MusicalNoteIcon', label: 'Private Cinema' },
  { icon: 'FireIcon', label: 'Sky Terrace Lounge' },
  { icon: 'ArrowsPointingOutIcon', label: 'Valet Parking' },
  { icon: 'MapPinIcon', label: 'Helipad' }],

  images: [
  {
    src: "https://images.unsplash.com/photo-1685534830735-9cbdfe7b955b",
    alt: 'One Obsidian Tower exterior rendering at dusk, dark glass facade reflecting Dubai skyline, dramatic lighting'
  },
  {
    src: "https://images.unsplash.com/photo-1578200228871-2d5389cc82f6",
    alt: 'Sky infinity pool on 55th floor with panoramic Burj Khalifa and Business Bay views at golden hour'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_15b6c49fe-1769420947258.png",
    alt: 'Luxury 3-bedroom residence interior with floor-to-ceiling windows, marble floors, and Dubai Creek views'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_17f985e3a-1774106261093.png",
    alt: 'Tower lobby with double-height ceilings, dark marble, and bespoke art installation'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_18177980c-1777959943189.png",
    alt: 'Members lounge with panoramic city views, bespoke furniture, and curated art collection'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_1ce78b5ae-1764745340163.png",
    alt: 'Sky terrace lounge at night with fire features, city lights backdrop, and outdoor dining'
  }],

  constructionProgress: [
  { phase: 'Foundation & Basement', complete: 100 },
  { phase: 'Core & Structure (Floors 1–30)', complete: 100 },
  { phase: 'Core & Structure (Floors 31–62)', complete: 65 },
  { phase: 'Facade & Glazing', complete: 40 },
  { phase: 'MEP & Fit-Out', complete: 20 },
  { phase: 'Amenities & Landscaping', complete: 5 }],

  agent: {
    name: 'Marcus Al-Rashid',
    title: 'Off-Plan Investment Specialist',
    phone: '+971 50 886 2683',
    whatsapp: '971508862683',
    email: 'marcus@coveestates.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18fcd4c37-1772439322102.png",
    avatarAlt: 'Marcus Al-Rashid, Off-Plan Investment Specialist at Cove Estates',
    listings: 31,
    experience: '9 Years',
    languages: 'English, Arabic'
  },
  location_coords: { lat: 25.1865, lng: 55.2615 },
  similar: [
  {
    id: 2,
    name: 'Seraphine Residences',
    location: 'Beverly Hills, CA',
    priceFrom: 'From AED 14,000,000',
    completion: 'Q1 2027',
    units: 32,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14243a416-1777959939436.png",
    alt: 'Seraphine Residences luxury tower rendering, flowing organic architecture, dramatic dusk lighting',
    href: '/projects/2'
  },
  {
    id: 3,
    name: 'The Monarch',
    location: 'Miami Beach, FL',
    priceFrom: 'From AED 4,200,000',
    completion: 'Q4 2026',
    units: 120,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_154e899f1-1777959941243.png",
    alt: 'The Monarch luxury mixed-use development, geometric white facade, ocean backdrop, golden hour',
    href: '/projects/3'
  },
  {
    id: 4,
    name: 'The Halcyon',
    location: 'Greenwich, CT',
    priceFrom: 'From AED 18,000,000',
    completion: 'Q1 2028',
    units: 22,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1709eb335-1777959940300.png",
    alt: 'The Halcyon estate development, classical modern architecture, Connecticut countryside, overcast sky',
    href: '/projects/4'
  }]

};

// ─── Sub-components ────────────────────────────────────────────────────────────

function GallerySection({ images }: {images: typeof PROJECT.images;}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <section className="relative">
      <div
        className="relative w-full cursor-zoom-in"
        style={{ height: 'clamp(360px, 65vh, 720px)' }}
        onClick={() => setLightbox(true)}>
        
        <AppImage
          src={images[active].src}
          alt={images[active].alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Hero text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3 block">{PROJECT.developer}</span>
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">
              {PROJECT.name}
            </h1>
            <p className="text-white/70 text-sm md:text-base tracking-widest uppercase">{PROJECT.tagline}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5">
            {PROJECT.status}
          </span>
          <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-border">
            {PROJECT.completion}
          </span>
        </div>

        <button
          onClick={(e) => {e.stopPropagation();setLightbox(true);}}
          className="absolute top-6 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/20 hover:border-primary transition-colors">
          
          <Icon name="PhotoIcon" size={14} />
          {images.length} Photos
        </button>

        <button
          onClick={(e) => {e.stopPropagation();setActive((a) => (a - 1 + images.length) % images.length);}}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
          
          <Icon name="ChevronLeftIcon" size={18} />
        </button>
        <button
          onClick={(e) => {e.stopPropagation();setActive((a) => (a + 1) % images.length);}}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
          
          <Icon name="ChevronRightIcon" size={18} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto">
        {images.map((img, i) =>
        <button
          key={i}
          onClick={() => setActive(i)}
          className={`relative flex-shrink-0 w-20 h-14 border-2 transition-all duration-300 overflow-hidden ${
          active === i ? 'border-primary' : 'border-border hover:border-primary/50'}`
          }>
          
            <AppImage src={img.src} alt={img.alt} fill className="object-cover" sizes="80px" />
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox &&
      <div
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={() => setLightbox(false)}>
        
          <button
          className="absolute top-6 right-6 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"
          onClick={() => setLightbox(false)}>
          
            <Icon name="XMarkIcon" size={20} />
          </button>
          <button
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"
          onClick={(e) => {e.stopPropagation();setActive((a) => (a - 1 + images.length) % images.length);}}>
          
            <Icon name="ChevronLeftIcon" size={22} />
          </button>
          <div className="relative w-full max-w-5xl mx-8" style={{ height: '70vh' }} onClick={(e) => e.stopPropagation()}>
            <AppImage src={images[active].src} alt={images[active].alt} fill className="object-contain" sizes="100vw" />
          </div>
          <button
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"
          onClick={(e) => {e.stopPropagation();setActive((a) => (a + 1) % images.length);}}>
          
            <Icon name="ChevronRightIcon" size={22} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">
            {active + 1} / {images.length}
          </div>
        </div>
      }
    </section>);

}

function PaymentPlanSection() {
  const total = PROJECT.paymentPlan.reduce((s, p) => s + p.percent, 0);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Payment Plan</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Visual bar */}
      <div className="flex h-3 border border-border overflow-hidden">
        {PROJECT.paymentPlan.map((p, i) =>
        <div
          key={i}
          style={{ width: `${p.percent}%` }}
          className={`h-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary/70' : i === 2 ? 'bg-primary/40' : 'bg-primary/20'}`} />

        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECT.paymentPlan.map((p, i) =>
        <div key={i} className="flex items-center gap-4 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 border border-primary/30 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={p.icon as any} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-foreground font-bold text-sm">{p.phase}</span>
                <span className="text-primary font-black text-lg">{p.percent}%</span>
              </div>
              <p className="text-muted-foreground text-xs">{p.label}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
        <span className="text-primary font-black text-xl">{total}%</span>
      </div>
    </div>);

}

function ConstructionProgress() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Construction Progress</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-4">
        {PROJECT.constructionProgress.map((phase, i) =>
        <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-foreground text-sm font-medium">{phase.phase}</span>
              <span className="text-primary font-bold text-sm">{phase.complete}%</span>
            </div>
            <div className="h-1.5 bg-border overflow-hidden">
              <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${phase.complete}%` }} />
            
            </div>
          </div>
        )}
      </div>
      <div className="border border-border bg-card px-5 py-4 flex items-center gap-3">
        <Icon name="CalendarIcon" size={16} className="text-primary flex-shrink-0" />
        <div>
          <p className="text-foreground text-sm font-bold">Expected Completion: {PROJECT.completion}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Construction updates sent monthly to registered buyers</p>
        </div>
      </div>
    </div>);

}

function AgentCard({ agent }: {agent: typeof PROJECT.agent;}) {
  return (
    <div className="border border-border bg-card p-6 space-y-5 gold-glow-animate">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 border-2 border-primary/40 overflow-hidden flex-shrink-0">
          <AppImage src={agent.avatar} alt={agent.avatarAlt} fill className="object-cover" sizes="64px" />
        </div>
        <div>
          <h4 className="text-foreground font-bold text-base">{agent.name}</h4>
          <p className="text-primary text-xs font-medium tracking-wide">{agent.title}</p>
          <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
            <span>{agent.listings} Projects</span>
            <span>·</span>
            <span>{agent.experience}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Icon name="GlobeAltIcon" size={12} className="text-primary" />
          {agent.languages}
        </p>
        <p className="flex items-center gap-2">
          <Icon name="EnvelopeIcon" size={12} className="text-primary" />
          {agent.email}
        </p>
      </div>
      <div className="space-y-2.5">
        <a
          href={`https://wa.me/${agent.whatsapp}?text=Hi, I'm interested in ${PROJECT.name} (Ref: ${PROJECT.reference})`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-accent transition-colors">
          
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp Agent
        </a>
        <a
          href={`tel:${agent.phone}`}
          className="flex items-center justify-center gap-2 w-full py-3 border border-primary text-primary text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors">
          
          <Icon name="PhoneIcon" size={14} />
          {agent.phone}
        </a>
        <a
          href={`mailto:${agent.email}?subject=Enquiry: ${PROJECT.name}`}
          className="flex items-center justify-center gap-2 w-full py-3 border border-border text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors">
          
          <Icon name="EnvelopeIcon" size={14} />
          Send Email
        </a>
      </div>
    </div>);

}

function EnquiryForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    unitType: '',
    message: `I'm interested in ${PROJECT.name} (Ref: ${PROJECT.reference}). Please send me the brochure and payment plan.`
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <Icon name="CheckCircleIcon" size={40} className="text-primary mx-auto" />
        <p className="text-foreground font-bold text-lg">Enquiry Received</p>
        <p className="text-muted-foreground text-sm">Our off-plan specialist will contact you within 2 hours.</p>
      </div>);

  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
      <h4 className="text-foreground font-bold text-sm uppercase tracking-[0.2em]">Register Interest</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        
        <input
          required
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        
      </div>
      <input
        type="tel"
        placeholder="Phone / WhatsApp"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      
      <select
        value={form.unitType}
        onChange={(e) => setForm({ ...form, unitType: e.target.value })}
        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
        
        <option value="">Interested Unit Type</option>
        {PROJECT.unitTypes.map((u) =>
        <option key={u.type} value={u.type}>{u.type} — {u.price}</option>
        )}
      </select>
      <textarea
        rows={3}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      
      <button
        type="submit"
        className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center gap-2 group">
        
        Register Interest
        <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-[10px] text-muted-foreground text-center">
        Download brochure & floor plans sent instantly upon registration
      </p>
    </form>);

}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
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
      { threshold: 0.05 }
    );
    const sections = document.querySelectorAll('[data-observe]');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const soldPercent = Math.round(PROJECT.sold / PROJECT.units * 100);

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Gallery Hero */}
      <div className="pt-[72px]">
        <GallerySection images={PROJECT.images} />
      </div>

      {/* Key Stats Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground">{PROJECT.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{PROJECT.developer}</span>
                <span className="text-border">·</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{PROJECT.architect}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">{PROJECT.name}</h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <Icon name="MapPinIcon" size={13} className="text-primary" />
                {PROJECT.address}
              </p>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              <p className="text-3xl md:text-4xl font-black text-primary">{PROJECT.priceFrom}</p>
              <p className="text-muted-foreground text-xs">Up to {PROJECT.priceTo}</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Ref: {PROJECT.reference}</p>
            </div>
          </div>

          {/* Availability bar */}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest mb-2">
              <span>{PROJECT.sold} of {PROJECT.units} Units Reserved</span>
              <span className="text-primary font-bold">{soldPercent}% Sold</span>
            </div>
            <div className="h-1.5 bg-border overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${soldPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex gap-3 min-w-max md:min-w-0 flex-wrap">
            {[
            { icon: 'BuildingOfficeIcon', label: 'Floors', value: `${PROJECT.floors} Floors` },
            { icon: 'HomeIcon', label: 'Total Units', value: `${PROJECT.units} Residences` },
            { icon: 'CalendarIcon', label: 'Completion', value: PROJECT.completion },
            { icon: 'MapPinIcon', label: 'Location', value: PROJECT.location },
            { icon: 'StarIcon', label: 'Type', value: PROJECT.type },
            { icon: 'CheckCircleIcon', label: 'Status', value: PROJECT.status }].
            map((s) =>
            <div key={s.label} className="flex items-center gap-3 px-5 py-3 border border-border bg-card">
                <Icon name={s.icon as any} size={16} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-foreground font-bold text-sm">{s.value}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-14">

            {/* Description */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">About the Project</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {PROJECT.description.split('\n\n').map((para, i) =>
              <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">{para}</p>
              )}
            </div>

            {/* Highlights */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Key Highlights</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT.highlights.map((h, i) =>
                <div key={i} className="flex items-start gap-3 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{h}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Unit Types */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Available Units</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="border border-border divide-y divide-border">
                <div className="grid grid-cols-4 px-5 py-3 bg-card">
                  {['Unit Type', 'Area', 'Starting Price', 'Available'].map((h) =>
                  <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
                  )}
                </div>
                {PROJECT.unitTypes.map((u, i) =>
                <div key={i} className="grid grid-cols-4 px-5 py-4 hover:bg-card transition-colors items-center">
                    <span className="text-foreground font-bold text-sm">{u.type}</span>
                    <span className="text-muted-foreground text-xs">{u.area}</span>
                    <span className="text-primary font-bold text-sm">{u.price}</span>
                    <span className={`text-xs font-bold ${u.available <= 3 ? 'text-red-400' : 'text-foreground'}`}>
                      {u.available} Left
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Plan */}
            <div data-observe className="animate-on-scroll">
              <PaymentPlanSection />
            </div>

            {/* Amenities */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Amenities</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PROJECT.amenities.map((a, i) =>
                <div key={i} className="flex flex-col items-center gap-2 p-4 border border-border bg-card hover:border-primary/40 transition-colors text-center">
                    <Icon name={a.icon as any} size={20} className="text-primary" />
                    <span className="text-foreground text-xs font-medium">{a.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Construction Progress */}
            <div data-observe className="animate-on-scroll">
              <ConstructionProgress />
            </div>

            {/* Location */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Location</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="relative border border-border overflow-hidden" style={{ height: 360 }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${PROJECT.location_coords.lng - 0.01},${PROJECT.location_coords.lat - 0.01},${PROJECT.location_coords.lng + 0.01},${PROJECT.location_coords.lat + 0.01}&layer=mapnik&marker=${PROJECT.location_coords.lat},${PROJECT.location_coords.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }}
                  loading="lazy"
                  title={`Map showing ${PROJECT.address}`} />
                
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border px-4 py-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Icon name="MapPinIcon" size={12} className="text-primary" />
                    {PROJECT.address}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                { label: 'Dubai Mall', distance: '8 min' },
                { label: 'Dubai Airport', distance: '20 min' },
                { label: 'DIFC', distance: '5 min' },
                { label: 'Burj Khalifa', distance: '6 min' }].
                map((poi) =>
                <div key={poi.label} className="border border-border bg-card px-4 py-3 text-center">
                    <p className="text-foreground text-xs font-bold">{poi.label}</p>
                    <p className="text-primary text-xs mt-0.5">{poi.distance}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Agent + Form */}
            <div className="lg:hidden" data-observe>
              <div className="animate-on-scroll space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Register Interest</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <AgentCard agent={PROJECT.agent} />
                <EnquiryForm />
              </div>
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <AgentCard agent={PROJECT.agent} />
              <EnquiryForm />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Projects */}
      <section className="border-t border-border py-16 px-6 md:px-10 bg-card" data-observe>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10 animate-on-scroll">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Similar Projects</span>
            <div className="flex-1 h-px bg-border" />
            <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <Icon name="ArrowRightIcon" size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            {PROJECT.similar.map((p, i) =>
            <Link
              key={p.id}
              href={p.href}
              className="project-card-3d block bg-background border border-border group animate-on-scroll"
              style={{ transitionDelay: `${i * 80}ms` }}>
              
                <div className="relative h-52 overflow-hidden">
                  <AppImage src={p.image} alt={p.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border">
                    {p.completion}
                  </span>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-4 border-t border-border">
                  <h3 className="text-foreground font-bold text-base leading-tight">{p.name}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                    <Icon name="MapPinIcon" size={10} className="text-primary" />
                    {p.location}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-primary font-bold text-sm">{p.priceFrom}</span>
                    <span className="text-muted-foreground text-xs">{p.units} Units</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp CTA */}
      <a
        href={`https://wa.me/${PROJECT.agent.whatsapp}?text=Hi, I'm interested in ${PROJECT.name} (Ref: ${PROJECT.reference}). Please send me the brochure.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 shadow-2xl hover:bg-accent transition-all duration-300"
        aria-label="Chat on WhatsApp">
        
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-xs font-black uppercase tracking-widest">Get Brochure</span>
      </a>

      <Footer />
    </main>);

}