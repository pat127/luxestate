'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROPERTY = {
  id: 1,
  name: 'Penthouse at One Palm',
  location: 'Palm Jumeirah, Dubai',
  address: 'One Palm Residences, Palm Jumeirah, Dubai, UAE',
  price: 'AED 85,000,000',
  pricePerSqft: 'AED 8,200 / sqft',
  beds: 5,
  baths: 6,
  sqft: 10_366,
  type: 'Penthouse',
  status: 'For Sale',
  reference: 'CE-PJ-0042',
  completion: 'Ready',
  floors: 'Floors 22–23',
  parking: '4 Spaces',
  view: 'Full Sea & Skyline',
  furnishing: 'Fully Furnished',
  description: `An extraordinary duplex penthouse crowning One Palm — the most prestigious address on Palm Jumeirah. Spanning two full floors with 270-degree panoramic views of the Arabian Gulf, Dubai Marina skyline, and the iconic Burj Al Arab, this residence redefines ultra-luxury living in Dubai.\n\nDesigned by the world-renowned Dorchester Collection, every detail has been curated to the highest standard. Bespoke Italian marble, hand-selected artworks, and a private rooftop terrace with an infinity pool create an unparalleled living experience.`,
  highlights: [
  'Private rooftop infinity pool & terrace',
  'Dorchester Collection interior design',
  'Direct beach access & private marina berth',
  '270° panoramic sea & skyline views',
  'Smart home automation throughout',
  'Private elevator & dedicated concierge'],

  amenities: [
  { icon: 'SparklesIcon', label: 'Infinity Pool' },
  { icon: 'HomeIcon', label: 'Private Beach' },
  { icon: 'ShieldCheckIcon', label: '24/7 Security' },
  { icon: 'StarIcon', label: 'Concierge' },
  { icon: 'BoltIcon', label: 'Smart Home' },
  { icon: 'TrophyIcon', label: 'Fitness Center' },
  { icon: 'GlobeAltIcon', label: 'Spa & Wellness' },
  { icon: 'BuildingOfficeIcon', label: 'Business Lounge' },
  { icon: 'MusicalNoteIcon', label: 'Cinema Room' },
  { icon: 'FireIcon', label: 'Rooftop Terrace' },
  { icon: 'ArrowsPointingOutIcon', label: 'Valet Parking' },
  { icon: 'MapPinIcon', label: 'Marina Berth' }],

  images: [
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_127d6dc96-1773156342470.png",
    alt: 'Luxury penthouse living room with floor-to-ceiling windows overlooking Palm Jumeirah and Arabian Gulf, white marble floors, bespoke furniture'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_17d8ac43a-1766837430470.png",
    alt: 'Master bedroom suite with panoramic sea views, king bed, dark wood accents, and private terrace access'
  },
  {
    src: "https://images.unsplash.com/photo-1679265441414-d5ed0aed8a38",
    alt: 'Private rooftop infinity pool with Dubai Marina skyline backdrop at golden hour'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_173dd8d64-1772641736960.png",
    alt: 'Gourmet kitchen with Italian marble countertops, integrated appliances, and island seating'
  },
  {
    src: "https://images.unsplash.com/photo-1537726235470-8504e3beef77",
    alt: 'Dining area with dramatic chandelier, floor-to-ceiling windows, and sea views'
  },
  {
    src: "https://img.rocket.new/generatedImages/rocket_gen_img_192331c36-1777354895465.png",
    alt: 'Outdoor terrace with lounge seating, fire pit, and unobstructed Burj Al Arab views at dusk'
  }],

  agent: {
    name: 'Alexandra Voss',
    title: 'Senior Luxury Property Consultant',
    phone: '+971 50 886 2683',
    whatsapp: '971508862683',
    email: 'alexandra@coveestates.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16f0638be-1763300671799.png",
    avatarAlt: 'Alexandra Voss, Senior Luxury Property Consultant at Cove Estates',
    listings: 47,
    experience: '12 Years',
    languages: 'English, Arabic, French'
  },
  location_coords: { lat: 25.1124, lng: 55.1390 },
  similar: [
  {
    id: 2,
    name: 'Sky Villa, Address Sky View',
    location: 'Downtown Dubai',
    price: 'AED 62,000,000',
    beds: 4,
    baths: 5,
    sqft: 7_200,
    tag: 'For Sale',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_169be6201-1772109576210.png",
    alt: 'Sky villa with Downtown Dubai skyline and Burj Khalifa views, modern luxury interior',
    href: '/properties/2'
  },
  {
    id: 3,
    name: 'Signature Villa, Emirates Hills',
    location: 'Emirates Hills, Dubai',
    price: 'AED 120,000,000',
    beds: 7,
    baths: 8,
    sqft: 18_000,
    tag: 'For Sale',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_10c4732d9-1772210224317.png",
    alt: 'Grand Emirates Hills villa with golf course views, private pool, and lush landscaping',
    href: '/properties/3'
  },
  {
    id: 4,
    name: 'Penthouse, DIFC Living',
    location: 'DIFC, Dubai',
    price: 'AED 45,000,000',
    beds: 3,
    baths: 4,
    sqft: 5_800,
    tag: 'For Sale',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_15dbdfb47-1773138915166.png",
    alt: 'DIFC penthouse with city skyline views, contemporary design, and rooftop terrace',
    href: '/properties/4'
  }]

};

// ─── Sub-components ────────────────────────────────────────────────────────────

function GallerySection({ images }: {images: typeof PROPERTY.images;}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <section className="relative">
      {/* Main Image */}
      <div
        className="relative w-full cursor-zoom-in"
        style={{ height: 'clamp(320px, 60vh, 680px)' }}
        onClick={() => setLightbox(true)}>
        
        <AppImage
          src={images[active].src}
          alt={images[active].alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Overlay top-left badge */}
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5">
            {PROPERTY.status}
          </span>
          <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-border">
            {PROPERTY.type}
          </span>
        </div>

        {/* Photo count */}
        <button
          onClick={(e) => {e.stopPropagation();setLightbox(true);}}
          className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/20 hover:border-primary transition-colors">
          
          <Icon name="PhotoIcon" size={14} />
          {images.length} Photos
        </button>

        {/* Nav arrows */}
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
      <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto scrollbar-hide">
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

function StatPill({ icon, label, value }: {icon: string;label: string;value: string | number;}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border border-border bg-card">
      <Icon name={icon as any} size={16} className="text-primary flex-shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-foreground font-bold text-sm">{value}</p>
      </div>
    </div>);

}

function MapEmbed({ lat, lng, address }: {lat: number;lng: number;address: string;}) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="relative border border-border overflow-hidden" style={{ height: 360 }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }}
        loading="lazy"
        title={`Map showing ${address}`} />
      
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border px-4 py-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon name="MapPinIcon" size={12} className="text-primary" />
          {address}
        </p>
      </div>
    </div>);

}

function AgentCard({ agent }: {agent: typeof PROPERTY.agent;}) {
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
            <span>{agent.listings} Listings</span>
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
          href={`https://wa.me/${agent.whatsapp}?text=Hi, I'm interested in ${PROPERTY.name} (Ref: ${PROPERTY.reference})`}
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
          href={`mailto:${agent.email}?subject=Enquiry: ${PROPERTY.name}`}
          className="flex items-center justify-center gap-2 w-full py-3 border border-border text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors">
          
          <Icon name="EnvelopeIcon" size={14} />
          Send Email
        </a>
      </div>
    </div>);

}

function EnquiryForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: `I'm interested in ${PROPERTY.name} (Ref: ${PROPERTY.reference}). Please contact me.` });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <Icon name="CheckCircleIcon" size={40} className="text-primary mx-auto" />
        <p className="text-foreground font-bold text-lg">Enquiry Sent</p>
        <p className="text-muted-foreground text-sm">Our team will contact you within 2 hours.</p>
      </div>);

  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
      <h4 className="text-foreground font-bold text-sm uppercase tracking-[0.2em]">Request Information</h4>
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
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      
      <textarea
        rows={4}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      
      <button
        type="submit"
        className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center gap-2 group">
        
        Send Enquiry
        <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>);

}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Gallery */}
      <div className="pt-[72px]">
        <GallerySection images={PROPERTY.images} />
      </div>

      {/* Breadcrumb + Title Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/residential" className="hover:text-primary transition-colors">Residential</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground">{PROPERTY.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                {PROPERTY.name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 flex items-center gap-1.5">
                <Icon name="MapPinIcon" size={13} className="text-primary" />
                {PROPERTY.address}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">{PROPERTY.price}</p>
              <p className="text-muted-foreground text-xs mt-1">{PROPERTY.pricePerSqft}</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">Ref: {PROPERTY.reference}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Strip */}
      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex gap-3 min-w-max md:min-w-0 flex-wrap">
            <StatPill icon="HomeIcon" label="Bedrooms" value={`${PROPERTY.beds} Beds`} />
            <StatPill icon="SparklesIcon" label="Bathrooms" value={`${PROPERTY.baths} Baths`} />
            <StatPill icon="ArrowsPointingOutIcon" label="Area" value={`${PROPERTY.sqft.toLocaleString()} sqft`} />
            <StatPill icon="BuildingOfficeIcon" label="Type" value={PROPERTY.type} />
            <StatPill icon="CheckCircleIcon" label="Status" value={PROPERTY.completion} />
            <StatPill icon="EyeIcon" label="View" value={PROPERTY.view} />
            <StatPill icon="TruckIcon" label="Parking" value={PROPERTY.parking} />
            <StatPill icon="SwatchIcon" label="Furnishing" value={PROPERTY.furnishing} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-14">

            {/* Description */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Overview</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {PROPERTY.description.split('\n\n').map((para, i) =>
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
                {PROPERTY.highlights.map((h, i) =>
                <div key={i} className="flex items-start gap-3 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{h}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Amenities</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PROPERTY.amenities.map((a, i) =>
                <div key={i} className="flex flex-col items-center gap-2 p-4 border border-border bg-card hover:border-primary/40 transition-colors text-center">
                    <Icon name={a.icon as any} size={20} className="text-primary" />
                    <span className="text-foreground text-xs font-medium">{a.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details Table */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Property Details</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="border border-border divide-y divide-border">
                {[
                ['Property Type', PROPERTY.type],
                ['Status', PROPERTY.status],
                ['Completion', PROPERTY.completion],
                ['Bedrooms', `${PROPERTY.beds} Bedrooms`],
                ['Bathrooms', `${PROPERTY.baths} Bathrooms`],
                ['Area', `${PROPERTY.sqft.toLocaleString()} sqft`],
                ['Floors', PROPERTY.floors],
                ['Parking', PROPERTY.parking],
                ['View', PROPERTY.view],
                ['Furnishing', PROPERTY.furnishing],
                ['Reference', PROPERTY.reference]].
                map(([label, value]) =>
                <div key={label} className="flex items-center px-5 py-3.5 hover:bg-card transition-colors">
                    <span className="text-muted-foreground text-xs uppercase tracking-widest w-40 flex-shrink-0">{label}</span>
                    <span className="text-foreground text-sm font-medium">{value}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Location</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <MapEmbed
                lat={PROPERTY.location_coords.lat}
                lng={PROPERTY.location_coords.lng}
                address={PROPERTY.address} />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                { label: 'Dubai Mall', distance: '12 min' },
                { label: 'Dubai Airport', distance: '25 min' },
                { label: 'Marina Walk', distance: '8 min' },
                { label: 'Burj Al Arab', distance: '5 min' }].
                map((poi) =>
                <div key={poi.label} className="border border-border bg-card px-4 py-3 text-center">
                    <p className="text-foreground text-xs font-bold">{poi.label}</p>
                    <p className="text-primary text-xs mt-0.5">{poi.distance}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enquiry Form (mobile) */}
            <div className="lg:hidden" data-observe>
              <div className="animate-on-scroll space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Enquire Now</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <AgentCard agent={PROPERTY.agent} />
                <EnquiryForm />
              </div>
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <AgentCard agent={PROPERTY.agent} />
              <EnquiryForm />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      <section className="border-t border-border py-16 px-6 md:px-10 bg-card" data-observe>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10 animate-on-scroll">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">You May Also Like</span>
            <div className="flex-1 h-px bg-border" />
            <Link href="/residential" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <Icon name="ArrowRightIcon" size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            {PROPERTY.similar.map((p, i) =>
            <Link
              key={p.id}
              href={p.href}
              className="property-card block bg-background border border-border group animate-on-scroll"
              style={{ transitionDelay: `${i * 80}ms` }}>
              
                <div className="relative h-52 overflow-hidden">
                  <AppImage src={p.image} alt={p.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    {p.tag}
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
                    <span className="text-primary font-bold text-sm">{p.price}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{p.beds} Beds</span>
                      <span>{p.sqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp CTA */}
      <a
        href={`https://wa.me/${PROPERTY.agent.whatsapp}?text=Hi, I'm interested in ${PROPERTY.name} (Ref: ${PROPERTY.reference})`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 shadow-2xl hover:bg-accent transition-all duration-300 group"
        aria-label="Chat on WhatsApp">
        
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-xs font-black uppercase tracking-widest">Enquire on WhatsApp</span>
      </a>

      <Footer />
    </main>);

}