'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Project {
  id: string;
  name: string;
  developer: string;
  location_area: string;
  starting_price: string;
  images: { url: string; caption?: string }[];
  status: string;
  published: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default function LandingPageBuilder() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('id, name, developer, location_area, starting_price, images, status, published')
      .order('name', { ascending: true });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.developer || '').toLowerCase().includes(search.toLowerCase())
  );

  const getLandingUrl = (project: Project) => `${SITE_URL}/lp/${project.id}`;

  const handleCopy = (project: Project) => {
    navigator.clipboard.writeText(getLandingUrl(project));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = (project: Project) => {
    window.open(getLandingUrl(project), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Project Landing Pages</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Generate shareable landing pages for any project — leads captured go directly to your CRM.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-primary/5 border border-primary/20 px-5 py-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="InformationCircleIcon" size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">How it works</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each project has a dedicated landing page with a hero image, project details, and a lead capture form (Name, Mobile, Email). 
            When a visitor submits the form, their details are saved as a lead in your CRM with the project name attached. 
            Share the link via WhatsApp, email, or social media.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-secondary border border-border pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const heroImg = project.images?.[0]?.url || '';
            const landingUrl = getLandingUrl(project);
            const isSelected = selectedProject?.id === project.id;

            return (
              <div
                key={project.id}
                className={`bg-card border transition-colors cursor-pointer ${isSelected ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                onClick={() => setSelectedProject(isSelected ? null : project)}
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] bg-secondary overflow-hidden relative">
                  {heroImg ? (
                    <AppImage
                      src={heroImg}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="BuildingOffice2Icon" size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="text-white text-xs font-bold truncate">{project.name}</p>
                    {project.developer && <p className="text-white/60 text-[10px] truncate">{project.developer}</p>}
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${project.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'}`}>
                      {project.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {project.location_area && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPinIcon" size={10} />
                        {project.location_area}
                      </span>
                    )}
                    {project.starting_price && (
                      <span className="text-[10px] text-primary font-semibold ml-auto">{project.starting_price}</span>
                    )}
                  </div>

                  {/* URL preview */}
                  <div className="bg-secondary border border-border px-2.5 py-1.5 mb-3 flex items-center gap-2 overflow-hidden">
                    <Icon name="LinkIcon" size={10} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate flex-1">{landingUrl}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(project); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={12} />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpen(project); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold hover:bg-accent transition-colors"
                    >
                      <Icon name="ArrowTopRightOnSquareIcon" size={12} />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Project Detail Panel */}
      {selectedProject && (
        <div className="bg-card border border-primary/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">{selectedProject.name} — Landing Page</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Share this link to capture leads for this project</p>
            </div>
            <button onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Landing Page URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getLandingUrl(selectedProject)}
                  className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(selectedProject)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold hover:bg-accent transition-colors flex items-center gap-1.5"
                >
                  <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={12} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleOpen(selectedProject)}
                  className="px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center gap-1.5"
                >
                  <Icon name="ArrowTopRightOnSquareIcon" size={12} />
                  Open
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-secondary border border-border p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Form Fields</p>
                <p className="text-sm font-bold text-foreground">3</p>
                <p className="text-[9px] text-muted-foreground">Name · Mobile · Email</p>
              </div>
              <div className="bg-secondary border border-border p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Lead Source</p>
                <p className="text-sm font-bold text-primary">Landing Page</p>
              </div>
              <div className="bg-secondary border border-border p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Project Tagged</p>
                <p className="text-xs font-bold text-foreground truncate">{selectedProject.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
