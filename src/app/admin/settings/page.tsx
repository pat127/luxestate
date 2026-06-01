'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useCMS, PageConfig, PageKey, BrandingConfig, HomepageBlock, DEFAULT_HOMEPAGE_BLOCKS, DEFAULT_FEATURED_PROPERTIES, DEFAULT_FEATURED_PROJECTS, DEFAULT_WHY_LUXESTATE, DEFAULT_TESTIMONIALS, DEFAULT_CONTACT, DEFAULT_MORTGAGE, DEFAULT_HERO_STATS, DEFAULT_ABOUT_CONTENT, HeroStat, PropertyItem, ProjectItem, WhyStep, TestimonialItem, AwardItem, ContactDetail, PropertyDetailContent, ProjectDetailContent,  } from '@/contexts/CMSContext';
import { UAE_LOCATIONS, UAELocation } from '@/lib/uaeLocations';
import { createClient } from '@/lib/supabase/client';
import { CMS_IMAGE_FOLDERS, extractCmsImageUrls, getSiteAssetsPath, isSiteAssetsUrl } from '@/lib/cmsImages';

type SettingsTab = 'Company' | 'Branding' | 'Appearance' | 'Pages' | 'Social' | 'SEO' | 'Workflow' | 'Property Fields' | 'Communities';

const tabs: SettingsTab[] = ['Company', 'Branding', 'Appearance', 'Pages', 'Social', 'SEO', 'Workflow', 'Property Fields', 'Communities'];

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
function tryParseError(text: string): string {
  try { return JSON.parse(text)?.error || ''; } catch { return text; }
}
function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }: { label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange?.(e.target.value)} className="w-10 h-10 bg-input border border-border cursor-pointer p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange?.(e.target.value)} className="flex-1 px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
      </div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className={`w-10 h-5 relative transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Homepage Blocks Manager ──────────────────────────────────────────────────
const AVAILABLE_BLOCKS: { key: string; label: string; description: string }[] = [
  { key: 'featured_properties', label: 'Featured Properties', description: 'Showcase a curated grid of featured property listings' },
  { key: 'featured_projects', label: 'Featured Projects', description: 'Highlight off-plan and new development projects' },
  { key: 'why_luxestate', label: 'Why Cove Estates', description: 'Scrolling workflow section explaining the Cove Estates process' },
  { key: 'testimonials', label: 'Testimonials', description: 'Client testimonials and awards recognition section' },
  { key: 'mortgage_calculator', label: 'Mortgage Calculator', description: 'Interactive mortgage and payment calculator tool' },
  { key: 'contact_section', label: 'Contact Section', description: 'Contact form and office details section' },
];

function HomepageBlocksManager({ page, onChange }: { page: PageConfig; onChange: (p: PageConfig) => void }) {
  const blocks: HomepageBlock[] = page.homepage_blocks?.length
    ? page.homepage_blocks
    : DEFAULT_HOMEPAGE_BLOCKS;

  const activeKeys = new Set(blocks.map((b) => b.key));

  const toggleBlock = (key: string) => {
    const updated = blocks.map((b) => b.key === key ? { ...b, visible: !b.visible } : b);
    onChange({ ...page, homepage_blocks: updated, sections: buildSections(updated) });
  };

  const removeBlock = (key: string) => {
    const updated = blocks.filter((b) => b.key !== key).map((b, i) => ({ ...b, order: i + 1 }));
    onChange({ ...page, homepage_blocks: updated, sections: buildSections(updated) });
  };

  const addBlock = (key: string) => {
    const def = AVAILABLE_BLOCKS.find((b) => b.key === key);
    if (!def) return;
    const newBlock: HomepageBlock = { key, label: def.label, visible: true, order: blocks.length + 1, editable: true };
    const updated = [...blocks, newBlock];
    onChange({ ...page, homepage_blocks: updated, sections: buildSections(updated) });
  };

  const moveBlock = (key: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex((b) => b.key === key);
    if (idx < 0) return;
    const newBlocks = [...blocks];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newBlocks.length) return;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    const reordered = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
    onChange({ ...page, homepage_blocks: reordered, sections: buildSections(reordered) });
  };

  const buildSections = (blks: HomepageBlock[]): Record<string, boolean> => {
    const s: Record<string, boolean> = {};
    blks.forEach((b) => { s[b.key] = b.visible; });
    return s;
  };

  const removableKeys = blocks.map((b) => b.key);
  const addableBlocks = AVAILABLE_BLOCKS.filter((b) => !activeKeys.has(b.key));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">Drag to reorder, toggle visibility, or remove blocks from the homepage. Changes apply after saving.</p>
      </div>

      {/* Active Blocks */}
      <div className="space-y-2 mb-6">
        {blocks.map((block, idx) => (
          <div key={block.key} className={`flex items-center gap-3 p-3 border transition-colors ${block.visible ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'}`}>
            {/* Reorder */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveBlock(block.key, 'up')}
                disabled={idx === 0}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                title="Move up"
              >
                <Icon name="ChevronUpIcon" size={12} />
              </button>
              <button
                onClick={() => moveBlock(block.key, 'down')}
                disabled={idx === blocks.length - 1}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                title="Move down"
              >
                <Icon name="ChevronDownIcon" size={12} />
              </button>
            </div>

            {/* Order badge */}
            <div className="w-6 h-6 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{block.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {AVAILABLE_BLOCKS.find((b) => b.key === block.key)?.description || ''}
              </p>
            </div>

            {/* Visibility status */}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0 ${block.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
              {block.visible ? 'Visible' : 'Hidden'}
            </span>

            {/* Toggle visibility */}
            <button
              onClick={() => toggleBlock(block.key)}
              className={`w-10 h-5 relative transition-colors flex-shrink-0 ${block.visible ? 'bg-primary' : 'bg-muted'}`}
              title={block.visible ? 'Hide block' : 'Show block'}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${block.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>

            {/* Remove */}
            <button
              onClick={() => removeBlock(block.key)}
              className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
              title="Remove block"
            >
              <Icon name="TrashIcon" size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Block */}
      {addableBlocks.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Add Block</p>
          <div className="space-y-2">
            {addableBlocks.map((block) => (
              <div key={block.key} className="flex items-center gap-3 p-3 border border-dashed border-border/60 bg-card/30">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground">{block.label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{block.description}</p>
                </div>
                <button
                  onClick={() => addBlock(block.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                >
                  <Icon name="PlusIcon" size={12} />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {blocks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No blocks on homepage. Add blocks above to build your homepage.
        </div>
      )}
    </div>
  );
}

// ─── Hero Stats Editor ────────────────────────────────────────────────────────
function HeroStatsEditor({ stats, onChange }: { stats: HeroStat[]; onChange: (s: HeroStat[]) => void }) {
  const update = (i: number, field: keyof HeroStat, val: string) => {
    const updated = stats.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange(updated);
  };
  const add = () => onChange([...stats, { value: 'New', label: 'Stat Label' }]);
  const remove = (i: number) => onChange(stats.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hero Stats</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add Stat
        </button>
      </div>
      <div className="space-y-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={stat.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder="Value" className="w-24 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            <input value={stat.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
            <button onClick={() => remove(i)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Properties Editor ────────────────────────────────────────────────────────
function PropertiesEditor({ properties, onChange }: { properties: PropertyItem[]; onChange: (p: PropertyItem[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const update = (i: number, field: keyof PropertyItem, val: string | number) => {
    const updated = properties.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(updated);
  };
  const add = () => {
    const newProp: PropertyItem = { id: Date.now(), name: 'New Property', location: 'Location', price: '$0', beds: 3, baths: 2, sqft: '2,000', tag: 'Property', href: '/residential', image: '', alt: 'Property image' };
    onChange([...properties, newProp]);
    setExpanded(properties.length);
  };
  const remove = (i: number) => { onChange(properties.filter((_, idx) => idx !== i)); if (expanded === i) setExpanded(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Properties ({properties.length})</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {properties.map((prop, i) => (
          <div key={prop.id} className="border border-border bg-card">
            <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <Icon name={expanded === i ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-foreground truncate">{prop.name}</span>
              <span className="text-xs text-primary font-bold">{prop.price}</span>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={12} /></button>
            </div>
            {expanded === i && (
              <div className="p-3 border-t border-border grid grid-cols-2 gap-2">
                <div className="col-span-2"><InputField label="Name" value={prop.name} onChange={(v) => update(i, 'name', v)} /></div>
                <InputField label="Location" value={prop.location} onChange={(v) => update(i, 'location', v)} />
                <InputField label="Price" value={prop.price} onChange={(v) => update(i, 'price', v)} />
                <InputField label="Tag" value={prop.tag} onChange={(v) => update(i, 'tag', v)} />
                <InputField label="Link" value={prop.href} onChange={(v) => update(i, 'href', v)} />
                <div className="col-span-2">
                  <SiteImageUpload
                    label="Property Image"
                    folder={CMS_IMAGE_FOLDERS.cms}
                    fileKey={`featured_property_${prop.id}`}
                    currentUrl={prop.image}
                    onChange={(v) => update(i, 'image', v)}
                  />
                </div>
                <div className="col-span-2"><InputField label="Image Alt Text" value={prop.alt} onChange={(v) => update(i, 'alt', v)} /></div>
                <InputField label="Beds" value={String(prop.beds)} onChange={(v) => update(i, 'beds', Number(v))} />
                <InputField label="Baths" value={String(prop.baths)} onChange={(v) => update(i, 'baths', Number(v))} />
                <InputField label="Sqft" value={prop.sqft} onChange={(v) => update(i, 'sqft', v)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Projects Editor ──────────────────────────────────────────────────────────
function ProjectsEditor({ projects, onChange }: { projects: ProjectItem[]; onChange: (p: ProjectItem[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const update = (i: number, field: keyof ProjectItem, val: string | number) => {
    const updated = projects.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(updated);
  };
  const add = () => {
    const newProj: ProjectItem = { id: Date.now(), name: 'New Project', developer: 'Developer', location: 'Location', type: 'Off-Plan', completion: 'Q4 2026', price: 'AED 1M+', units: 100, sold: 0, image: '', alt: 'Project image', tag: 'New Launch' };
    onChange([...projects, newProj]);
    setExpanded(projects.length);
  };
  const remove = (i: number) => { onChange(projects.filter((_, idx) => idx !== i)); if (expanded === i) setExpanded(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projects ({projects.length})</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {projects.map((proj, i) => (
          <div key={proj.id} className="border border-border bg-card">
            <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <Icon name={expanded === i ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-foreground truncate">{proj.name}</span>
              <span className="text-xs text-primary font-bold">{proj.price}</span>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={12} /></button>
            </div>
            {expanded === i && (
              <div className="p-3 border-t border-border grid grid-cols-2 gap-2">
                <div className="col-span-2"><InputField label="Name" value={proj.name} onChange={(v) => update(i, 'name', v)} /></div>
                <InputField label="Developer" value={proj.developer} onChange={(v) => update(i, 'developer', v)} />
                <InputField label="Location" value={proj.location} onChange={(v) => update(i, 'location', v)} />
                <InputField label="Price" value={proj.price} onChange={(v) => update(i, 'price', v)} />
                <InputField label="Tag" value={proj.tag} onChange={(v) => update(i, 'tag', v)} />
                <InputField label="Type" value={proj.type} onChange={(v) => update(i, 'type', v)} />
                <InputField label="Completion" value={proj.completion} onChange={(v) => update(i, 'completion', v)} />
                <InputField label="Units" value={String(proj.units)} onChange={(v) => update(i, 'units', Number(v))} />
                <InputField label="% Sold" value={String(proj.sold)} onChange={(v) => update(i, 'sold', Number(v))} />
                <div className="col-span-2">
                  <SiteImageUpload
                    label="Project Image"
                    folder={CMS_IMAGE_FOLDERS.cms}
                    fileKey={`featured_project_${proj.id}`}
                    currentUrl={proj.image}
                    onChange={(v) => update(i, 'image', v)}
                  />
                </div>
                <div className="col-span-2"><InputField label="Image Alt Text" value={proj.alt} onChange={(v) => update(i, 'alt', v)} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Why Steps Editor ─────────────────────────────────────────────────────────
function WhyStepsEditor({ steps, onChange }: { steps: WhyStep[]; onChange: (s: WhyStep[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const update = (i: number, field: keyof WhyStep, val: string) => {
    const updated = steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange(updated);
  };
  const add = () => {
    const n = steps.length + 1;
    const newStep: WhyStep = { id: String(n), number: String(n).padStart(2, '0'), title: 'New Step', description: 'Step description', badge: 'Badge', image: '', imageAlt: 'Step image' };
    onChange([...steps, newStep]);
    setExpanded(steps.length);
  };
  const remove = (i: number) => { onChange(steps.filter((_, idx) => idx !== i)); if (expanded === i) setExpanded(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Process Steps ({steps.length})</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.id} className="border border-border bg-card">
            <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <Icon name={expanded === i ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-bold text-primary w-8">{step.number}</span>
              <span className="flex-1 text-sm font-medium text-foreground truncate">{step.title}</span>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={12} /></button>
            </div>
            {expanded === i && (
              <div className="p-3 border-t border-border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Number" value={step.number} onChange={(v) => update(i, 'number', v)} />
                  <InputField label="Badge" value={step.badge} onChange={(v) => update(i, 'badge', v)} />
                </div>
                <InputField label="Title" value={step.title} onChange={(v) => update(i, 'title', v)} />
                <TextareaField label="Description" value={step.description} onChange={(v) => update(i, 'description', v)} rows={3} />
                <SiteImageUpload
                  label="Step Image"
                  folder={CMS_IMAGE_FOLDERS.cms}
                  fileKey={`why_step_${step.id}`}
                  currentUrl={step.image}
                  onChange={(v) => update(i, 'image', v)}
                />
                <InputField label="Image Alt Text" value={step.imageAlt} onChange={(v) => update(i, 'imageAlt', v)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Testimonials Editor ──────────────────────────────────────────────────────
function TestimonialsEditor({ testimonials, onChange }: { testimonials: TestimonialItem[]; onChange: (t: TestimonialItem[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const update = (i: number, field: keyof TestimonialItem, val: string | boolean) => {
    const updated = testimonials.map((t, idx) => idx === i ? { ...t, [field]: val } : t);
    onChange(updated);
  };
  const setCenter = (i: number) => {
    const updated = testimonials.map((t, idx) => ({ ...t, isCenter: idx === i }));
    onChange(updated);
  };
  const add = () => {
    const newT: TestimonialItem = { name: 'Client Name', location: 'Location', quote: 'Testimonial quote here.', role: 'Role', image: '', imageAlt: 'Client portrait' };
    onChange([...testimonials, newT]);
    setExpanded(testimonials.length);
  };
  const remove = (i: number) => { onChange(testimonials.filter((_, idx) => idx !== i)); if (expanded === i) setExpanded(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Testimonials ({testimonials.length})</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {testimonials.map((t, i) => (
          <div key={i} className="border border-border bg-card">
            <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <Icon name={expanded === i ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-foreground truncate">{t.name}</span>
              {t.isCenter && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 font-bold">CENTER</span>}
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={12} /></button>
            </div>
            {expanded === i && (
              <div className="p-3 border-t border-border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Name" value={t.name} onChange={(v) => update(i, 'name', v)} />
                  <InputField label="Role" value={t.role} onChange={(v) => update(i, 'role', v)} />
                </div>
                <InputField label="Location" value={t.location} onChange={(v) => update(i, 'location', v)} />
                <TextareaField label="Quote" value={t.quote} onChange={(v) => update(i, 'quote', v)} rows={2} />
                <SiteImageUpload
                  label="Client Photo"
                  folder={CMS_IMAGE_FOLDERS.cms}
                  fileKey={`testimonial_${i}`}
                  currentUrl={t.image}
                  onChange={(v) => update(i, 'image', v)}
                />
                <InputField label="Image Alt Text" value={t.imageAlt} onChange={(v) => update(i, 'imageAlt', v)} />
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setCenter(i)} className={`px-3 py-1.5 text-xs font-bold border transition-colors ${t.isCenter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                    {t.isCenter ? '✓ Center Card' : 'Set as Center Card'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Awards Editor ────────────────────────────────────────────────────────────
function AwardsEditor({ awards, onChange }: { awards: AwardItem[]; onChange: (a: AwardItem[]) => void }) {
  const update = (i: number, field: keyof AwardItem, val: string) => {
    const updated = awards.map((a, idx) => idx === i ? { ...a, [field]: val } : a);
    onChange(updated);
  };
  const add = () => onChange([...awards, { title: 'Publication', category: 'Award Category', year: '2025' }]);
  const remove = (i: number) => onChange(awards.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Awards ({awards.length})</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {awards.map((award, i) => (
          <div key={i} className="flex gap-2 items-center p-2 border border-border bg-card">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input value={award.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Publication" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
              <input value={award.category} onChange={(e) => update(i, 'category', e.target.value)} placeholder="Category" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
              <input value={award.year} onChange={(e) => update(i, 'year', e.target.value)} placeholder="Year" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <button onClick={() => remove(i)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Details Editor ───────────────────────────────────────────────────
function ContactDetailsEditor({ details, onChange }: { details: ContactDetail[]; onChange: (d: ContactDetail[]) => void }) {
  const update = (i: number, field: keyof ContactDetail, val: string) => {
    const updated = details.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
    onChange(updated);
  };
  const add = () => onChange([...details, { icon: 'PhoneIcon', label: 'Label', value: 'Value' }]);
  const remove = (i: number) => onChange(details.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Details</p>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <Icon name="PlusIcon" size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {details.map((detail, i) => (
          <div key={i} className="flex gap-2 items-center p-2 border border-border bg-card">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input value={detail.icon} onChange={(e) => update(i, 'icon', e.target.value)} placeholder="Icon name" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
              <input value={detail.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Label" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
              <input value={detail.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder="Value" className="px-2 py-1.5 bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <button onClick={() => remove(i)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Site image upload (Supabase site-assets bucket) ───────────────────────────
function SiteImageUpload({
  label = 'Image',
  currentUrl,
  onChange,
  folder = CMS_IMAGE_FOLDERS.cms,
  fileKey = 'cms',
  variant = 'cms',
  pageKey,
}: {
  label?: string;
  currentUrl: string;
  onChange: (url: string) => void;
  folder?: string;
  fileKey?: string;
  variant?: 'hero' | 'cms';
  pageKey?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [urlUploading, setUrlUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadEndpoint = variant === 'hero' ? '/api/admin/upload-hero-image' : '/api/admin/upload-site-image';
  const oldPath = getSiteAssetsPath(currentUrl);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (variant === 'hero' && pageKey) {
        fd.append('pageKey', pageKey);
        if (oldPath) fd.append('oldPath', oldPath);
      } else {
        fd.append('folder', folder);
        fd.append('fileKey', fileKey);
        if (oldPath) fd.append('oldPath', oldPath);
      }
      const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text();
        const msg = text.startsWith('<') ? `Upload failed (HTTP ${res.status})` : text;
        console.error('Image upload error:', msg);
        return;
      }
      const data = await res.json();
      if (data.url) { onChange(data.url); setPasteUrl(''); }
      else if (data.error) console.error('Image upload error:', data.error);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    const url = pasteUrl.trim();
    if (!url) return;
    setUrlUploading(true);
    setUrlError('');
    try {
      const body =
        variant === 'hero' && pageKey
          ? { sourceUrl: url, pageKey, oldPath }
          : { sourceUrl: url, folder, fileKey, oldPath };
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        const msg = text.startsWith('<') ? `Upload failed (HTTP ${res.status})` : text;
        setUrlError(msg);
        return;
      }
      const data = await res.json();
      if (data.url) { onChange(data.url); setPasteUrl(''); setUrlError(''); }
      else if (data.error) setUrlError(data.error);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUrlUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isUploading = uploading || urlUploading;

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      {currentUrl ? (
        <div className="relative group border border-border bg-card overflow-hidden">
          <img src={currentUrl} alt="Hero preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => fileRef.current?.click()} disabled={isUploading} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
          </div>
          <div className="px-3 py-2 bg-card border-t border-border">
            <p className="text-xs text-muted-foreground truncate">{currentUrl}</p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileRef.current?.click()}
          className={`border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground">{urlUploading ? 'Downloading & uploading...' : 'Uploading...'}</p>
            </div>
          ) : (
            <>
              <Icon name="PhotoIcon" size={28} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
              <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP — recommended 1920×1080 or larger</p>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

      <div className="mt-3 border border-border bg-card p-3">
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Paste Image URL & Upload to Storage</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            onKeyDown={(e) => { if (e.key === 'Enter') handleUrlUpload(); }}
          />
          <button
            onClick={handleUrlUpload}
            disabled={!pasteUrl.trim() || isUploading}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {urlUploading ? (
              <><div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent animate-spin" /> Uploading...</>
            ) : (
              <><Icon name="CloudArrowUpIcon" size={14} /> Upload to Storage</>
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5">Paste any image URL — it will be downloaded and saved to Supabase storage</p>
        {urlError && (
          <p className="text-[11px] text-red-500 mt-1.5 font-medium">{urlError}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page CMS Editor ──────────────────────────────────────────────────────────
function PageEditor({ page, onChange }: { page: PageConfig; onChange: (p: PageConfig) => void }) {
  const isHome = page.key === 'home';
  const isAbout = page.key === 'about';
  type SubTab = 'content' | 'sections' | 'seo' | 'blocks' | 'hero' | 'properties' | 'projects' | 'why' | 'testimonials' | 'contact' | 'mortgage' | 'about_story' | 'about_values' | 'about_ceo';
  const [activeSection, setActiveSection] = useState<SubTab>('content');

  const sectionLabels: Record<string, string> = {
    featured_properties: 'Featured Properties', featured_projects: 'Featured Projects', why_luxestate: 'Why Cove Estates',
    testimonials: 'Testimonials', mortgage_calculator: 'Mortgage Calculator', contact_section: 'Contact Section',
    search_bar: 'Search Bar', listings_grid: 'Listings Grid', team_section: 'Meet Our CEO', market_stats: 'Market Stats',
    market_insights: 'Market Insights', commercial_stats: 'Commercial Stats', projects_gallery: 'Projects Gallery',
    project_timeline: 'Project Timeline', project_inquiry: 'Project Inquiry', stats_section: 'Stats Section',
    awards_section: 'Awards Section', timeline_section: 'Timeline Section', featured_post: 'Featured Post',
    posts_grid: 'Posts Grid', categories_filter: 'Categories Filter', newsletter_signup: 'Newsletter Signup',
    contact_form: 'Contact Form', map_section: 'Map Section', office_details: 'Office Details', whatsapp_button: 'WhatsApp Button',
  };

  const subTabs: { key: SubTab; label: string }[] = isHome
    ? [
        { key: 'content', label: 'Hero' },
        { key: 'blocks', label: 'Blocks' },
        { key: 'properties', label: 'Properties' },
        { key: 'projects', label: 'Projects' },
        { key: 'why', label: 'Our Process' },
        { key: 'testimonials', label: 'Testimonials' },
        { key: 'contact', label: 'Contact' },
        { key: 'mortgage', label: 'Calculator' },
        { key: 'seo', label: 'SEO' },
      ]
    : isAbout
    ? [
        { key: 'content', label: 'Hero' },
        { key: 'about_story', label: 'Our Story' },
        { key: 'about_values', label: 'Values' },
        { key: 'about_ceo', label: 'Meet Our CEO' },
        { key: 'sections', label: 'Page Sections' },
        { key: 'seo', label: 'SEO' },
      ]
    : [
        { key: 'content', label: 'Content & Hero' },
        { key: 'sections', label: 'Page Sections' },
        { key: 'seo', label: 'SEO' },
      ];

  // Helpers to get/set nested content
  const fp = page.featured_properties_content ?? DEFAULT_FEATURED_PROPERTIES;
  const fj = page.featured_projects_content ?? DEFAULT_FEATURED_PROJECTS;
  const wy = page.why_luxestate_content ?? DEFAULT_WHY_LUXESTATE;
  const tm = page.testimonials_content ?? DEFAULT_TESTIMONIALS;
  const ct = page.contact_content ?? DEFAULT_CONTACT;
  const mg = page.mortgage_content ?? DEFAULT_MORTGAGE;
  const hs = page.hero_stats ?? DEFAULT_HERO_STATS;
  const ab = page.about_content ?? DEFAULT_ABOUT_CONTENT;

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-border flex-wrap">
        {subTabs.map((s) => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeSection === s.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'content' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputField label="Hero Headline" value={page.hero_headline} onChange={(v) => onChange({ ...page, hero_headline: v })} />
            </div>
            {isHome && (
              <div className="sm:col-span-2">
                <InputField label="Hero Eyebrow Text" value={page.hero_eyebrow ?? ''} onChange={(v) => onChange({ ...page, hero_eyebrow: v })} />
              </div>
            )}
            <div className="sm:col-span-2">
              <InputField label="Hero Subheadline" value={page.hero_subheadline} onChange={(v) => onChange({ ...page, hero_subheadline: v })} />
            </div>
            <div className="sm:col-span-2">
              <TextareaField label="Hero Description" value={page.hero_description} onChange={(v) => onChange({ ...page, hero_description: v })} />
            </div>
            <div className="sm:col-span-2">
              <SiteImageUpload
                label="Hero Background Image"
                variant="hero"
                pageKey={page.key}
                folder={CMS_IMAGE_FOLDERS.hero}
                fileKey={`${page.key}_hero`}
                currentUrl={page.hero_image ?? ''}
                onChange={(v) => onChange({ ...page, hero_image: v })}
              />
            </div>
            <InputField label="Primary CTA Text" value={page.cta_primary_text} onChange={(v) => onChange({ ...page, cta_primary_text: v })} />
            <InputField label="Primary CTA Link" value={page.cta_primary_link} onChange={(v) => onChange({ ...page, cta_primary_link: v })} />
            <InputField label="Secondary CTA Text" value={page.cta_secondary_text} onChange={(v) => onChange({ ...page, cta_secondary_text: v })} />
            <InputField label="Secondary CTA Link" value={page.cta_secondary_link} onChange={(v) => onChange({ ...page, cta_secondary_link: v })} />
          </div>
          {isHome && (
            <div className="pt-2">
              <HeroStatsEditor stats={hs} onChange={(s) => onChange({ ...page, hero_stats: s })} />
            </div>
          )}
          {isAbout && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Hero Stats</p>
              <div className="space-y-2">
                {ab.hero_stats.map((stat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={stat.value} onChange={(e) => { const updated = ab.hero_stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s); onChange({ ...page, about_content: { ...ab, hero_stats: updated } }); }} placeholder="Value" className="w-24 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <input value={stat.label} onChange={(e) => { const updated = ab.hero_stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s); onChange({ ...page, about_content: { ...ab, hero_stats: updated } }); }} placeholder="Label" className="flex-1 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary/80">
              <span className="font-semibold">Live Preview:</span> Changes reflect on the <strong>/{page.key === 'home' ? '' : page.key}</strong> page after clicking Save Changes.
            </p>
          </div>
        </div>
      )}

      {activeSection === 'about_story' && isAbout && (
        <div className="space-y-4">
          <SectionHeader title="Our Story" description="Edit the company story section text and timeline milestones." />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={ab.story_eyebrow} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_eyebrow: v } })} />
            <InputField label="Headline" value={ab.story_headline} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_headline: v } })} />
            <InputField label="Headline Shimmer Word" value={ab.story_headline_shimmer} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_headline_shimmer: v } })} />
          </div>
          <TextareaField label="Paragraph 1" value={ab.story_paragraph1} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_paragraph1: v } })} rows={3} />
          <TextareaField label="Paragraph 2" value={ab.story_paragraph2} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_paragraph2: v } })} rows={3} />
          <TextareaField label="Paragraph 3" value={ab.story_paragraph3} onChange={(v) => onChange({ ...page, about_content: { ...ab, story_paragraph3: v } })} rows={3} />
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timeline Milestones</p>
              <button onClick={() => onChange({ ...page, about_content: { ...ab, milestones: [...ab.milestones, { year: 'Year', event: 'Event description' }] } })} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                <Icon name="PlusIcon" size={11} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {ab.milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input value={m.year} onChange={(e) => { const updated = ab.milestones.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x); onChange({ ...page, about_content: { ...ab, milestones: updated } }); }} placeholder="Year" className="w-16 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <input value={m.event} onChange={(e) => { const updated = ab.milestones.map((x, idx) => idx === i ? { ...x, event: e.target.value } : x); onChange({ ...page, about_content: { ...ab, milestones: updated } }); }} placeholder="Event description" className="flex-1 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <button onClick={() => onChange({ ...page, about_content: { ...ab, milestones: ab.milestones.filter((_, idx) => idx !== i) } })} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'about_values' && isAbout && (
        <div className="space-y-4">
          <SectionHeader title="Core Values" description="Edit the values section heading and individual value cards." />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={ab.values_eyebrow} onChange={(v) => onChange({ ...page, about_content: { ...ab, values_eyebrow: v } })} />
            <InputField label="Section Headline" value={ab.values_headline} onChange={(v) => onChange({ ...page, about_content: { ...ab, values_headline: v } })} />
            <div className="col-span-2">
              <TextareaField label="Section Subtext" value={ab.values_subtext} onChange={(v) => onChange({ ...page, about_content: { ...ab, values_subtext: v } })} rows={2} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Values ({ab.values.length})</p>
              <button onClick={() => onChange({ ...page, about_content: { ...ab, values: [...ab.values, { icon: 'StarIcon', title: 'New Value', description: 'Description' }] } })} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                <Icon name="PlusIcon" size={11} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {ab.values.map((v, i) => (
                <div key={i} className="border border-border bg-card p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={v.title} onChange={(e) => { const updated = ab.values.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x); onChange({ ...page, about_content: { ...ab, values: updated } }); }} placeholder="Title" className="flex-1 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <button onClick={() => onChange({ ...page, about_content: { ...ab, values: ab.values.filter((_, idx) => idx !== i) } })} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                  <textarea value={v.description} onChange={(e) => { const updated = ab.values.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x); onChange({ ...page, about_content: { ...ab, values: updated } }); }} placeholder="Description" rows={2} className="w-full px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'about_ceo' && isAbout && (
        <div className="space-y-4">
          <SectionHeader title="Meet Our CEO" description="Edit the CEO section heading, bio, image, and stats." />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={ab.ceo_eyebrow} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo_eyebrow: v } })} />
            <InputField label="Section Headline" value={ab.ceo_section_headline} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo_section_headline: v } })} />
            <div className="col-span-2">
              <TextareaField label="Section Subtext" value={ab.ceo_section_subtext} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo_section_subtext: v } })} rows={2} />
            </div>
          </div>
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">CEO Details</p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Name" value={ab.ceo.name} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, name: v } } })} />
              <InputField label="Role / Title" value={ab.ceo.role} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, role: v } } })} />
              <div className="col-span-2">
                <SiteImageUpload
                  label="CEO Photo"
                  folder={CMS_IMAGE_FOLDERS.cms}
                  fileKey="about_ceo"
                  currentUrl={ab.ceo.image}
                  onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, image: v } } })}
                />
              </div>
              <div className="col-span-2">
                <InputField label="Photo Alt Text" value={ab.ceo.alt} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, alt: v } } })} />
              </div>
              <div className="col-span-2">
                <TextareaField label="Bio (Paragraph 1)" value={ab.ceo.bio} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, bio: v } } })} rows={3} />
              </div>
              <div className="col-span-2">
                <TextareaField label="Bio (Paragraph 2)" value={ab.ceo.bio2} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, bio2: v } } })} rows={3} />
              </div>
              <div className="col-span-2">
                <InputField label="LinkedIn URL" value={ab.ceo.linkedin} onChange={(v) => onChange({ ...page, about_content: { ...ab, ceo: { ...ab.ceo, linkedin: v } } })} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CEO Stats</p>
              <button onClick={() => onChange({ ...page, about_content: { ...ab, ceo_stats: [...ab.ceo_stats, { value: '—', label: 'Stat Label' }] } })} className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                <Icon name="PlusIcon" size={11} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {ab.ceo_stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={stat.value} onChange={(e) => { const updated = ab.ceo_stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s); onChange({ ...page, about_content: { ...ab, ceo_stats: updated } }); }} placeholder="Value" className="w-24 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <input value={stat.label} onChange={(e) => { const updated = ab.ceo_stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s); onChange({ ...page, about_content: { ...ab, ceo_stats: updated } }); }} placeholder="Label" className="flex-1 px-2 py-1.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <button onClick={() => onChange({ ...page, about_content: { ...ab, ceo_stats: ab.ceo_stats.filter((_, idx) => idx !== i) } })} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'blocks' && isHome && (
        <HomepageBlocksManager page={page} onChange={onChange} />
      )}

      {activeSection === 'properties' && isHome && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={fp.eyebrow} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, eyebrow: v } })} />
            <InputField label="Headline" value={fp.headline} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, headline: v } })} />
            <InputField label="Headline Shimmer Word" value={fp.headline_shimmer} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, headline_shimmer: v } })} />
            <InputField label="CTA Text" value={fp.cta_text} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, cta_text: v } })} />
            <InputField label="CTA Link" value={fp.cta_link} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, cta_link: v } })} />
            <div className="col-span-2">
              <TextareaField label="Description" value={fp.description} onChange={(v) => onChange({ ...page, featured_properties_content: { ...fp, description: v } })} rows={2} />
            </div>
          </div>
          <PropertiesEditor properties={fp.properties} onChange={(p) => onChange({ ...page, featured_properties_content: { ...fp, properties: p } })} />
        </div>
      )}

      {activeSection === 'projects' && isHome && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={fj.eyebrow} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, eyebrow: v } })} />
            <InputField label="Headline" value={fj.headline} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, headline: v } })} />
            <InputField label="Headline Shimmer Word" value={fj.headline_shimmer} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, headline_shimmer: v } })} />
            <InputField label="CTA Text" value={fj.cta_text} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, cta_text: v } })} />
            <InputField label="CTA Link" value={fj.cta_link} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, cta_link: v } })} />
            <div className="col-span-2">
              <TextareaField label="Description" value={fj.description} onChange={(v) => onChange({ ...page, featured_projects_content: { ...fj, description: v } })} rows={2} />
            </div>
          </div>
          <ProjectsEditor projects={fj.projects} onChange={(p) => onChange({ ...page, featured_projects_content: { ...fj, projects: p } })} />
        </div>
      )}

      {activeSection === 'why' && isHome && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={wy.eyebrow} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, eyebrow: v } })} />
            <InputField label="Section Subtext" value={wy.subtext} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, subtext: v } })} />
            <InputField label="CTA Text" value={wy.cta_text} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, cta_text: v } })} />
            <InputField label="CTA Link" value={wy.cta_link} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, cta_link: v } })} />
          </div>
          <div className="bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary/80">
              <span className="font-semibold">Our Process</span> — The section heading is fixed as "Our Process". Edit the eyebrow, subtext, CTA, and individual process steps below.
            </p>
          </div>
          <WhyStepsEditor steps={wy.steps} onChange={(s) => onChange({ ...page, why_luxestate_content: { ...wy, steps: s } })} />
        </div>
      )}

      {activeSection === 'testimonials' && isHome && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={tm.eyebrow} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, eyebrow: v } })} />
            <InputField label="Headline" value={tm.headline} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, headline: v } })} />
            <InputField label="Headline Shimmer Word" value={tm.headline_shimmer} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, headline_shimmer: v } })} />
            <InputField label="Awards Eyebrow" value={tm.awards_eyebrow} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, awards_eyebrow: v } })} />
            <InputField label="Awards Headline" value={tm.awards_headline} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, awards_headline: v } })} />
            <InputField label="Awards Shimmer Word" value={tm.awards_headline_shimmer} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, awards_headline_shimmer: v } })} />
            <div className="col-span-2">
              <TextareaField label="Awards Subtext" value={tm.awards_subtext} onChange={(v) => onChange({ ...page, testimonials_content: { ...tm, awards_subtext: v } })} rows={2} />
            </div>
          </div>
          <TestimonialsEditor testimonials={tm.testimonials} onChange={(t) => onChange({ ...page, testimonials_content: { ...tm, testimonials: t } })} />
          <AwardsEditor awards={tm.awards} onChange={(a) => onChange({ ...page, testimonials_content: { ...tm, awards: a } })} />
        </div>
      )}

      {activeSection === 'contact' && isHome && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Section Eyebrow" value={ct.eyebrow} onChange={(v) => onChange({ ...page, contact_content: { ...ct, eyebrow: v } })} />
            <InputField label="Headline" value={ct.headline} onChange={(v) => onChange({ ...page, contact_content: { ...ct, headline: v } })} />
            <InputField label="Headline Shimmer Word" value={ct.headline_shimmer} onChange={(v) => onChange({ ...page, contact_content: { ...ct, headline_shimmer: v } })} />
            <InputField label="Availability Text" value={ct.availability_text} onChange={(v) => onChange({ ...page, contact_content: { ...ct, availability_text: v } })} />
            <div className="col-span-2">
              <TextareaField label="Description" value={ct.description} onChange={(v) => onChange({ ...page, contact_content: { ...ct, description: v } })} rows={2} />
            </div>
            <div className="col-span-2">
              <TextareaField label="Availability Subtext" value={ct.availability_subtext} onChange={(v) => onChange({ ...page, contact_content: { ...ct, availability_subtext: v } })} rows={2} />
            </div>
          </div>
          <ContactDetailsEditor details={ct.details} onChange={(d) => onChange({ ...page, contact_content: { ...ct, details: d } })} />
        </div>
      )}

      {activeSection === 'mortgage' && isHome && (
        <div className="space-y-4">
          <InputField label="Section Eyebrow" value={mg.eyebrow} onChange={(v) => onChange({ ...page, mortgage_content: { ...mg, eyebrow: v } })} />
          <InputField label="Headline (use \\n for line break)" value={mg.headline} onChange={(v) => onChange({ ...page, mortgage_content: { ...mg, headline: v } })} />
          <TextareaField label="Description" value={mg.description} onChange={(v) => onChange({ ...page, mortgage_content: { ...mg, description: v } })} rows={2} />
          <InputField label="CTA Text" value={mg.cta_text} onChange={(v) => onChange({ ...page, mortgage_content: { ...mg, cta_text: v } })} />
          <InputField label="CTA Link" value={mg.cta_link} onChange={(v) => onChange({ ...page, mortgage_content: { ...mg, cta_link: v } })} />
        </div>
      )}

      {activeSection === 'sections' && !isHome && (
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
          <InputField label="Page Title" value={page.meta_title} onChange={(v) => onChange({ ...page, meta_title: v })} />
          <p className="text-xs text-muted-foreground -mt-2">{page.meta_title.length}/60 characters</p>
          <TextareaField label="Meta Description" value={page.meta_description} onChange={(v) => onChange({ ...page, meta_description: v })} />
          <p className="text-xs text-muted-foreground -mt-2">{page.meta_description.length}/160 characters</p>
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
const DEFAULT_GROUP_KEYS = new Set(['statuses', 'types', 'categories', 'furnishing', 'completion', 'amenities', 'views', 'payment_plans']);

function PropertyFieldsManager() {
  const [groups, setGroups] = useState<PropertyFieldGroup[]>(DEFAULT_PROPERTY_FIELDS);
  const [activeGroup, setActiveGroup] = useState(DEFAULT_PROPERTY_FIELDS[0].key);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupLabel, setNewGroupLabel] = useState('');
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'property_fields')
      .single()
      .then(({ data }) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setGroups(data.data as PropertyFieldGroup[]);
        } else {
          supabase.from('site_settings').upsert(
            { key: 'property_fields', data: DEFAULT_PROPERTY_FIELDS, updated_at: new Date().toISOString() },
            { onConflict: 'key' },
          );
        }
      });
  }, [supabase]);

  const persistGroups = async (updated: PropertyFieldGroup[]) => {
    setGroups(updated);
    setSaving(true);
    await supabase
      .from('site_settings')
      .upsert({ key: 'property_fields', data: updated, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addGroup = () => {
    const label = newGroupLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (groups.some((g) => g.key === key)) return;
    const updated = [...groups, { key, label, options: [] }];
    persistGroups(updated);
    setActiveGroup(key);
    setNewGroupLabel('');
    setShowNewGroupForm(false);
  };

  const deleteGroup = (key: string) => {
    if (DEFAULT_GROUP_KEYS.has(key)) return;
    const updated = groups.filter((g) => g.key !== key);
    persistGroups(updated);
    if (activeGroup === key) setActiveGroup(updated[0]?.key ?? '');
  };

  const group = groups.find((g) => g.key === activeGroup)!;

  const addOption = () => {
    if (!newValue.trim()) return;
    const updated = groups.map((g) => g.key === activeGroup ? { ...g, options: [...g.options, { id: Date.now(), value: newValue.trim() }] } : g);
    persistGroups(updated);
    setNewValue('');
  };

  const removeOption = (id: number) => {
    const updated = groups.map((g) => g.key === activeGroup ? { ...g, options: g.options.filter((o) => o.id !== id) } : g);
    persistGroups(updated);
  };

  const saveEdit = (id: number) => {
    if (!editValue.trim()) return;
    const updated = groups.map((g) => g.key === activeGroup ? { ...g, options: g.options.map((o) => o.id === id ? { ...o, value: editValue } : o) } : g);
    persistGroups(updated);
    setEditingId(null);
  };

  return (
    <div>
      <SectionHeader title="Property Field Configuration" description="Manage dropdown options, statuses, and field values used across property listings" />
      {(saved || saving) && (
        <div className="mb-4">
          <span className={`text-xs font-semibold ${saving ? 'text-primary' : 'text-emerald-400'} flex items-center gap-1.5`}>
            <Icon name={saving ? 'ArrowPathIcon' : 'CheckCircleIcon'} size={14} className={saving ? 'animate-spin' : ''} />
            {saving ? 'Saving…' : 'Saved'}
          </span>
        </div>
      )}
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {groups.map((g) => (
              <button key={g.key} onClick={() => setActiveGroup(g.key)} className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors border group ${activeGroup === g.key ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/2'}`}>
                <div className="flex items-center justify-between">
                  <span>{g.label}</span>
                  {!DEFAULT_GROUP_KEYS.has(g.key) && (
                    <span onClick={(e) => { e.stopPropagation(); deleteGroup(g.key); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-1" title="Delete group">
                      <Icon name="TrashIcon" size={11} />
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">{g.options.length} options{!DEFAULT_GROUP_KEYS.has(g.key) ? ' · custom' : ''}</div>
              </button>
            ))}
          </div>
          {showNewGroupForm ? (
            <div className="mt-3 space-y-2">
              <input value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addGroup()} placeholder="Group name…" className="w-full px-2.5 py-2 bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" autoFocus />
              <div className="flex gap-1.5">
                <button onClick={addGroup} disabled={!newGroupLabel.trim()} className="flex-1 px-2 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">Create</button>
                <button onClick={() => { setShowNewGroupForm(false); setNewGroupLabel(''); }} className="flex-1 px-2 py-1.5 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewGroupForm(true)} className="mt-3 w-full px-3 py-2.5 border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1.5">
              <Icon name="PlusIcon" size={12} /> New Field Group
            </button>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">{group.label}{!DEFAULT_GROUP_KEYS.has(group.key) && <span className="ml-2 text-[10px] font-normal text-primary/70 bg-primary/10 px-1.5 py-0.5">Custom</span>}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{group.options.length} options</span>
              {!DEFAULT_GROUP_KEYS.has(group.key) && (
                <button onClick={() => deleteGroup(group.key)} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                  <Icon name="TrashIcon" size={12} /> Delete Group
                </button>
              )}
            </div>
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

// ─── Communities Manager ──────────────────────────────────────────────────────
function CommunitiesManager() {
  const [locations, setLocations] = useState<UAELocation[]>([]);
  const [selectedEmirate, setSelectedEmirate] = useState('Dubai');
  const [selectedArea, setSelectedArea] = useState('');
  const [newCommunity, setNewCommunity] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newEmirate, setNewEmirate] = useState('');
  const [editingCommunity, setEditingCommunity] = useState<{ area: string; idx: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'communities' | 'areas' | 'emirates'>('communities');
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'communities')
      .single()
      .then(({ data }) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setLocations(data.data as UAELocation[]);
        } else {
          setLocations(UAE_LOCATIONS);
          supabase.from('site_settings').upsert(
            { key: 'communities', data: UAE_LOCATIONS, updated_at: new Date().toISOString() },
            { onConflict: 'key' },
          );
        }
      });
  }, [supabase]);

  useEffect(() => {
    if (locations.length > 0) {
      const emirateAreas = locations.filter((l) => l.emirate === selectedEmirate);
      if (emirateAreas.length > 0 && !emirateAreas.find((l) => l.area === selectedArea)) {
        setSelectedArea(emirateAreas[0].area);
      }
    }
  }, [selectedEmirate, locations]);

  const saveLocations = async (updated: UAELocation[]) => {
    setLocations(updated);
    setSaving(true);
    await supabase
      .from('site_settings')
      .upsert({ key: 'communities', data: updated, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const emirates = [...new Set(locations.map((l) => l.emirate))];
  const areas = locations.filter((l) => l.emirate === selectedEmirate).map((l) => l.area);
  const currentLocation = locations.find((l) => l.emirate === selectedEmirate && l.area === selectedArea);

  const addCommunity = () => {
    if (!newCommunity.trim() || !selectedArea) return;
    const updated = locations.map((l) =>
      l.emirate === selectedEmirate && l.area === selectedArea
        ? { ...l, communities: [...l.communities, newCommunity.trim()] }
        : l
    );
    saveLocations(updated);
    setNewCommunity('');
  };

  const removeCommunity = (idx: number) => {
    const updated = locations.map((l) =>
      l.emirate === selectedEmirate && l.area === selectedArea
        ? { ...l, communities: l.communities.filter((_, i) => i !== idx) }
        : l
    );
    saveLocations(updated);
  };

  const saveEditCommunity = (idx: number) => {
    if (!editValue.trim()) return;
    const updated = locations.map((l) =>
      l.emirate === selectedEmirate && l.area === selectedArea
        ? { ...l, communities: l.communities.map((c, i) => (i === idx ? editValue.trim() : c)) }
        : l
    );
    saveLocations(updated);
    setEditingCommunity(null);
  };

  const addArea = () => {
    if (!newArea.trim()) return;
    const exists = locations.find((l) => l.emirate === selectedEmirate && l.area === newArea.trim());
    if (exists) return;
    const updated = [...locations, { emirate: selectedEmirate, area: newArea.trim(), communities: [] }];
    saveLocations(updated);
    setSelectedArea(newArea.trim());
    setNewArea('');
  };

  const removeArea = (area: string) => {
    const updated = locations.filter((l) => !(l.emirate === selectedEmirate && l.area === area));
    saveLocations(updated);
    if (selectedArea === area) {
      const remaining = updated.filter((l) => l.emirate === selectedEmirate);
      setSelectedArea(remaining[0]?.area || '');
    }
  };

  const addEmirate = () => {
    if (!newEmirate.trim()) return;
    const exists = locations.find((l) => l.emirate === newEmirate.trim());
    if (exists) return;
    const updated = [...locations, { emirate: newEmirate.trim(), area: 'General', communities: [] }];
    saveLocations(updated);
    setSelectedEmirate(newEmirate.trim());
    setNewEmirate('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-5 bg-primary" />
            UAE Communities Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1 ml-3">
            Manage all emirates, areas, and communities. Changes are saved instantly and used across all property/project forms.
          </p>
        </div>
        {(saved || saving) && (
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${saving ? 'text-primary' : 'text-emerald-400'}`}>
            <Icon name={saving ? 'ArrowPathIcon' : 'CheckCircleIcon'} size={14} className={saving ? 'animate-spin' : ''} />
            {saving ? 'Saving…' : 'Saved'}
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        {(['communities', 'areas', 'emirates'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeView === v ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {v === 'communities' ? 'Communities' : v === 'areas' ? 'Areas / Districts' : 'Emirates'}
          </button>
        ))}
      </div>

      {activeView === 'communities' && (
        <div className="flex gap-6">
          {/* Emirate selector */}
          <div className="w-36 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Emirate</p>
            <div className="space-y-1">
              {emirates.map((em) => (
                <button
                  key={em}
                  onClick={() => setSelectedEmirate(em)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors border ${selectedEmirate === em ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/2'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Area selector */}
          <div className="w-52 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Area / District</p>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {areas.map((area) => {
                const loc = locations.find((l) => l.emirate === selectedEmirate && l.area === area);
                return (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors border ${selectedArea === area ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/2'}`}
                  >
                    <div>{area}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{loc?.communities.length || 0} communities</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Communities list */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Communities in {selectedArea}
              </p>
              <span className="text-xs text-muted-foreground">{currentLocation?.communities.length || 0} total</span>
            </div>
            <div className="space-y-1.5 mb-4 max-h-72 overflow-y-auto pr-1">
              {currentLocation?.communities.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-card border border-border">
                  {editingCommunity?.area === selectedArea && editingCommunity?.idx === idx ? (
                    <>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditCommunity(idx)}
                        className="flex-1 bg-input border border-primary/50 px-2 py-1 text-sm text-foreground focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEditCommunity(idx)} className="text-xs text-primary hover:underline px-2">Save</button>
                      <button onClick={() => setEditingCommunity(null)} className="text-xs text-muted-foreground hover:text-foreground px-2">Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-primary/40 flex-shrink-0" />
                      <span className="flex-1 text-sm text-foreground">{c}</span>
                      <button
                        onClick={() => { setEditingCommunity({ area: selectedArea, idx }); setEditValue(c); }}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon name="PencilIcon" size={12} />
                      </button>
                      <button onClick={() => removeCommunity(idx)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                        <Icon name="TrashIcon" size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {(!currentLocation || currentLocation.communities.length === 0) && (
                <p className="text-xs text-muted-foreground py-4 text-center">No communities yet. Add one below.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newCommunity}
                onChange={(e) => setNewCommunity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCommunity()}
                placeholder="Add new community..."
                className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={addCommunity}
                disabled={!newCommunity.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'areas' && (
        <div className="flex gap-6">
          <div className="w-36 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Emirate</p>
            <div className="space-y-1">
              {emirates.map((em) => (
                <button
                  key={em}
                  onClick={() => setSelectedEmirate(em)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors border ${selectedEmirate === em ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/2'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Areas in {selectedEmirate}</p>
              <span className="text-xs text-muted-foreground">{areas.length} areas</span>
            </div>
            <div className="space-y-1.5 mb-4 max-h-80 overflow-y-auto pr-1">
              {areas.map((area) => {
                const loc = locations.find((l) => l.emirate === selectedEmirate && l.area === area);
                return (
                  <div key={area} className="flex items-center gap-2 p-2.5 bg-card border border-border">
                    <div className="w-2 h-2 bg-primary/40 flex-shrink-0" />
                    <span className="flex-1 text-sm text-foreground">{area}</span>
                    <span className="text-xs text-muted-foreground">{loc?.communities.length || 0} communities</span>
                    <button
                      onClick={() => removeArea(area)}
                      className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Icon name="TrashIcon" size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addArea()}
                placeholder={`Add new area in ${selectedEmirate}...`}
                className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={addArea}
                disabled={!newArea.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                Add Area
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'emirates' && (
        <div className="max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">All Emirates</p>
            <span className="text-xs text-muted-foreground">{emirates.length} emirates</span>
          </div>
          <div className="space-y-1.5 mb-4">
            {emirates.map((em) => {
              const emAreas = locations.filter((l) => l.emirate === em);
              const totalCommunities = emAreas.reduce((acc, l) => acc + l.communities.length, 0);
              return (
                <div key={em} className="flex items-center gap-2 p-2.5 bg-card border border-border">
                  <div className="w-2 h-2 bg-primary/40 flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground font-medium">{em}</span>
                  <span className="text-xs text-muted-foreground">{emAreas.length} areas · {totalCommunities} communities</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              value={newEmirate}
              onChange={(e) => setNewEmirate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmirate()}
              placeholder="Add new emirate..."
              className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={addEmirate}
              disabled={!newEmirate.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
            >
              Add Emirate
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Adding a new emirate creates it with a default "General" area. Switch to the Areas tab to add more areas.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { pages: cmsPages, branding: cmsBranding, propertyDetail: cmsPropertyDetail, projectDetail: cmsProjectDetail, saveAll, lastSaved, loaded } = useCMS();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Company');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageConfig[]>(cmsPages);
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [branding, setBranding] = useState<BrandingConfig>(cmsBranding);
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetailContent>(cmsPropertyDetail);
  const [projectDetail, setProjectDetail] = useState<ProjectDetailContent>(cmsProjectDetail);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPasteUrl, setLogoPasteUrl] = useState('');
  const [logoUrlUploading, setLogoUrlUploading] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconInputRef = React.useRef<HTMLInputElement>(null);
  const initializedRef = React.useRef(false);

  // Sync from CMS context only after Supabase data has loaded (not on every render)
  React.useEffect(() => {
    if (!initializedRef.current && loaded) {
      setPages(cmsPages);
      setBranding(cmsBranding);
      setPropertyDetail(cmsPropertyDetail);
      setProjectDetail(cmsProjectDetail);
      initializedRef.current = true;
    }
  }, [loaded, cmsPages, cmsBranding, cmsPropertyDetail, cmsProjectDetail]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const oldPath = getSiteAssetsPath(branding.logo_url);
      if (oldPath) formData.append('oldPath', oldPath);

      const res = await fetch('/api/admin/upload-logo', { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.startsWith('<') ? `Upload failed (HTTP ${res.status})` : (tryParseError(text) || 'Upload failed'));
      }
      const result = await res.json();
      if (!result.url) throw new Error(result.error || 'Upload failed');

      setLogoPreview(result.url);
      setBranding((prev) => ({ ...prev, logo_url: result.url }));
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      setSaveError(err?.message || 'Failed to upload logo');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleLogoUrlUpload = async () => {
    const sourceUrl = logoPasteUrl.trim();
    if (!sourceUrl || logoUrlUploading || logoUploading) return;

    setLogoUrlUploading(true);
    try {
      const res = await fetch('/api/admin/upload-site-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl,
          folder: CMS_IMAGE_FOLDERS.logos,
          fileKey: 'logo_manual',
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.startsWith('<') ? `Upload failed (HTTP ${res.status})` : (tryParseError(text) || 'Upload failed'));
      }
      const result = await res.json();
      if (!result.url) throw new Error(result.error || 'Upload failed');

      setLogoPreview(result.url);
      setBranding((prev) => ({ ...prev, logo_url: result.url }));
      setLogoPasteUrl('');
    } catch (err: any) {
      console.error('Logo URL upload failed:', err);
      setSaveError(err?.message || 'Failed to upload logo URL');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setLogoUrlUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const oldPath = getSiteAssetsPath(branding.favicon_url);
      if (oldPath) formData.append('oldPath', oldPath);

      const res = await fetch('/api/admin/upload-favicon', { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.startsWith('<') ? `Upload failed (HTTP ${res.status})` : (tryParseError(text) || 'Upload failed'));
      }
      const result = await res.json();
      if (!result.url) throw new Error(result.error || 'Upload failed');

      setFaviconPreview(result.url);
      setBranding((prev) => ({ ...prev, favicon_url: result.url }));
    } catch (err: any) {
      console.error('Favicon upload failed:', err);
      setSaveError(err?.message || 'Failed to upload favicon');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setFaviconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const migrateExternalUrl = async (
    url: string,
    opts: { endpoint: string; body: Record<string, string> },
  ): Promise<string | null> => {
    if (!url || isSiteAssetsUrl(url)) return url;
    try {
      const res = await fetch(opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: url, ...opts.body }),
      });
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  };

  const migrateAllCmsImages = async (
    pagesToSave: PageConfig[],
    brandingToSave: BrandingConfig,
    pd: PropertyDetailContent,
    prd: ProjectDetailContent,
  ) => {
    const migratedPages = [...pagesToSave];

    for (let i = 0; i < migratedPages.length; i++) {
      let p = migratedPages[i];
      if (p.hero_image && !isSiteAssetsUrl(p.hero_image)) {
        const url = await migrateExternalUrl(p.hero_image, {
          endpoint: '/api/admin/upload-hero-image',
          body: { pageKey: p.key },
        });
        if (url) {
          p = { ...p, hero_image: url };
          migratedPages[i] = p;
        }
      }

      const fp = p.featured_properties_content;
      if (fp?.properties?.length) {
        const props = await Promise.all(
          fp.properties.map(async (item) => {
            if (!item.image || isSiteAssetsUrl(item.image)) return item;
            const url = await migrateExternalUrl(item.image, {
              endpoint: '/api/admin/upload-site-image',
              body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `featured_property_${item.id}` },
            });
            return url ? { ...item, image: url } : item;
          }),
        );
        migratedPages[i] = { ...p, featured_properties_content: { ...fp, properties: props } };
      }

      const fj = migratedPages[i].featured_projects_content;
      if (fj?.projects?.length) {
        const projects = await Promise.all(
          fj.projects.map(async (item) => {
            if (!item.image || isSiteAssetsUrl(item.image)) return item;
            const url = await migrateExternalUrl(item.image, {
              endpoint: '/api/admin/upload-site-image',
              body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `featured_project_${item.id}` },
            });
            return url ? { ...item, image: url } : item;
          }),
        );
        migratedPages[i] = { ...migratedPages[i], featured_projects_content: { ...fj, projects } };
      }

      const wy = migratedPages[i].why_luxestate_content;
      if (wy?.steps?.length) {
        const steps = await Promise.all(
          wy.steps.map(async (step) => {
            if (!step.image || isSiteAssetsUrl(step.image)) return step;
            const url = await migrateExternalUrl(step.image, {
              endpoint: '/api/admin/upload-site-image',
              body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `why_step_${step.id}` },
            });
            return url ? { ...step, image: url } : step;
          }),
        );
        migratedPages[i] = { ...migratedPages[i], why_luxestate_content: { ...wy, steps } };
      }

      const tm = migratedPages[i].testimonials_content;
      if (tm?.testimonials?.length) {
        const testimonials = await Promise.all(
          tm.testimonials.map(async (t, idx) => {
            if (!t.image || isSiteAssetsUrl(t.image)) return t;
            const url = await migrateExternalUrl(t.image, {
              endpoint: '/api/admin/upload-site-image',
              body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `testimonial_${idx}` },
            });
            return url ? { ...t, image: url } : t;
          }),
        );
        migratedPages[i] = { ...migratedPages[i], testimonials_content: { ...tm, testimonials } };
      }

      const ab = migratedPages[i].about_content;
      if (ab?.ceo?.image && !isSiteAssetsUrl(ab.ceo.image)) {
        const url = await migrateExternalUrl(ab.ceo.image, {
          endpoint: '/api/admin/upload-site-image',
          body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: 'about_ceo' },
        });
        if (url) {
          migratedPages[i] = {
            ...migratedPages[i],
            about_content: { ...ab, ceo: { ...ab.ceo, image: url } },
          };
        }
      }
    }

    let nextBranding = { ...brandingToSave };
    if (nextBranding.logo_url && !isSiteAssetsUrl(nextBranding.logo_url)) {
      const url = await migrateExternalUrl(nextBranding.logo_url, {
        endpoint: '/api/admin/upload-site-image',
        body: { folder: CMS_IMAGE_FOLDERS.logos, fileKey: 'logo' },
      });
      if (url) nextBranding = { ...nextBranding, logo_url: url };
    }
    if (nextBranding.favicon_url && !isSiteAssetsUrl(nextBranding.favicon_url)) {
      const url = await migrateExternalUrl(nextBranding.favicon_url, {
        endpoint: '/api/admin/upload-site-image',
        body: { folder: CMS_IMAGE_FOLDERS.logos, fileKey: 'favicon' },
      });
      if (url) nextBranding = { ...nextBranding, favicon_url: url };
    }

    let nextPd = { ...pd };
    if (nextPd.agent?.avatar && !isSiteAssetsUrl(nextPd.agent.avatar)) {
      const url = await migrateExternalUrl(nextPd.agent.avatar, {
        endpoint: '/api/admin/upload-site-image',
        body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `property_agent_${nextPd.id}` },
      });
      if (url) nextPd = { ...nextPd, agent: { ...nextPd.agent, avatar: url } };
    }
    const pdImages = await Promise.all(
      nextPd.images.map(async (img, idx) => {
        if (!img.src || isSiteAssetsUrl(img.src)) return img;
        const url = await migrateExternalUrl(img.src, {
          endpoint: '/api/admin/upload-site-image',
          body: { folder: CMS_IMAGE_FOLDERS.property, fileKey: `property_detail_${nextPd.id}_${idx}` },
        });
        return url ? { ...img, src: url } : img;
      }),
    );
    nextPd = { ...nextPd, images: pdImages };

    let nextPrd = { ...prd };
    if (nextPrd.agent?.avatar && !isSiteAssetsUrl(nextPrd.agent.avatar)) {
      const url = await migrateExternalUrl(nextPrd.agent.avatar, {
        endpoint: '/api/admin/upload-site-image',
        body: { folder: CMS_IMAGE_FOLDERS.cms, fileKey: `project_agent_${nextPrd.id}` },
      });
      if (url) nextPrd = { ...nextPrd, agent: { ...nextPrd.agent, avatar: url } };
    }
    const prdImages = await Promise.all(
      nextPrd.images.map(async (img, idx) => {
        if (!img.src || isSiteAssetsUrl(img.src)) return img;
        const url = await migrateExternalUrl(img.src, {
          endpoint: '/api/admin/upload-site-image',
          body: { folder: CMS_IMAGE_FOLDERS.property, fileKey: `project_detail_${nextPrd.id}_${idx}` },
        });
        return url ? { ...img, src: url } : img;
      }),
    );
    nextPrd = { ...nextPrd, images: prdImages };

    return { migratedPages, nextBranding, nextPd, nextPrd };
  };

  const cleanupReplacedAssets = async (
    prevUrls: string[],
    nextUrls: string[],
  ) => {
    const nextSet = new Set(nextUrls);
    for (const prevUrl of prevUrls) {
      if (!prevUrl || nextSet.has(prevUrl)) continue;
      const path = getSiteAssetsPath(prevUrl);
      if (!path) continue;
      const deleteEndpoint = path.startsWith('hero-images/')
        ? '/api/admin/upload-hero-image' : path.startsWith('logos/')
          ? '/api/admin/upload-logo' :'/api/admin/upload-site-image';
      try {
        await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        });
      } catch {
        // non-blocking
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const {
        migratedPages,
        nextBranding,
        nextPd,
        nextPrd,
      } = await migrateAllCmsImages(pages, branding, propertyDetail, projectDetail);

      setPages(migratedPages);
      setBranding(nextBranding);
      setPropertyDetail(nextPd);
      setProjectDetail(nextPrd);

      const prevUrls = extractCmsImageUrls(cmsPages, cmsBranding, cmsPropertyDetail, cmsProjectDetail);
      const nextUrls = extractCmsImageUrls(migratedPages, nextBranding, nextPd, nextPrd);
      await cleanupReplacedAssets(prevUrls, nextUrls);

      await saveAll(migratedPages, nextBranding, nextPd, nextPrd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save settings');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const currentPage = pages.find((p) => p.key === activePage) || pages[0];
  const updatePage = (updated: PageConfig) => setPages(pages.map((p) => p.key === updated.key ? updated : p));

  // ─── Property Detail helpers ──────────────────────────────────────────────
  const updatePD = (patch: Partial<PropertyDetailContent>) => setPropertyDetail((prev) => ({ ...prev, ...patch }));
  const updatePDHighlight = (idx: number, val: string) => {
    const h = [...propertyDetail.highlights];
    h[idx] = val;
    updatePD({ highlights: h });
  };
  const addPDHighlight = () => updatePD({ highlights: [...propertyDetail.highlights, ''] });
  const removePDHighlight = (idx: number) => updatePD({ highlights: propertyDetail.highlights.filter((_, i) => i !== idx) });

  const updatePDAmenity = (idx: number, field: 'icon' | 'label', val: string) => {
    const a = propertyDetail.amenities.map((am, i) => i === idx ? { ...am, [field]: val } : am);
    updatePD({ amenities: a });
  };
  const addPDAmenity = () => updatePD({ amenities: [...propertyDetail.amenities, { icon: 'StarIcon', label: '' }] });
  const removePDAmenity = (idx: number) => updatePD({ amenities: propertyDetail.amenities.filter((_, i) => i !== idx) });

  const updatePDImage = (idx: number, field: 'src' | 'alt', val: string) => {
    const imgs = propertyDetail.images.map((im, i) => i === idx ? { ...im, [field]: val } : im);
    updatePD({ images: imgs });
  };
  const addPDImage = () => updatePD({ images: [...propertyDetail.images, { src: '', alt: '' }] });
  const removePDImage = (idx: number) => updatePD({ images: propertyDetail.images.filter((_, i) => i !== idx) });

  const updatePDPOI = (idx: number, field: 'label' | 'distance', val: string) => {
    const pois = propertyDetail.pois.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    updatePD({ pois: pois });
  };
  const addPDPOI = () => updatePD({ pois: [...propertyDetail.pois, { label: '', distance: '' }] });
  const removePDPOI = (idx: number) => updatePD({ pois: propertyDetail.pois.filter((_, i) => i !== idx) });

  // ─── Project Detail helpers ───────────────────────────────────────────────
  const updatePRD = (patch: Partial<ProjectDetailContent>) => setProjectDetail((prev) => ({ ...prev, ...patch }));
  const updatePRDHighlight = (idx: number, val: string) => {
    const h = [...projectDetail.highlights];
    h[idx] = val;
    updatePRD({ highlights: h });
  };
  const addPRDHighlight = () => updatePRD({ highlights: [...projectDetail.highlights, ''] });
  const removePRDHighlight = (idx: number) => updatePRD({ highlights: projectDetail.highlights.filter((_, i) => i !== idx) });

  const updatePRDAmenity = (idx: number, field: 'icon' | 'label', val: string) => {
    const a = projectDetail.amenities.map((am, i) => i === idx ? { ...am, [field]: val } : am);
    updatePRD({ amenities: a });
  };
  const addPRDAmenity = () => updatePRD({ amenities: [...projectDetail.amenities, { icon: 'StarIcon', label: '' }] });
  const removePRDAmenity = (idx: number) => updatePRD({ amenities: projectDetail.amenities.filter((_, i) => i !== idx) });

  const updatePRDImage = (idx: number, field: 'src' | 'alt', val: string) => {
    const imgs = projectDetail.images.map((im, i) => i === idx ? { ...im, [field]: val } : im);
    updatePRD({ images: imgs });
  };
  const addPRDImage = () => updatePRD({ images: [...projectDetail.images, { src: '', alt: '' }] });
  const removePRDImage = (idx: number) => updatePRD({ images: projectDetail.images.filter((_, i) => i !== idx) });

  const updatePRDPOI = (idx: number, field: 'label' | 'distance', val: string) => {
    const pois = projectDetail.pois.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    updatePRD({ pois: pois });
  };
  const addPRDPOI = () => updatePRD({ pois: [...projectDetail.pois, { label: '', distance: '' }] });
  const removePRDPOI = (idx: number) => updatePRD({ pois: projectDetail.pois.filter((_, i) => i !== idx) });

  const updatePRDUnitType = (idx: number, field: keyof ProjectDetailContent['unitTypes'][0], val: string | number) => {
    const ut = projectDetail.unitTypes.map((u, i) => i === idx ? { ...u, [field]: val } : u);
    updatePRD({ unitTypes: ut });
  };
  const addPRDUnitType = () => updatePRD({ unitTypes: [...projectDetail.unitTypes, { type: '', area: '', price: '', available: 0 }] });
  const removePRDUnitType = (idx: number) => updatePRD({ unitTypes: projectDetail.unitTypes.filter((_, i) => i !== idx) });

  const updatePRDPayment = (idx: number, field: keyof ProjectDetailContent['paymentPlan'][0], val: string | number) => {
    const pp = projectDetail.paymentPlan.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    updatePRD({ paymentPlan: pp });
  };

  const updatePRDConstruction = (idx: number, field: 'phase' | 'complete', val: string | number) => {
    const cp = projectDetail.constructionProgress.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    updatePRD({ constructionProgress: cp });
  };
  const addPRDConstruction = () => updatePRD({ constructionProgress: [...projectDetail.constructionProgress, { phase: '', complete: 0 }] });
  const removePRDConstruction = (idx: number) => updatePRD({ constructionProgress: projectDetail.constructionProgress.filter((_, i) => i !== idx) });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all site content and configuration
            {lastSaved && <span className="ml-2 text-xs text-primary/60">· Last saved: {lastSaved}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-xs text-red-400">{saveError}</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon name={saved ? 'CheckIcon' : saving ? 'ArrowPathIcon' : 'CloudArrowUpIcon'} size={14} className={saving ? 'animate-spin' : ''} />
            {saved ? 'Saved & Live!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
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
              <InputField label="Company Name" value={branding.company_name} onChange={(v) => setBranding({ ...branding, company_name: v })} />
              <InputField label="Tagline" value={branding.tagline} onChange={(v) => setBranding({ ...branding, tagline: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Phone" value={branding.phone ?? ''} onChange={(v) => setBranding({ ...branding, phone: v })} placeholder="+971 50 000 0000" />
              <InputField label="Email" value={branding.email ?? ''} onChange={(v) => setBranding({ ...branding, email: v })} placeholder="admin@yourcompany.com" />
              <InputField label="WhatsApp" value={branding.whatsapp ?? ''} onChange={(v) => setBranding({ ...branding, whatsapp: v })} placeholder="+971500000000" />
            </div>
            <TextareaField label="Address" value={branding.address ?? ''} onChange={(v) => setBranding({ ...branding, address: v })} rows={2} />
          </div>
        )}

        {activeTab === 'Branding' && (
          <div className="space-y-6">
            <SectionHeader title="Brand Identity" description="Logo, colors, and typography settings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorField label="Primary Color (Gold)" value={branding.primary_color} onChange={(v) => setBranding({ ...branding, primary_color: v })} />
              <ColorField label="Accent Color" value={branding.accent_color} onChange={(v) => setBranding({ ...branding, accent_color: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Font Family</label>
                <select value={branding.font_family} onChange={(e) => setBranding({ ...branding, font_family: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Plus Jakarta Sans</option><option>DM Sans</option><option>Manrope</option><option>Cabinet Grotesk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Border Radius</label>
                <select value={branding.border_radius || '0px'} onChange={(e) => setBranding({ ...branding, border_radius: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option value="0px">0px — Sharp</option><option value="4px">4px — Slight</option><option value="8px">8px — Rounded</option><option value="12px">12px — Soft</option><option value="16px">16px — Pill</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo Upload</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div
                className={`border border-dashed border-border p-6 text-center transition-colors ${logoUploading ? 'opacity-60 pointer-events-none' : 'hover:border-primary/40 cursor-pointer'}`}
                onClick={() => !logoUploading && logoInputRef.current?.click()}
              >
                {logoUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Uploading to Supabase...</p>
                  </div>
                ) : logoPreview || (branding as any).logo_url ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview || (branding as any).logo_url}
                      alt="Logo preview"
                      className="max-h-16 max-w-[200px] object-contain"
                    />
                    <p className="text-xs text-primary font-semibold">Logo uploaded — click to replace</p>
                  </div>
                ) : (
                  <>
                    <Icon name="PhotoIcon" size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload logo (SVG, PNG, JPG)</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Recommended: SVG or PNG with transparent background</p>
                  </>
                )}
              </div>
              {(logoPreview || (branding as any).logo_url) && (
                <button
                  onClick={async () => {
                    const oldUrl = branding.logo_url;
                    if (oldUrl && oldUrl.includes('/site-assets/')) {
                      const oldPath = oldUrl.split('/site-assets/').pop();
                      if (oldPath) {
                        await fetch('/api/admin/upload-logo', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: oldPath }),
                        });
                      }
                    }
                    setLogoPreview(null);
                    setBranding((prev) => ({ ...prev, logo_url: undefined }));
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove logo
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo URL (ImageKit / CDN)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={branding.logo_url ?? ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setLogoPreview(null);
                    setBranding((prev) => ({ ...prev, logo_url: url || undefined }));
                  }}
                  placeholder="https://ik.imagekit.io/your-id/logo.png"
                  className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoPasteUrl}
                    onChange={(e) => setLogoPasteUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLogoUrlUpload(); }}
                    placeholder="Paste image URL and upload to storage"
                    className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleLogoUrlUpload}
                    disabled={!logoPasteUrl.trim() || logoUrlUploading || logoUploading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    {logoUrlUploading ? (
                      <><div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent animate-spin" /> Uploading...</>
                    ) : (
                      <><Icon name="CloudArrowUpIcon" size={14} /> Upload to Storage</>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Paste an ImageKit or any CDN URL directly. This takes priority over the uploaded file above.</p>
            </div>
            {/* Favicon Upload */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Favicon</label>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/x-icon,image/png,image/svg+xml,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFaviconUpload}
              />
              <div
                className={`border border-dashed border-border p-5 text-center transition-colors ${faviconUploading ? 'opacity-60 pointer-events-none' : 'hover:border-primary/40 cursor-pointer'}`}
                onClick={() => !faviconUploading && faviconInputRef.current?.click()}
              >
                {faviconUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Uploading to Supabase...</p>
                  </div>
                ) : faviconPreview || branding.favicon_url ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={faviconPreview || branding.favicon_url}
                      alt="Favicon preview"
                      className="w-10 h-10 object-contain"
                    />
                    <p className="text-xs text-primary font-semibold">Favicon uploaded — click to replace</p>
                  </div>
                ) : (
                  <>
                    <Icon name="GlobeAltIcon" size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload favicon (ICO, PNG, SVG)</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Recommended: 32×32 or 64×64 PNG / ICO</p>
                  </>
                )}
              </div>
              {(faviconPreview || branding.favicon_url) && (
                <button
                  onClick={async () => {
                    const oldUrl = branding.favicon_url;
                    if (oldUrl && oldUrl.includes('/site-assets/')) {
                      const oldPath = oldUrl.split('/site-assets/').pop();
                      if (oldPath) {
                        await fetch('/api/admin/upload-favicon', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: oldPath }),
                        });
                      }
                    }
                    setFaviconPreview(null);
                    setBranding((prev) => ({ ...prev, favicon_url: undefined }));
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove favicon
                </button>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-1">The favicon appears in browser tabs and bookmarks. Changes apply after saving.</p>
            </div>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div className="space-y-6">
            <SectionHeader title="Site Appearance" description="Layout, theme, and visual settings — saved with branding" />
            <div className="space-y-0">
              <ToggleField label="Dark Mode" description="Enable dark mode by default" checked={branding.dark_mode !== false} onChange={(v) => setBranding({ ...branding, dark_mode: v })} />
              <ToggleField label="Sticky Header" description="Keep navigation fixed on scroll" checked={branding.sticky_header !== false} onChange={(v) => setBranding({ ...branding, sticky_header: v })} />
              <ToggleField label="Scroll Animations" description="Enable scroll-triggered animations" checked={branding.scroll_animations !== false} onChange={(v) => setBranding({ ...branding, scroll_animations: v })} />
              <ToggleField label="Gold Shimmer Effects" description="Enable gold shimmer text animations" checked={branding.gold_shimmer !== false} onChange={(v) => setBranding({ ...branding, gold_shimmer: v })} />
              <ToggleField label="Show WhatsApp Button" description="Display WhatsApp chat button in header" checked={branding.show_whatsapp_button !== false} onChange={(v) => setBranding({ ...branding, show_whatsapp_button: v })} />
            </div>
          </div>
        )}

        {activeTab === 'Pages' && (
          <div>
            <SectionHeader title="Page CMS Settings" description="Configure content, sections, and SEO for each page. Changes are live on the frontend after saving." />
            <div className="flex flex-wrap gap-1 border border-border overflow-hidden mb-6 w-fit">
              {pages.map((p) => (
                <button key={p.key} onClick={() => setActivePage(p.key)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activePage === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 bg-primary" />
                <h3 className="text-sm font-bold text-foreground">{currentPage.label} Page</h3>
                <span className="text-xs text-muted-foreground">/{currentPage.key === 'home' ? '' : currentPage.key}</span>
                {currentPage.key === 'home' && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                    Homepage Builder
                  </span>
                )}
              </div>
              <PageEditor page={currentPage} onChange={updatePage} />
            </div>
          </div>
        )}

        {activeTab === 'Social' && (
          <div className="space-y-6">
            <SectionHeader title="Social Media Links" description="Configure social media profiles and links" />
            <div className="space-y-4">
              <InputField label="Instagram" value={branding.social_instagram ?? ''} onChange={(v) => setBranding({ ...branding, social_instagram: v })} placeholder="https://instagram.com/coveestates" />
              <InputField label="LinkedIn" value={branding.social_linkedin ?? ''} onChange={(v) => setBranding({ ...branding, social_linkedin: v })} placeholder="https://linkedin.com/company/coveestates" />
              <InputField label="Facebook" value={branding.social_facebook ?? ''} onChange={(v) => setBranding({ ...branding, social_facebook: v })} placeholder="https://facebook.com/coveestates" />
              <InputField label="Twitter / X" value={branding.social_twitter ?? ''} onChange={(v) => setBranding({ ...branding, social_twitter: v })} placeholder="https://x.com/coveestates" />
              <InputField label="YouTube" value={branding.social_youtube ?? ''} onChange={(v) => setBranding({ ...branding, social_youtube: v })} placeholder="https://youtube.com/@coveestates" />
              <InputField label="TikTok" value={branding.social_tiktok ?? ''} onChange={(v) => setBranding({ ...branding, social_tiktok: v })} placeholder="https://tiktok.com/@coveestates" />
            </div>
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-6">
            <SectionHeader title="Global SEO Configuration" description="Site-wide search engine optimization settings — saved with branding" />
            <InputField label="Site Title" value={branding.seo_title || ''} onChange={(v) => setBranding({ ...branding, seo_title: v })} placeholder="My Site — Tagline" />
            <TextareaField label="Meta Description" value={branding.seo_description || ''} onChange={(v) => setBranding({ ...branding, seo_description: v })} rows={3} placeholder="A short description for search engines" />
            <InputField label="Google Analytics ID" value={branding.google_analytics_id || ''} onChange={(v) => setBranding({ ...branding, google_analytics_id: v })} placeholder="G-XXXXXXXXXX" />
            <InputField label="Google Search Console Verification" value={branding.google_search_console || ''} onChange={(v) => setBranding({ ...branding, google_search_console: v })} placeholder="google-site-verification=..." />
            <div className="space-y-0">
              <ToggleField label="Enable Sitemap" description="Auto-generate XML sitemap" checked={branding.enable_sitemap !== false} onChange={(v) => setBranding({ ...branding, enable_sitemap: v })} />
              <ToggleField label="Enable Robots.txt" description="Allow search engine crawling" checked={branding.enable_robots !== false} onChange={(v) => setBranding({ ...branding, enable_robots: v })} />
              <ToggleField label="Structured Data (JSON-LD)" description="Enable schema.org markup" checked={branding.enable_jsonld !== false} onChange={(v) => setBranding({ ...branding, enable_jsonld: v })} />
              <ToggleField label="Open Graph Tags" description="Enable social sharing meta tags" checked={branding.enable_og_tags !== false} onChange={(v) => setBranding({ ...branding, enable_og_tags: v })} />
            </div>
          </div>
        )}

        {activeTab === 'Workflow' && (
          <div className="space-y-6">
            <SectionHeader title="Workflow Settings" description="Configure CRM workflow and automation — saved with branding" />
            <div className="space-y-0">
              <ToggleField label="Auto-assign Leads" description="Automatically assign new leads to agents" checked={branding.auto_assign_leads !== false} onChange={(v) => setBranding({ ...branding, auto_assign_leads: v })} />
              <ToggleField label="Lead Notifications" description="Send email notifications for new leads" checked={branding.lead_notifications !== false} onChange={(v) => setBranding({ ...branding, lead_notifications: v })} />
              <ToggleField label="Deal Stage Alerts" description="Notify agents when deal stage changes" checked={branding.deal_stage_alerts !== false} onChange={(v) => setBranding({ ...branding, deal_stage_alerts: v })} />
              <ToggleField label="Task Reminders" description="Send task due date reminders" checked={branding.task_reminders !== false} onChange={(v) => setBranding({ ...branding, task_reminders: v })} />
              <ToggleField label="Weekly Reports" description="Auto-generate and email weekly reports" checked={branding.weekly_reports !== false} onChange={(v) => setBranding({ ...branding, weekly_reports: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Lead Assignment Method</label>
                <select value={branding.lead_assignment_method || 'Round Robin'} onChange={(e) => setBranding({ ...branding, lead_assignment_method: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Round Robin</option><option>By Availability</option><option>Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Follow-up Reminder (days)</label>
                <input type="number" value={branding.followup_days ?? 3} onChange={(e) => setBranding({ ...branding, followup_days: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Property Fields' && <PropertyFieldsManager />}
        {activeTab === 'Communities' && <CommunitiesManager />}

        {/* Property Detail and Project Detail tabs removed — using actual admin data */}
        {activeTab === ('Property Detail' as string) && (
          <div className="space-y-8">
            <SectionHeader title="Property Detail Page" description="Edit all content shown on the property detail landing page (/properties/[id]). Changes are live after saving." />

            {/* Core Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Core Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Property Name" value={propertyDetail.name} onChange={(v) => updatePD({ name: v })} />
                <InputField label="Location" value={propertyDetail.location} onChange={(v) => updatePD({ location: v })} />
              </div>
              <InputField label="Full Address" value={propertyDetail.address} onChange={(v) => updatePD({ address: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Price" value={propertyDetail.price} onChange={(v) => updatePD({ price: v })} placeholder="AED 85,000,000" />
                <InputField label="Price Per Sqft" value={propertyDetail.pricePerSqft} onChange={(v) => updatePD({ pricePerSqft: v })} placeholder="AED 8,200 / sqft" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Beds</label>
                  <input type="number" value={propertyDetail.beds} onChange={(e) => updatePD({ beds: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Baths</label>
                  <input type="number" value={propertyDetail.baths} onChange={(e) => updatePD({ baths: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Sqft</label>
                  <input type="number" value={propertyDetail.sqft} onChange={(e) => updatePD({ sqft: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <InputField label="Reference" value={propertyDetail.reference} onChange={(v) => updatePD({ reference: v })} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField label="Type" value={propertyDetail.type} onChange={(v) => updatePD({ type: v })} />
                <InputField label="Status" value={propertyDetail.status} onChange={(v) => updatePD({ status: v })} />
                <InputField label="Completion" value={propertyDetail.completion} onChange={(v) => updatePD({ completion: v })} />
                <InputField label="Floors" value={propertyDetail.floors} onChange={(v) => updatePD({ floors: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Parking" value={propertyDetail.parking} onChange={(v) => updatePD({ parking: v })} />
                <InputField label="View" value={propertyDetail.view} onChange={(v) => updatePD({ view: v })} />
                <InputField label="Furnishing" value={propertyDetail.furnishing} onChange={(v) => updatePD({ furnishing: v })} />
              </div>
              <TextareaField label="Description (use double line break for paragraphs)" value={propertyDetail.description} onChange={(v) => updatePD({ description: v })} rows={6} />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Gallery Images</h3>
                <button onClick={addPDImage} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add Image
                </button>
              </div>
              {propertyDetail.images.map((img, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-border bg-card">
                  <SiteImageUpload
                    label={`Gallery Image ${idx + 1}`}
                    folder={CMS_IMAGE_FOLDERS.property}
                    fileKey={`property_detail_${propertyDetail.id}_${idx}`}
                    currentUrl={img.src}
                    onChange={(v) => updatePDImage(idx, 'src', v)}
                  />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <InputField label="Alt Text" value={img.alt} onChange={(v) => updatePDImage(idx, 'alt', v)} placeholder="Describe the image" />
                    </div>
                    <button onClick={() => removePDImage(idx)} className="mb-0.5 p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors flex-shrink-0">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Key Highlights</h3>
                <button onClick={addPDHighlight} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add
                </button>
              </div>
              {propertyDetail.highlights.map((h, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={h} onChange={(e) => updatePDHighlight(idx, e.target.value)} placeholder="Highlight point" className="flex-1 px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  <button onClick={() => removePDHighlight(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors">
                    <Icon name="TrashIcon" size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Amenities</h3>
                <button onClick={addPDAmenity} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propertyDetail.amenities.map((a, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-3 border border-border bg-card">
                    <input value={a.label} onChange={(e) => updatePDAmenity(idx, 'label', e.target.value)} placeholder="Amenity name" className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <button onClick={() => removePDAmenity(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors flex-shrink-0">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Location & Map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Latitude</label>
                  <input type="number" step="0.0001" value={propertyDetail.location_coords.lat} onChange={(e) => updatePD({ location_coords: { ...propertyDetail.location_coords, lat: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Longitude</label>
                  <input type="number" step="0.0001" value={propertyDetail.location_coords.lng} onChange={(e) => updatePD({ location_coords: { ...propertyDetail.location_coords, lng: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearby Points of Interest</p>
                  <button onClick={addPDPOI} className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                    <Icon name="PlusIcon" size={12} /> Add POI
                  </button>
                </div>
                {propertyDetail.pois.map((poi, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input value={poi.label} onChange={(e) => updatePDPOI(idx, 'label', e.target.value)} placeholder="Location name" className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <input value={poi.distance} onChange={(e) => updatePDPOI(idx, 'distance', e.target.value)} placeholder="e.g. 5 min" className="w-28 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <button onClick={() => removePDPOI(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Agent Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Agent Name" value={propertyDetail.agent.name} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, name: v } })} />
                <InputField label="Agent Title" value={propertyDetail.agent.title} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, title: v } })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Phone" value={propertyDetail.agent.phone} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, phone: v } })} />
                <InputField label="WhatsApp Number (no +)" value={propertyDetail.agent.whatsapp} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, whatsapp: v } })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email" value={propertyDetail.agent.email} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, email: v } })} />
                <InputField label="Languages" value={propertyDetail.agent.languages} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, languages: v } })} />
              </div>
              <div className="col-span-2">
                <SiteImageUpload
                  label="Agent Avatar"
                  folder={CMS_IMAGE_FOLDERS.cms}
                  fileKey={`property_agent_${propertyDetail.id}`}
                  currentUrl={propertyDetail.agent.avatar}
                  onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, avatar: v } })}
                />
              </div>
              <InputField label="Avatar Alt Text" value={propertyDetail.agent.avatarAlt} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, avatarAlt: v } })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Listings Count</label>
                  <input type="number" value={propertyDetail.agent.listings} onChange={(e) => updatePD({ agent: { ...propertyDetail.agent, listings: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <InputField label="Experience" value={propertyDetail.agent.experience} onChange={(v) => updatePD({ agent: { ...propertyDetail.agent, experience: v } })} placeholder="12 Years" />
              </div>
            </div>

            <div className="pt-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name={saved ? 'CheckIcon' : saving ? 'ArrowPathIcon' : 'CloudArrowUpIcon'} size={14} className={saving ? 'animate-spin' : ''} />
                {saved ? 'Saved & Live!' : saving ? 'Saving…' : 'Save Property Detail'}
              </button>
            </div>
          </div>
        )}

        {activeTab === ('Project Detail' as string) && (
          <div className="space-y-8">
            <SectionHeader title="Project Detail Page" description="Edit all content shown on the project detail landing page (/projects/[id]). Changes are live after saving." />

            {/* Core Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Core Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Project Name" value={projectDetail.name} onChange={(v) => updatePRD({ name: v })} />
                <InputField label="Tagline" value={projectDetail.tagline} onChange={(v) => updatePRD({ tagline: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Developer" value={projectDetail.developer} onChange={(v) => updatePRD({ developer: v })} />
                <InputField label="Architect" value={projectDetail.architect} onChange={(v) => updatePRD({ architect: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Location" value={projectDetail.location} onChange={(v) => updatePRD({ location: v })} />
                <InputField label="Full Address" value={projectDetail.address} onChange={(v) => updatePRD({ address: v })} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField label="Price From" value={projectDetail.priceFrom} onChange={(v) => updatePRD({ priceFrom: v })} />
                <InputField label="Price To" value={projectDetail.priceTo} onChange={(v) => updatePRD({ priceTo: v })} />
                <InputField label="Completion" value={projectDetail.completion} onChange={(v) => updatePRD({ completion: v })} />
                <InputField label="Status" value={projectDetail.status} onChange={(v) => updatePRD({ status: v })} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Total Units</label>
                  <input type="number" value={projectDetail.units} onChange={(e) => updatePRD({ units: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Units Sold</label>
                  <input type="number" value={projectDetail.sold} onChange={(e) => updatePRD({ sold: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Floors</label>
                  <input type="number" value={projectDetail.floors} onChange={(e) => updatePRD({ floors: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <InputField label="Reference" value={projectDetail.reference} onChange={(v) => updatePRD({ reference: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Type" value={projectDetail.type} onChange={(v) => updatePRD({ type: v })} />
              </div>
              <TextareaField label="Description (use double line break for paragraphs)" value={projectDetail.description} onChange={(v) => updatePRD({ description: v })} rows={6} />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Gallery Images</h3>
                <button onClick={addPRDImage} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add Image
                </button>
              </div>
              {projectDetail.images.map((img, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-border bg-card">
                  <SiteImageUpload
                    label={`Gallery Image ${idx + 1}`}
                    folder={CMS_IMAGE_FOLDERS.property}
                    fileKey={`project_detail_${projectDetail.id}_${idx}`}
                    currentUrl={img.src}
                    onChange={(v) => updatePRDImage(idx, 'src', v)}
                  />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <InputField label="Alt Text" value={img.alt} onChange={(v) => updatePRDImage(idx, 'alt', v)} placeholder="Describe the image" />
                    </div>
                    <button onClick={() => removePRDImage(idx)} className="mb-0.5 p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors flex-shrink-0">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Key Highlights</h3>
                <button onClick={addPRDHighlight} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add
                </button>
              </div>
              {projectDetail.highlights.map((h, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={h} onChange={(e) => updatePRDHighlight(idx, e.target.value)} placeholder="Highlight point" className="flex-1 px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  <button onClick={() => removePRDHighlight(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors">
                    <Icon name="TrashIcon" size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Unit Types */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Unit Types & Pricing</h3>
                <button onClick={addPRDUnitType} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add Unit Type
                </button>
              </div>
              {projectDetail.unitTypes.map((u, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-border bg-card items-end">
                  <InputField label="Type" value={u.type} onChange={(v) => updatePRDUnitType(idx, 'type', v)} placeholder="1 Bedroom" />
                  <InputField label="Area" value={u.area} onChange={(v) => updatePRDUnitType(idx, 'area', v)} placeholder="1,200 – 1,800 sqft" />
                  <InputField label="Starting Price" value={u.price} onChange={(v) => updatePRDUnitType(idx, 'price', v)} placeholder="From AED 8,500,000" />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Available</label>
                      <input type="number" value={u.available} onChange={(e) => updatePRDUnitType(idx, 'available', Number(e.target.value))} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    </div>
                    <button onClick={() => removePRDUnitType(idx)} className="mb-0.5 p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors flex-shrink-0">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Plan */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Payment Plan</h3>
              {projectDetail.paymentPlan.map((p, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-border bg-card">
                  <InputField label="Phase Name" value={p.phase} onChange={(v) => updatePRDPayment(idx, 'phase', v)} />
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Percentage</label>
                    <input type="number" value={p.percent} onChange={(e) => updatePRDPayment(idx, 'percent', Number(e.target.value))} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <InputField label="Label" value={p.label} onChange={(v) => updatePRDPayment(idx, 'label', v)} placeholder="On Signing SPA" />
                  <InputField label="Icon Name" value={p.icon} onChange={(v) => updatePRDPayment(idx, 'icon', v)} placeholder="PencilSquareIcon" />
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Amenities</h3>
                <button onClick={addPRDAmenity} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectDetail.amenities.map((a, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-3 border border-border bg-card">
                    <input value={a.label} onChange={(e) => updatePRDAmenity(idx, 'label', e.target.value)} placeholder="Amenity name" className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <button onClick={() => removePRDAmenity(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors flex-shrink-0">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Construction Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 flex-1">Construction Progress</h3>
                <button onClick={addPRDConstruction} className="ml-4 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <Icon name="PlusIcon" size={12} /> Add Phase
                </button>
              </div>
              {projectDetail.constructionProgress.map((phase, idx) => (
                <div key={idx} className="flex gap-3 items-center p-3 border border-border bg-card">
                  <input value={phase.phase} onChange={(e) => updatePRDConstruction(idx, 'phase', e.target.value)} placeholder="Phase name" className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="number" min={0} max={100} value={phase.complete} onChange={(e) => updatePRDConstruction(idx, 'complete', Number(e.target.value))} className="w-20 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <button onClick={() => removePRDConstruction(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors">
                    <Icon name="TrashIcon" size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Location & Map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Latitude</label>
                  <input type="number" step="0.0001" value={projectDetail.location_coords.lat} onChange={(e) => updatePRD({ location_coords: { ...projectDetail.location_coords, lat: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Longitude</label>
                  <input type="number" step="0.0001" value={projectDetail.location_coords.lng} onChange={(e) => updatePRD({ location_coords: { ...projectDetail.location_coords, lng: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearby Points of Interest</p>
                  <button onClick={addPRDPOI} className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
                    <Icon name="PlusIcon" size={12} /> Add POI
                  </button>
                </div>
                {projectDetail.pois.map((poi, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input value={poi.label} onChange={(e) => updatePRDPOI(idx, 'label', e.target.value)} placeholder="Location name" className="flex-1 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <input value={poi.distance} onChange={(e) => updatePRDPOI(idx, 'distance', e.target.value)} placeholder="e.g. 5 min" className="w-28 px-3 py-2 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    <button onClick={() => removePRDPOI(idx)} className="p-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 transition-colors">
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2">Agent Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Agent Name" value={projectDetail.agent.name} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, name: v } })} />
                <InputField label="Agent Title" value={projectDetail.agent.title} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, title: v } })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Phone" value={projectDetail.agent.phone} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, phone: v } })} />
                <InputField label="WhatsApp Number (no +)" value={projectDetail.agent.whatsapp} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, whatsapp: v } })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email" value={projectDetail.agent.email} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, email: v } })} />
                <InputField label="Languages" value={projectDetail.agent.languages} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, languages: v } })} />
              </div>
              <div className="col-span-2">
                <SiteImageUpload
                  label="Agent Avatar"
                  folder={CMS_IMAGE_FOLDERS.cms}
                  fileKey={`project_agent_${projectDetail.id}`}
                  currentUrl={projectDetail.agent.avatar}
                  onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, avatar: v } })}
                />
              </div>
              <InputField label="Avatar Alt Text" value={projectDetail.agent.avatarAlt} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, avatarAlt: v } })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Projects Count</label>
                  <input type="number" value={projectDetail.agent.listings} onChange={(e) => updatePRD({ agent: { ...projectDetail.agent, listings: Number(e.target.value) } })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <InputField label="Experience" value={projectDetail.agent.experience} onChange={(v) => updatePRD({ agent: { ...projectDetail.agent, experience: v } })} placeholder="9 Years" />
              </div>
            </div>

            <div className="pt-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name={saved ? 'CheckIcon' : saving ? 'ArrowPathIcon' : 'CloudArrowUpIcon'} size={14} className={saving ? 'animate-spin' : ''} />
                {saved ? 'Saved & Live!' : saving ? 'Saving…' : 'Save Project Detail'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
