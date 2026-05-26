'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PinLocationMap from '@/components/ui/PinLocationMap';
import { useRole } from '@/contexts/RoleContext';
import { usePropertyFields } from '@/hooks/usePropertyFields';
import { useCommunities } from '@/hooks/useCommunities';

interface Project {
  id: string;
  name: string;
  developer: string;
  locationArea: string;
  projectType: string;
  status: string;
  totalUnits: number;
  soldUnits: number;
  handoverDate: string;
  startingPrice: string;
  images: any[];
  featured: boolean;
  published: boolean;
  international: boolean;
}

interface UnitType { id: number; name: string; size: string; price: string; }
interface PaymentMilestone { id: number; label: string; percentage: string; dueDate: string; }
interface ProjectImage { id: number; url: string; caption: string; }
interface FloorPlan { id: number; url: string; label: string; }

const PROPERTY_TYPES_FALLBACK = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex'];
const AMENITIES_LIST_FALLBACK = ['Swimming Pool', 'Gym', 'Kids Play Area', 'Parks', 'Retail', 'Mosque', 'School', 'Concierge', 'Security', 'Parking', 'Beach Access', 'Golf Course'];

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Completed: 'text-blue-400 bg-blue-400/10',
  Launching: 'text-primary bg-primary/10',
  'On Hold': 'text-orange-400 bg-orange-400/10',
};

type TabId = 'basic' | 'units' | 'location' | 'payment' | 'media' | 'docs';
const TABS: { id: TabId; label: string }[] = [
  { id: 'basic', label: 'Basic' }, { id: 'units', label: 'Units' },
  { id: 'location', label: 'Location' }, { id: 'payment', label: 'Payment' },
  { id: 'media', label: 'Media' }, { id: 'docs', label: 'Docs' },
];

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">Loading...</div>}>
      <ProjectsPageInner />
    </Suspense>
  );
}

function ProjectsPageInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { isAgentScoped, canViewAll, canEditProject } = useRole();
  const pf = usePropertyFields();
  const comm = useCommunities();
  const PROPERTY_TYPES = pf.loaded ? pf.types : PROPERTY_TYPES_FALLBACK;
  const AMENITIES_LIST = pf.loaded ? pf.amenities : AMENITIES_LIST_FALLBACK;

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Basic tab
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Off-Plan');
  const [status, setStatus] = useState('Active');
  const [startingPrice, setStartingPrice] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [international, setInternational] = useState(false);
  const [country, setCountry] = useState('');

  // Units tab
  const [totalUnits, setTotalUnits] = useState('');
  const [availableUnits, setAvailableUnits] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('0');
  const [maxBedrooms, setMaxBedrooms] = useState('6');
  const [sizeRange, setSizeRange] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

  // Location tab
  const [emirate, setEmirate] = useState('Dubai');
  const [locationArea, setLocationArea] = useState('');
  const [community, setCommunity] = useState('');
  const [subCommunity, setSubCommunity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latitude, setLatitude] = useState('25.0657');
  const [longitude, setLongitude] = useState('55.1713');
  const [availableAreas, setAvailableAreas] = useState<string[]>(comm.getAreasForEmirate('Dubai'));
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);

  // Payment tab
  const [paymentPlanSummary, setPaymentPlanSummary] = useState('');
  const [postHandoverPlan, setPostHandoverPlan] = useState('');
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);

  // Media tab
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [masterPlanUrl, setMasterPlanUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');

  // Docs tab
  const [brochureUrl, setBrochureUrl] = useState('');
  const [factsheetUrl, setFactsheetUrl] = useState('');
  const [priceListUrl, setPriceListUrl] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, developer, location_area, project_type, status, total_units, sold_units, handover_date, starting_price, images, featured, published, international')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading projects:', error.message);
    }
    if (data) {
      setProjectList(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        developer: p.developer || '',
        locationArea: p.location_area || '',
        projectType: p.project_type || 'Off-Plan',
        status: p.status || 'Active',
        totalUnits: p.total_units || 0,
        soldUnits: p.sold_units || 0,
        handoverDate: p.handover_date || '',
        startingPrice: p.starting_price || '',
        images: Array.isArray(p.images) ? p.images : [],
        featured: p.featured ?? false,
        published: p.published ?? false,
        international: p.international ?? false,
      })));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = projectList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.developer.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allSelected) { const s = new Set(selectedIds); filtered.forEach(p => s.delete(p.id)); setSelectedIds(s); }
    else { const s = new Set(selectedIds); filtered.forEach(p => s.add(p.id)); setSelectedIds(s); }
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };

  const handleBulkDelete = async () => {
    await supabase.from('projects').delete().in('id', Array.from(selectedIds));
    setSelectedIds(new Set()); setBulkDeleteConfirm(false); loadProjects();
  };
  const handleBulkPublish = async (pub: boolean) => {
    await supabase.from('projects').update({ published: pub }).in('id', Array.from(selectedIds));
    setSelectedIds(new Set()); loadProjects();
  };
  const handleBulkFeatured = async (feat: boolean) => {
    await supabase.from('projects').update({ featured: feat }).in('id', Array.from(selectedIds));
    setSelectedIds(new Set()); loadProjects();
  };

  const resetModal = () => {
    setName(''); setDeveloper(''); setDescription(''); setProjectType('Off-Plan'); setStatus('Active');
    setStartingPrice(''); setHandoverDate(''); setFeatured(false); setPublished(false);
    setInternational(false); setCountry('');
    setTotalUnits(''); setAvailableUnits(''); setMinBedrooms('0'); setMaxBedrooms('6');
    setSizeRange(''); setSelectedPropertyTypes([]); setSelectedAmenities([]); setUnitTypes([]);
    setEmirate('Dubai'); setLocationArea(''); setCommunity(''); setSubCommunity('');
    setFullAddress(''); setLatitude('25.0657'); setLongitude('55.1713');
    setAvailableAreas(comm.getAreasForEmirate('Dubai')); setAvailableCommunities([]);
    setPaymentPlanSummary(''); setPostHandoverPlan(''); setMilestones([]);
    setImageUrlsText(''); setFloorPlans([]); setMasterPlanUrl(''); setVideoUrl(''); setVirtualTourUrl('');
    setBrochureUrl(''); setFactsheetUrl(''); setPriceListUrl('');
  };

  const openNew = () => { setEditId(null); resetModal(); setActiveTab('basic'); setShowModal(true); };

  const openEdit = async (id: string) => {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    if (!data) return;
    setName(data.name || ''); setDeveloper(data.developer || ''); setDescription(data.description || '');
    setProjectType(data.project_type || 'Off-Plan'); setStatus(data.status || 'Active');
    setStartingPrice(data.starting_price || ''); setHandoverDate(data.handover_date || '');
    setFeatured(data.featured ?? false); setPublished(data.published ?? false);
    setInternational(data.international ?? false); setCountry(data.country || '');
    setTotalUnits(String(data.total_units || '')); setAvailableUnits(String(data.available_units || ''));
    setMinBedrooms(String(data.min_bedrooms ?? 0)); setMaxBedrooms(String(data.max_bedrooms ?? 6));
    setSizeRange(data.size_range || '');
    setSelectedPropertyTypes(Array.isArray(data.property_types) ? data.property_types : []);
    setSelectedAmenities(Array.isArray(data.amenities) ? data.amenities : []);
    setUnitTypes((Array.isArray(data.unit_types) ? data.unit_types : []).map((u: any, i: number) => ({ id: Date.now() + i, name: u.name || '', size: u.size || '', price: u.price || '' })));
    const em = data.emirate || 'Dubai';
    setEmirate(em); setLocationArea(data.location_area || ''); setCommunity(data.community || '');
    setSubCommunity(data.sub_community || ''); setFullAddress(data.full_address || '');
    setLatitude(data.latitude || '25.0657'); setLongitude(data.longitude || '55.1713');
    setAvailableAreas(comm.getAreasForEmirate(em));
    if (data.location_area) setAvailableCommunities(comm.getCommunitiesForArea(data.location_area));
    setPaymentPlanSummary(data.payment_plan_summary || ''); setPostHandoverPlan(data.post_handover_plan || '');
    setMilestones((Array.isArray(data.milestones) ? data.milestones : []).map((m: any, i: number) => ({ id: Date.now() + i, label: m.label || '', percentage: m.percentage || '', dueDate: m.dueDate || '' })));
    const imgs = Array.isArray(data.images) ? data.images : [];
    setImageUrlsText(imgs.map((img: any) => img.url || img.src || '').filter(Boolean).join(', '));
    setFloorPlans((Array.isArray(data.floor_plans) ? data.floor_plans : []).map((fp: any, i: number) => ({ id: Date.now() + i, url: fp.url || '', label: fp.label || '' })));
    setMasterPlanUrl(data.master_plan_url || ''); setVideoUrl(data.video_url || ''); setVirtualTourUrl(data.virtual_tour_url || '');
    setBrochureUrl(data.brochure_url || ''); setFactsheetUrl(data.factsheet_url || ''); setPriceListUrl(data.price_list_url || '');
    setEditId(id); setActiveTab('basic'); setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    loadProjects();
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    setSaveError(null);
    const parsedImages = imageUrlsText.split(',').map(u => u.trim()).filter(Boolean).map(url => ({ url, alt: name, caption: '' }));
    const payload = {
      name, developer, description, project_type: projectType, status,
      starting_price: startingPrice, handover_date: handoverDate,
      featured, published, international, country,
      total_units: parseInt(totalUnits) || 0,
      available_units: parseInt(availableUnits) || 0,
      sold_units: 0,
      min_bedrooms: parseInt(minBedrooms) || 0,
      max_bedrooms: parseInt(maxBedrooms) || 6,
      size_range: sizeRange,
      property_types: selectedPropertyTypes,
      amenities: selectedAmenities,
      unit_types: unitTypes.map(u => ({ name: u.name, size: u.size, price: u.price })),
      emirate, location_area: locationArea, community, sub_community: subCommunity,
      full_address: fullAddress, latitude, longitude,
      payment_plan_summary: paymentPlanSummary, post_handover_plan: postHandoverPlan,
      milestones: milestones.map(m => ({ label: m.label, percentage: m.percentage, dueDate: m.dueDate })),
      images: parsedImages,
      floor_plans: floorPlans.map(fp => ({ url: fp.url, label: fp.label })),
      master_plan_url: masterPlanUrl, video_url: videoUrl, virtual_tour_url: virtualTourUrl,
      brochure_url: brochureUrl, factsheet_url: factsheetUrl, price_list_url: priceListUrl,
    };

    let error: any = null;
    if (editId) {
      const result = await supabase.from('projects').update(payload).eq('id', editId);
      error = result.error;
    } else {
      const result = await supabase.from('projects').insert({ ...payload, sold_units: 0 });
      error = result.error;
    }

    setSaving(false);
    if (error) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save project. Please try again.');
      return;
    }
    setShowModal(false);
    setSaveError(null);
    resetModal();
    setEditId(null);
    loadProjects();
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60";
  const labelCls = "block text-xs text-[#aaa] mb-1";

  const getProjectCoverImage = (project: Project) => {
    if (Array.isArray(project.images) && project.images.length > 0) {
      return project.images[0]?.url || project.images[0]?.src || '';
    }
    return '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage new development projects</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name="PlusIcon" size={14} />Add Project
        </button>
      </div>

      {/* Agent scope notice */}
      {isAgentScoped && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/20 text-xs text-primary">
          <Icon name="InformationCircleIcon" size={14} />
          <span>All projects are visible. Unit pricing and inventory details are restricted to the assigned agent only.</span>
        </div>
      )}

      <div className="relative max-w-sm mb-5">
        <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            <button onClick={() => handleBulkPublish(true)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors">Publish</button>
            <button onClick={() => handleBulkPublish(false)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Unpublish</button>
            <button onClick={() => handleBulkFeatured(true)} className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">Featured</button>
            <button onClick={() => handleBulkFeatured(false)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Unfeatured</button>
            <button onClick={() => setBulkDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <Icon name="TrashIcon" size={13} />Delete
            </button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"><Icon name="XMarkIcon" size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="BuildingOffice2Icon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No projects found.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">Add First Project</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 px-1">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
            <span className="text-xs text-muted-foreground">Select all {filtered.length} projects</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((project) => {
              const soldPct = project.totalUnits > 0 ? Math.round(project.soldUnits / project.totalUnits * 100) : 0;
              const coverImg = getProjectCoverImage(project);
              return (
                <div key={project.id} className={`bg-card border overflow-hidden hover:border-primary/30 transition-colors ${selectedIds.has(project.id) ? 'border-primary/40' : 'border-border'}`}>
                  <div className="relative h-44 overflow-hidden">
                    {coverImg ? (
                      <AppImage src={coverImg} alt={project.name} fill className="object-cover" sizes="600px" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Icon name="BuildingOffice2Icon" size={32} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2 items-center">
                      <input type="checkbox" checked={selectedIds.has(project.id)} onChange={() => toggleSelect(project.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" onClick={(e) => e.stopPropagation()} />
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{project.projectType}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[project.status] || ''}`}>{project.status}</span>
                      {project.featured && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-400">Featured</span>}
                      {project.international && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-500/20 text-blue-400">🌐 Intl</span>}
                      {!project.published && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-500/20 text-gray-400">Draft</span>}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-base font-bold text-white">{project.name}</h3>
                      <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5"><Icon name="MapPinIcon" size={10} />{project.locationArea || '—'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div><p className="text-xs text-muted-foreground">Developer</p><p className="text-sm font-semibold text-foreground mt-0.5 truncate">{project.developer || '—'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Handover</p><p className="text-sm font-semibold text-foreground mt-0.5">{project.handoverDate || '—'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Starting Price</p><p className="text-sm font-semibold text-primary mt-0.5 truncate">{project.startingPrice ? `AED ${project.startingPrice}` : '—'}</p></div>
                    </div>
                    {/* Unit availability — restricted to admins only; agents see count but not breakdown */}
                    {project.totalUnits > 0 && (
                      <div className="mb-4">
                        {canViewAll ? (
                          <>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">Units Sold</span>
                              <span className="text-foreground font-semibold">{project.soldUnits}/{project.totalUnits} ({soldPct}%)</span>
                            </div>
                            <div className="h-1.5 bg-secondary overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-700" style={{ width: `${soldPct}%` }} />
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="LockClosedIcon" size={12} />
                            <span>Unit details restricted — {project.totalUnits} total units</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {canEditProject && (
                        <button onClick={() => openEdit(project.id)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Edit</button>
                      )}
                      <button onClick={() => router.push(`/admin/projects/${project.id}`)} className="flex-1 py-2 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">View Details</button>
                      <button onClick={() => handleDelete(project.id)} className="px-3 py-2 border border-red-400/20 text-xs text-red-400 hover:bg-red-400/5 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-[#0f1117] border border-[#2a3040] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3040]">
              <h2 className="text-base font-bold text-white">{editId ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex border-b border-[#2a3040] overflow-x-auto">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-[#666] hover:text-white'}`}>{tab.label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={labelCls}>Project Name *</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skyline Residences" /></div>
                  <div><label className={labelCls}>Developer</label><input className={inputCls} value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="e.g. Emaar" /></div>
                  <div><label className={labelCls}>Type</label>
                    <select className={inputCls} value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                      <option>Off-Plan</option><option>Completed</option><option>Under Construction</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Status</label>
                    <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option>Active</option><option>Launching</option><option>Completed</option><option>On Hold</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Starting Price (AED)</label><input className={inputCls} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. 1,200,000" /></div>
                  <div><label className={labelCls}>Handover Date</label><input className={inputCls} value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} placeholder="e.g. Q4 2026" /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description..." /></div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-[#c9a84c]" /><span className="text-xs text-[#aaa]">Featured</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 accent-[#c9a84c]" /><span className="text-xs text-[#aaa]">Published</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={international} onChange={(e) => setInternational(e.target.checked)} className="w-4 h-4 accent-[#c9a84c]" /><span className="text-xs text-[#aaa]">International</span></label>
                  </div>
                  {international && <div className="col-span-2"><label className={labelCls}>Country</label><input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Saudi Arabia" /></div>}
                </div>
              )}

              {activeTab === 'units' && (
                <div className="space-y-4">
                  {isAgentScoped ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                      <Icon name="LockClosedIcon" size={28} className="text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-foreground">Unit Information Restricted</p>
                      <p className="text-xs text-muted-foreground max-w-xs">Unit types, pricing, and inventory details are only accessible to the assigned agent for this project.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Total Units</label><input className={inputCls} value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} placeholder="e.g. 240" /></div>
                        <div><label className={labelCls}>Available Units</label><input className={inputCls} value={availableUnits} onChange={(e) => setAvailableUnits(e.target.value)} placeholder="e.g. 60" /></div>
                        <div><label className={labelCls}>Min Bedrooms</label><input className={inputCls} value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} /></div>
                        <div><label className={labelCls}>Max Bedrooms</label><input className={inputCls} value={maxBedrooms} onChange={(e) => setMaxBedrooms(e.target.value)} /></div>
                        <div className="col-span-2"><label className={labelCls}>Size Range</label><input className={inputCls} value={sizeRange} onChange={(e) => setSizeRange(e.target.value)} placeholder="e.g. 650 - 3,200 sq ft" /></div>
                      </div>
                      <div>
                        <label className={labelCls}>Property Types</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {PROPERTY_TYPES.map(t => (
                            <button key={t} onClick={() => setSelectedPropertyTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-3 py-1.5 text-xs border transition-colors ${selectedPropertyTypes.includes(t) ? 'border-primary text-primary bg-primary/10' : 'border-[#333] text-[#aaa] hover:border-[#555]'}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Amenities</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {AMENITIES_LIST.map(a => (
                            <button key={a} onClick={() => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])} className={`px-3 py-1.5 text-xs border transition-colors ${selectedAmenities.includes(a) ? 'border-primary text-primary bg-primary/10' : 'border-[#333] text-[#aaa] hover:border-[#555]'}`}>{a}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelCls}>Unit Types</label>
                          <button onClick={() => setUnitTypes([...unitTypes, { id: Date.now(), name: '', size: '', price: '' }])} className="text-xs text-primary hover:text-accent transition-colors">+ Add Unit Type</button>
                        </div>
                        {unitTypes.map((u) => (
                          <div key={u.id} className="grid grid-cols-4 gap-2 mb-2">
                            <input className={inputCls} value={u.name} onChange={(e) => setUnitTypes(unitTypes.map(x => x.id === u.id ? { ...x, name: e.target.value } : x))} placeholder="Type" />
                            <input className={inputCls} value={u.size} onChange={(e) => setUnitTypes(unitTypes.map(x => x.id === u.id ? { ...x, size: e.target.value } : x))} placeholder="Size" />
                            <input className={inputCls} value={u.price} onChange={(e) => setUnitTypes(unitTypes.map(x => x.id === u.id ? { ...x, price: e.target.value } : x))} placeholder="Price" />
                            <button onClick={() => setUnitTypes(unitTypes.filter(x => x.id !== u.id))} className="px-2 py-2 border border-red-400/20 text-red-400 hover:bg-red-400/5 transition-colors text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Emirate</label>
                    <select className={inputCls} value={emirate} onChange={(e) => { const em = e.target.value; setEmirate(em); setLocationArea(''); setCommunity(''); setAvailableAreas(comm.getAreasForEmirate(em)); setAvailableCommunities([]); }}>
                      {comm.emirates.map(em => <option key={em}>{em}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Area</label>
                    <select className={inputCls} value={locationArea} onChange={(e) => { const area = e.target.value; setLocationArea(area); setCommunity(''); setAvailableCommunities(comm.getCommunitiesForArea(area)); }}>
                      <option value="">Select area...</option>
                      {availableAreas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Community</label>
                    <select className={inputCls} value={community} onChange={(e) => setCommunity(e.target.value)}>
                      <option value="">Select community...</option>
                      {availableCommunities.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Sub-Community</label><input className={inputCls} value={subCommunity} onChange={(e) => setSubCommunity(e.target.value)} /></div>
                  <div className="col-span-2"><label className={labelCls}>Full Address</label><input className={inputCls} value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} /></div>
                  <div className="col-span-2">
                    <PinLocationMap
                      label="Pin Location on Map"
                      value={{
                        lat: parseFloat(latitude) || 25.0657,
                        lng: parseFloat(longitude) || 55.1713,
                        address: fullAddress,
                      }}
                      onChange={(val) => { setLatitude(String(val.lat)); setLongitude(String(val.lng)); if (val.address) setFullAddress(val.address); }}
                    />
                  </div>
                  <div><label className={labelCls}>Latitude</label><input className={inputCls} value={latitude} onChange={(e) => setLatitude(e.target.value)} /></div>
                  <div><label className={labelCls}>Longitude</label><input className={inputCls} value={longitude} onChange={(e) => setLongitude(e.target.value)} /></div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-4">
                  <div><label className={labelCls}>Payment Plan Summary</label><textarea className={inputCls} rows={3} value={paymentPlanSummary} onChange={(e) => setPaymentPlanSummary(e.target.value)} placeholder="e.g. 60/40 payment plan with flexible installments" /></div>
                  <div><label className={labelCls}>Post-Handover Plan</label><textarea className={inputCls} rows={2} value={postHandoverPlan} onChange={(e) => setPostHandoverPlan(e.target.value)} placeholder="e.g. 40% over 3 years post-handover" /></div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls}>Payment Milestones</label>
                      <button onClick={() => setMilestones([...milestones, { id: Date.now(), label: '', percentage: '', dueDate: '' }])} className="text-xs text-primary hover:text-accent transition-colors">+ Add Milestone</button>
                    </div>
                    {milestones.map((m) => (
                      <div key={m.id} className="grid grid-cols-4 gap-2 mb-2">
                        <input className={inputCls} value={m.label} onChange={(e) => setMilestones(milestones.map(x => x.id === m.id ? { ...x, label: e.target.value } : x))} placeholder="Label" />
                        <input className={inputCls} value={m.percentage} onChange={(e) => setMilestones(milestones.map(x => x.id === m.id ? { ...x, percentage: e.target.value } : x))} placeholder="%" />
                        <input className={inputCls} value={m.dueDate} onChange={(e) => setMilestones(milestones.map(x => x.id === m.id ? { ...x, dueDate: e.target.value } : x))} placeholder="Due Date" />
                        <button onClick={() => setMilestones(milestones.filter(x => x.id !== m.id))} className="px-2 py-2 border border-red-400/20 text-red-400 hover:bg-red-400/5 transition-colors text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Image URLs (comma-separated)</label>
                    <textarea className={inputCls} rows={5} value={imageUrlsText} onChange={(e) => setImageUrlsText(e.target.value)} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, ..." />
                    <p className="text-xs text-[#555] mt-1">Paste multiple image URLs separated by commas</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls}>Floor Plans</label>
                      <button onClick={() => setFloorPlans([...floorPlans, { id: Date.now(), url: '', label: '' }])} className="text-xs text-primary hover:text-accent transition-colors">+ Add Floor Plan</button>
                    </div>
                    {floorPlans.map((fp) => (
                      <div key={fp.id} className="grid grid-cols-3 gap-2 mb-2">
                        <input className={`${inputCls} col-span-2`} value={fp.url} onChange={(e) => setFloorPlans(floorPlans.map(x => x.id === fp.id ? { ...x, url: e.target.value } : x))} placeholder="Floor plan URL" />
                        <input className={inputCls} value={fp.label} onChange={(e) => setFloorPlans(floorPlans.map(x => x.id === fp.id ? { ...x, label: e.target.value } : x))} placeholder="Label" />
                      </div>
                    ))}
                  </div>
                  <div><label className={labelCls}>Master Plan URL</label><input className={inputCls} value={masterPlanUrl} onChange={(e) => setMasterPlanUrl(e.target.value)} /></div>
                  <div><label className={labelCls}>Video URL</label><input className={inputCls} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /></div>
                  <div><label className={labelCls}>Virtual Tour URL</label><input className={inputCls} value={virtualTourUrl} onChange={(e) => setVirtualTourUrl(e.target.value)} /></div>
                  {imageUrlsText && (
                    <div>
                      <p className="text-xs text-[#aaa] mb-2">Preview</p>
                      <div className="flex gap-2 flex-wrap">
                        {imageUrlsText.split(',').map(u => u.trim()).filter(Boolean).slice(0, 6).map((url, i) => (
                          <div key={i} className="relative w-20 h-14 border border-[#333] overflow-hidden">
                            <AppImage src={url} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="80px" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-4">
                  <div><label className={labelCls}>Brochure URL</label><input className={inputCls} value={brochureUrl} onChange={(e) => setBrochureUrl(e.target.value)} /></div>
                  <div><label className={labelCls}>Factsheet URL</label><input className={inputCls} value={factsheetUrl} onChange={(e) => setFactsheetUrl(e.target.value)} /></div>
                  <div><label className={labelCls}>Price List URL</label><input className={inputCls} value={priceListUrl} onChange={(e) => setPriceListUrl(e.target.value)} /></div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a3040]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors">Cancel</button>
              <div className="flex items-center gap-3">
                {saveError && <p className="text-xs text-red-400 max-w-xs text-right">{saveError}</p>}
                <button onClick={handleSave} disabled={saving || !name} className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editId ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-foreground mb-2">Delete {selectedIds.size} Projects?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}