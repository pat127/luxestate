'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      setProject(data);
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

  if (!project) {
    return (
      <div className="p-6">
        <button onClick={() => router.push('/admin/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <Icon name="ArrowLeftIcon" size={16} />Back to Projects
        </button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const images: any[] = Array.isArray(project.images) ? project.images : [];
  const unitTypes: any[] = Array.isArray(project.unit_types) ? project.unit_types : [];
  const milestones: any[] = Array.isArray(project.milestones) ? project.milestones : [];
  const amenities: string[] = Array.isArray(project.amenities) ? project.amenities : [];
  const floorPlans: any[] = Array.isArray(project.floor_plans) ? project.floor_plans : [];
  const soldPct = project.total_units > 0 ? Math.round((project.sold_units / project.total_units) * 100) : 0;
  const shareUrl = `https://coveestate.com/projects/${id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };

  const handleDownloadPDF = () => {
    setPdfGenerating(true);
    if (typeof window !== 'undefined') {
      const heroImg = images[0]?.url || images[0]?.src || '';
      const printContent = `<!DOCTYPE html><html><head><title>${project.name} - Brochure</title>
        <style>* { margin:0;padding:0;box-sizing:border-box; } body { font-family:Georgia,serif;color:#1a1a1a;background:#fff; }
        .brochure { max-width:800px;margin:0 auto;padding:40px; }
        .header { display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #c9a84c;padding-bottom:20px;margin-bottom:30px; }
        .logo { font-size:24px;font-weight:bold;color:#c9a84c;letter-spacing:2px; }
        .hero-img { width:100%;height:300px;object-fit:cover;margin-bottom:30px; }
        .title { font-size:28px;font-weight:bold;margin-bottom:6px; }
        .developer { font-size:14px;color:#c9a84c;font-weight:bold;margin-bottom:8px; }
        .price { font-size:24px;font-weight:bold;color:#c9a84c;margin-bottom:20px; }
        .section-title { font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;border-bottom:1px solid #e5e0d5;padding-bottom:8px;margin:24px 0 12px; }
        .description { font-size:14px;line-height:1.8;color:#444; }
        .footer { text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e0d5;font-size:11px;color:#aaa; }
        @media print { body { print-color-adjust:exact;-webkit-print-color-adjust:exact; } }</style></head>
        <body><div class="brochure">
        <div class="header"><div class="logo">COVE ESTATES</div></div>
        ${heroImg ? `<img class="hero-img" src="${heroImg}" alt="${project.name}" />` : ''}
        <div class="title">${project.name}</div>
        <div class="developer">${project.developer || ''}</div>
        <div style="color:#666;margin-bottom:12px">📍 ${project.location_area || ''}</div>
        <div class="price">AED ${project.starting_price || 'Price on Request'}+</div>
        <div class="section-title">Description</div>
        <div class="description">${project.description || ''}</div>
        <div class="footer">© Cove Estates ${new Date().getFullYear()}</div>
        </div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body></html>`;
      const w = window.open('', '_blank');
      if (w) { w.document.write(printContent); w.document.close(); }
    }
    setTimeout(() => setPdfGenerating(false), 1500);
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/admin/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeftIcon" size={16} />Back to Projects
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Icon name="ShareIcon" size={13} />Share
          </button>
          <button onClick={handleDownloadPDF} disabled={pdfGenerating} className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors disabled:opacity-60">
            <Icon name="DocumentArrowDownIcon" size={13} />{pdfGenerating ? 'Generating...' : 'PDF Brochure'}
          </button>
          <button onClick={() => router.push('/admin/projects')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PencilIcon" size={13} />Edit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {(['overview', 'units', 'payment', 'media', 'docs'] as DetailTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Gallery */}
          <div className="bg-card border border-border overflow-hidden">
            <div className="relative h-72 overflow-hidden">
              {images.length > 0 ? (
                <AppImage src={images[activeImage]?.url || images[activeImage]?.src || ''} alt={project.name} fill className="object-cover" sizes="800px" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Icon name="BuildingOffice2Icon" size={48} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{project.project_type}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusColors[project.status] || ''}`}>{project.status}</span>
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"><Icon name="ChevronLeftIcon" size={16} /></button>
                  <button onClick={() => setActiveImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"><Icon name="ChevronRightIcon" size={16} /></button>
                </>
              )}
              {images.length > 0 && <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1">{activeImage + 1} / {images.length}</div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}>
                    <AppImage src={img.url || img.src || ''} alt={img.caption || `Image ${idx + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Icon name="MapPinIcon" size={13} className="text-primary" />{project.location_area || '—'}</p>
                {project.developer && <p className="text-xs text-primary font-semibold mt-0.5">{project.developer}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{project.starting_price ? `AED ${project.starting_price}+` : 'Price on Request'}</p>
                <p className="text-xs text-muted-foreground mt-1">Starting From</p>
              </div>
            </div>
            {project.total_units > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Units Sold</span>
                  <span className="text-foreground font-semibold">{project.sold_units}/{project.total_units} ({soldPct}%)</span>
                </div>
                <div className="h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${soldPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <>
              {project.description && project.description.trim() && (
                <div className="bg-card border border-border p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</h2>
                  <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
                </div>
              )}
              <div className="bg-card border border-border p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Project Details</h2>
                <div className="grid grid-cols-2 gap-0">
                  {[
                    { label: 'Type', value: project.project_type },
                    { label: 'Status', value: project.status },
                    { label: 'Handover', value: project.handover_date },
                    { label: 'Total Units', value: project.total_units ? String(project.total_units) : null },
                    { label: 'Available', value: project.available_units ? String(project.available_units) : null },
                    { label: 'Size Range', value: project.size_range },
                    { label: 'Bedrooms', value: project.min_bedrooms != null && project.max_bedrooms != null ? `${project.min_bedrooms} - ${project.max_bedrooms} BR` : null },
                    { label: 'Location', value: project.location_area },
                    { label: 'Community', value: project.community },
                    { label: 'Emirate', value: project.emirate },
                  ].filter(({ value }) => value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-border">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {amenities.length > 0 && (
                <div className="bg-card border border-border p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a) => <span key={a} className="px-3 py-1.5 text-xs border border-primary/30 text-primary bg-primary/5">{a}</span>)}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'units' && (
            <div className="bg-card border border-border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Unit Types</h2>
              {unitTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unit types added yet.</p>
              ) : (
                <div className="space-y-3">
                  {unitTypes.map((u: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border">
                      <span className="text-sm font-semibold text-foreground">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.size}</span>
                      <span className="text-sm font-bold text-primary">{u.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-card border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Payment Plan</h2>
              {project.payment_plan_summary && <p className="text-sm text-foreground">{project.payment_plan_summary}</p>}
              {project.post_handover_plan && <p className="text-sm text-muted-foreground">{project.post_handover_plan}</p>}
              {milestones.length > 0 && (
                <div className="space-y-2 mt-4">
                  {milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border">
                      <span className="text-sm text-foreground">{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.dueDate}</span>
                      <span className="text-sm font-bold text-primary">{m.percentage}</span>
                    </div>
                  ))}
                </div>
              )}
              {milestones.length === 0 && !project.payment_plan_summary && <p className="text-sm text-muted-foreground">No payment plan added yet.</p>}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="bg-card border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Media</h2>
              {floorPlans.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Floor Plans</p>
                  <div className="grid grid-cols-2 gap-3">
                    {floorPlans.map((fp: any, i: number) => (
                      <div key={i} className="border border-border p-3">
                        <div className="relative h-32 mb-2">
                          <AppImage src={fp.url} alt={fp.label || `Floor Plan ${i + 1}`} fill className="object-contain" sizes="200px" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">{fp.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 flex-wrap">
                {project.video_url && <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="PlayCircleIcon" size={14} className="text-primary" />Watch Video</a>}
                {project.virtual_tour_url && <a href={project.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="CubeTransparentIcon" size={14} className="text-primary" />Virtual Tour</a>}
                {project.master_plan_url && <a href={project.master_plan_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="MapIcon" size={14} className="text-primary" />Master Plan</a>}
              </div>
              {!project.video_url && !project.virtual_tour_url && !project.master_plan_url && floorPlans.length === 0 && <p className="text-sm text-muted-foreground">No media added yet.</p>}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="bg-card border border-border p-5 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Documents</h2>
              {project.brochure_url && <a href={project.brochure_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="DocumentIcon" size={14} className="text-primary" />Brochure</a>}
              {project.factsheet_url && <a href={project.factsheet_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="DocumentTextIcon" size={14} className="text-primary" />Factsheet</a>}
              {project.price_list_url && <a href={project.price_list_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><Icon name="CurrencyDollarIcon" size={14} className="text-primary" />Price List</a>}
              {!project.brochure_url && !project.factsheet_url && !project.price_list_url && <p className="text-sm text-muted-foreground">No documents added yet.</p>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Created', value: project.created_at ? new Date(project.created_at).toLocaleDateString('en-GB') : '—' },
                { label: 'Featured', value: project.featured ? 'Yes' : 'No' },
                { label: 'Published', value: project.published ? 'Live' : 'Draft' },
                { label: 'International', value: project.international ? (project.country || 'Yes') : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setShowShareModal(true)} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="ShareIcon" size={13} className="text-primary" />Share Project
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfGenerating} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-60">
                <Icon name="DocumentArrowDownIcon" size={13} className="text-primary" />{pdfGenerating ? 'Generating...' : 'Download PDF Brochure'}
              </button>
              <button onClick={() => router.push('/admin/projects')} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="PencilIcon" size={13} className="text-primary" />Edit Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-[#12151f] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Share Project</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white transition-colors"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              <button onClick={handleCopyLink} className={`px-4 py-2 text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}