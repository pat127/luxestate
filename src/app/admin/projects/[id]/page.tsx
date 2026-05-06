'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const projectData: Record<string, any> = {
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
    { name: 'Penthouse', size: '3,000 - 3,200 sq ft', price: 'AED 8.5M' }],

    paymentPlanSummary: '60/40 payment plan with flexible installments during construction',
    postHandoverPlan: '40% over 3 years post-handover',
    milestones: [
    { label: 'On Booking', percentage: '10%', dueDate: 'Immediately' },
    { label: 'On SPA Signing', percentage: '10%', dueDate: '30 days' },
    { label: 'During Construction', percentage: '40%', dueDate: 'Q4 2024 - Q2 2026' },
    { label: 'On Handover', percentage: '10%', dueDate: 'Q4 2026' },
    { label: 'Post Handover', percentage: '30%', dueDate: '2027 - 2029' }],

    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1d4a4c643-1772201743362.png", alt: 'Modern residential tower exterior', caption: 'Tower Exterior' },
    { url: "https://images.unsplash.com/photo-1632365627904-2167bf5c9f14", alt: 'Lobby interior', caption: 'Grand Lobby' },
    { url: "https://images.unsplash.com/photo-1661981390723-d7555367cf2e", alt: 'Swimming pool amenity', caption: 'Infinity Pool' }],

    floorPlans: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1c56853fb-1774155639670.png", label: '1BR Floor Plan' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_19f1308ff-1764924314067.png", label: '2BR Floor Plan' }],

    masterPlanUrl: '',
    videoUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    factsheetUrl: '',
    priceListUrl: '',
    featured: true,
    published: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-04-15'
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
    { name: '3 Bedroom', size: '1,800 - 2,200 sq ft', price: 'AED 3.8M' }],

    paymentPlanSummary: '70/30 payment plan',
    postHandoverPlan: '30% over 2 years',
    milestones: [
    { label: 'On Booking', percentage: '10%', dueDate: 'Immediately' },
    { label: 'During Construction', percentage: '60%', dueDate: '2025 - 2026' },
    { label: 'On Handover', percentage: '10%', dueDate: 'Q2 2027' },
    { label: 'Post Handover', percentage: '20%', dueDate: '2027 - 2029' }],

    images: [
    { url: "https://images.unsplash.com/photo-1690710513317-dc76760d409a", alt: 'Marina bay towers', caption: 'Tower Exterior' }],

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
    updatedAt: '2024-04-10'
  }
};

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Launching: 'text-primary bg-primary/10 border-primary/20',
  'On Hold': 'text-orange-400 bg-orange-400/10 border-orange-400/20'
};

type DetailTab = 'overview' | 'units' | 'payment' | 'media' | 'docs';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const project = projectData[id] || projectData['1'];

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const soldPct = Math.round(project.sold / project.units * 100);
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
            <img class="hero-img" src="${project.images[0]?.url}" alt="${project.images[0]?.alt}" />
            <div class="title">${project.name}</div>
            <div class="developer">By ${project.developer}</div>
            <div class="location">📍 ${project.location}, ${project.community}</div>
            <div class="price">Starting from ${project.price}</div>
            <div class="stats">
              <div class="stat"><div class="stat-val">${project.units}</div><div class="stat-lbl">Total Units</div></div>
              <div class="stat"><div class="stat-val">${project.available}</div><div class="stat-lbl">Available</div></div>
              <div class="stat"><div class="stat-val">${project.completion}</div><div class="stat-lbl">Handover</div></div>
              <div class="stat"><div class="stat-val">${project.sizeRange.split(' - ')[0]}</div><div class="stat-lbl">From (sq ft)</div></div>
            </div>
            <div class="section-title">About the Project</div>
            <div class="description">${project.description}</div>
            <div class="section-title">Unit Types</div>
            <table class="unit-table">
              <thead><tr><th>Type</th><th>Size</th><th>Starting Price</th></tr></thead>
              <tbody>
                ${project.unitTypes.map((u: any) => `<tr><td>${u.name}</td><td>${u.size}</td><td>${u.price}</td></tr>`).join('')}
              </tbody>
            </table>
            <div class="section-title">Amenities</div>
            <div class="tags">
              ${project.amenities.map((a: string) => `<span class="tag">${a}</span>`).join('')}
            </div>
            <div class="section-title">Payment Plan</div>
            <div class="description">${project.paymentPlanSummary}</div>
            ${project.milestones.map((m: any) => `
              <div class="milestone-row">
                <span>${m.label}</span>
                <span style="font-weight: bold; color: #c9a84c;">${m.percentage}</span>
                <span style="color: #888;">${m.dueDate}</span>
              </div>
            `).join('')}
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

  const tabs: {id: DetailTab;label: string;}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'units', label: 'Units & Amenities' },
  { id: 'payment', label: 'Payment Plan' },
  { id: 'media', label: 'Media' },
  { id: 'docs', label: 'Documents' }];


  return (
    <div className="p-6 max-w-6xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/admin/projects')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          
          <Icon name="ArrowLeftIcon" size={16} />
          Back to Projects
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
          <button
            onClick={() => router.push(`/admin/projects?edit=${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PencilIcon" size={13} />
            Edit Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero Image */}
          <div className="bg-card border border-border overflow-hidden">
            <div className="relative h-72 overflow-hidden">
              <AppImage
                src={project.images[activeImage]?.url || project.images[0]?.url}
                alt={project.images[activeImage]?.alt || project.name}
                fill
                className="object-cover"
                sizes="800px" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{project.type}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusColors[project.status] || ''}`}>{project.status}</span>
              </div>
              {project.images.length > 1 &&
              <>
                  <button onClick={() => setActiveImage((p) => (p - 1 + project.images.length) % project.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                    <Icon name="ChevronLeftIcon" size={16} />
                  </button>
                  <button onClick={() => setActiveImage((p) => (p + 1) % project.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors">
                    <Icon name="ChevronRightIcon" size={16} />
                  </button>
                </>
              }
            </div>
            {project.images.length > 1 &&
            <div className="flex gap-2 p-3 overflow-x-auto">
                {project.images.map((img: any, idx: number) =>
              <button key={idx} onClick={() => setActiveImage(idx)}
              className={`relative flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}>
                    <AppImage src={img.url} alt={img.alt} fill className="object-cover" sizes="64px" />
                  </button>
              )}
              </div>
            }
          </div>

          {/* Title + Stats */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-primary font-semibold mt-0.5">By {project.developer}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Icon name="MapPinIcon" size={13} className="text-primary" />
                  {project.location}, {project.community}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">Starting {project.price}</p>
                <p className="text-xs text-muted-foreground mt-1">Handover: {project.completion}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Units Sold</span>
                <span className="text-foreground font-semibold">{project.sold}/{project.units} ({soldPct}%)</span>
              </div>
              <div className="h-2 bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${soldPct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border">
              {[
              { label: 'Total Units', value: project.units },
              { label: 'Available', value: project.available },
              { label: 'Bedrooms', value: `${project.minBedrooms} - ${project.maxBedrooms}` },
              { label: 'Size Range', value: project.sizeRange }].
              map(({ label, value }) =>
              <div key={label} className="text-center">
                  <p className="text-sm font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border">
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) =>
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab.label}
                </button>
              )}
            </div>

            <div className="p-5">
              {/* Overview */}
              {activeTab === 'overview' &&
              <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About the Project</h3>
                    <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Details</h3>
                    <div className="grid grid-cols-2 gap-0">
                      {[
                    { label: 'Developer', value: project.developer },
                    { label: 'Project Type', value: project.type },
                    { label: 'Status', value: project.status },
                    { label: 'Handover', value: project.completion },
                    { label: 'Location', value: project.location },
                    { label: 'Community', value: project.community },
                    { label: 'Total Units', value: project.units },
                    { label: 'Available Units', value: project.available },
                    { label: 'Size Range', value: project.sizeRange },
                    { label: 'Bedrooms', value: `${project.minBedrooms} - ${project.maxBedrooms} BR` }].
                    map(({ label, value }) =>
                    <div key={label} className="flex justify-between py-2.5 border-b border-border">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-xs font-semibold text-foreground">{value}</span>
                        </div>
                    )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><p className="text-xs text-muted-foreground mb-1">Area</p><p className="text-sm font-semibold text-foreground">{project.location}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Community</p><p className="text-sm font-semibold text-foreground">{project.community}</p></div>
                      {project.subCommunity && <div><p className="text-xs text-muted-foreground mb-1">Sub Community</p><p className="text-sm font-semibold text-foreground">{project.subCommunity}</p></div>}
                      <div className="col-span-2"><p className="text-xs text-muted-foreground mb-1">Full Address</p><p className="text-sm font-semibold text-foreground">{project.fullAddress}</p></div>
                    </div>
                    <div className="h-36 bg-[#1a1a1a] border border-border flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="MapPinIcon" size={24} className="text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">{project.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              }

              {/* Units & Amenities */}
              {activeTab === 'units' &&
              <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Property Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.propertyTypes.map((t: string) =>
                    <span key={t} className="px-3 py-1.5 text-xs border border-primary/30 text-primary bg-primary/5">{t}</span>
                    )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Unit Types</h3>
                    <div className="border border-border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30">
                            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</th>
                            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Starting Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.unitTypes.map((u: any, i: number) =>
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-white/2 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{u.size}</td>
                              <td className="px-4 py-3 text-sm font-bold text-primary">{u.price}</td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.amenities.map((a: string) =>
                    <span key={a} className="px-3 py-1.5 text-xs border border-border text-foreground">{a}</span>
                    )}
                    </div>
                  </div>
                </div>
              }

              {/* Payment Plan */}
              {activeTab === 'payment' &&
              <div className="space-y-5">
                  <div className="p-4 bg-primary/5 border border-primary/20">
                    <p className="text-sm font-semibold text-foreground">{project.paymentPlanSummary}</p>
                    {project.postHandoverPlan &&
                  <p className="text-xs text-muted-foreground mt-1">Post-Handover: {project.postHandoverPlan}</p>
                  }
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment Milestones</h3>
                    <div className="space-y-0 border border-border overflow-hidden">
                      {project.milestones.map((m: any, i: number) =>
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-white/2 transition-colors">
                          <span className="text-sm text-foreground">{m.label}</span>
                          <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-primary">{m.percentage}</span>
                            <span className="text-xs text-muted-foreground w-32 text-right">{m.dueDate}</span>
                          </div>
                        </div>
                    )}
                    </div>
                  </div>
                </div>
              }

              {/* Media */}
              {activeTab === 'media' &&
              <div className="space-y-5">
                  {project.floorPlans.length > 0 &&
                <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Floor Plans</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {project.floorPlans.map((fp: any, i: number) =>
                    <div key={i} className="border border-border overflow-hidden">
                            <div className="relative h-32">
                              <AppImage src={fp.url} alt={fp.label} fill className="object-cover" sizes="300px" />
                            </div>
                            <p className="text-xs text-center py-2 text-muted-foreground border-t border-border">{fp.label}</p>
                          </div>
                    )}
                      </div>
                    </div>
                }
                  <div className="flex flex-wrap gap-3">
                    {project.videoUrl &&
                  <a href={project.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        <Icon name="PlayCircleIcon" size={14} className="text-primary" />
                        Watch Video
                      </a>
                  }
                    {project.virtualTourUrl &&
                  <a href={project.virtualTourUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        <Icon name="CubeTransparentIcon" size={14} className="text-primary" />
                        Virtual Tour
                      </a>
                  }
                    {project.masterPlanUrl &&
                  <a href={project.masterPlanUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        <Icon name="MapIcon" size={14} className="text-primary" />
                        Master Plan
                      </a>
                  }
                    {!project.videoUrl && !project.virtualTourUrl && !project.masterPlanUrl &&
                  <p className="text-sm text-muted-foreground">No media links available.</p>
                  }
                  </div>
                </div>
              }

              {/* Documents */}
              {activeTab === 'docs' &&
              <div className="space-y-3">
                  {[
                { label: 'Project Brochure', url: project.brochureUrl, icon: 'DocumentTextIcon' },
                { label: 'Factsheet', url: project.factsheetUrl, icon: 'DocumentIcon' },
                { label: 'Price List', url: project.priceListUrl, icon: 'CurrencyDollarIcon' }].
                map(({ label, url, icon }) =>
                <div key={label} className="flex items-center justify-between p-4 border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon name={icon as any} size={16} className="text-primary" />
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      {url ?
                  <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-accent transition-colors">
                          <Icon name="ArrowDownTrayIcon" size={12} />
                          Download
                        </a> :

                  <span className="text-xs text-muted-foreground">Not available</span>
                  }
                    </div>
                )}
                  <button
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-primary/40 text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-60">
                  
                    <Icon name="DocumentArrowDownIcon" size={14} />
                    {pdfGenerating ? 'Generating...' : 'Generate PDF Brochure'}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
              { label: 'Listed', value: project.createdAt },
              { label: 'Last Updated', value: project.updatedAt },
              { label: 'Featured', value: project.featured ? 'Yes' : 'No' },
              { label: 'Published', value: project.published ? 'Live' : 'Draft' }].
              map(({ label, value }) =>
              <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setShowShareModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="ShareIcon" size={13} className="text-primary" />
                Share Project
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfGenerating}
              className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-60">
                <Icon name="DocumentArrowDownIcon" size={13} className="text-primary" />
                {pdfGenerating ? 'Generating...' : 'Download PDF Brochure'}
              </button>
              <button onClick={() => router.push(`/admin/projects?edit=${id}`)} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="PencilIcon" size={13} className="text-primary" />
                Edit Project
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-red-400/20 text-xs text-red-400 hover:bg-red-400/5 transition-colors">
                <Icon name="TrashIcon" size={13} />
                Delete Project
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
              <h3 className="text-base font-bold text-white">Share Project</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Share this project via:</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
            { label: 'WhatsApp', icon: 'ChatBubbleLeftRightIcon', color: 'text-emerald-400', href: `https://wa.me/?text=${encodeURIComponent(project.name + ' by ' + project.developer + ' | ' + shareUrl)}` },
            { label: 'Email', icon: 'EnvelopeIcon', color: 'text-blue-400', href: `mailto:?subject=${encodeURIComponent(project.name)}&body=${encodeURIComponent('Check out this project: ' + shareUrl)}` },
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
                <input type="text" readOnly value={shareUrl}
              className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
                <button onClick={handleCopyLink}
              className={`px-4 py-2 text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button onClick={handleDownloadPDF} disabled={pdfGenerating}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c9a84c]/40 text-sm text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-60">
              <Icon name="DocumentArrowDownIcon" size={14} />
              {pdfGenerating ? 'Generating...' : 'Download PDF Brochure'}
            </button>
          </div>
        </div>
      }
    </div>);

}