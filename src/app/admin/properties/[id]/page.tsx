'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const propertyData: Record<string, any> = {
  '1': {
    id: 1,
    name: 'Obsidian Penthouse',
    referenceNumber: 'LUX-OBS001',
    location: 'Downtown Dubai',
    community: 'Burj Khalifa District',
    fullAddress: 'Level 52, Obsidian Tower, Downtown Dubai, UAE',
    latitude: '25.1972',
    longitude: '55.2744',
    price: 'AED 28,500,000',
    pricePerSqFt: 'AED 3,476',
    serviceCharge: 'AED 85,000/year',
    type: 'Residential',
    propertyType: 'Penthouse',
    listingType: 'For Sale',
    status: 'Available',
    completion: 'Ready',
    availability: 'Available',
    beds: 5,
    baths: 6,
    sqft: '8,200',
    builtUpArea: '8,200',
    plotArea: 'N/A',
    furnishing: 'Furnished',
    view: 'Burj Khalifa View',
    balcony: true,
    maidRoom: true,
    studyRoom: true,
    privatePool: true,
    privateGarden: false,
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Valet Parking', 'Spa', 'Business Center'],
    description: 'Discover this exceptional Obsidian Penthouse nestled in the heart of Downtown Dubai. This stunning property offers an unparalleled living experience with world-class amenities, breathtaking Burj Khalifa views, and meticulous attention to detail. Perfect for discerning buyers seeking the pinnacle of luxury real estate.',
    agent: 'Sarah Mitchell',
    agentPhone: '+971 50 123 4567',
    agentEmail: 'sarah.mitchell@luxestate.com',
    featured: true,
    published: true,
    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_15fed27fb-1772893766018.png", alt: 'Luxury penthouse interior living room', caption: 'Main Living Area' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_19dade3f5-1772296291041.png", alt: 'Penthouse master bedroom', caption: 'Master Bedroom' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_14c0e775d-1775926655552.png", alt: 'Penthouse kitchen', caption: 'Gourmet Kitchen' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_11e0c1171-1773178910220.png", alt: 'Penthouse terrace view', caption: 'Private Terrace' }],

    videoUrl: '',
    virtualTourUrl: '',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20'
  },
  '2': {
    id: 2,
    name: 'Meridian Villa',
    referenceNumber: 'LUX-MER002',
    location: 'Palm Jumeirah',
    community: 'Frond N',
    fullAddress: 'Villa 12, Frond N, Palm Jumeirah, Dubai, UAE',
    latitude: '25.1124',
    longitude: '55.1390',
    price: 'AED 42,000,000',
    pricePerSqFt: 'AED 2,897',
    serviceCharge: 'AED 120,000/year',
    type: 'Residential',
    propertyType: 'Villa',
    listingType: 'For Sale',
    status: 'Under Offer',
    completion: 'Ready',
    availability: 'Under Offer',
    beds: 7,
    baths: 9,
    sqft: '14,500',
    builtUpArea: '14,500',
    plotArea: '18,000',
    furnishing: 'Furnished',
    view: 'Sea View',
    balcony: true,
    maidRoom: true,
    studyRoom: true,
    privatePool: true,
    privateGarden: true,
    amenities: ['Private Beach', 'Swimming Pool', 'Gym', 'Home Cinema', 'Wine Cellar'],
    description: 'An extraordinary beachfront villa on Palm Jumeirah offering unobstructed sea views and the ultimate in luxury living. This 7-bedroom masterpiece features a private beach, infinity pool, and world-class finishes throughout.',
    agent: 'James Carter',
    agentPhone: '+971 50 234 5678',
    agentEmail: 'james.carter@luxestate.com',
    featured: true,
    published: true,
    images: [
    { url: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b9553347-1774335786277.png', alt: 'Modern villa exterior', caption: 'Villa Exterior' },
    { url: "https://images.unsplash.com/photo-1555426104-3a03a4e70b1d", alt: 'Villa pool area', caption: 'Private Pool' }],

    videoUrl: '',
    virtualTourUrl: '',
    createdAt: '2024-02-10',
    updatedAt: '2024-04-05'
  }
};

const statusColors: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Under Offer': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Sold: 'text-red-400 bg-red-400/10 border-red-400/20'
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const property = propertyData[id] || propertyData['1'];

  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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
    // Use window.print with a print-specific stylesheet
    if (typeof window !== 'undefined') {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${property.name} - LuxEstate Brochure</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; }
            .brochure { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #c9a84c; letter-spacing: 2px; }
            .ref { font-size: 12px; color: #666; }
            .hero-img { width: 100%; height: 350px; object-fit: cover; margin-bottom: 30px; }
            .title { font-size: 32px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
            .location { font-size: 16px; color: #666; margin-bottom: 20px; }
            .price { font-size: 28px; font-weight: bold; color: #c9a84c; margin-bottom: 30px; }
            .specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; background: #f8f6f0; padding: 20px; margin-bottom: 30px; }
            .spec { text-align: center; }
            .spec-val { font-size: 20px; font-weight: bold; color: #1a1a1a; }
            .spec-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #c9a84c; border-bottom: 1px solid #e5e0d5; padding-bottom: 8px; margin-bottom: 16px; margin-top: 30px; }
            .description { font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 20px; }
            .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
            .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0ece4; }
            .detail-label { font-size: 12px; color: #888; }
            .detail-value { font-size: 12px; font-weight: 600; color: #1a1a1a; }
            .amenities { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
            .amenity { padding: 4px 12px; background: #f8f6f0; border: 1px solid #e5e0d5; font-size: 11px; color: #444; }
            .images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px; }
            .thumb-img { width: 100%; height: 120px; object-fit: cover; }
            .agent-section { background: #1a1a1a; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
            .agent-name { font-size: 16px; font-weight: bold; color: #c9a84c; }
            .agent-contact { font-size: 12px; color: #aaa; margin-top: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e0d5; font-size: 11px; color: #aaa; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="brochure">
            <div class="header">
              <div class="logo">LUXESTATE</div>
              <div class="ref">Ref: ${property.referenceNumber}</div>
            </div>
            <img class="hero-img" src="${property.images[0]?.url}" alt="${property.images[0]?.alt}" />
            <div class="title">${property.name}</div>
            <div class="location">📍 ${property.location}, ${property.community}</div>
            <div class="price">${property.price}</div>
            <div class="specs">
              ${property.beds ? `<div class="spec"><div class="spec-val">${property.beds}</div><div class="spec-lbl">Bedrooms</div></div>` : ''}
              ${property.baths ? `<div class="spec"><div class="spec-val">${property.baths}</div><div class="spec-lbl">Bathrooms</div></div>` : ''}
              <div class="spec"><div class="spec-val">${property.sqft}</div><div class="spec-lbl">Sq Ft</div></div>
              <div class="spec"><div class="spec-val">${property.pricePerSqFt}</div><div class="spec-lbl">Per Sq Ft</div></div>
            </div>
            <div class="section-title">Property Description</div>
            <div class="description">${property.description}</div>
            <div class="section-title">Property Details</div>
            <div class="details-grid">
              <div class="detail-item"><span class="detail-label">Property Type</span><span class="detail-value">${property.propertyType}</span></div>
              <div class="detail-item"><span class="detail-label">Listing Type</span><span class="detail-value">${property.listingType}</span></div>
              <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${property.status}</span></div>
              <div class="detail-item"><span class="detail-label">Completion</span><span class="detail-value">${property.completion}</span></div>
              <div class="detail-item"><span class="detail-label">Furnishing</span><span class="detail-value">${property.furnishing}</span></div>
              <div class="detail-item"><span class="detail-label">View</span><span class="detail-value">${property.view}</span></div>
              <div class="detail-item"><span class="detail-label">Built-up Area</span><span class="detail-value">${property.builtUpArea} sq ft</span></div>
              <div class="detail-item"><span class="detail-label">Service Charge</span><span class="detail-value">${property.serviceCharge}</span></div>
            </div>
            <div class="section-title">Amenities & Features</div>
            <div class="amenities">
              ${property.amenities.map((a: string) => `<span class="amenity">${a}</span>`).join('')}
              ${property.balcony ? '<span class="amenity">Balcony</span>' : ''}
              ${property.maidRoom ? '<span class="amenity">Maid Room</span>' : ''}
              ${property.studyRoom ? '<span class="amenity">Study Room</span>' : ''}
              ${property.privatePool ? '<span class="amenity">Private Pool</span>' : ''}
              ${property.privateGarden ? '<span class="amenity">Private Garden</span>' : ''}
            </div>
            ${property.images.length > 1 ? `
            <div class="section-title">Gallery</div>
            <div class="images-grid">
              ${property.images.slice(1).map((img: any) => `<img class="thumb-img" src="${img.url}" alt="${img.alt}" />`).join('')}
            </div>` : ''}
            <div class="section-title">Location</div>
            <div class="details-grid">
              <div class="detail-item"><span class="detail-label">Area</span><span class="detail-value">${property.location}</span></div>
              <div class="detail-item"><span class="detail-label">Community</span><span class="detail-value">${property.community}</span></div>
              <div class="detail-item" style="grid-column: span 2"><span class="detail-label">Full Address</span><span class="detail-value">${property.fullAddress}</span></div>
            </div>
            <div class="agent-section">
              <div>
                <div class="agent-name">${property.agent}</div>
                <div class="agent-contact">${property.agentPhone} · ${property.agentEmail}</div>
              </div>
              <div style="text-align: right; color: #c9a84c; font-size: 18px; font-weight: bold;">LUXESTATE</div>
            </div>
            <div class="footer">
              This brochure is for informational purposes only. All details are subject to change. © LuxEstate ${new Date().getFullYear()}
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      }
    }
    setTimeout(() => setPdfGenerating(false), 1500);
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/admin/properties')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          
          <Icon name="ArrowLeftIcon" size={16} />
          Back to Properties
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            
            <Icon name="ShareIcon" size={13} />
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors disabled:opacity-60">
            
            <Icon name="DocumentArrowDownIcon" size={13} />
            {pdfGenerating ? 'Generating...' : 'PDF Brochure'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PencilIcon" size={13} />
            Edit Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images + Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image Gallery */}
          <div className="bg-card border border-border overflow-hidden">
            <div className="relative h-80 overflow-hidden">
              <AppImage
                src={property.images[activeImage]?.url || property.images[0]?.url}
                alt={property.images[activeImage]?.alt || property.name}
                fill
                className="object-cover"
                sizes="800px" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
                  {property.propertyType}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusColors[property.status] || ''}`}>
                  {property.status}
                </span>
              </div>
              {property.images.length > 1 &&
              <>
                  <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + property.images.length) % property.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                  
                    <Icon name="ChevronLeftIcon" size={16} />
                  </button>
                  <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % property.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                  
                    <Icon name="ChevronRightIcon" size={16} />
                  </button>
                </>
              }
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1">
                {activeImage + 1} / {property.images.length}
              </div>
            </div>
            {property.images.length > 1 &&
            <div className="flex gap-2 p-3 overflow-x-auto">
                {property.images.map((img: any, idx: number) =>
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}>
                
                    <AppImage src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
                  </button>
              )}
              </div>
            }
          </div>

          {/* Title + Price */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{property.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Icon name="MapPinIcon" size={13} className="text-primary" />
                  {property.location}, {property.community}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{property.fullAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{property.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{property.pricePerSqFt} / sq ft</p>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-3 border-t border-border">
              {property.beds &&
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Icon name="HomeIcon" size={14} className="text-primary" />
                  <span className="font-semibold">{property.beds}</span>
                  <span className="text-muted-foreground">Beds</span>
                </div>
              }
              {property.baths &&
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Icon name="SparklesIcon" size={14} className="text-primary" />
                  <span className="font-semibold">{property.baths}</span>
                  <span className="text-muted-foreground">Baths</span>
                </div>
              }
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Icon name="ArrowsPointingOutIcon" size={14} className="text-primary" />
                <span className="font-semibold">{property.sqft}</span>
                <span className="text-muted-foreground">sq ft</span>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Ref: <span className="text-foreground font-medium">{property.referenceNumber}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</h2>
            <p className="text-sm text-foreground leading-relaxed">{property.description}</p>
          </div>

          {/* Property Details Grid */}
          <div className="bg-card border border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-0">
              {[
              { label: 'Property Type', value: property.propertyType },
              { label: 'Listing Type', value: property.listingType },
              { label: 'Availability', value: property.availability },
              { label: 'Completion', value: property.completion },
              { label: 'Furnishing', value: property.furnishing },
              { label: 'View', value: property.view },
              { label: 'Built-up Area', value: `${property.builtUpArea} sq ft` },
              { label: 'Plot Area', value: property.plotArea !== 'N/A' ? `${property.plotArea} sq ft` : 'N/A' },
              { label: 'Service Charge', value: property.serviceCharge },
              { label: 'Category', value: property.type }].
              map(({ label, value }) =>
              <div key={label} className="flex justify-between py-2.5 border-b border-border">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              )}
            </div>
          </div>

          {/* Features & Amenities */}
          <div className="bg-card border border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Features & Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a: string) =>
              <span key={a} className="px-3 py-1.5 text-xs border border-primary/30 text-primary bg-primary/5">{a}</span>
              )}
              {property.balcony && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Balcony</span>}
              {property.maidRoom && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Maid Room</span>}
              {property.studyRoom && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Study Room</span>}
              {property.privatePool && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Private Pool</span>}
              {property.privateGarden && <span className="px-3 py-1.5 text-xs border border-border text-foreground">Private Garden</span>}
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Location</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Area</p>
                <p className="text-sm font-semibold text-foreground">{property.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Community</p>
                <p className="text-sm font-semibold text-foreground">{property.community}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Full Address</p>
                <p className="text-sm font-semibold text-foreground">{property.fullAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
                <p className="text-sm font-semibold text-foreground">{property.latitude}, {property.longitude}</p>
              </div>
            </div>
            <div className="h-40 bg-[#1a1a1a] border border-border flex items-center justify-center">
              <div className="text-center">
                <Icon name="MapPinIcon" size={24} className="text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Media */}
          {(property.videoUrl || property.virtualTourUrl) &&
          <div className="bg-card border border-border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Media</h2>
              <div className="flex gap-3">
                {property.videoUrl &&
              <a href={property.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    <Icon name="PlayCircleIcon" size={14} className="text-primary" />
                    Watch Video
                  </a>
              }
                {property.virtualTourUrl &&
              <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    <Icon name="CubeTransparentIcon" size={14} className="text-primary" />
                    Virtual Tour
                  </a>
              }
              </div>
            </div>
          }
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
              { label: 'Listed', value: property.createdAt },
              { label: 'Last Updated', value: property.updatedAt },
              { label: 'Featured', value: property.featured ? 'Yes' : 'No' },
              { label: 'Published', value: property.published ? 'Live' : 'Draft' }].
              map(({ label, value }) =>
              <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Card */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Listing Agent</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Icon name="UserIcon" size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{property.agent}</p>
                <p className="text-xs text-muted-foreground">Senior Property Consultant</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`tel:${property.agentPhone}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="PhoneIcon" size={12} className="text-primary" />
                {property.agentPhone}
              </a>
              <a href={`mailto:${property.agentEmail}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="EnvelopeIcon" size={12} className="text-primary" />
                {property.agentEmail}
              </a>
            </div>
            <button className="w-full mt-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
              Contact Agent
            </button>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                
                <Icon name="ShareIcon" size={13} className="text-primary" />
                Share Property
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-60">
                
                <Icon name="DocumentArrowDownIcon" size={13} className="text-primary" />
                {pdfGenerating ? 'Generating PDF...' : 'Download PDF Brochure'}
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="PencilIcon" size={13} className="text-primary" />
                Edit Property
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-red-400/20 text-xs text-red-400 hover:bg-red-400/5 transition-colors">
                <Icon name="TrashIcon" size={13} />
                Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-[#12151f] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Share Property</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">Share this property listing via:</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
            { label: 'WhatsApp', icon: 'ChatBubbleLeftRightIcon', color: 'text-emerald-400', href: `https://wa.me/?text=${encodeURIComponent(property.name + ' - ' + property.price + ' | ' + shareUrl)}` },
            { label: 'Email', icon: 'EnvelopeIcon', color: 'text-blue-400', href: `mailto:?subject=${encodeURIComponent(property.name)}&body=${encodeURIComponent('Check out this property: ' + shareUrl)}` },
            { label: 'LinkedIn', icon: 'GlobeAltIcon', color: 'text-sky-400', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` }].
            map(({ label, icon, color, href }) =>
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 border border-[#2a3040] hover:border-[#c9a84c]/40 transition-colors">
                  <Icon name={icon as any} size={20} className={color} />
                  <span className="text-xs text-gray-300">{label}</span>
                </a>
            )}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Or copy link:</p>
              <div className="flex gap-2">
                <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              
                <button
                onClick={handleCopyLink}
                className={`px-4 py-2 text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`}>
                
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c9a84c]/40 text-sm text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-60">
            
              <Icon name="DocumentArrowDownIcon" size={14} />
              {pdfGenerating ? 'Generating...' : 'Download PDF Brochure'}
            </button>
          </div>
        </div>
      }
    </div>);

}