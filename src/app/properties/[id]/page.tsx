'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { trackPropertyView, trackInquirySubmission } from '@/lib/analytics';
import { useCMS } from '@/contexts/CMSContext';

// ─── Gallery ──────────────────────────────────────────────────────────────────
function PropertyGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div className="relative w-full bg-card border-b border-border flex items-center justify-center" style={{ height: 'clamp(320px, 60vh, 680px)' }}>
        <Icon name="PhotoIcon" size={48} className="text-muted-foreground" />
      </div>
    );
  }
  return (
    <section className="relative">
      <div className="relative w-full" style={{ height: 'clamp(320px, 60vh, 680px)' }}>
        <AppImage src={images[active]} alt={`Property image ${active + 1}`} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {images.length > 1 && (
          <>
            <button onClick={() => setActive((a) => (a - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
              <Icon name="ChevronLeftIcon" size={18} />
            </button>
            <button onClick={() => setActive((a) => (a + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all">
              <Icon name="ChevronRightIcon" size={18} />
            </button>
          </>
        )}
        <div className="absolute top-24 md:bottom-6 md:top-auto right-4 md:right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-2 border border-white/20">
          <Icon name="PhotoIcon" size={14} />{images.length} Photo{images.length !== 1 ? 's' : ''}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`relative flex-shrink-0 w-20 h-14 border-2 transition-all duration-300 overflow-hidden ${active === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
              <AppImage src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

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

// ─── Location Map ─────────────────────────────────────────────────────────────
function LocationMap({ locationArea, community, emirate }: { locationArea?: string; community?: string; emirate?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [pinPos, setPinPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
  const zoom = 14;

  useEffect(() => {
    const query = [community, locationArea, emirate, 'UAE'].filter(Boolean).join(', ');
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ae&accept-language=en`, {
      headers: { 'Accept-Language': 'en' },
    })
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setPinPos({ lat, lng });
          setMapCenter({ lat, lng });
        }
      })
      .catch(() => {});
  }, [locationArea, community, emirate]);

  const lat2tile = (lat: number, z: number) =>
    Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
  const lng2tile = (lng: number, z: number) =>
    Math.floor((lng + 180) / 360 * Math.pow(2, z));

  const latLngToPixel = (lat: number, lng: number, cLat: number, cLng: number, z: number, w: number, h: number) => {
    const scale = Math.pow(2, z) * 256;
    const toX = (l: number) => (l + 180) / 360 * scale;
    const toY = (l: number) => {
      const s = Math.sin(l * Math.PI / 180);
      return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale;
    };
    return { x: toX(lng) - toX(cLng) + w / 2, y: toY(lat) - toY(cLat) + h / 2 };
  };

  const mapW = 600;
  const mapH = 300;
  const centerTileX = lng2tile(mapCenter.lng, zoom);
  const centerTileY = lat2tile(mapCenter.lat, zoom);
  const pinPixel = pinPos ? latLngToPixel(pinPos.lat, pinPos.lng, mapCenter.lat, mapCenter.lng, zoom, mapW, mapH) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Location</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div
        ref={mapRef}
        className="relative border border-border overflow-hidden bg-secondary"
        style={{ height: 300 }}
      >
        {/* OSM Tiles */}
        <div className="absolute inset-0 pointer-events-none">
          {[-1, 0, 1].map((dy) =>
            [-1, 0, 1].map((dx) => {
              const tx = centerTileX + dx;
              const ty = centerTileY + dy;
              const tileSize = 256;
              const tileLeft = mapW / 2 + dx * tileSize - (mapW / 2 % tileSize);
              const tileTop = mapH / 2 + dy * tileSize - (mapH / 2 % tileSize);
              return (
                <img
                  key={`${dx}-${dy}`}
                  src={`https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${zoom}/${tx}/${ty}.png`}
                  alt=""
                  style={{ position: 'absolute', left: tileLeft, top: tileTop, width: tileSize, height: tileSize }}
                />
              );
            })
          )}
        </div>

        {/* Pin */}
        {pinPixel && (
          <div
            className="absolute pointer-events-none z-10"
            style={{ left: pinPixel.x - 14, top: pinPixel.y - 36 }}
          >
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-primary border-2 border-white rounded-full shadow-xl flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <div className="w-0.5 h-5 bg-primary" />
            </div>
          </div>
        )}

        {/* Location label */}
        {(locationArea || community) && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 pointer-events-none flex items-center gap-1.5">
            <Icon name="MapPinIcon" size={11} className="text-primary" />
            {[community, locationArea].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agentName, propertyName, reference, companyName, phone, whatsapp }: { agentName: string; propertyName: string; reference: string; companyName?: string; phone?: string; whatsapp?: string }) {
  const waDigits = (whatsapp || phone || '+971508862683').replace(/[^0-9]/g, '');
  const telHref = `tel:${(phone || '+971508862683').replace(/\s/g, '')}`;
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon name="UserCircleIcon" size={28} className="text-primary" />
        </div>
        <div>
          <p className="text-foreground font-bold text-sm">{agentName || `${companyName || 'Cove Estates'} Agent`}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Property Consultant</p>
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Ref: {reference}</p>
        </div>
      </div>
      <div className="space-y-2">
        <a href={telHref} className="flex items-center gap-3 w-full px-4 py-2.5 border border-border bg-background hover:border-primary/40 transition-colors text-sm text-foreground">
          <Icon name="PhoneIcon" size={14} className="text-primary" />Call Agent
        </a>
        <a href={`https://wa.me/${waDigits}?text=Hi, I'm interested in ${encodeURIComponent(propertyName)} (Ref: ${reference})`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent transition-colors text-sm font-bold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}

function EnquiryForm({ propertyName, reference, propertyId }: { propertyName: string; reference: string; propertyId: string }) {
  const supabase = createClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: `I'm interested in ${propertyName} (Ref: ${reference}). Please contact me.` });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      source: 'Website',
      status: 'New',
      interest: propertyName,
      notes: form.message,
    });
    trackInquirySubmission({
      formType: 'property_enquiry',
      propertyId,
      propertyName,
      source: 'property_detail',
    });
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <Icon name="CheckCircleIcon" size={32} className="text-primary mx-auto" />
        <h3 className="text-foreground font-bold">Enquiry Sent</h3>
        <p className="text-muted-foreground text-sm">We will contact you shortly regarding {propertyName}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Enquire About This Property</h3>
      <input required className="w-full bg-background border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input type="email" required className="w-full bg-background border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full bg-background border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <textarea rows={3} className="w-full bg-background border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-accent transition-colors disabled:opacity-60">
        {submitting ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  const { branding } = useCMS();

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    supabase.from('properties').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); } else {
        setProperty(data);
        trackPropertyView({
          propertyId: id,
          propertyName: data.name || data.title || 'Unknown Property',
          propertyType: data.property_type,
          location: data.location_area || data.community,
          price: data.price,
          listingType: data.listing_type || data.availability,
        });
      }
      setLoading(false);
    });
  }, [id]);

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
              Browse All Properties<Icon name="ArrowRightIcon" size={14} />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const imageList: string[] = Array.isArray(property.image_urls)
    ? property.image_urls
    : typeof property.image_urls === 'string'
      ? property.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];

  const amenityList: string[] = property.amenities
    ? property.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
    : [];

  const reference = property.reference_number || `REF-${id.slice(0, 8).toUpperCase()}`;
  const beds = property.bedrooms || '—';
  const baths = property.bathrooms || '—';
  const sqft = property.area_sqft || '—';
  const address = property.full_address || property.location_area || '—';
  const propType = property.property_type || '—';
  const completion = property.completion || '—';
  const furnishing = property.furnishing || '—';
  const view = property.view_type || '—';
  const listingType = property.listing_type || property.availability || '—';

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <div className="pt-[112px] md:pt-[96px]">
        <PropertyGallery images={imageList} />
      </div>

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/residential" className="hover:text-primary transition-colors">Residential</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground">{property.title}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-4xl font-black text-foreground tracking-tight leading-tight">{property.title}</h1>
              <p className="text-muted-foreground text-sm mt-1.5 flex items-center gap-1.5">
                <Icon name="MapPinIcon" size={13} className="text-primary" />{address}
              </p>
            </div>
            <div className="text-left md:text-right flex-shrink-0">
              <p className="text-2xl md:text-4xl font-black text-primary tracking-tight">
                {property.price_aed ? `AED ${Number(property.price_aed).toLocaleString()}` : 'Price on Request'}
              </p>
              {property.price_per_sqft && <p className="text-muted-foreground text-xs mt-1">AED {Number(property.price_per_sqft).toLocaleString()} / sqft</p>}
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5">Ref: {reference}</p>
            </div>
          </div>
        </div>
      </div>

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

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-14">
            {property.description && property.description.trim() && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Overview</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {property.description.split('\n\n').map((para: string, i: number) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">{para}</p>
                ))}
              </div>
            )}

            {amenityList.length > 0 && (
              <div className="space-y-5">
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

            <div className="space-y-5">
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
                  ['Location', property.location_area || null],
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

            {/* Location Map */}
            {(property.location_area || property.community || property.emirate) && (
              <LocationMap
                locationArea={property.location_area}
                community={property.community}
                emirate={property.emirate}
              />
            )}

            <div className="lg:hidden space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Enquire Now</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <AgentCard agentName={property.agent_name || ''} propertyName={property.title} reference={reference} companyName={branding?.company_name} phone={branding?.phone} whatsapp={branding?.whatsapp} />
              <EnquiryForm propertyName={property.title} reference={reference} propertyId={id} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <AgentCard agentName={property.agent_name || ''} propertyName={property.title} reference={reference} companyName={branding?.company_name} phone={branding?.phone} whatsapp={branding?.whatsapp} />
              <EnquiryForm propertyName={property.title} reference={reference} propertyId={id} />
            </div>
          </div>
        </div>
      </div>

      <a href={`https://wa.me/97144000000?text=Hi, I'm interested in ${encodeURIComponent(property.title)} (Ref: ${reference})`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 shadow-2xl hover:bg-accent transition-all duration-300" aria-label="Chat on WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        <span className="text-xs font-black uppercase tracking-widest">Enquire on WhatsApp</span>
      </a>

      <Footer />
    </main>
  );
}