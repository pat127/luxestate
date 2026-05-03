'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  useCMS, PageConfig, PageKey, BrandingConfig, HomepageBlock, DEFAULT_HOMEPAGE_BLOCKS,
  DEFAULT_FEATURED_PROPERTIES, DEFAULT_FEATURED_PROJECTS, DEFAULT_WHY_LUXESTATE,
  DEFAULT_TESTIMONIALS, DEFAULT_CONTACT, DEFAULT_MORTGAGE, DEFAULT_HERO_STATS,
  HeroStat, PropertyItem, ProjectItem, WhyStep, TestimonialItem, AwardItem, ContactDetail,
} from '@/contexts/CMSContext';
import { UAE_LOCATIONS, UAELocation } from '@/lib/uaeLocations';

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

// ─── Homepage Blocks Manager ──────────────────────────────────────────────────
const AVAILABLE_BLOCKS: { key: string; label: string; description: string }[] = [
  { key: 'featured_properties', label: 'Featured Properties', description: 'Showcase a curated grid of featured property listings' },
  { key: 'featured_projects', label: 'Featured Projects', description: 'Highlight off-plan and new development projects' },
  { key: 'why_luxestate', label: 'Why LuxEstate', description: 'Scrolling workflow section explaining the LuxEstate process' },
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
                <div className="col-span-2"><InputField label="Image URL" value={prop.image} onChange={(v) => update(i, 'image', v)} /></div>
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
                <div className="col-span-2"><InputField label="Image URL" value={proj.image} onChange={(v) => update(i, 'image', v)} /></div>
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
                <InputField label="Image URL" value={step.image} onChange={(v) => update(i, 'image', v)} />
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
                <InputField label="Image URL" value={t.image} onChange={(v) => update(i, 'image', v)} />
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

// ─── Page CMS Editor ──────────────────────────────────────────────────────────
function PageEditor({ page, onChange }: { page: PageConfig; onChange: (p: PageConfig) => void }) {
  const isHome = page.key === 'home';
  type SubTab = 'content' | 'sections' | 'seo' | 'blocks' | 'hero' | 'properties' | 'projects' | 'why' | 'testimonials' | 'contact' | 'mortgage';
  const [activeSection, setActiveSection] = useState<SubTab>('content');

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

  const subTabs: { key: SubTab; label: string }[] = isHome
    ? [
        { key: 'content', label: 'Hero' },
        { key: 'blocks', label: 'Blocks' },
        { key: 'properties', label: 'Properties' },
        { key: 'projects', label: 'Projects' },
        { key: 'why', label: 'Why Us' },
        { key: 'testimonials', label: 'Testimonials' },
        { key: 'contact', label: 'Contact' },
        { key: 'mortgage', label: 'Calculator' },
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
            {isHome && (
              <div className="sm:col-span-2">
                <InputField label="Hero Background Image URL" value={page.hero_image ?? ''} onChange={(v) => onChange({ ...page, hero_image: v })} placeholder="https://..." />
              </div>
            )}
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
          <div className="bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary/80">
              <span className="font-semibold">Live Preview:</span> Changes reflect on the <strong>/{page.key === 'home' ? '' : page.key}</strong> page after clicking Save Changes.
            </p>
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
            <InputField label="Headline" value={wy.headline} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, headline: v } })} />
            <InputField label="Headline Shimmer Word" value={wy.headline_shimmer} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, headline_shimmer: v } })} />
            <InputField label="Left Panel Title" value={wy.left_title} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, left_title: v } })} />
            <InputField label="Left Panel Subtitle" value={wy.left_subtitle} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, left_subtitle: v } })} />
            <InputField label="CTA Text" value={wy.cta_text} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, cta_text: v } })} />
            <InputField label="CTA Link" value={wy.cta_link} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, cta_link: v } })} />
            <div className="col-span-2">
              <TextareaField label="Subtext" value={wy.subtext} onChange={(v) => onChange({ ...page, why_luxestate_content: { ...wy, subtext: v } })} rows={2} />
            </div>
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

// ─── Communities Manager ──────────────────────────────────────────────────────
const STORAGE_KEY = 'luxestate_communities';

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
  const [activeView, setActiveView] = useState<'communities' | 'areas' | 'emirates'>('communities');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try { setLocations(JSON.parse(stored)); } catch { setLocations(UAE_LOCATIONS); }
    } else {
      setLocations(UAE_LOCATIONS);
    }
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      const emirateAreas = locations.filter((l) => l.emirate === selectedEmirate);
      if (emirateAreas.length > 0 && !emirateAreas.find((l) => l.area === selectedArea)) {
        setSelectedArea(emirateAreas[0].area);
      }
    }
  }, [selectedEmirate, locations]);

  const saveLocations = (updated: UAELocation[]) => {
    setLocations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
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
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Icon name="CheckCircleIcon" size={14} /> Saved
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
  const { pages: cmsPages, branding: cmsBranding, saveAll, lastSaved } = useCMS();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Company');
  const [saved, setSaved] = useState(false);
  const [pages, setPages] = useState<PageConfig[]>(cmsPages);
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [branding, setBranding] = useState<BrandingConfig>(cmsBranding);

  // Sync from CMS context when it loads
  React.useEffect(() => {
    setPages(cmsPages);
    setBranding(cmsBranding);
  }, [cmsPages, cmsBranding]);

  const handleSave = () => {
    saveAll(pages, branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const currentPage = pages.find((p) => p.key === activePage) || pages[0];
  const updatePage = (updated: PageConfig) => setPages(pages.map((p) => p.key === updated.key ? updated : p));

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
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name={saved ? 'CheckIcon' : 'CloudArrowUpIcon'} size={14} />
          {saved ? 'Saved & Live!' : 'Save Changes'}
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
              <InputField label="Company Name" value={branding.company_name} onChange={(v) => setBranding({ ...branding, company_name: v })} />
              <InputField label="Tagline" value={branding.tagline} onChange={(v) => setBranding({ ...branding, tagline: v })} />
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
                <label className="block text-xs font-semibold text-muted-foreground hover:text-foreground mb-1.5 uppercase tracking-wider">Follow-up Reminder (days)</label>
                <input type="number" defaultValue={3} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Property Fields' && <PropertyFieldsManager />}
        {activeTab === 'Communities' && <CommunitiesManager />}
      </div>
    </div>
  );
}
