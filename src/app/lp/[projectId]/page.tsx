'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppImage from '@/components/ui/AppImage';

interface UnitType {
  type?: string;
  name?: string;
  bedrooms?: string | number;
  size?: string;
  price?: string;
  starting_price?: string;
  area?: string;
}

interface Milestone {
  label?: string;
  name?: string;
  percentage?: number | string;
  percent?: number | string;
  date?: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  developer: string;
  description: string;
  location_area: string;
  emirate: string;
  community: string;
  starting_price: string;
  handover_date: string;
  images: { url: string; caption?: string }[];
  amenities: string[];
  property_types: string[];
  total_units: number;
  available_units: number;
  payment_plan_summary: string;
  post_handover_plan: string;
  milestones: Milestone[];
  unit_types: UnitType[];
  size_range: string;
  min_bedrooms: number;
  max_bedrooms: number;
  brochure_url: string;
  factsheet_url: string;
  price_list_url: string;
  floor_plans: { url: string; caption?: string; name?: string }[];
  project_type: string;
  status: string;
}

interface SiteConfig {
  siteName?: string;
  logoUrl?: string;
  primaryColor?: string;
  phone?: string;
  email?: string;
}

export default function ProjectLandingPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [projResult, settingsResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('site_settings').select('data').eq('key', 'cms_config').single(),
      ]);
      const proj = projResult.data;
      const settings = settingsResult.data;
      if (!proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj as Project);
      if (settings?.data) setSiteConfig(settings.data as SiteConfig);
      setLoading(false);
    };
    if (projectId) load();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Name and mobile number are required.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    const { error } = await supabase.from('leads').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      project: project?.name || '',
      source: 'Landing Page',
      form_type: 'landing_page',
      status: 'New',
      interest: project?.name || '',
    });
    setSubmitting(false);
    if (error) {
      setFormError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  const heroImage = project?.images?.[0]?.url || '';
  const siteName = siteConfig.siteName || 'Cove Estate';
  const galleryImages = project?.images?.slice(1) || [];
  const unitTypes: UnitType[] = Array.isArray(project?.unit_types) ? project.unit_types : [];
  const milestones: Milestone[] = Array.isArray(project?.milestones) ? project.milestones : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-4xl font-bold text-[#C9A84C] mb-2">404</p>
          <p className="text-white/50">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {siteConfig.logoUrl ? (
            <AppImage src={siteConfig.logoUrl} alt={siteName} width={120} height={36} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-lg font-bold tracking-widest text-[#C9A84C] uppercase">{siteName}</span>
          )}
        </div>
        {siteConfig.phone && (
          <a href={`tel:${siteConfig.phone}`} className="text-sm text-white/70 hover:text-[#C9A84C] transition-colors hidden sm:block">
            {siteConfig.phone}
          </a>
        )}
      </header>

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-stretch">
        <div className="absolute inset-0 z-0">
          {heroImage ? (
            <AppImage src={heroImage} alt={project.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left: Project Title + Location */}
          <div className="flex-1 max-w-xl">
            {project.developer && (
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.25em] mb-4">{project.developer}</p>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {project.name}
            </h1>
            {(project.location_area || project.emirate) && (
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-4 h-4 text-[#C9A84C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/70 text-sm">{[project.community, project.location_area, project.emirate].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {project.starting_price && (
                <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Starting From</p>
                  <p className="text-sm font-bold text-[#C9A84C]">{project.starting_price}</p>
                </div>
              )}
              {project.handover_date && (
                <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Handover</p>
                  <p className="text-sm font-bold text-white">{project.handover_date}</p>
                </div>
              )}
              {project.project_type && (
                <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm font-bold text-white">{project.project_type}</p>
                </div>
              )}
            </div>

            {/* Amenities preview */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.amenities.slice(0, 5).map((a) => (
                  <span key={a} className="text-[10px] text-white/50 border border-white/10 px-2.5 py-1 uppercase tracking-wider">{a}</span>
                ))}
                {project.amenities.length > 5 && (
                  <span className="text-[10px] text-[#C9A84C] border border-[#C9A84C]/20 px-2.5 py-1 uppercase tracking-wider">+{project.amenities.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Right: Lead Capture Form */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-[#111111]/95 backdrop-blur-md border border-white/10 p-7">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-sm text-white/50">Our team will reach out to you shortly regarding <span className="text-[#C9A84C]">{project.name}</span>.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.2em] font-bold mb-1">Register Interest</p>
                    <h2 className="text-xl font-bold text-white leading-snug">{project.name}</h2>
                    <p className="text-xs text-white/40 mt-1">Get exclusive details, pricing &amp; availability</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+971 50 000 0000"
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
                      />
                    </div>
                    {formError && <p className="text-xs text-red-400">{formError}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#C9A84C] text-black text-xs font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-[#b8963e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                      {submitting ? 'Submitting...' : 'Request Information'}
                    </button>
                    <p className="text-[10px] text-white/25 text-center leading-relaxed">
                      By submitting, you agree to be contacted by our team regarding this project.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: GALLERY ──────────────────────────────────────── */}
      {project.images && project.images.length > 0 && (
        <section className="bg-[#0D0D0D] py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-2">Visual Tour</p>
                <h2 className="text-3xl font-bold text-white">Gallery</h2>
              </div>
              <span className="text-xs text-white/30">{project.images.length} images</span>
            </div>
            {/* Featured image */}
            <div className="mb-3 aspect-[16/7] overflow-hidden bg-white/5 relative">
              <AppImage
                src={activeGalleryImg || project.images[0]?.url}
                alt={project.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnails */}
            {project.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {project.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGalleryImg(img.url)}
                    className={`aspect-square overflow-hidden bg-white/5 border-2 transition-all ${(activeGalleryImg || project.images[0]?.url) === img.url ? 'border-[#C9A84C]' : 'border-transparent hover:border-white/20'}`}
                  >
                    <AppImage
                      src={img.url}
                      alt={img.caption || `${project.name} image ${i + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── SECTION 3: ABOUT THE PROJECT ────────────────────────────── */}
      <section className="bg-[#0A0A0A] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-3">Overview</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">About {project.name}</h2>
              {project.description && (
                <p className="text-white/60 text-base leading-relaxed mb-8">{project.description}</p>
              )}
              {/* Project details grid */}
              <div className="grid grid-cols-2 gap-4">
                {project.developer && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Developer</p>
                    <p className="text-sm font-semibold text-white">{project.developer}</p>
                  </div>
                )}
                {project.handover_date && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Handover</p>
                    <p className="text-sm font-semibold text-white">{project.handover_date}</p>
                  </div>
                )}
                {project.total_units > 0 && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Total Units</p>
                    <p className="text-sm font-semibold text-white">{project.total_units}</p>
                  </div>
                )}
                {project.size_range && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Size Range</p>
                    <p className="text-sm font-semibold text-white">{project.size_range}</p>
                  </div>
                )}
                {(project.location_area || project.emirate) && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-semibold text-white">{[project.community, project.location_area, project.emirate].filter(Boolean).join(', ')}</p>
                  </div>
                )}
                {project.project_type && (
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Project Type</p>
                    <p className="text-sm font-semibold text-white">{project.project_type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <div>
                <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-3">Features &amp; Amenities</p>
                <h3 className="text-2xl font-bold text-white mb-6">What&apos;s Included</h3>
                <div className="grid grid-cols-2 gap-3">
                  {project.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                      <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full flex-shrink-0" />
                      <span className="text-sm text-white/70">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: UNIT TYPES & STARTING PRICES ─────────────────── */}
      {(unitTypes.length > 0 || (project.property_types && project.property_types.length > 0)) && (
        <section className="bg-[#0D0D0D] py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-3">Residences</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Unit Types &amp; Pricing</h2>
              {project.starting_price && (
                <p className="text-white/40 mt-3 text-sm">Starting from <span className="text-[#C9A84C] font-semibold">{project.starting_price}</span></p>
              )}
            </div>

            {unitTypes.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {unitTypes.map((unit, i) => {
                  const unitName = unit.type || unit.name || `Unit Type ${i + 1}`;
                  const unitPrice = unit.price || unit.starting_price || '';
                  const unitSize = unit.size || unit.area || '';
                  const unitBeds = unit.bedrooms;
                  return (
                    <div key={i} className="border border-white/10 bg-white/[0.02] p-6 hover:border-[#C9A84C]/30 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold mb-1">
                            {unitBeds !== undefined && unitBeds !== null ? `${unitBeds} BR` : 'Unit'}
                          </p>
                          <h3 className="text-lg font-bold text-white">{unitName}</h3>
                        </div>
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-[#C9A84C]/30 transition-all">
                          <svg className="w-5 h-5 text-white/20 group-hover:text-[#C9A84C]/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2 mb-5">
                        {unitSize && (
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Size</span>
                            <span className="text-white/80 font-medium">{unitSize}</span>
                          </div>
                        )}
                      </div>
                      {unitPrice && (
                        <div className="pt-4 border-t border-white/5">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Starting Price</p>
                          <p className="text-xl font-bold text-[#C9A84C]">{unitPrice}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback: property_types list */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {project.property_types.map((pt, i) => (
                  <div key={i} className="border border-white/10 bg-white/[0.02] p-6 hover:border-[#C9A84C]/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-2">{pt}</h3>
                    {project.starting_price && (
                      <div className="pt-4 border-t border-white/5 mt-4">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Starting Price</p>
                        <p className="text-xl font-bold text-[#C9A84C]">{project.starting_price}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── SECTION 5: PAYMENT PLAN ─────────────────────────────────── */}
      {(project.payment_plan_summary || milestones.length > 0 || project.post_handover_plan) && (
        <section className="bg-[#0A0A0A] py-24 px-6 relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A84C]/3 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-3">Flexible Financing</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Payment Plan</h2>
              {project.payment_plan_summary && (
                <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">{project.payment_plan_summary}</p>
              )}
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <div className="mb-12">
                <div className="relative">
                  {/* Progress line */}
                  <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-white/10 z-0" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
                    {milestones.map((m, i) => {
                      const pct = m.percentage ?? m.percent;
                      const label = m.label || m.name || m.description || `Milestone ${i + 1}`;
                      return (
                        <div key={i} className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full border-2 border-[#C9A84C] bg-[#0A0A0A] flex items-center justify-center mb-4 shadow-lg shadow-[#C9A84C]/10">
                            <span className="text-lg font-bold text-[#C9A84C]">{pct !== undefined ? `${pct}%` : `${i + 1}`}</span>
                          </div>
                          <p className="text-sm font-semibold text-white mb-1">{label}</p>
                          {m.date && <p className="text-xs text-white/40">{m.date}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Post-handover plan */}
            {project.post_handover_plan && (
              <div className="max-w-3xl mx-auto">
                <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-8 text-center">
                  <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.2em] font-bold mb-3">Post-Handover</p>
                  <p className="text-white/70 text-base leading-relaxed">{project.post_handover_plan}</p>
                </div>
              </div>
            )}

            {/* CTA inside payment plan */}
            <div className="mt-14 text-center">
              <p className="text-white/40 text-sm mb-5">Interested in flexible payment options?</p>
              {!submitted ? (
                <button
                  onClick={() => {
                    const formEl = document.querySelector('form');
                    formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="inline-flex items-center gap-2 bg-[#C9A84C] text-black text-xs font-bold uppercase tracking-[0.15em] px-8 py-4 hover:bg-[#b8963e] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Speak to an Advisor
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 text-[#C9A84C] text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your enquiry has been received
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 6: DOWNLOADS ────────────────────────────────────── */}
      {(project.factsheet_url || project.brochure_url || project.price_list_url || (project.floor_plans && project.floor_plans.length > 0)) && (
        <section className="bg-[#0D0D0D] py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-3">Resources</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Download Project Documents</h2>
              <p className="text-white/40 text-sm">Access detailed information about {project.name}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {project.factsheet_url && (
                <a
                  href={project.factsheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center border border-white/10 bg-white/[0.02] p-8 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all"
                >
                  <div className="w-14 h-14 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center mb-5 transition-all">
                    <svg className="w-7 h-7 text-white/30 group-hover:text-[#C9A84C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-[#C9A84C] transition-colors">Factsheet</p>
                  <p className="text-xs text-white/30 mb-5">Project overview &amp; key details</p>
                  <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold border border-[#C9A84C]/30 px-4 py-1.5 group-hover:bg-[#C9A84C] group-hover:text-black transition-all">
                    Download PDF
                  </span>
                </a>
              )}

              {(project.floor_plans && project.floor_plans.length > 0) && (
                <a
                  href={project.floor_plans[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center border border-white/10 bg-white/[0.02] p-8 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all"
                >
                  <div className="w-14 h-14 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center mb-5 transition-all">
                    <svg className="w-7 h-7 text-white/30 group-hover:text-[#C9A84C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-[#C9A84C] transition-colors">Floor Plans</p>
                  <p className="text-xs text-white/30 mb-5">Detailed unit layouts &amp; dimensions</p>
                  <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold border border-[#C9A84C]/30 px-4 py-1.5 group-hover:bg-[#C9A84C] group-hover:text-black transition-all">
                    Download PDF
                  </span>
                </a>
              )}

              {project.price_list_url && (
                <a
                  href={project.price_list_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center border border-white/10 bg-white/[0.02] p-8 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all"
                >
                  <div className="w-14 h-14 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center mb-5 transition-all">
                    <svg className="w-7 h-7 text-white/30 group-hover:text-[#C9A84C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-[#C9A84C] transition-colors">Investment Analysis</p>
                  <p className="text-xs text-white/30 mb-5">Pricing, ROI &amp; investment details</p>
                  <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold border border-[#C9A84C]/30 px-4 py-1.5 group-hover:bg-[#C9A84C] group-hover:text-black transition-all">
                    Download PDF
                  </span>
                </a>
              )}

              {/* Brochure as fallback if no price_list but brochure exists */}
              {project.brochure_url && !project.price_list_url && (
                <a
                  href={project.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center border border-white/10 bg-white/[0.02] p-8 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all"
                >
                  <div className="w-14 h-14 border border-white/10 group-hover:border-[#C9A84C]/40 flex items-center justify-center mb-5 transition-all">
                    <svg className="w-7 h-7 text-white/30 group-hover:text-[#C9A84C] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-[#C9A84C] transition-colors">Brochure</p>
                  <p className="text-xs text-white/30 mb-5">Full project brochure</p>
                  <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold border border-[#C9A84C]/30 px-4 py-1.5 group-hover:bg-[#C9A84C] group-hover:text-black transition-all">
                    Download PDF
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {siteConfig.logoUrl ? (
              <AppImage src={siteConfig.logoUrl} alt={siteName} width={100} height={30} className="h-7 w-auto object-contain opacity-60" />
            ) : (
              <span className="text-sm font-bold tracking-widest text-white/30 uppercase">{siteName}</span>
            )}
          </div>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          {siteConfig.phone && (
            <a href={`tel:${siteConfig.phone}`} className="text-xs text-white/30 hover:text-[#C9A84C] transition-colors">{siteConfig.phone}</a>
          )}
        </div>
      </footer>
    </div>
  );
}
