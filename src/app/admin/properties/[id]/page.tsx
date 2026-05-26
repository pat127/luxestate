'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import jsPDF from 'jspdf';

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

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/properties/${id}`
    : `https://coveestate.com/properties/${id}`;

  const shareTitle = property.title;
  const shareText = `${property.title} — ${property.price_aed ? `AED ${property.price_aed}` : 'Price on Request'} | ${property.location_area || ''}${property.community ? `, ${property.community}` : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
    setShowShareModal(false);
  };

  const handleShareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nView property: ${shareUrl}`)}`, '_blank');
    setShowShareModal(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setShowShareModal(false);
      } catch { /* user cancelled */ }
    }
  };

  const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      const gold = '#c9a84c';
      const dark = '#1a1a1a';
      const mid = '#666666';
      const light = '#999999';
      let y = margin;

      // --- Header ---
      pdf.setFillColor(26, 26, 26);
      pdf.rect(0, 0, pageW, 32, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(gold);
      pdf.text('COVE ESTATES', margin, 20);
      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 200);
      if (property.reference_number) pdf.text(`Ref: ${property.reference_number}`, pageW - margin, 20, { align: 'right' });
      y = 40;

      // --- Hero Image ---
      if (images.length > 0) {
        const heroBase64 = await loadImageAsBase64(images[0]);
        if (heroBase64) {
          const imgH = 80;
          pdf.addImage(heroBase64, 'JPEG', margin, y, contentW, imgH);
          y += imgH + 6;
        }
      }

      // --- Title ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(dark);
      const titleLines = pdf.splitTextToSize(property.title, contentW);
      pdf.text(titleLines, margin, y + 6);
      y += titleLines.length * 8 + 4;

      // --- Location ---
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(mid);
      const loc = [property.location_area, property.community].filter(Boolean).join(', ');
      if (loc) { pdf.text(loc, margin, y + 4); y += 7; }
      if (property.full_address) { pdf.text(property.full_address, margin, y + 4); y += 7; }

      // --- Price ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(gold);
      pdf.text(property.price_aed ? `AED ${property.price_aed}` : 'Price on Request', margin, y + 7);
      y += 12;
      if (property.price_per_sqft) {
        pdf.setFontSize(9);
        pdf.setTextColor(light);
        pdf.text(`AED ${property.price_per_sqft} per sq ft`, margin, y + 2);
        y += 6;
      }

      // --- Gold divider ---
      pdf.setDrawColor(gold);
      pdf.setLineWidth(0.6);
      pdf.line(margin, y + 2, pageW - margin, y + 2);
      y += 8;

      // --- Key Stats row ---
      const stats = [
        property.bedrooms ? `${property.bedrooms} Bedrooms` : null,
        property.bathrooms ? `${property.bathrooms} Bathrooms` : null,
        property.area_sqft ? `${property.area_sqft} sq ft` : null,
        property.property_type || null,
      ].filter(Boolean) as string[];
      if (stats.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(dark);
        pdf.text(stats.join('   •   '), margin, y + 4);
        y += 10;
      }

      // --- Description ---
      if (property.description?.trim()) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(gold);
        pdf.text('DESCRIPTION', margin, y + 6);
        y += 11;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(mid);
        const descLines = pdf.splitTextToSize(property.description, contentW);
        const maxDescLines = 12;
        const trimmedDesc = descLines.slice(0, maxDescLines);
        pdf.text(trimmedDesc, margin, y + 2);
        y += trimmedDesc.length * 4 + 6;
      }

      // --- Property Details ---
      const details = [
        { label: 'Property Type', value: property.property_type },
        { label: 'Listing Type', value: property.listing_type },
        { label: 'Availability', value: property.availability },
        { label: 'Completion', value: property.completion },
        { label: 'Furnishing', value: property.furnishing },
        { label: 'View', value: property.view_type },
        { label: 'Built-up Area', value: property.built_up_area ? `${property.built_up_area} sq ft` : null },
        { label: 'Service Charge', value: property.service_charge },
      ].filter(d => d.value);

      if (details.length > 0) {
        if (y > pageH - 80) { pdf.addPage(); y = margin; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(gold);
        pdf.text('PROPERTY DETAILS', margin, y + 6);
        y += 12;
        pdf.setFontSize(9);
        details.forEach((d) => {
          if (y > pageH - 20) { pdf.addPage(); y = margin; }
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(light);
          pdf.text(d.label, margin, y + 3);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(dark);
          pdf.text(d.value!, pageW - margin, y + 3, { align: 'right' });
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.2);
          pdf.line(margin, y + 6, pageW - margin, y + 6);
          y += 8;
        });
        y += 4;
      }

      // --- Amenities ---
      if (amenities.length > 0) {
        if (y > pageH - 40) { pdf.addPage(); y = margin; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(gold);
        pdf.text('FEATURES & AMENITIES', margin, y + 6);
        y += 12;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(mid);
        const allAmenities = [...amenities];
        if (property.balcony) allAmenities.push('Balcony');
        if (property.maid_room) allAmenities.push('Maid Room');
        if (property.study_room) allAmenities.push('Study Room');
        if (property.private_pool) allAmenities.push('Private Pool');
        if (property.private_garden) allAmenities.push('Private Garden');
        const amenityText = allAmenities.join('  •  ');
        const amenityLines = pdf.splitTextToSize(amenityText, contentW);
        pdf.text(amenityLines, margin, y + 2);
        y += amenityLines.length * 4 + 6;
      }

      // --- Additional images (up to 4) on a new page ---
      if (images.length > 1) {
        pdf.addPage();
        y = margin;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(gold);
        pdf.text('GALLERY', margin, y + 6);
        y += 14;
        const galleryImages = images.slice(1, 5);
        const imgW = (contentW - 4) / 2;
        const imgH = 58;
        for (let i = 0; i < galleryImages.length; i++) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const gx = margin + col * (imgW + 4);
          const gy = y + row * (imgH + 4);
          const base64 = await loadImageAsBase64(galleryImages[i]);
          if (base64) pdf.addImage(base64, 'JPEG', gx, gy, imgW, imgH);
        }
      }

      // --- Agent info on last page ---
      const lastPageY = pdf.internal.pages.length > 1 ? 220 : Math.max(y + 6, pageH - 60);
      if (lastPageY > pageH - 50) {
        pdf.addPage();
        y = margin;
      } else {
        y = lastPageY;
      }

      if (property.agent_name || property.agent_phone || property.agent_email) {
        pdf.setDrawColor(gold);
        pdf.setLineWidth(0.6);
        pdf.line(margin, y, pageW - margin, y);
        y += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(gold);
        pdf.text('CONTACT', margin, y + 2);
        y += 8;
        pdf.setFontSize(10);
        if (property.agent_name) {
          pdf.setTextColor(dark);
          pdf.text(property.agent_name, margin, y + 2);
          y += 6;
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(mid);
        if (property.agent_phone) { pdf.text(property.agent_phone, margin, y + 2); y += 5; }
        if (property.agent_email) { pdf.text(property.agent_email, margin, y + 2); y += 5; }
      }

      // --- Footer ---
      const totalPages = pdf.internal.pages.length - 1;
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFillColor(245, 243, 238);
        pdf.rect(0, pageH - 14, pageW, 14, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(light);
        pdf.text(`© Cove Estates ${new Date().getFullYear()}`, margin, pageH - 5);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
      }

      const slug = property.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'property';
      pdf.save(`${slug}-brochure.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfGenerating(false);
    }
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
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-base font-bold text-foreground">Share Property</h3>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="XMarkIcon" size={18} /></button>
            </div>

            <div className="px-6 pb-4">
              <div className="flex gap-2">
                <input type="text" readOnly value={shareUrl} className="flex-1 bg-secondary border border-border text-xs text-foreground px-3 py-2.5 focus:outline-none focus:border-primary/50" />
                <button onClick={handleCopyLink} className={`px-4 py-2.5 text-xs font-bold transition-colors shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-accent'}`}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">Share via</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleShareWhatsApp} className="flex items-center gap-2.5 px-4 py-3 border border-border text-sm text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  WhatsApp
                </button>
                <button onClick={handleShareEmail} className="flex items-center gap-2.5 px-4 py-3 border border-border text-sm text-foreground hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Icon name="EnvelopeIcon" size={16} className="text-blue-500" />
                  </span>
                  Email
                </button>
              </div>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button onClick={handleNativeShare} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border border-border text-sm text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Icon name="ShareIcon" size={16} className="text-primary" />
                  More sharing options…
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}