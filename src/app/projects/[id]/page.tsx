'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProjectImage { src: string; alt: string; }
interface UnitType { type: string; area: string; price: string; available: number; }
interface PaymentPhase { phase: string; percent: number; label: string; icon: string; }
interface Amenity { icon: string; label: string; }
interface ConstructionPhase { phase: string; complete: number; }
interface SimilarProject { id: string; name: string; location: string; image: string; alt: string; completion: string; priceFrom: string; units: number; href: string; }

const AMENITY_ICON_MAP: Record<string, string> = {
  'Swimming Pool': 'BeakerIcon', 'Gym': 'BoltIcon', 'Kids Play Area': 'FaceSmileIcon',
  'Parks': 'SunIcon', 'Retail': 'ShoppingBagIcon', 'Mosque': 'BuildingLibraryIcon',
  'School': 'AcademicCapIcon', 'Concierge': 'UserIcon', 'Security': 'ShieldCheckIcon',
  'Parking': 'TruckIcon', 'Beach Access': 'SunIcon', 'Golf Course': 'MapPinIcon',
};
const PHASE_ICONS = ['PencilSquareIcon', 'CalendarIcon', 'BuildingOfficeIcon', 'KeyIcon'];

function mapProject(p: any) {
  const images: ProjectImage[] = (Array.isArray(p.images) ? p.images : [])
    .map((img: any) => ({ src: img?.url || img?.src || '', alt: img?.caption || img?.alt || p.name || '' }))
    .filter((img: ProjectImage) => img.src);

  const unitTypes: UnitType[] = (Array.isArray(p.unit_types) ? p.unit_types : []).map((u: any) => ({
    type: u.name || u.type || '', area: u.size || u.area || 'N/A', price: u.price || 'N/A', available: u.available ?? 0,
  }));

  const amenities: Amenity[] = (Array.isArray(p.amenities) ? p.amenities : []).map((a: any) => {
    if (typeof a === 'string') return { icon: AMENITY_ICON_MAP[a] || 'SparklesIcon', label: a };
    return { icon: a.icon || AMENITY_ICON_MAP[a.label || ''] || 'SparklesIcon', label: a.label || '' };
  });

  const paymentPlan: PaymentPhase[] = (Array.isArray(p.milestones) ? p.milestones : []).map((m: any, i: number) => ({
    phase: m.label || `Phase ${i + 1}`,
    percent: parseInt(String(m.percentage || '0').replace('%', ''), 10) || 0,
    label: m.dueDate || '',
    icon: PHASE_ICONS[i] || 'CheckCircleIcon',
  }));

  const highlights: string[] = Array.isArray(p.highlights) && p.highlights.length > 0
    ? p.highlights
    : (Array.isArray(p.property_types) && p.property_types.length > 0
      ? p.property_types.map((t: string) => `${t} units available`)
      : []);

  return {
    id: p.id,
    name: p.name || '',
    developer: p.developer || '',
    location: p.location_area || '',
    address: p.full_address || [p.sub_community, p.community, p.location_area].filter(Boolean).join(', ') || '',
    completion: p.handover_date || '',
    units: p.total_units || 0,
    floors: p.floors || '',
    priceFrom: p.starting_price ? `AED ${Number(p.starting_price).toLocaleString()}+` : '',
    priceTo: '',
    status: p.status || '',
    sold: p.sold_units || 0,
    type: p.project_type || '',
    reference: `CE-PRJ-${String(p.id).slice(0, 6).toUpperCase()}`,
    description: (p.description || '').trim(),
    tagline: `${p.project_type || 'Off-Plan'} by ${p.developer || ''}`,
    highlights,
    unitTypes,
    paymentPlan,
    amenities,
    images,
    constructionProgress: Array.isArray(p.construction_progress) ? p.construction_progress : [],
    location_coords: { lat: parseFloat(p.latitude) || 25.0657, lng: parseFloat(p.longitude) || 55.1713 },
    pois: Array.isArray(p.pois) ? p.pois : [],
    agent: {
      name: 'LuxEstate Specialist', title: 'Off-Plan Consultant',
      phone: '+971 4 000 0000', whatsapp: '971400000000',
      email: 'projects@luxestate.ae', avatar: '', avatarAlt: 'LuxEstate Specialist',
      listings: 0, experience: '', languages: 'English, Arabic',
    },
  };
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function GallerySection({ images, project }: { images: ProjectImage[]; project: ReturnType<typeof mapProject> }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <section className="relative w-full bg-secondary flex items-center justify-center" style={{ height: 'clamp(360px, 65vh, 720px)' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3 block">{project.developer}</span>
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">{project.name}</h1>
            <p className="text-white/70 text-sm md:text-base tracking-widest uppercase">{project.tagline}</p>
          </div>
        </div>
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5">{project.status}</span>
          {project.completion && <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-border">{project.completion}</span>}
        </div>
        <Icon name="BuildingOffice2Icon" size={60} className="text-muted-foreground/30" />
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="relative w-full cursor-zoom-in" style={{ height: 'clamp(360px, 65vh, 720px)' }} onClick={() => setLightbox(true)}>
        <AppImage src={images[active]?.src ?? ''} alt={images[active]?.alt ?? project.name} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3 block">{project.developer}</span>
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">{project.name}</h1>
            <p className="text-white/70 text-sm md:text-base tracking-widest uppercase">{project.tagline}</p>
          </div>
        </div>
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5">{project.status}</span>
          {project.completion && <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-border">{project.completion}</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); setLightbox(true); }} className="absolute top-6 right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/20 hover:border-primary transition-colors">
          <Icon name="PhotoIcon" size={14} />{images.length} Photos
        </button>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"><Icon name="ChevronLeftIcon" size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all"><Icon name="ChevronRightIcon" size={18} /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 px-6 md:px-10 py-3 bg-card border-b border-border overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`relative flex-shrink-0 w-20 h-14 border-2 transition-all duration-300 overflow-hidden ${active === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
              <AppImage src={img.src} alt={img.alt} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-6 right-6 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all" onClick={() => setLightbox(false)}><Icon name="XMarkIcon" size={20} /></button>
          {images.length > 1 && <button className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all" onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}><Icon name="ChevronLeftIcon" size={22} /></button>}
          <div className="relative w-full max-w-5xl mx-8" style={{ height: '70vh' }} onClick={(e) => e.stopPropagation()}>
            <AppImage src={images[active]?.src ?? ''} alt={images[active]?.alt ?? ''} fill className="object-contain" sizes="100vw" />
          </div>
          {images.length > 1 && <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:border-primary hover:text-primary transition-all" onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}><Icon name="ChevronRightIcon" size={22} /></button>}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">{active + 1} / {images.length}</div>
        </div>
      )}
    </section>
  );
}

function PaymentPlanSection({ paymentPlan }: { paymentPlan: PaymentPhase[] }) {
  if (paymentPlan.length === 0) return null;
  const total = paymentPlan.reduce((s, p) => s + p.percent, 0);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Payment Plan</span><div className="flex-1 h-px bg-border" /></div>
      <div className="flex h-3 border border-border overflow-hidden">
        {paymentPlan.map((p, i) => <div key={i} style={{ width: `${p.percent}%` }} className={`h-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary/70' : i === 2 ? 'bg-primary/40' : 'bg-primary/20'}`} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentPlan.map((p, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 border border-primary/30 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={p.icon as any} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-foreground font-bold text-sm">{p.phase}</span>
                <span className="text-primary font-black text-lg">{p.percent}%</span>
              </div>
              {p.label && <p className="text-muted-foreground text-xs">{p.label}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
        <span className="text-primary font-black text-xl">{total}%</span>
      </div>
    </div>
  );
}

function AgentCard({ agent, projectName, reference }: { agent: ReturnType<typeof mapProject>['agent']; projectName: string; reference: string }) {
  return (
    <div className="border border-border bg-card p-6 space-y-5 gold-glow-animate">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 border-2 border-primary/40 overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
          {agent.avatar ? <AppImage src={agent.avatar} alt={agent.avatarAlt} fill className="object-cover" sizes="64px" /> : <Icon name="UserIcon" size={28} className="text-muted-foreground" />}
        </div>
        <div>
          <h4 className="text-foreground font-bold text-base">{agent.name}</h4>
          <p className="text-primary text-xs font-medium tracking-wide">{agent.title}</p>
          <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
            {agent.experience && <span>{agent.experience}</span>}
          </div>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        {agent.languages && <p className="flex items-center gap-2"><Icon name="GlobeAltIcon" size={12} className="text-primary" />{agent.languages}</p>}
        {agent.email && <p className="flex items-center gap-2"><Icon name="EnvelopeIcon" size={12} className="text-primary" />{agent.email}</p>}
      </div>
      <div className="space-y-2.5">
        {agent.whatsapp && <a href={`https://wa.me/${agent.whatsapp}?text=Hi, I'm interested in ${projectName} (Ref: ${reference})`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-accent transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp Agent
        </a>}
        {agent.phone && <a href={`tel:${agent.phone}`} className="flex items-center justify-center gap-2 w-full py-3 border border-primary text-primary text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors"><Icon name="PhoneIcon" size={14} />{agent.phone}</a>}
        {agent.email && <a href={`mailto:${agent.email}?subject=Enquiry: ${projectName}`} className="flex items-center justify-center gap-2 w-full py-3 border border-border text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors"><Icon name="EnvelopeIcon" size={14} />Send Email</a>}
      </div>
    </div>
  );
}

function EnquiryForm({ projectName, reference, unitTypes, projectId }: { projectName: string; reference: string; unitTypes: UnitType[]; projectId: string }) {
  const supabase = createClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '', unitType: '', message: `I'm interested in ${projectName} (Ref: ${reference}). Please send me the brochure and payment plan.` });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('leads').insert({
      name: form.name, email: form.email, phone: form.phone,
      source: 'Website', status: 'New',
      interest: form.unitType ? `${projectName} — ${form.unitType}` : projectName,
      notes: form.message,
    });
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <Icon name="CheckCircleIcon" size={40} className="text-primary mx-auto" />
        <p className="text-foreground font-bold text-lg">Enquiry Received</p>
        <p className="text-muted-foreground text-sm">Our off-plan specialist will contact you within 2 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
      <h4 className="text-foreground font-bold text-sm uppercase tracking-[0.2em]">Register Interest</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      </div>
      <input type="tel" placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors" />
      {unitTypes.length > 0 && (
        <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
          <option value="">Interested Unit Type</option>
          {unitTypes.map((u) => <option key={u.type} value={u.type}>{u.type}{u.price !== 'N/A' ? ` — ${u.price}` : ''}</option>)}
        </select>
      )}
      <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      <button type="submit" disabled={submitting} className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center gap-2 group disabled:opacity-60">
        {submitting ? 'Submitting...' : 'Register Interest'}
        <Icon name="ArrowRightIcon" size={14} className="transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-[10px] text-muted-foreground text-center">Download brochure & floor plans sent instantly upon registration</p>
    </form>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<ReturnType<typeof mapProject> | null>(null);
  const [similar, setSimilar] = useState<SimilarProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoaded(true); return; }
    supabase.from('projects').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoaded(true); return; }
      const mapped = mapProject(data);
      setProject(mapped);
      // Load similar projects
      supabase.from('projects').select('id, name, location_area, images, handover_date, starting_price, total_units').eq('published', true).neq('id', id).limit(3).then(({ data: simData }) => {
        if (simData) {
          setSimilar(simData.map((p: any) => {
            const imgs = Array.isArray(p.images) ? p.images : [];
            const img = imgs[0]?.url || imgs[0]?.src || '';
            return { id: p.id, name: p.name || '', location: p.location_area || '', image: img, alt: p.name || '', completion: p.handover_date || '', priceFrom: p.starting_price ? `AED ${Number(p.starting_price).toLocaleString()}+` : '', units: p.total_units || 0, href: `/projects/${p.id}` };
          }));
        }
      });
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) {
    return (
      <main className="bg-background"><Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !project) {
    return (
      <main className="bg-background"><Header />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Icon name="BuildingOffice2Icon" size={48} className="text-muted-foreground" />
          <h1 className="text-foreground font-bold text-2xl">Project Not Found</h1>
          <p className="text-muted-foreground text-sm">This project may have been removed or the link is incorrect.</p>
          <Link href="/projects" className="mt-4 px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors">View All Projects</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const soldPercent = project.units > 0 ? Math.round((project.sold / project.units) * 100) : 0;

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <div className="pt-[72px]"><GallerySection images={project.images} project={project} /></div>

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground">{project.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {project.developer && <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">{project.developer}</span>}
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">{project.name}</h2>
              {project.address && <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5"><Icon name="MapPinIcon" size={13} className="text-primary" />{project.address}</p>}
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              {project.priceFrom && <p className="text-3xl md:text-4xl font-black text-primary">{project.priceFrom}</p>}
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Ref: {project.reference}</p>
            </div>
          </div>
          {project.units > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest mb-2">
                <span>{project.sold} of {project.units} Units Reserved</span>
                <span className="text-primary font-bold">{soldPercent}% Sold</span>
              </div>
              <div className="h-1.5 bg-border overflow-hidden"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${soldPercent}%` }} /></div>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex gap-3 min-w-max md:min-w-0 flex-wrap">
            {[
              project.units > 0 ? { icon: 'HomeIcon', label: 'Total Units', value: `${project.units} Residences` } : null,
              project.completion ? { icon: 'CalendarIcon', label: 'Completion', value: project.completion } : null,
              project.location ? { icon: 'MapPinIcon', label: 'Location', value: project.location } : null,
              project.type ? { icon: 'StarIcon', label: 'Type', value: project.type } : null,
              project.status ? { icon: 'CheckCircleIcon', label: 'Status', value: project.status } : null,
            ].filter(Boolean).map((s) => s && (
              <div key={s.label} className="flex items-center gap-3 px-5 py-3 border border-border bg-card">
                <Icon name={s.icon as any} size={16} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-foreground font-bold text-sm">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-14">
            {project.description && (
              <div className="space-y-5">
                <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">About the Project</span><div className="flex-1 h-px bg-border" /></div>
                {project.description.split('\n\n').map((para, i) => <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">{para}</p>)}
              </div>
            )}
            {project.highlights.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Key Highlights</span><div className="flex-1 h-px bg-border" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {project.unitTypes.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Available Units</span><div className="flex-1 h-px bg-border" /></div>
                <div className="border border-border divide-y divide-border">
                  <div className="grid grid-cols-4 px-5 py-3 bg-card">
                    {['Unit Type', 'Area', 'Starting Price', 'Available'].map((h) => <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>)}
                  </div>
                  {project.unitTypes.map((u, i) => (
                    <div key={i} className="grid grid-cols-4 px-5 py-4 hover:bg-card transition-colors items-center">
                      <span className="text-foreground font-bold text-sm">{u.type}</span>
                      <span className="text-muted-foreground text-xs">{u.area}</span>
                      <span className="text-primary font-bold text-sm">{u.price}</span>
                      <span className={`text-xs font-bold ${u.available <= 3 && u.available > 0 ? 'text-red-400' : 'text-foreground'}`}>{u.available > 0 ? `${u.available} Left` : 'Enquire'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {project.paymentPlan.length > 0 && <PaymentPlanSection paymentPlan={project.paymentPlan} />}
            {project.amenities.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Amenities</span><div className="flex-1 h-px bg-border" /></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {project.amenities.map((a, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 border border-border bg-card hover:border-primary/40 transition-colors text-center">
                      <Icon name={a.icon as any} size={20} className="text-primary" />
                      <span className="text-foreground text-xs font-medium">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-5">
              <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Location</span><div className="flex-1 h-px bg-border" /></div>
              <div className="relative border border-border overflow-hidden" style={{ height: 360 }}>
                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.location_coords.lng - 0.01},${project.location_coords.lat - 0.01},${project.location_coords.lng + 0.01},${project.location_coords.lat + 0.01}&layer=mapnik&marker=${project.location_coords.lat},${project.location_coords.lng}`} width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }} loading="lazy" title={`Map showing ${project.address || project.name}`} />
                {project.address && <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border px-4 py-2"><p className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon name="MapPinIcon" size={12} className="text-primary" />{project.address}</p></div>}
              </div>
            </div>
            <div className="lg:hidden space-y-5">
              <div className="flex items-center gap-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Register Interest</span><div className="flex-1 h-px bg-border" /></div>
              <AgentCard agent={project.agent} projectName={project.name} reference={project.reference} />
              <EnquiryForm projectName={project.name} reference={project.reference} unitTypes={project.unitTypes} projectId={id} />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <AgentCard agent={project.agent} projectName={project.name} reference={project.reference} />
              <EnquiryForm projectName={project.name} reference={project.reference} unitTypes={project.unitTypes} projectId={id} />
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-border py-16 px-6 md:px-10 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Similar Projects</span>
              <div className="flex-1 h-px bg-border" />
              <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">View All <Icon name="ArrowRightIcon" size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {similar.map((p) => (
                <Link key={p.id} href={p.href} className="block bg-background border border-border group hover:border-primary/30 transition-colors">
                  <div className="relative h-52 overflow-hidden">
                    {p.image ? <AppImage src={p.image} alt={p.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="w-full h-full bg-secondary flex items-center justify-center"><Icon name="BuildingOffice2Icon" size={32} className="text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {p.completion && <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border">{p.completion}</span>}
                  </div>
                  <div className="p-4 border-t border-border">
                    <h3 className="text-foreground font-bold text-base leading-tight">{p.name}</h3>
                    {p.location && <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1"><Icon name="MapPinIcon" size={10} className="text-primary" />{p.location}</p>}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                      {p.priceFrom && <span className="text-primary font-bold text-sm">{p.priceFrom}</span>}
                      {p.units > 0 && <span className="text-muted-foreground text-xs">{p.units} Units</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.agent.whatsapp && (
        <a href={`https://wa.me/${project.agent.whatsapp}?text=Hi, I'm interested in ${project.name} (Ref: ${project.reference}). Please send me the brochure.`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3 shadow-2xl hover:bg-accent transition-all duration-300" aria-label="Chat on WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          <span className="text-xs font-black uppercase tracking-widest">Get Brochure</span>
        </a>
      )}
      <Footer />
    </main>
  );
}