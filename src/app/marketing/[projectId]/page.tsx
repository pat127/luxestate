'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { sendInquiryEmail } from '@/lib/sendInquiryEmail';
import { useCMS } from '@/contexts/CMSContext';

interface ProjectData {
  id: string;
  name: string;
  developer: string;
  location_area: string;
  full_address: string;
  starting_price: number | null;
  handover_date: string;
  status: string;
  project_type: string;
  description: string;
  images: { url?: string; src?: string; caption?: string; alt?: string }[];
  amenities: (string | { label: string; icon?: string })[];
  highlights: string[];
  unit_types: { name?: string; type?: string; size?: string; area?: string; price?: string }[];
  milestones: { label?: string; percentage?: string; dueDate?: string }[];
  total_units: number;
}

interface LeadForm {
  name: string;
  mobile: string;
  email: string;
}

const AMENITY_ICON_MAP: Record<string, string> = {
  'Swimming Pool': 'BeakerIcon', 'Gym': 'BoltIcon', 'Kids Play Area': 'FaceSmileIcon',
  'Parks': 'SunIcon', 'Retail': 'ShoppingBagIcon', 'Mosque': 'BuildingLibraryIcon',
  'School': 'AcademicCapIcon', 'Concierge': 'UserIcon', 'Security': 'ShieldCheckIcon',
  'Parking': 'TruckIcon', 'Beach Access': 'SunIcon', 'Golf Course': 'MapPinIcon',
};

export default function MarketingLandingPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const supabase = useMemo(() => createClient(), []);
  const { branding } = useCMS();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [form, setForm] = useState<LeadForm>({ name: '', mobile: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const logoSrc = branding?.logo_url || '/assets/images/app_logo.png';
  const waDigits = (branding?.whatsapp || '+971508862683').replace(/[^0-9]/g, '');
  const phone = branding?.phone || '+971 50 886 2683';
  const companyName = branding?.company_name || 'Cove Estates';

  useEffect(() => {
    if (!projectId) { setLoaded(true); return; }
    supabase
      .from('projects')
      .select('id, name, developer, location_area, full_address, starting_price, handover_date, status, project_type, description, images, amenities, highlights, unit_types, milestones, total_units')
      .eq('id', projectId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Marketing page project fetch error:', error);
        }
        if (data) setProject(data as ProjectData);
        setLoaded(true);
      });
  }, [projectId, supabase]);

  const images = project
    ? (Array.isArray(project.images) ? project.images : [])
        .map((img) => ({ src: img?.url || img?.src || '', alt: img?.caption || img?.alt || project.name }))
        .filter((img) => img.src)
    : [];

  const amenities = project
    ? (Array.isArray(project.amenities) ? project.amenities : []).map((a) => {
        if (typeof a === 'string') return { icon: AMENITY_ICON_MAP[a] || 'SparklesIcon', label: a };
        return { icon: a.icon || AMENITY_ICON_MAP[a.label || ''] || 'SparklesIcon', label: a.label || '' };
      })
    : [];

  const unitTypes = project
    ? (Array.isArray(project.unit_types) ? project.unit_types : []).map((u) => ({
        type: u.name || u.type || '',
        area: u.size || u.area || 'N/A',
        price: u.price || 'N/A',
      }))
    : [];

  const highlights = project?.highlights?.length
    ? project.highlights
    : unitTypes.map((u) => `${u.type} units available`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.mobile,
        source: 'Marketing Landing Page',
        status: 'New',
        interest: project?.name || 'Marketing Enquiry',
        notes: `Enquiry from marketing landing page for ${project?.name || 'project'}.`,
        project: project?.id || null,
        form_type: 'marketing_landing',
      });
      await sendInquiryEmail({
        name: form.name,
        email: form.email,
        phone: form.mobile,
        message: `Marketing landing page enquiry for ${project?.name || 'project'}.`,
        formType: 'marketing_landing',
        projectName: project?.name,
      });
    } catch (_) {
      // silent — lead saved even if email fails
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <Icon name="BuildingOffice2Icon" size={48} className="text-muted-foreground" />
        <h1 className="text-foreground font-bold text-2xl">Project Not Found</h1>
        <p className="text-muted-foreground text-sm text-center">This landing page is not available or the project has been removed.</p>
      </div>
    );
  }

  const priceFrom = project.starting_price
    ? `AED ${Number(project.starting_price).toLocaleString()}+`
    : null;

  const heroImage = images[0]?.src || '';
  const heroAlt = images[0]?.alt || project.name;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Minimal Header ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <AppLogo src={logoSrc} size={110} className="w-auto" />
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phone}`}
              className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon name="PhoneIcon" size={13} className="text-primary" />
              {phone}
            </a>
            <a
              href={`https://wa.me/${waDigits}?text=Hi, I'm interested in ${project.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-stretch pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          {heroImage ? (
            <AppImage src={heroImage} alt={heroAlt} fill className="object-cover" sizes="100vw" priority />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full py-16 md:py-24 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-center">
            {/* Left — Project Info */}
            <div className="space-y-6 md:space-y-8">
              {project.developer && (
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-primary border border-primary/40 px-4 py-2">
                  {project.developer}
                </span>
              )}
              <div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-3">
                  {project.name}
                </h1>
                {project.location_area && (
                  <p className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Icon name="MapPinIcon" size={14} className="text-primary flex-shrink-0" />
                    {project.full_address || project.location_area}
                  </p>
                )}
              </div>

              {/* Key stats */}
              <div className="flex flex-wrap gap-3">
                {priceFrom && (
                  <div className="bg-black/50 backdrop-blur-sm border border-white/10 px-5 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-0.5">Starting From</p>
                    <p className="text-xl font-black text-primary">{priceFrom}</p>
                  </div>
                )}
                {project.handover_date && (
                  <div className="bg-black/50 backdrop-blur-sm border border-white/10 px-5 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-0.5">Completion</p>
                    <p className="text-xl font-black text-white">{project.handover_date}</p>
                  </div>
                )}
                {project.status && (
                  <div className="bg-primary/20 backdrop-blur-sm border border-primary/40 px-5 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/70 mb-0.5">Status</p>
                    <p className="text-xl font-black text-primary">{project.status}</p>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <ul className="space-y-2">
                  {highlights.slice(0, 4).map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: 'ShieldCheckIcon', label: 'RERA Registered' },
                  { icon: 'StarIcon', label: 'Award-Winning Developer' },
                  { icon: 'KeyIcon', label: 'Flexible Payment Plans' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                    <Icon name={b.icon as any} size={12} className="text-primary" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Lead Capture Form */}
            <div className="lg:flex lg:justify-end">
              <div className="w-full lg:max-w-md">
                {/* Gold accent top bar */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <div className="bg-background/95 backdrop-blur-xl border border-border/80 p-8 md:p-10 shadow-2xl">
                  {submitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                        <Icon name="CheckCircleIcon" size={32} className="text-primary" />
                      </div>
                      <h3 className="text-foreground font-black text-xl tracking-tight">Thank You</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Our specialist will contact you within 2 hours with the brochure and payment plan.
                      </p>
                      <a
                        href={`https://wa.me/${waDigits}?text=Hi, I just registered interest in ${project.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-accent transition-colors mt-4"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Chat on WhatsApp
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="mb-7">
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-2">Exclusive Offer</p>
                        <h2 className="text-xl font-black text-foreground tracking-tight leading-tight">
                          Register Your Interest
                        </h2>
                        <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
                          Get the brochure, floor plans & payment plan delivered instantly.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                          <input
                            required
                            type="text"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-secondary border border-border px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mobile / WhatsApp</label>
                          <input
                            required
                            type="tel"
                            placeholder="+971 50 000 0000"
                            value={form.mobile}
                            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                            className="w-full bg-secondary border border-border px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
                          <input
                            required
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-secondary border border-border px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        {formError && (
                          <p className="text-red-400 text-xs">{formError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-4 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 mt-2"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </span>
                          ) : (
                            <>
                              Get Brochure & Floor Plans
                              <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>

                        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                          By submitting, you agree to be contacted by {companyName}. No spam, ever.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <Icon name="ChevronDownIcon" size={20} />
        </div>
      </section>

      {/* ── Image Gallery Strip ── */}
      {images.length > 1 && (
        <section className="bg-card border-y border-border py-6 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative flex-shrink-0 w-32 h-20 border-2 transition-all duration-300 overflow-hidden ${
                    activeImage === i ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <AppImage src={img.src} alt={img.alt} fill className="object-cover" sizes="128px" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Project Overview ── */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Description */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">About {project.name}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {project.description ? (
                  project.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">{para}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {project.name} is a prestigious {project.project_type || 'residential'} development by {project.developer || companyName}, 
                    located in {project.location_area || 'Dubai'}. This exceptional project offers a unique blend of luxury living and modern design.
                  </p>
                )}
              </div>

              {/* Unit Types */}
              {unitTypes.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Available Units</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="border border-border divide-y divide-border">
                    <div className="grid grid-cols-3 px-5 py-3 bg-card">
                      {['Unit Type', 'Area', 'Starting Price'].map((h) => (
                        <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
                      ))}
                    </div>
                    {unitTypes.map((u, i) => (
                      <div key={i} className="grid grid-cols-3 px-5 py-4 hover:bg-card transition-colors">
                        <span className="text-foreground font-bold text-sm">{u.type}</span>
                        <span className="text-muted-foreground text-xs self-center">{u.area}</span>
                        <span className="text-primary font-bold text-sm">{u.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar stats */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Project Details</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {[
                project.developer ? { label: 'Developer', value: project.developer, icon: 'BuildingOffice2Icon' } : null,
                project.location_area ? { label: 'Location', value: project.location_area, icon: 'MapPinIcon' } : null,
                project.project_type ? { label: 'Type', value: project.project_type, icon: 'HomeIcon' } : null,
                project.handover_date ? { label: 'Completion', value: project.handover_date, icon: 'CalendarIcon' } : null,
                project.total_units ? { label: 'Total Units', value: String(project.total_units), icon: 'BuildingOfficeIcon' } : null,
                project.status ? { label: 'Status', value: project.status, icon: 'CheckCircleIcon' } : null,
                priceFrom ? { label: 'Starting Price', value: priceFrom, icon: 'CurrencyDollarIcon' } : null,
              ].filter(Boolean).map((s) => s && (
                <div key={s.label} className="flex items-center gap-4 p-4 border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={s.icon as any} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    <p className="text-foreground font-bold text-sm">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      {amenities.length > 0 && (
        <section className="py-16 md:py-20 px-6 md:px-10 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">World-Class Amenities</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {amenities.map((a, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 p-5 border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-center group"
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon name={a.icon as any} size={20} className="text-primary" />
                  </div>
                  <span className="text-foreground text-xs font-medium leading-tight">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-background">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-16 h-px bg-primary mx-auto" />
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Secure Your Unit in<br />
            <span className="text-primary">{project.name}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Limited units available. Register now to receive the official brochure, floor plans, and exclusive payment plan options.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors group"
            >
              Register Interest
              <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={`https://wa.me/${waDigits}?text=Hi, I'm interested in ${project.name}. Please send me the brochure.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary text-xs font-black uppercase tracking-[0.25em] hover:bg-primary/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card py-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <AppLogo src={logoSrc} size={100} className="w-auto opacity-70" />
          <p className="text-muted-foreground text-xs text-center">
            © 2026 {companyName}. All rights reserved. RERA Registered.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${waDigits}?text=Hi, I'm interested in ${project.name}. Please send me the brochure.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 shadow-2xl hover:bg-accent transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-xs font-black uppercase tracking-widest">Get Brochure</span>
      </a>
    </div>
  );
}
