'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { EnquiryForm } from './components';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminProperty {
  id: number;
  name: string;
  location: string;
  price: string;
  type: string;
  status: string;
  beds?: number;
  baths?: number;
  sqft: string;
  image: string;
  alt: string;
  agent: string;
  published?: boolean;
  featured?: boolean;
  // Extended fields from form
  referenceNumber?: string;
  description?: string;
  propertyType?: string;
  listingType?: string;
  pricePerSqFt?: string;
  completion?: string;
  furnishing?: string;
  view?: string;
  amenities?: string;
  fullAddress?: string;
  latitude?: string;
  longitude?: string;
  imageUrls?: string;
  bedrooms?: string;
  bathrooms?: string;
  areaSqFt?: string;
  emirate?: string;
  community?: string;
}

interface AgentInfo {
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  image: string;
  imageAlt: string;
}

// ─── Gallery Component ────────────────────────────────────────────────────────
function PropertyGallery({ images, mainImage, mainAlt }: { images: string[]; mainImage: string; mainAlt: string }) {
  const [active, setActive] = useState(0);
  const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);

  if (allImages.length === 0) {
    return (
      <div className="relative w-full bg-card border-b border-border flex items-center justify-center" style={{ height: 'clamp(320px, 60vh, 680px)' }}>
        <Icon name="PhotoIcon" size={48} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="relative">
      <div className="relative w-full" style={{ height: 'clamp(320px, 60vh, 680px)' }}>
        <AppImage
          src={allImages[active]}
          alt={active === 0 ? mainAlt : `Property image ${active + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + allImages.length) % allImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
              <Icon name="ChevronLeftIcon" size={18} />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % allImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
              <Icon name="ChevronRightIcon" size={18} />
            </button>
          </>
        )}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/20">
          <Icon name="PhotoIcon" size={14} />
          {allImages.length} Photo{allImages.length !== 1 ? 's' : ''}
        </div>
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-14 border-2 transition-all duration-300 overflow-hidden ${active === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
              <AppImage src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border border-border bg-card hover:border-primary/40 transition-colors flex-shrink-0">
      <Icon name={icon as any} size={14} className="text-primary" />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-foreground text-xs font-bold">{value}</p>
      </div>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({ agentName, propertyName, reference }: { agentName: string; propertyName: string; reference: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon name="UserCircleIcon" size={28} className="text-primary" />
        </div>
        <div>
          <p className="text-foreground font-bold text-sm">{agentName || 'Cove Estates Agent'}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Property Consultant</p>
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Ref: {reference}</p>
        </div>
      </div>
      <div className="space-y-2">
        <a
          href="tel:+97144000000"
          className="flex items-center gap-3 w-full px-4 py-2.5 border border-border bg-background hover:border-primary/40 transition-colors text-sm text-foreground">
          <Icon name="PhoneIcon" size={14} className="text-primary" />
          Call Agent
        </a>
        <a
          href={`https://wa.me/97144000000?text=Hi, I'm interested in ${encodeURIComponent(propertyName)} (Ref: ${reference})`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent transition-colors text-sm font-bold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    try {
      const stored = localStorage.getItem('admin_properties');
      if (!stored) { setNotFound(true); setLoading(false); return; }
      const list: AdminProperty[] = JSON.parse(stored);
      const found = list.find((p) => String(p.id) === String(id));
      if (found) {
        setProperty(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  }, [id]);

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
  }, [property]);

  if (loading) {
    return (
      <main className="bg-background overflow-x-hidden">
        <Header />
        <div className="pt-[72px] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading property...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !property) {
    return (
      <main className="bg-background overflow-x-hidden">
        <Header />
        <div className="pt-[72px] min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Icon name="HomeIcon" size={48} className="text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Property Not Found</h1>
            <p className="text-muted-foreground text-sm mb-8">This property listing may have been removed or is no longer available.</p>
            <Link href="/residential" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors">
              Browse All Properties
              <Icon name="ArrowRightIcon" size={14} />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Parse image URLs (comma-separated or single)
  const imageList: string[] = property.imageUrls
    ? property.imageUrls.split(',').map((u) => u.trim()).filter(Boolean)
    : property.image
    ? [property.image]
    : [];

  // Parse amenities
  const amenityList: string[] = property.amenities
    ? property.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const reference = property.referenceNumber || `REF-${property.id}`;
  const beds = property.bedrooms || (property.beds != null ? String(property.beds) : '—');
  const baths = property.bathrooms || (property.baths != null ? String(property.baths) : '—');
  const sqft = property.areaSqFt || property.sqft || '—';
  const address = property.fullAddress || property.location || '—';
  const propType = property.propertyType || property.type || '—';
  const completion = property.completion || '—';
  const furnishing = property.furnishing || '—';
  const view = property.view || '—';
  const listingType = property.listingType || property.status || '—';

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Gallery */}
      <div className="pt-[72px]">
        <PropertyGallery images={imageList} mainImage={property.image} mainAlt={property.alt || property.name} />
      </div>

      {/* Breadcrumb + Title Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/residential" className="hover:text-primary transition-colors">Residential</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground">{property.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                {property.name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 flex items-center gap-1.5">
                <Icon name="MapPinIcon" size={13} className="text-primary" />
                {address}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">{property.price}</p>
              {property.pricePerSqFt && (
                <p className="text-muted-foreground text-xs mt-1">AED {property.pricePerSqFt} / sqft</p>
              )}
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">Ref: {reference}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Strip */}
      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex gap-3 min-w-max md:min-w-0 flex-wrap">
            {beds !== '—' && <StatPill icon="HomeIcon" label="Bedrooms" value={`${beds} Beds`} />}
            {baths !== '—' && <StatPill icon="SparklesIcon" label="Bathrooms" value={`${baths} Baths`} />}
            {sqft !== '—' && <StatPill icon="ArrowsPointingOutIcon" label="Area" value={`${sqft} sqft`} />}
            {propType !== '—' && <StatPill icon="BuildingOfficeIcon" label="Type" value={propType} />}
            {completion !== '—' && <StatPill icon="CheckCircleIcon" label="Status" value={completion} />}
            {view !== '—' && <StatPill icon="EyeIcon" label="View" value={view} />}
            {furnishing !== '—' && <StatPill icon="SwatchIcon" label="Furnishing" value={furnishing} />}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-14">

            {/* Description */}
            {property.description && (
              <div data-observe className="animate-on-scroll space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Overview</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {property.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">{para}</p>
                ))}
              </div>
            )}

            {/* Amenities */}
            {amenityList.length > 0 && (
              <div data-observe className="animate-on-scroll space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Amenities</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {amenityList.map((a, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 border border-border bg-card hover:border-primary/40 transition-colors text-center">
                      <Icon name="CheckCircleIcon" size={18} className="text-primary" />
                      <span className="text-foreground text-xs font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details Table */}
            <div data-observe className="animate-on-scroll space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Property Details</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="border border-border divide-y divide-border">
                {([
                  ['Property Type', propType],
                  ['Listing Type', listingType],
                  ['Completion', completion],
                  ['Bedrooms', beds !== '—' ? `${beds} Bedrooms` : null],
                  ['Bathrooms', baths !== '—' ? `${baths} Bathrooms` : null],
                  ['Area', sqft !== '—' ? `${sqft} sqft` : null],
                  ['View', view !== '—' ? view : null],
                  ['Furnishing', furnishing !== '—' ? furnishing : null],
                  ['Location', property.location || null],
                  ['Community', property.community || null],
                  ['Emirate', property.emirate || null],
                  ['Reference', reference],
                ] as [string, string | null][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex items-center px-5 py-3.5 hover:bg-card transition-colors">
                    <span className="text-muted-foreground text-xs uppercase tracking-widest w-40 flex-shrink-0">{label}</span>
                    <span className="text-foreground text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquiry Form (mobile) */}
            <div className="lg:hidden" data-observe>
              <div className="animate-on-scroll space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Enquire Now</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <AgentCard agentName={property.agent} propertyName={property.name} reference={reference} />
                <EnquiryForm propertyName={property.name} reference={reference} />
              </div>
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <AgentCard agentName={property.agent} propertyName={property.name} reference={reference} />
              <EnquiryForm propertyName={property.name} reference={reference} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp CTA */}
      <a
        href={`https://wa.me/97144000000?text=Hi, I'm interested in ${encodeURIComponent(property.name)} (Ref: ${reference})`}
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
    </main>
  );
}