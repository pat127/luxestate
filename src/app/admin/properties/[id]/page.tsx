'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

const statusColors: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Under Offer': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Sold: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const supabase = createClient();

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).single().then(({ data }) => {
      setProperty(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <button onClick={() => router.push('/admin/properties')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <Icon name="ArrowLeftIcon" size={16} />Back to Properties
        </button>
        <p className="text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  const images: string[] = property.image_urls
    ? property.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
    : [];

  const amenities: string[] = property.amenities
    ? property.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
    : [];

  const shareUrl = `https://luxestate6357.builtwithrocket.new/properties/${id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownloadPDF = () => {
    setPdfGenerating(true);
    if (typeof window !== 'undefined') {
      const printContent = `<!DOCTYPE html><html><head><title>${property.title} - Brochure</title>
        <style>* { margin:0;padding:0;box-sizing:border-box; } body { font-family:Georgia,serif;color:#1a1a1a;background:#fff; }
        .brochure { max-width:800px;margin:0 auto;padding:40px; }
        .header { display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #c9a84c;padding-bottom:20px;margin-bottom:30px; }
        .logo { font-size:24px;font-weight:bold;color:#c9a84c;letter-spacing:2px; }
        .hero-img { width:100%;height:350px;object-fit:cover;margin-bottom:30px; }
        .title { font-size:32px;font-weight:bold;margin-bottom:8px; }
        .price { font-size:28px;font-weight:bold;color:#c9a84c;margin-bottom:20px; }
        .section-title { font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;border-bottom:1px solid #e5e0d5;padding-bottom:8px;margin:24px 0 12px; }
        .description { font-size:14px;line-height:1.8;color:#444; }
        .footer { text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e0d5;font-size:11px;color:#aaa; }
        @media print { body { print-color-adjust:exact;-webkit-print-color-adjust:exact; } }</style></head>
        <body><div class="brochure">
        <div class="header"><div class="logo">COVE ESTATES</div><div>Ref: ${property.reference_number || ''}</div></div>
        ${images[0] ? `<img class="hero-img" src="${images[0]}" alt="${property.title}" />` : ''}
        <div class="title">${property.title}</div>
        <div style="color:#666;margin-bottom:12px">📍 ${property.location_area || ''}, ${property.community || ''}</div>
        <div class="price">AED ${property.price_aed || 'Price on Request'}</div>
        <div class="section-title">Description</div>
        <div class="description">${property.description || ''}</div>
        <div class="footer">© Cove Estates ${new Date().getFullYear()}</div>
        </div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body></html>`;
      const w = window.open('', '_blank');
      if (w) { w.document.write(printContent); w.document.close(); }
    }
    setTimeout(() => setPdfGenerating(false), 1500);
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/admin/properties')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeftIcon" size={16} />Back to Properties
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Icon name="ShareIcon" size={13} />Share
          </button>
          <button onClick={handleDownloadPDF} disabled={pdfGenerating} className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors disabled:opacity-60">
            <Icon name="DocumentArrowDownIcon" size={13} />{pdfGenerating ? 'Generating...' : 'PDF Brochure'}
          </button>
          <button onClick={() => router.push('/admin/properties')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PencilIcon" size={13} />Edit Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Gallery */}
          <div className="bg-card border border-border overflow-hidden">
            <div className="relative h-80 overflow-hidden">
              {images.length > 0 ? (
                <AppImage src={images[activeImage] || images[0]} alt={property.title} fill className="object-cover" sizes="800px" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Icon name="HomeIcon" size={48} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{property.property_type}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusColors[property.availability] || ''}`}>{property.availability}</span>
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                    <Icon name="ChevronLeftIcon" size={16} />
                  </button>
                  <button onClick={() => setActiveImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                    <Icon name="ChevronRightIcon" size={16} />
                  </button>
                </>
              )}
              {images.length > 0 && <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1">{activeImage + 1} / {images.length}</div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}>
                    <AppImage src={img} alt={`Image ${idx + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Price */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Icon name="MapPinIcon" size={13} className="text-primary" />
                  {property.location_area}{property.community ? `, ${property.community}` : ''}
                </p>
                {property.full_address && <p className="text-xs text-muted-foreground mt-0.5">{property.full_address}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{property.price_aed ? `AED ${property.price_aed}` : 'Price on Request'}</p>
                {property.price_per_sqft && <p className="text-xs text-muted-foreground mt-1">AED {property.price_per_sqft} / sq ft</p>}
              </div>
            </div>
            <div className="flex items-center gap-6 pt-3 border-t border-border">
              {property.bedrooms && <div className="flex items-center gap-1.5 text-sm text-foreground"><Icon name="HomeIcon" size={14} className="text-primary" /><span className="font-semibold">{property.bedrooms}</span><span className="text-muted-foreground">Beds</span></div>}
              {property.bathrooms && <div className="flex items-center gap-1.5 text-sm text-foreground"><Icon name="SparklesIcon" size={14} className="text-primary" /><span className="font-semibold">{property.bathrooms}</span><span className="text-muted-foreground">Baths</span></div>}
              {property.area_sqft && <div className="flex items-center gap-1.5 text-sm text-foreground"><Icon name="ArrowsPointingOutIcon" size={14} className="text-primary" /><span className="font-semibold">{property.area_sqft}</span><span className="text-muted-foreground">sq ft</span></div>}
              {property.reference_number && <div className="ml-auto text-xs text-muted-foreground">Ref: <span className="text-foreground font-medium">{property.reference_number}</span></div>}
            </div>
          </div>

          {/* Description */}
          {property.description && property.description.trim() && (
            <div className="bg-card border border-border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</h2>
              <p className="text-sm text-foreground leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="bg-card border border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-0">
              {[
                { label: 'Property Type', value: property.property_type },
                { label: 'Listing Type', value: property.listing_type },
                { label: 'Availability', value: property.availability },
                { label: 'Completion', value: property.completion },
                { label: 'Furnishing', value: property.furnishing },
                { label: 'View', value: property.view_type },
                { label: 'Built-up Area', value: property.built_up_area ? `${property.built_up_area} sq ft` : null },
                { label: 'Service Charge', value: property.service_charge },
                { label: 'Category', value: property.prop_category },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-card border border-border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Features & Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => <span key={a} className="px-3 py-1.5 text-xs border border-primary/30 text-primary bg-primary/5">{a}</span>)}
                {property.balcony && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Balcony</span>}
                {property.maid_room && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Maid Room</span>}
                {property.study_room && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Study Room</span>}
                {property.private_pool && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Private Pool</span>}
                {property.private_garden && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Private Garden</span>}
              </div>
            </div>
          )}

          {/* Media links */}
          {(property.video_url || property.virtual_tour_url) && (
            <div className="bg-card border border-border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Media</h2>
              <div className="flex gap-3">
                {property.video_url && <a href={property.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="PlayCircleIcon" size={14} className="text-primary" />Watch Video</a>}
                {property.virtual_tour_url && <a href={property.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="CubeTransparentIcon" size={14} className="text-primary" />Virtual Tour</a>}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Listed', value: property.created_at ? new Date(property.created_at).toLocaleDateString('en-GB') : '—' },
                { label: 'Featured', value: property.featured ? 'Yes' : 'No' },
                { label: 'Published', value: property.published ? 'Live' : 'Draft' },
                { label: 'Emirate', value: property.emirate || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {(property.agent_name || property.agent_phone || property.agent_email) && (
            <div className="bg-card border border-border p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Listing Agent</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="UserIcon" size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{property.agent_name || 'Agent'}</p>
                  <p className="text-xs text-muted-foreground">Property Consultant</p>
                </div>
              </div>
              <div className="space-y-2">
                {property.agent_phone && <a href={`tel:${property.agent_phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"><Icon name="PhoneIcon" size={12} className="text-primary" />{property.agent_phone}</a>}
                {property.agent_email && <a href={`mailto:${property.agent_email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"><Icon name="EnvelopeIcon" size={12} className="text-primary" />{property.agent_email}</a>}
              </div>
            </div>
          )}

          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setShowShareModal(true)} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="ShareIcon" size={13} className="text-primary" />Share Property
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfGenerating} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-60">
                <Icon name="DocumentArrowDownIcon" size={13} className="text-primary" />{pdfGenerating ? 'Generating...' : 'Download PDF Brochure'}
              </button>
              <button onClick={() => router.push('/admin/properties')} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="PencilIcon" size={13} className="text-primary" />Edit Property
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-[#12151f] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Share Property</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white transition-colors"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              <button onClick={handleCopyLink} className={`px-4 py-2 text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}