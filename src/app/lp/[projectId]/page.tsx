'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppImage from '@/components/ui/AppImage';

interface Project {
  id: string;
  name: string;
  developer: string;
  description: string;
  location_area: string;
  emirate: string;
  starting_price: string;
  handover_date: string;
  images: { url: string; caption?: string }[];
  amenities: string[];
  property_types: string[];
  total_units: number;
  available_units: number;
  payment_plan_summary: string;
  brochure_url: string;
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
          <p className="text-muted-foreground">Project not found.</p>
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-stretch">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {heroImage ? (
            <AppImage
              src={heroImage}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left: Project Info */}
          <div className="flex-1 max-w-xl">
            {project.developer && (
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.25em] mb-4">{project.developer}</p>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {project.name}
            </h1>
            {(project.location_area || project.emirate) && (
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-4 h-4 text-[#C9A84C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/70 text-sm">{[project.location_area, project.emirate].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {project.description && (
              <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md line-clamp-4">{project.description}</p>
            )}

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
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
              {project.available_units > 0 && (
                <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Units Available</p>
                  <p className="text-sm font-bold text-white">{project.available_units}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.amenities.slice(0, 6).map((a) => (
                  <span key={a} className="text-[10px] text-white/50 border border-white/10 px-2.5 py-1 uppercase tracking-wider">{a}</span>
                ))}
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
                    <p className="text-xs text-white/40 mt-1">Get exclusive details, pricing & availability</p>
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

                    {formError && (
                      <p className="text-xs text-red-400">{formError}</p>
                    )}

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

            {/* Payment Plan Teaser */}
            {project.payment_plan_summary && (
              <div className="mt-3 bg-[#C9A84C]/5 border border-[#C9A84C]/20 px-4 py-3">
                <p className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold mb-1">Payment Plan</p>
                <p className="text-xs text-white/60 leading-relaxed">{project.payment_plan_summary}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Strip */}
      {project.images && project.images.length > 1 && (
        <section className="bg-[#0D0D0D] py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-6">Gallery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {project.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden bg-white/5">
                  <AppImage
                    src={img.url}
                    alt={img.caption || `${project.name} image ${i + 2}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-white/5 py-8 px-6 text-center">
        <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
