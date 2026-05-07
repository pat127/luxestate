'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const PROJECTS_STORAGE_KEY = 'admin_projects';

// Seed/fallback data for projects 1 and 2
const seedProjectDetails: Record<string, any> = {
  '1': {
    id: 1,
    name: 'Skyline Residences',
    developer: 'Emaar',
    location: 'Downtown Dubai',
    community: 'Burj Khalifa District',
    subCommunity: 'Tower A',
    fullAddress: 'Skyline Residences, Downtown Dubai, UAE',
    latitude: '25.1972',
    longitude: '55.2744',
    type: 'Off-Plan',
    status: 'Active',
    units: 240,
    sold: 180,
    available: 60,
    completion: 'Q4 2026',
    price: 'AED 1.2M+',
    minBedrooms: 1,
    maxBedrooms: 4,
    sizeRange: '650 - 3,200 sq ft',
    description: 'Skyline Residences is a landmark development by Emaar in the heart of Downtown Dubai. Offering stunning views of the Burj Khalifa and Dubai Fountain, this iconic tower features meticulously designed residences with premium finishes and world-class amenities.',
    propertyTypes: ['Apartment', 'Penthouse', 'Studio'],
    amenities: ['Swimming Pool', 'Gym', 'Kids Play Area', 'Concierge', 'Security', 'Parking', 'Retail'],
    unitTypes: [
      { name: 'Studio', size: '450 - 650 sq ft', price: 'AED 1.2M' },
      { name: '1 Bedroom', size: '750 - 1,100 sq ft', price: 'AED 1.8M' },
      { name: '2 Bedroom', size: '1,200 - 1,800 sq ft', price: 'AED 2.9M' },
      { name: '3 Bedroom', size: '1,900 - 2,500 sq ft', price: 'AED 4.5M' },
      { name: 'Penthouse', size: '3,000 - 3,200 sq ft', price: 'AED 8.5M' },
    ],
    paymentPlanSummary: '60/40 payment plan with flexible installments during construction',
    postHandoverPlan: '40% over 3 years post-handover',
    milestones: [
      { label: 'On Booking', percentage: '10%', dueDate: 'Immediately' },
      { label: 'On SPA Signing', percentage: '10%', dueDate: '30 days' },
      { label: 'During Construction', percentage: '40%', dueDate: 'Q4 2024 - Q2 2026' },
      { label: 'On Handover', percentage: '10%', dueDate: 'Q4 2026' },
      { label: 'Post Handover', percentage: '30%', dueDate: '2027 - 2029' },
    ],
    images: [
      { url: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d4a4c643-1772201743362.png', alt: 'Modern residential tower exterior', caption: 'Tower Exterior' },
      { url: 'https://images.unsplash.com/photo-1632365627904-2167bf5c9f14', alt: 'Lobby interior', caption: 'Grand Lobby' },
      { url: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b16b7625-1768316070451.png', alt: 'Swimming pool amenity', caption: 'Infinity Pool' },
    ],
    floorPlans: [
      { url: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c56853fb-1774155639670.png', label: '1BR Floor Plan' },
      { url: 'https://img.rocket.new/generatedImages/rocket_gen_img_19f1308ff-1764924314067.png', label: '2BR Floor Plan' },
    ],
    masterPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    factsheetUrl: '',
    priceListUrl: '',
    featured: true,
    published: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-04-15',
  },
  '2': {
    id: 2,
    name: 'Marina Bay Towers',
    developer: 'DAMAC',
    location: 'Dubai Marina',
    community: 'Marina Walk',
    subCommunity: '',
    fullAddress: 'Marina Bay Towers, Dubai Marina, UAE',
    latitude: '25.0657',
    longitude: '55.1403',
    type: 'Off-Plan',
    status: 'Active',
    units: 320,
    sold: 210,
    available: 110,
    completion: 'Q2 2027',
    price: 'AED 900K+',
    minBedrooms: 0,
    maxBedrooms: 3,
    sizeRange: '400 - 2,200 sq ft',
    description: 'Marina Bay Towers by DAMAC offers a premium waterfront lifestyle in Dubai Marina. With breathtaking marina views and direct access to the promenade, these residences redefine luxury living.',
    propertyTypes: ['Apartment', 'Studio', 'Duplex'],
    amenities: ['Swimming Pool', 'Gym', 'Beach Access', 'Concierge', 'Parking', 'Retail'],
    unitTypes: [
      { name: 'Studio', size: '400 - 550 sq ft', price: 'AED 900K' },
      { name: '1 Bedroom', size: '700 - 950 sq ft', price: 'AED 1.5M' },
      { name: '2 Bedroom', size: '1,100 - 1,600 sq ft', price: 'AED 2.4M' },
      { name: '3 Bedroom', size: '1,800 - 2,200 sq ft', price: 'AED 3.8M' },
    ],
    paymentPlanSummary: '70/30 payment plan',
    postHandoverPlan: '30% over 2 years',
    milestones: [
      { label: 'On Booking', percentage: '10%', dueDate: 'Immediately' },
      { label: 'During Construction', percentage: '60%', dueDate: '2025 - 2026' },
      { label: 'On Handover', percentage: '10%', dueDate: 'Q2 2027' },
      { label: 'Post Handover', percentage: '20%', dueDate: '2027 - 2029' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1624268638085-483818378fbe', alt: 'Marina bay towers', caption: 'Tower Exterior' },
    ],
    floorPlans: [],
    masterPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    factsheetUrl: '',
    priceListUrl: '',
    featured: false,
    published: true,
    createdAt: '2024-02-20',
    updatedAt: '2024-04-10',
  },
};

function loadProjectById(id: string): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      const projects: any[] = JSON.parse(stored);
      const found = projects.find((p) => String(p.id) === id);
      if (found) {
        // Normalize images field: stored projects may have image (string) instead of images (array)
        if (!found.images || !Array.isArray(found.images) || found.images.length === 0) {
          if (found.image) {
            found.images = [{ url: found.image, alt: found.alt || found.name, caption: '' }];
          } else {
            found.images = [];
          }
        }
        if (!found.floorPlans) found.floorPlans = [];
        if (!found.unitTypes) found.unitTypes = [];
        if (!found.amenities) found.amenities = [];
        if (!found.propertyTypes) found.propertyTypes = [];
        if (!found.milestones) found.milestones = [];
        if (!found.community) found.community = found.location || '';
        if (!found.available) found.available = (found.units || 0) - (found.sold || 0);
        if (found.minBedrooms === undefined) found.minBedrooms = 0;
        if (found.maxBedrooms === undefined) found.maxBedrooms = 0;
        if (!found.sizeRange) found.sizeRange = 'N/A';
        if (!found.paymentPlanSummary) found.paymentPlanSummary = '';
        if (!found.postHandoverPlan) found.postHandoverPlan = '';
        if (!found.description) found.description = '';
        return found;
      }
    }
  } catch {
    // fall through to seed data
  }
  return null;
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Launching: 'text-primary bg-primary/10 border-primary/20',
  'On Hold': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

type DetailTab = 'overview' | 'units' | 'payment' | 'media' | 'docs';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    // Try localStorage first, then fall back to seed data
    const dynamic = loadProjectById(id);
    if (dynamic) {
      setProject(dynamic);
    } else if (seedProjectDetails[id]) {
      setProject(seedProjectDetails[id]);
    } else {
      // For any other ID not in seed, try to use first available seed
      setProject(seedProjectDetails['1']);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground text-sm">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <button onClick={() => router.push('/admin/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <Icon name="ArrowLeftIcon" size={16} />
          Back to Projects
        </button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const soldPct = project.units > 0 ? Math.round((project.sold / project.units) * 100) : 0;
  const shareUrl = `https://luxestate6357.builtwithrocket.new/projects/${id}`;

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
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${project.name} - LuxEstate Project Brochure</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; }
            .brochure { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #c9a84c; letter-spacing: 2px; }
            .hero-img { width: 100%; height: 300px; object-fit: cover; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 6px; }
            .developer { font-size: 14px; color: #c9a84c; font-weight: bold; margin-bottom: 8px; }
            .location { font-size: 14px; color: #666; margin-bottom: 20px; }
            .price { font-size: 24px; font-weight: bold; color: #c9a84c; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f8f6f0; padding: 20px; margin-bottom: 30px; }
            .stat { text-align: center; }
            .stat-val { font-size: 18px; font-weight: bold; color: #1a1a1a; }
            .stat-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #c9a84c; border-bottom: 1px solid #e5e0d5; padding-bottom: 8px; margin-bottom: 16px; margin-top: 25px; }
            .description { font-size: 13px; line-height: 1.8; color: #444; margin-bottom: 20px; }
            .unit-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .unit-table th { background: #1a1a1a; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: left; }
            .unit-table td { font-size: 12px; padding: 8px 12px; border-bottom: 1px solid #f0ece4; }
            .milestone-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0ece4; font-size: 12px; }
            .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
            .tag { padding: 3px 10px; background: #f8f6f0; border: 1px solid #e5e0d5; font-size: 11px; color: #444; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e0d5; font-size: 11px; color: #aaa; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="brochure">
            <div class="header">
              <div class="logo">LUXESTATE</div>
              <div style="font-size: 12px; color: #666;">Off-Plan Projects</div>
            </div>
            ${project.images[0]?.url ? `<img class="hero-img" src="${project.images[0].url}" alt="${project.images[0].alt || project.name}" />` : ''}
            <div class="title">${project.name}</div>
            <div class="developer">By ${project.developer}</div>
            <div class="location">📍 ${project.location}${project.community ? ', ' + project.community : ''}</div>
            <div class="price">Starting from ${project.price}</div>
            <div class="stats">
              <div class="stat"><div class="stat-val">${project.units}</div><div class="stat-lbl">Total Units</div></div>
              <div class="stat"><div class="stat-val">${project.available}</div><div class="stat-lbl">Available</div></div>
              <div class="stat"><div class="stat-val">${project.completion}</div><div class="stat-lbl">Handover</div></div>
              <div class="stat"><div class="stat-val">${project.sizeRange?.split(' - ')[0] || 'N/A'}</div><div class="stat-lbl">From (sq ft)</div></div>
            </div>
            ${project.description ? `<div class="section-title">About the Project</div><div class="description">${project.description}</div>` : ''}
            ${project.unitTypes?.length > 0 ? `
            <div class="section-title">Unit Types</div>
            <table class="unit-table">
              <thead><tr><th>Type</th><th>Size</th><th>Starting Price</th></tr></thead>
              <tbody>
                ${project.unitTypes.map((u: any) => `<tr><td>${u.name}</td><td>${u.size}</td><td>${u.price}</td></tr>`).join('')}
              </tbody>
            </table>` : ''}
            ${project.amenities?.length > 0 ? `
            <div class="section-title">Amenities</div>
            <div class="tags">
              ${project.amenities.map((a: string) => `<span class="tag">${a}</span>`).join('')}
            </div>` : ''}
            ${project.paymentPlanSummary ? `
            <div class="section-title">Payment Plan</div>
            <div class="description">${project.paymentPlanSummary}</div>
            ${project.milestones?.map((m: any) => `
              <div class="milestone-row">
                <span>${m.label}</span>
                <span style="font-weight: bold; color: #c9a84c;">${m.percentage}</span>
                <span style="color: #888;">${m.dueDate}</span>
              </div>
            `).join('') || ''}` : ''}
            <div class="footer">
              This brochure is for informational purposes only. All details are subject to change. © LuxEstate 2026
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
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

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'units', label: 'Units & Amenities' },
    { id: 'payment', label: 'Payment Plan' },
    { id: 'media', label: 'Media' },
    { id: 'docs', label: 'Documents' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={() => router.push('/admin/projects')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeftIcon" size={16} />
          Back to Projects
        </button>
        <div className="flex items-center gap-2 flex-wrap">
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
          <button
            onClick={() => router.push(`/admin/projects?edit=${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PencilIcon" size={13} />
            Edit Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero Image */}
          <div className="bg-card border border-border overflow-hidden">
            {project.images.length > 0 ? (
              <>
                <div className="relative h-56 md:h-72 overflow-hidden">
                  <AppImage
                    src={project.images[activeImage]?.url || project.images[0]?.url}
                    alt={project.images[activeImage]?.alt || project.name}
                    fill
                    className="object-cover"
                    sizes="800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{project.type}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusColors[project.status] || ''}`}>{project.status}</span>
                  </div>
                  {project.images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImage((p) => (p - 1 + project.images.length) % project.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                        <Icon name="ChevronLeftIcon" size={16} />
                      </button>
                      <button onClick={() => setActiveImage((p) => (p + 1) % project.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                        <Icon name="ChevronRightIcon" size={16} />
                      </button>
                    </>
                  )}
                </div>
                {project.images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {project.images.map((img: any, idx: number) => (
                      <button key={idx} onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}>
                        <AppImage src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-56 md:h-72 bg-secondary flex items-center justify-center">
                <Icon name="PhotoIcon" size={48} className="text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Title + Stats */}
          <div className="bg-card border border-border p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-primary font-semibold mt-0.5">By {project.developer}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Icon name="MapPinIcon" size={13} className="text-primary" />
                  {project.location}{project.community ? `, ${project.community}` : ''}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-lg md:text-xl font-bold text-primary">Starting {project.price}</p>
                <p className="text-xs text-muted-foreground mt-1">Handover: {project.completion}</p>
              </div>
            </div>
            {project.units > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Units Sold</span>
                  <span className="text-foreground font-semibold">{project.sold}/{project.units} ({soldPct}%)</span>
                </div>
                <div className="h-2 bg-secondary overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${soldPct}%` }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
              {[
                { label: 'Total Units', value: project.units || 'N/A' },
                { label: 'Available', value: project.available ?? 'N/A' },
                { label: 'Bedrooms', value: project.minBedrooms !== undefined && project.maxBedrooms !== undefined ? `${project.minBedrooms} - ${project.maxBedrooms}` : 'N/A' },
                { label: 'Size Range', value: project.sizeRange || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border">
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-5 py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 md:p-5">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {project.description && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About the Project</h3>
                      <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                      {[
                        { label: 'Developer', value: project.developer },
                        { label: 'Project Type', value: project.type },
                        { label: 'Status', value: project.status },
                        { label: 'Handover', value: project.completion },
                        { label: 'Location', value: project.location },
                        { label: 'Community', value: project.community || '—' },
                        { label: 'Starting Price', value: project.price },
                        { label: 'Size Range', value: project.sizeRange || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2.5 border-b border-border/50 px-1">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-xs font-medium text-foreground text-right ml-4">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {project.propertyTypes?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Property Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.propertyTypes.map((t: string) => (
                          <span key={t} className="px-3 py-1 border border-border text-xs text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Units & Amenities */}
              {activeTab === 'units' && (
                <div className="space-y-5">
                  {project.unitTypes?.length > 0 ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Unit Types</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 pr-4">Type</th>
                              <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 pr-4">Size</th>
                              <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.unitTypes.map((u: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2.5 pr-4 text-foreground font-medium text-xs md:text-sm">{u.name}</td>
                                <td className="py-2.5 pr-4 text-muted-foreground text-xs md:text-sm">{u.size}</td>
                                <td className="py-2.5 text-primary font-semibold text-xs md:text-sm">{u.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No unit types added yet.</p>
                  )}
                  {project.amenities?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.amenities.map((a: string) => (
                          <span key={a} className="px-3 py-1.5 border border-border text-xs text-muted-foreground">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Plan */}
              {activeTab === 'payment' && (
                <div className="space-y-5">
                  {project.paymentPlanSummary ? (
                    <>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Payment Plan Summary</h3>
                        <p className="text-sm text-foreground leading-relaxed">{project.paymentPlanSummary}</p>
                      </div>
                      {project.postHandoverPlan && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Post-Handover Plan</h3>
                          <p className="text-sm text-foreground leading-relaxed">{project.postHandoverPlan}</p>
                        </div>
                      )}
                      {project.milestones?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment Milestones</h3>
                          <div className="space-y-2">
                            {project.milestones.map((m: any, i: number) => (
                              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50">
                                <span className="text-sm text-foreground">{m.label}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-bold text-primary">{m.percentage}</span>
                                  <span className="text-xs text-muted-foreground">{m.dueDate}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payment plan details added yet.</p>
                  )}
                </div>
              )}

              {/* Media */}
              {activeTab === 'media' && (
                <div className="space-y-5">
                  {project.images?.length > 0 ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {project.images.map((img: any, i: number) => (
                          <div key={i} className="relative aspect-video overflow-hidden border border-border">
                            <AppImage src={img.url} alt={img.alt || img.caption || `Image ${i + 1}`} fill className="object-cover" sizes="300px" />
                            {img.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                <p className="text-[10px] text-white">{img.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No images added yet.</p>
                  )}
                  {project.floorPlans?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Floor Plans</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {project.floorPlans.map((fp: any, i: number) => (
                          <div key={i} className="relative aspect-square overflow-hidden border border-border">
                            <AppImage src={fp.url} alt={fp.label || `Floor Plan ${i + 1}`} fill className="object-contain bg-white" sizes="300px" />
                            {fp.label && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                <p className="text-[10px] text-white">{fp.label}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.videoUrl && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Video</h3>
                      <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{project.videoUrl}</a>
                    </div>
                  )}
                  {project.virtualTourUrl && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Virtual Tour</h3>
                      <a href={project.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{project.virtualTourUrl}</a>
                    </div>
                  )}
                  {!project.images?.length && !project.floorPlans?.length && !project.videoUrl && !project.virtualTourUrl && (
                    <p className="text-sm text-muted-foreground">No media added yet.</p>
                  )}
                </div>
              )}

              {/* Documents */}
              {activeTab === 'docs' && (
                <div className="space-y-3">
                  {[
                    { label: 'Brochure', url: project.brochureUrl },
                    { label: 'Factsheet', url: project.factsheetUrl },
                    { label: 'Price List', url: project.priceListUrl },
                  ].filter((d) => d.url).map((doc) => (
                    <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-border hover:border-primary/30 transition-colors group">
                      <Icon name="DocumentIcon" size={16} className="text-primary" />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{doc.label}</span>
                      <Icon name="ArrowTopRightOnSquareIcon" size={13} className="text-muted-foreground ml-auto" />
                    </a>
                  ))}
                  {!project.brochureUrl && !project.factsheetUrl && !project.priceListUrl && (
                    <p className="text-sm text-muted-foreground">No documents added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-card border border-border p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={`text-xs font-bold px-2 py-1 border ${statusColors[project.status] || 'text-muted-foreground'}`}>{project.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs font-medium text-foreground">{project.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Featured</span>
                <span className={`text-xs font-medium ${project.featured ? 'text-primary' : 'text-muted-foreground'}`}>{project.featured ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Published</span>
                <span className={`text-xs font-medium ${project.published ? 'text-emerald-400' : 'text-orange-400'}`}>{project.published ? 'Live' : 'Draft'}</span>
              </div>
              {project.international && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">International</span>
                  <span className="text-xs font-medium text-blue-400">🌐 {project.country || 'Yes'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
            <div className="space-y-1.5">
              <p className="text-sm text-foreground">{project.location}</p>
              {project.community && <p className="text-xs text-muted-foreground">{project.community}</p>}
              {project.subCommunity && <p className="text-xs text-muted-foreground">{project.subCommunity}</p>}
              {project.fullAddress && <p className="text-xs text-muted-foreground mt-2">{project.fullAddress}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Actions</h3>
            <button
              onClick={() => router.push(`/admin/projects?edit=${id}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
              <Icon name="PencilIcon" size={13} />
              Edit Project
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              <Icon name="ShareIcon" size={13} />
              Share Project
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary/40 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors disabled:opacity-60">
              <Icon name="DocumentArrowDownIcon" size={13} />
              {pdfGenerating ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Share Project</h3>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Public project URL:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-background border border-border text-foreground text-xs px-3 py-2.5 outline-none min-w-0"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors whitespace-nowrap">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}