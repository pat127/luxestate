'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { PropertyDetailContent } from '@/contexts/CMSContext';

export function GallerySection({ images }: { images: PropertyDetailContent['images'] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <section className="relative">
      <div
        className="relative w-full cursor-zoom-in"
        style={{ height: 'clamp(320px, 60vh, 680px)' }}
        onClick={() => setLightbox(true)}>
        <AppImage
          src={images[active]?.src ?? ''}
          alt={images[active]?.alt ?? ''}
          fill
          className="object-cover"
          sizes="100vw"
          priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
          className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/20 hover:border-primary transition-colors">
          <Icon name="PhotoIcon" size={14} />
          {images.length} Photos
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
          <Icon name="ChevronLeftIcon" size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
          <Icon name="ChevronRightIcon" size={18} />
        </button>
      </div>

      <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto scrollbar-hide">
        {images.map((img, i) =>
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative flex-shrink-0 w-20 h-14 border-2 transition-all duration-300 overflow-hidden ${active === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
            <AppImage src={img.src} alt={img.alt} fill className="object-cover" sizes="80px" />
          </button>
        )}
      </div>

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
            onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}>
            <Icon name="ChevronLeftIcon" size={22} />
          </button>
          <div className="relative w-full max-w-5xl mx-8" style={{ height: '70vh' }} onClick={(e) => e.stopPropagation()}>
            <AppImage src={images[active]?.src ?? ''} alt={images[active]?.alt ?? ''} fill className="object-contain" sizes="100vw" />
          </div>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"
            onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}>
            <Icon name="ChevronRightIcon" size={22} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">
            {active + 1} / {images.length}
          </div>
        </div>
      }
    </section>
  );
}

export function StatPill({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border border-border bg-card">
      <Icon name={icon as any} size={16} className="text-primary flex-shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-foreground font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

export function MapEmbed({ lat, lng, address }: { lat: number; lng: number; address: string }) {
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
    </div>
  );
}

export function AgentCard({ agent, propertyName, reference }: { agent: PropertyDetailContent['agent']; propertyName: string; reference: string }) {
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
          href={`https://wa.me/${agent.whatsapp}?text=Hi, I'm interested in ${propertyName} (Ref: ${reference})`}
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
          href={`mailto:${agent.email}?subject=Enquiry: ${propertyName}`}
          className="flex items-center justify-center gap-2 w-full py-3 border border-border text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors">
          <Icon name="EnvelopeIcon" size={14} />
          Send Email
        </a>
      </div>
    </div>
  );
}

export function EnquiryForm({ propertyName, reference }: { propertyName: string; reference: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: `I'm interested in ${propertyName} (Ref: ${reference}). Please contact me.` });
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
      <h4 className="text-foreground font-bold text-sm uppercase tracking-[0.2em]">Request Information</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center gap-2 group">
        Send Enquiry
        <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
