'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Project {
  id: string;
  name: string;
  developer: string;
  location_area: string;
  status: string;
  starting_price: number | null;
  images: { url?: string; src?: string }[];
  published: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default function MarketingPagesAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, developer, location_area, status, starting_price, images, published')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setProjects(data as Project[]);
        setLoading(false);
      });
  }, [supabase]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.developer?.toLowerCase().includes(q) ||
      p.location_area?.toLowerCase().includes(q)
    );
  });

  const getLandingUrl = (id: string) => `${SITE_URL}/marketing/${id}`;

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getLandingUrl(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {
      // fallback
    }
  };

  const getThumb = (p: Project) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    return imgs[0]?.url || imgs[0]?.src || '';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Landing Pages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select a project to generate a shareable marketing landing page
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 p-4 mb-6 flex items-start gap-3">
        <Icon name="InformationCircleIcon" size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          Each project has a dedicated marketing landing page with a lead capture form (Name, Mobile, Email).
          Copy the link and use it in your ad campaigns, WhatsApp broadcasts, or email campaigns.
          All leads are automatically captured in the CRM.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-secondary border border-border pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="BuildingOffice2Icon" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => {
            const thumb = getThumb(project);
            const url = getLandingUrl(project.id);
            const isCopied = copiedId === project.id;

            return (
              <div
                key={project.id}
                className="bg-card border border-border hover:border-primary/30 transition-all duration-300 group overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-secondary overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="BuildingOffice2Icon" size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {project.status && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1">
                      {project.status}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    {project.developer && (
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">{project.developer}</p>
                    )}
                    <h3 className="text-foreground font-bold text-sm leading-tight">{project.name}</h3>
                    {project.location_area && (
                      <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                        <Icon name="MapPinIcon" size={10} className="text-primary" />
                        {project.location_area}
                      </p>
                    )}
                    {project.starting_price && (
                      <p className="text-primary font-bold text-xs mt-1">
                        AED {Number(project.starting_price).toLocaleString()}+
                      </p>
                    )}
                  </div>

                  {/* URL display */}
                  <div className="bg-secondary border border-border px-3 py-2 flex items-center gap-2 min-w-0">
                    <Icon name="LinkIcon" size={11} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate flex-1 font-mono">
                      /marketing/{project.id}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(project.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                        isCopied
                          ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' :'bg-primary text-primary-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon name={isCopied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={12} />
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={`/marketing/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      title="Preview landing page"
                    >
                      <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
