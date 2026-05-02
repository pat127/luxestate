'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type SettingsTab = 'Company' | 'Branding' | 'Appearance' | 'Pages' | 'Social' | 'SEO' | 'Workflow' | 'Property Fields';

const tabs: SettingsTab[] = ['Company', 'Branding', 'Appearance', 'Pages', 'Social', 'SEO', 'Workflow', 'Property Fields'];

type PageKey = 'home' | 'residential' | 'commercial' | 'projects' | 'about' | 'blog' | 'contact';

interface PageConfig {
  key: PageKey;
  label: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_description: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  meta_title: string;
  meta_description: string;
  sections: Record<string, boolean>;
}

const DEFAULT_PAGES: PageConfig[] = [
  {
    key: 'home',
    label: 'Home',
    hero_headline: 'Where Luxury Meets Legacy',
    hero_subheadline: 'Ultra-premium properties for discerning buyers',
    hero_description: 'LuxEstate curates the world\'s finest residential and commercial properties for high-net-worth buyers seeking exclusivity, prestige, and exceptional returns.',
    cta_primary_text: 'Explore Properties',
    cta_primary_link: '/residential',
    cta_secondary_text: 'Book Consultation',
    cta_secondary_link: '/#contact',
    meta_title: 'LuxEstate — Ultra-Premium Properties for Discerning Buyers',
    meta_description: 'LuxEstate curates the world\'s finest residential and commercial properties for high-net-worth buyers.',
    sections: { featured_properties: true, featured_projects: true, why_luxestate: true, testimonials: true, mortgage_calculator: true, contact_section: true },
  },
  {
    key: 'residential',
    label: 'Residential',
    hero_headline: 'Exclusive Residential Properties',
    hero_subheadline: 'Villas, penthouses & luxury apartments in Dubai\'s finest locations',
    hero_description: 'Discover our curated portfolio of ultra-premium residential properties, from beachfront villas to sky-high penthouses.',
    cta_primary_text: 'View All Properties',
    cta_primary_link: '/residential#listings',
    cta_secondary_text: 'Book Viewing',
    cta_secondary_link: '/#contact',
    meta_title: 'Luxury Residential Properties Dubai — LuxEstate',
    meta_description: 'Browse exclusive villas, penthouses and luxury apartments in Dubai\'s most prestigious locations.',
    sections: { search_bar: true, listings_grid: true, team_section: true, market_stats: true },
  },
  {
    key: 'commercial',
    label: 'Commercial',
    hero_headline: 'Premium Commercial Real Estate',
    hero_subheadline: 'Office spaces, retail units & investment-grade commercial properties',
    hero_description: 'Strategic commercial properties in Dubai\'s most sought-after business districts, offering exceptional yields and capital appreciation.',
    cta_primary_text: 'View Commercial',
    cta_primary_link: '/commercial#listings',
    cta_secondary_text: 'Get Investment Report',
    cta_secondary_link: '/#contact',
    meta_title: 'Commercial Properties Dubai — LuxEstate',
    meta_description: 'Premium office spaces, retail units and investment-grade commercial properties in Dubai.',
    sections: { listings_grid: true, market_insights: true, commercial_stats: true },
  },
  {
    key: 'projects',
    label: 'Projects',
    hero_headline: 'Off-Plan & New Developments',
    hero_subheadline: 'Exclusive access to Dubai\'s most anticipated new projects',
    hero_description: 'Invest in tomorrow\'s landmarks today. Our off-plan portfolio features the most sought-after developments from Dubai\'s leading developers.',
    cta_primary_text: 'View Projects',
    cta_primary_link: '/projects#gallery',
    cta_secondary_text: 'Register Interest',
    cta_secondary_link: '/#contact',
    meta_title: 'Off-Plan Projects Dubai — LuxEstate',
    meta_description: 'Exclusive off-plan and new development projects in Dubai from leading developers.',
    sections: { projects_gallery: true, project_timeline: true, project_inquiry: true },
  },
  {
    key: 'about',
    label: 'About',
    hero_headline: 'Redefining Luxury Real Estate',
    hero_subheadline: 'A legacy of excellence in Dubai\'s premium property market',
    hero_description: 'LuxEstate was founded with a singular vision: to provide ultra-high-net-worth individuals with unparalleled access to the world\'s most exclusive properties.',
    cta_primary_text: 'Meet Our Team',
    cta_primary_link: '/about#team',
    cta_secondary_text: 'Our Story',
    cta_secondary_link: '/about#story',
    meta_title: 'About LuxEstate — Luxury Real Estate Dubai',
    meta_description: 'Learn about LuxEstate\'s mission, team and 15+ years of excellence in Dubai\'s luxury property market.',
    sections: { team_section: true, stats_section: true, awards_section: true, timeline_section: true },
  },
  {
    key: 'blog',
    label: 'Blog',
    hero_headline: 'Market Insights & News',
    hero_subheadline: 'Expert analysis on Dubai\'s luxury real estate market',
    hero_description: 'Stay informed with the latest market trends, investment insights, and property news from LuxEstate\'s expert team.',
    cta_primary_text: 'Read Latest',
    cta_primary_link: '/blog#latest',
    cta_secondary_text: 'Subscribe',
    cta_secondary_link: '/blog#subscribe',
    meta_title: 'Real Estate Blog & Market Insights — LuxEstate',
    meta_description: 'Expert analysis, market trends and property investment insights from LuxEstate.',
    sections: { featured_post: true, posts_grid: true, categories_filter: true, newsletter_signup: true },
  },
  {
    key: 'contact',
    label: 'Contact',
    hero_headline: 'Get in Touch',
    hero_subheadline: 'Our team of specialists is ready to assist you',
    hero_description: 'Whether you\'re buying, selling, or investing, our dedicated team provides personalised guidance every step of the way.',
    cta_primary_text: 'Send Message',
    cta_primary_link: '/contact#form',
    cta_secondary_text: 'WhatsApp Us',
    cta_secondary_link: 'https://wa.me/971508862683',
    meta_title: 'Contact LuxEstate — Luxury Real Estate Dubai',
    meta_description: 'Contact LuxEstate\'s team of luxury property specialists in Dubai.',
    sections: { contact_form: true, map_section: true, office_details: true, whatsapp_button: true },
  },
];

// ─── Property Field Config ────────────────────────────────────────────────────
interface FieldOption { id: number; value: string; }
interface PropertyFieldGroup {
  key: string;
  label: string;
  options: FieldOption[];
}

const DEFAULT_PROPERTY_FIELDS: PropertyFieldGroup[] = [
  { key: 'statuses', label: 'Property Statuses', options: [{ id: 1, value: 'Available' }, { id: 2, value: 'Under Offer' }, { id: 3, value: 'Sold' }, { id: 4, value: 'Rented' }, { id: 5, value: 'Off Market' }, { id: 6, value: 'Coming Soon' }] },
  { key: 'types', label: 'Property Types', options: [{ id: 1, value: 'Apartment' }, { id: 2, value: 'Villa' }, { id: 3, value: 'Townhouse' }, { id: 4, value: 'Penthouse' }, { id: 5, value: 'Duplex' }, { id: 6, value: 'Studio' }, { id: 7, value: 'Office' }, { id: 8, value: 'Retail' }, { id: 9, value: 'Warehouse' }, { id: 10, value: 'Land' }] },
  { key: 'categories', label: 'Listing Categories', options: [{ id: 1, value: 'Residential' }, { id: 2, value: 'Commercial' }, { id: 3, value: 'Off-Plan' }, { id: 4, value: 'Investment' }] },
  { key: 'furnishing', label: 'Furnishing Status', options: [{ id: 1, value: 'Furnished' }, { id: 2, value: 'Semi-Furnished' }, { id: 3, value: 'Unfurnished' }] },
  { key: 'completion', label: 'Completion Status', options: [{ id: 1, value: 'Ready' }, { id: 2, value: 'Off-Plan' }, { id: 3, value: 'Under Construction' }, { id: 4, value: 'Handover Q1 2026' }, { id: 5, value: 'Handover Q2 2026' }, { id: 6, value: 'Handover Q3 2026' }, { id: 7, value: 'Handover Q4 2026' }] },
  { key: 'amenities', label: 'Amenities', options: [{ id: 1, value: 'Swimming Pool' }, { id: 2, value: 'Gym' }, { id: 3, value: 'Concierge' }, { id: 4, value: 'Parking' }, { id: 5, value: 'Security 24/7' }, { id: 6, value: 'Beach Access' }, { id: 7, value: 'Marina View' }, { id: 8, value: 'Golf Course View' }, { id: 9, value: 'Kids Play Area' }, { id: 10, value: 'Spa' }] },
  { key: 'views', label: 'Views', options: [{ id: 1, value: 'Sea View' }, { id: 2, value: 'Burj Khalifa View' }, { id: 3, value: 'Marina View' }, { id: 4, value: 'Golf View' }, { id: 5, value: 'City View' }, { id: 6, value: 'Garden View' }, { id: 7, value: 'Pool View' }] },
  { key: 'payment_plans', label: 'Payment Plans', options: [{ id: 1, value: 'Full Cash' }, { id: 2, value: '10/90 Plan' }, { id: 3, value: '20/80 Plan' }, { id: 4, value: '30/70 Plan' }, { id: 5, value: '40/60 Plan' }, { id: 6, value: '50/50 Plan' }, { id: 7, value: 'Mortgage' }, { id: 8, value: 'Post-Handover' }] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InputField({ label, value, placeholder, type = 'text' }: { label: string; value?: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} defaultValue={value} placeholder={placeholder} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
    </div>
  );
}

function TextareaField({ label, value, placeholder, rows = 3 }: { label: string; value?: string; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <textarea rows={rows} defaultValue={value} placeholder={placeholder} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <div className="w-1 h-5 bg-primary" />
        {title}
      </h2>
      <p className="text-xs text-muted-foreground mt-1 ml-3">{description}</p>
    </div>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" defaultValue={value} className="w-10 h-10 bg-input border border-border cursor-pointer p-0.5" />
        <input type="text" defaultValue={value} className="flex-1 px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
      </div>
    </div>
  );
}

function ToggleField({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button onClick={() => setChecked(!checked)} className={`w-10 h-5 relative transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Page CMS Editor ──────────────────────────────────────────────────────────
function PageEditor({ page, onChange }: { page: PageConfig; onChange: (p: PageConfig) => void }) {
  const [activeSection, setActiveSection] = useState<'content' | 'sections' | 'seo'>('content');

  const sectionLabels: Record<string, string> = {
    featured_properties: 'Featured Properties', featured_projects: 'Featured Projects', why_luxestate: 'Why LuxEstate',
    testimonials: 'Testimonials', mortgage_calculator: 'Mortgage Calculator', contact_section: 'Contact Section',
    search_bar: 'Search Bar', listings_grid: 'Listings Grid', team_section: 'Team Section', market_stats: 'Market Stats',
    market_insights: 'Market Insights', commercial_stats: 'Commercial Stats', projects_gallery: 'Projects Gallery',
    project_timeline: 'Project Timeline', project_inquiry: 'Project Inquiry', stats_section: 'Stats Section',
    awards_section: 'Awards Section', timeline_section: 'Timeline Section', featured_post: 'Featured Post',
    posts_grid: 'Posts Grid', categories_filter: 'Categories Filter', newsletter_signup: 'Newsletter Signup',
    contact_form: 'Contact Form', map_section: 'Map Section', office_details: 'Office Details', whatsapp_button: 'WhatsApp Button',
  };

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-border">
        {(['content', 'sections', 'seo'] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeSection === s ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {s === 'content' ? 'Content & Hero' : s === 'sections' ? 'Page Sections' : 'SEO'}
          </button>
        ))}
      </div>

      {activeSection === 'content' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Hero Headline</label>
              <input defaultValue={page.hero_headline} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Hero Subheadline</label>
              <input defaultValue={page.hero_subheadline} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Hero Description</label>
              <textarea rows={3} defaultValue={page.hero_description} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Primary CTA Text</label>
              <input defaultValue={page.cta_primary_text} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Primary CTA Link</label>
              <input defaultValue={page.cta_primary_link} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Secondary CTA Text</label>
              <input defaultValue={page.cta_secondary_text} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Secondary CTA Link</label>
              <input defaultValue={page.cta_secondary_link} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Hero Background Image</label>
            <div className="border border-dashed border-border p-5 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Icon name="PhotoIcon" size={22} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Click to upload hero image (recommended: 1920×1080)</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'sections' && (
        <div className="space-y-0">
          {Object.entries(page.sections).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{sectionLabels[key] || key}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Show on {page.label} page</p>
              </div>
              <button
                onClick={() => onChange({ ...page, sections: { ...page.sections, [key]: !enabled } })}
                className={`w-10 h-5 relative transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'seo' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Page Title</label>
            <input defaultValue={page.meta_title} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            <p className="text-xs text-muted-foreground mt-1">{page.meta_title.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Meta Description</label>
            <textarea rows={3} defaultValue={page.meta_description} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
            <p className="text-xs text-muted-foreground mt-1">{page.meta_description.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">OG Image</label>
            <div className="border border-dashed border-border p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Icon name="PhotoIcon" size={20} className="text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Upload OG image (1200×630)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Property Fields Manager ──────────────────────────────────────────────────
function PropertyFieldsManager() {
  const [groups, setGroups] = useState<PropertyFieldGroup[]>(DEFAULT_PROPERTY_FIELDS);
  const [activeGroup, setActiveGroup] = useState(DEFAULT_PROPERTY_FIELDS[0].key);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const group = groups.find((g) => g.key === activeGroup)!;

  const addOption = () => {
    if (!newValue.trim()) return;
    setGroups(groups.map((g) => g.key === activeGroup ? { ...g, options: [...g.options, { id: Date.now(), value: newValue.trim() }] } : g));
    setNewValue('');
  };

  const removeOption = (id: number) => {
    setGroups(groups.map((g) => g.key === activeGroup ? { ...g, options: g.options.filter((o) => o.id !== id) } : g));
  };

  const saveEdit = (id: number) => {
    if (!editValue.trim()) return;
    setGroups(groups.map((g) => g.key === activeGroup ? { ...g, options: g.options.map((o) => o.id === id ? { ...o, value: editValue } : o) } : g));
    setEditingId(null);
  };

  return (
    <div>
      <SectionHeader title="Property Field Configuration" description="Manage dropdown options, statuses, and field values used across property listings" />
      <div className="flex gap-6">
        {/* Group selector */}
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {groups.map((g) => (
              <button key={g.key} onClick={() => setActiveGroup(g.key)} className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors border ${activeGroup === g.key ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/2'}`}>
                <div>{g.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{g.options.length} options</div>
              </button>
            ))}
          </div>
        </div>

        {/* Options editor */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
            <span className="text-xs text-muted-foreground">{group.options.length} options</span>
          </div>
          <div className="space-y-2 mb-4">
            {group.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 p-2.5 bg-card border border-border">
                {editingId === opt.id ? (
                  <>
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(opt.id)} className="flex-1 bg-input border border-primary/50 px-2 py-1 text-sm text-foreground focus:outline-none" autoFocus />
                    <button onClick={() => saveEdit(opt.id)} className="text-xs text-primary hover:underline px-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground hover:text-foreground px-2">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-primary/40 flex-shrink-0" />
                    <span className="flex-1 text-sm text-foreground">{opt.value}</span>
                    <button onClick={() => { setEditingId(opt.id); setEditValue(opt.value); }} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={12} /></button>
                    <button onClick={() => removeOption(opt.id)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={12} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOption()}
              placeholder={`Add new ${group.label.toLowerCase()} option...`}
              className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button onClick={addOption} disabled={!newValue.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Company');
  const [saved, setSaved] = useState(false);
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [activePage, setActivePage] = useState<PageKey>('home');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentPage = pages.find((p) => p.key === activePage)!;
  const updatePage = (updated: PageConfig) => setPages(pages.map((p) => p.key === updated.key ? updated : p));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all site content and configuration</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name={saved ? 'CheckIcon' : 'CloudArrowUpIcon'} size={14} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {activeTab === 'Company' && (
          <div className="space-y-6">
            <SectionHeader title="Company Information" description="Basic company details and contact information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Company Name" value="LuxEstate" />
              <InputField label="Tagline" value="Luxury Real Estate in Dubai" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Phone" value="+971 50 886 2683" />
              <InputField label="Email" value="admin@luxestate.com" />
              <InputField label="WhatsApp" value="+971508862683" />
            </div>
            <TextareaField label="Address" value="8th Level, Moosa Tower 1, Dubai, UAE" rows={2} />
          </div>
        )}

        {activeTab === 'Branding' && (
          <div className="space-y-6">
            <SectionHeader title="Brand Identity" description="Logo, colors, and typography settings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorField label="Primary Color (Gold)" value="#C9A84C" />
              <ColorField label="Accent Color" value="#B8963E" />
              <ColorField label="Background Color" value="#0A0A0A" />
              <ColorField label="Foreground Color" value="#F5F0E8" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Font Family</label>
                <select className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Plus Jakarta Sans</option><option>DM Sans</option><option>Manrope</option><option>Cabinet Grotesk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Border Radius</label>
                <select className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>0px — Sharp</option><option>4px — Slight</option><option>8px — Rounded</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo Upload</label>
              <div className="border border-dashed border-border p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Icon name="PhotoIcon" size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload logo (SVG, PNG, JPG)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div className="space-y-6">
            <SectionHeader title="Site Appearance" description="Layout, theme, and visual settings" />
            <div className="space-y-0">
              <ToggleField label="Dark Mode" description="Enable dark mode by default" defaultChecked={true} />
              <ToggleField label="Sticky Header" description="Keep navigation fixed on scroll" defaultChecked={true} />
              <ToggleField label="Scroll Animations" description="Enable scroll-triggered animations" defaultChecked={true} />
              <ToggleField label="Gold Shimmer Effects" description="Enable gold shimmer text animations" defaultChecked={true} />
              <ToggleField label="Show WhatsApp Button" description="Display WhatsApp chat button in header" defaultChecked={true} />
            </div>
          </div>
        )}

        {activeTab === 'Pages' && (
          <div>
            <SectionHeader title="Page CMS Settings" description="Configure content, sections, and SEO for each page individually" />
            {/* Page selector */}
            <div className="flex flex-wrap gap-1 border border-border overflow-hidden mb-6 w-fit">
              {pages.map((p) => (
                <button key={p.key} onClick={() => setActivePage(p.key)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activePage === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Page editor */}
            <div className="bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 bg-primary" />
                <h3 className="text-sm font-bold text-foreground">{currentPage.label} Page</h3>
                <span className="text-xs text-muted-foreground">/{currentPage.key === 'home' ? '' : currentPage.key}</span>
              </div>
              <PageEditor page={currentPage} onChange={updatePage} />
            </div>
          </div>
        )}

        {activeTab === 'Social' && (
          <div className="space-y-6">
            <SectionHeader title="Social Media Links" description="Configure social media profiles and links" />
            <div className="space-y-4">
              {[
                { label: 'Instagram', placeholder: 'https://instagram.com/luxestate' },
                { label: 'LinkedIn', placeholder: 'https://linkedin.com/company/luxestate' },
                { label: 'Facebook', placeholder: 'https://facebook.com/luxestate' },
                { label: 'Twitter / X', placeholder: 'https://twitter.com/luxestate' },
                { label: 'YouTube', placeholder: 'https://youtube.com/@luxestate' },
                { label: 'TikTok', placeholder: 'https://tiktok.com/@luxestate' },
              ].map((s) => <InputField key={s.label} label={s.label} placeholder={s.placeholder} />)}
            </div>
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-6">
            <SectionHeader title="Global SEO Configuration" description="Site-wide search engine optimization settings" />
            <InputField label="Site Title" value="LuxEstate — Ultra-Premium Properties for Discerning Buyers" />
            <TextareaField label="Meta Description" value="LuxEstate curates the world's finest residential and commercial properties for high-net-worth buyers." rows={3} />
            <InputField label="Google Analytics ID" placeholder="G-XXXXXXXXXX" />
            <InputField label="Google Search Console Verification" placeholder="google-site-verification=..." />
            <div className="space-y-0">
              <ToggleField label="Enable Sitemap" description="Auto-generate XML sitemap" defaultChecked={true} />
              <ToggleField label="Enable Robots.txt" description="Allow search engine crawling" defaultChecked={true} />
              <ToggleField label="Structured Data (JSON-LD)" description="Enable schema.org markup" defaultChecked={true} />
              <ToggleField label="Open Graph Tags" description="Enable social sharing meta tags" defaultChecked={true} />
            </div>
          </div>
        )}

        {activeTab === 'Workflow' && (
          <div className="space-y-6">
            <SectionHeader title="Workflow Settings" description="Configure CRM workflow and automation" />
            <div className="space-y-0">
              <ToggleField label="Auto-assign Leads" description="Automatically assign new leads to agents" defaultChecked={true} />
              <ToggleField label="Lead Notifications" description="Send email notifications for new leads" defaultChecked={true} />
              <ToggleField label="Deal Stage Alerts" description="Notify agents when deal stage changes" defaultChecked={true} />
              <ToggleField label="Task Reminders" description="Send task due date reminders" defaultChecked={true} />
              <ToggleField label="Weekly Reports" description="Auto-generate and email weekly reports" defaultChecked={true} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Lead Assignment Method</label>
                <select className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Round Robin</option><option>By Availability</option><option>Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Follow-up Reminder (days)</label>
                <input type="number" defaultValue={3} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Property Fields' && <PropertyFieldsManager />}
      </div>
    </div>
  );
}
