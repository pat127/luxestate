'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useRouter, useSearchParams } from 'next/navigation';
import PinLocationMap from '@/components/ui/PinLocationMap';
import { UAE_EMIRATES, getAreasForEmirate, getCommunitiesForArea } from '@/lib/uaeLocations';

interface Project {
  id: number;
  name: string;
  developer: string;
  location: string;
  type: string;
  status: string;
  units: number;
  sold: number;
  completion: string;
  price: string;
  image: string;
  alt: string;
  featured?: boolean;
  published?: boolean;
  international?: boolean;
  country?: string;
}

interface UnitType {id: number;name: string;size: string;price: string;}
interface PaymentMilestone {id: number;label: string;percentage: string;dueDate: string;}
interface ProjectImage {id: number;url: string;caption: string;}
interface FloorPlan {id: number;url: string;label: string;}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex'];
const AMENITIES = ['Swimming Pool', 'Gym', 'Kids Play Area', 'Parks', 'Retail', 'Mosque', 'School', 'Concierge', 'Security', 'Parking', 'Beach Access', 'Golf Course'];

const PROJECTS_STORAGE_KEY = 'admin_projects';
const IMPORT_STORAGE_KEY = 'imported_projects';

const initialProjects: Project[] = [
{ id: 1, name: 'Skyline Residences', developer: 'Emaar', location: 'Downtown Dubai', type: 'Off-Plan', status: 'Active', units: 240, sold: 180, completion: 'Q4 2026', price: 'AED 1.2M+', image: "https://images.unsplash.com/photo-1700391488389-7ad0b572b299", alt: 'Modern residential tower', featured: true, published: true },
{ id: 2, name: 'Marina Bay Towers', developer: 'DAMAC', location: 'Dubai Marina', type: 'Off-Plan', status: 'Active', units: 320, sold: 210, completion: 'Q2 2027', price: 'AED 900K+', image: "https://images.unsplash.com/photo-1624268638085-483818378fbe", alt: 'Marina bay towers', featured: false, published: true },
{ id: 3, name: 'Palm Grove Villas', developer: 'Nakheel', location: 'Palm Jumeirah', type: 'Completed', status: 'Completed', units: 48, sold: 48, completion: 'Q1 2024', price: 'AED 8M+', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6c5561f-1772578497366.png", alt: 'Palm grove villa', featured: true, published: true },
{ id: 4, name: 'Creek Horizon', developer: 'Meraas', location: 'Dubai Creek', type: 'Off-Plan', status: 'Launching', units: 180, sold: 0, completion: 'Q3 2028', price: 'AED 1.8M+', image: "https://img.rocket.new/generatedImages/rocket_gen_img_10fd3b150-1768441578667.png", alt: 'Creek horizon project', featured: false, published: false }];


function loadProjects(): Project[] {
  if (typeof window === 'undefined') return initialProjects;
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Project[];
    let base: Project[] = stored ? JSON.parse(stored) : initialProjects;
    const existingIds = new Set(base.map((p) => p.id));
    const newImports = imported.filter((p) => !existingIds.has(p.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
      localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(base));
    }
    return base;
  } catch {
    return initialProjects;
  }
}

function saveProjects(list: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Completed: 'text-blue-400 bg-blue-400/10',
  Launching: 'text-primary bg-primary/10',
  'On Hold': 'text-orange-400 bg-orange-400/10'
};

type TabId = 'basic' | 'units' | 'location' | 'payment' | 'media' | 'docs';

const TABS: {id: TabId;label: string;}[] = [
{ id: 'basic', label: 'Basic' },
{ id: 'units', label: 'Units' },
{ id: 'location', label: 'Location' },
{ id: 'payment', label: 'Payment' },
{ id: 'media', label: 'Media' },
{ id: 'docs', label: 'Docs' }];


interface ProjectFormState {
  name: string;developer: string;description: string;type: string;status: string;
  startingPrice: string;handoverDate: string;completionYear: string;featured: boolean;published: boolean;
  international: boolean;country: string;
}

const emptyBasicForm: ProjectFormState = {
  name: '', developer: '', description: '', type: 'Off-Plan', status: 'Active',
  startingPrice: '', handoverDate: '', completionYear: '', featured: false, published: false,
  international: false, country: ''
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">Loading...</div>}>
      <ProjectsPageInner />
    </Suspense>);

}

function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [projectList, setProjectList] = useState<Project[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Basic tab state
  const [basicForm, setBasicForm] = useState<ProjectFormState>(emptyBasicForm);

  // Units tab state
  const [totalUnits, setTotalUnits] = useState('');
  const [availableUnits, setAvailableUnits] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('0');
  const [maxBedrooms, setMaxBedrooms] = useState('6');
  const [sizeRange, setSizeRange] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

  // Location tab state
  const [locationSearch, setLocationSearch] = useState('');
  const [emirate, setEmirate] = useState('Dubai');
  const [locationArea, setLocationArea] = useState('');
  const [community, setCommunity] = useState('');
  const [subCommunity, setSubCommunity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latitude, setLatitude] = useState('25.0657');
  const [longitude, setLongitude] = useState('55.1713');
  const [availableAreas, setAvailableAreas] = useState<string[]>(getAreasForEmirate('Dubai'));
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);

  // Payment tab state
  const [paymentPlanSummary, setPaymentPlanSummary] = useState('');
  const [postHandoverPlan, setPostHandoverPlan] = useState('');
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);

  // Media tab state
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [masterPlanUrl, setMasterPlanUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');

  // Docs tab state
  const [brochureUrl, setBrochureUrl] = useState('');
  const [factsheetUrl, setFactsheetUrl] = useState('');
  const [priceListUrl, setPriceListUrl] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    setProjectList(loadProjects());
  }, []);

  // Handle ?edit=<id> query param from project detail page
  useEffect(() => {
    const editId = searchParams?.get('edit');
    if (editId && projectList.length > 0) {
      const project = projectList.find((p) => p.id.toString() === editId);
      if (project) {
        openEdit(project);
        // Clear the query param without navigation
        router.replace('/admin/projects');
      }
    }
  }, [searchParams, projectList]);

  // Poll for new imports
  useEffect(() => {
    const interval = setInterval(() => {
      const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Project[];
      if (imported.length > 0) {
        setProjectList((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newImports = imported.filter((p) => !existingIds.has(p.id));
          if (newImports.length === 0) return prev;
          const updated = [...prev, ...newImports];
          localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateProjectList = (updated: Project[]) => {
    setProjectList(updated);
    saveProjects(updated);
  };

  const filtered = projectList.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  p.developer.toLowerCase().includes(search.toLowerCase())
  );

  // Bulk selection helpers
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach((p) => newSet.delete(p.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach((p) => newSet.add(p.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);else
    newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = () => {
    if (!bulkStatusValue) return;
    updateProjectList(projectList.map((p) => selectedIds.has(p.id) ? { ...p, status: bulkStatusValue } : p));
    setBulkStatusValue('');
    clearSelection();
  };

  const handleBulkPublish = (publish: boolean) => {
    updateProjectList(projectList.map((p) => selectedIds.has(p.id) ? { ...p, published: publish } : p));
    clearSelection();
  };

  const handleBulkFeatured = (featured: boolean) => {
    updateProjectList(projectList.map((p) => selectedIds.has(p.id) ? { ...p, featured } : p));
    clearSelection();
  };

  const handleBulkDeleteConfirmed = () => {
    updateProjectList(projectList.filter((p) => !selectedIds.has(p.id)));
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const addUnitType = () => setUnitTypes([...unitTypes, { id: Date.now(), name: '', size: '', price: '' }]);
  const updateUnitType = (id: number, field: keyof UnitType, value: string) => setUnitTypes(unitTypes.map((u) => u.id === id ? { ...u, [field]: value } : u));
  const removeUnitType = (id: number) => setUnitTypes(unitTypes.filter((u) => u.id !== id));

  const addMilestone = () => setMilestones([...milestones, { id: Date.now(), label: '', percentage: '', dueDate: '' }]);
  const updateMilestone = (id: number, field: keyof PaymentMilestone, value: string) => setMilestones(milestones.map((m) => m.id === id ? { ...m, [field]: value } : m));
  const removeMilestone = (id: number) => setMilestones(milestones.filter((m) => m.id !== id));

  const addProjectImage = () => setProjectImages([...projectImages, { id: Date.now(), url: '', caption: '' }]);
  const updateProjectImage = (id: number, field: keyof ProjectImage, value: string) => setProjectImages(projectImages.map((img) => img.id === id ? { ...img, [field]: value } : img));
  const removeProjectImage = (id: number) => setProjectImages(projectImages.filter((img) => img.id !== id));

  const addFloorPlan = () => setFloorPlans([...floorPlans, { id: Date.now(), url: '', label: '' }]);
  const updateFloorPlan = (id: number, field: keyof FloorPlan, value: string) => setFloorPlans(floorPlans.map((fp) => fp.id === id ? { ...fp, [field]: value } : fp));
  const removeFloorPlan = (id: number) => setFloorPlans(floorPlans.filter((fp) => fp.id !== id));

  const resetModal = () => {
    setActiveTab('basic');
    setBasicForm(emptyBasicForm);
    setTotalUnits('');setAvailableUnits('');setMinBedrooms('0');setMaxBedrooms('6');
    setSizeRange('');setSelectedPropertyTypes([]);setSelectedAmenities([]);setUnitTypes([]);
    setLocationSearch('');setEmirate('Dubai');setLocationArea('');setCommunity('');setSubCommunity('');
    setFullAddress('');setLatitude('25.0657');setLongitude('55.1713');
    setAvailableAreas(getAreasForEmirate('Dubai'));setAvailableCommunities([]);
    setPaymentPlanSummary('');setPostHandoverPlan('');setMilestones([]);
    setProjectImages([]);setFloorPlans([]);setMasterPlanUrl('');setVideoUrl('');setVirtualTourUrl('');
    setBrochureUrl('');setFactsheetUrl('');setPriceListUrl('');
  };

  const openNew = () => {
    setEditProject(null);
    resetModal();
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditProject(project);
    setBasicForm({
      name: project.name,
      developer: project.developer,
      description: '',
      type: project.type,
      status: project.status,
      startingPrice: project.price.replace('AED ', '').replace('+', ''),
      handoverDate: project.completion,
      completionYear: '',
      featured: project.featured || false,
      published: project.published || false,
      international: project.international || false,
      country: project.country || ''
    });
    setLocationArea(project.location);
    setEmirate('Dubai');
    setAvailableAreas(getAreasForEmirate('Dubai'));
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!basicForm.name) return;
    if (editProject) {
      updateProjectList(projectList.map((p) => p.id === editProject.id ? {
        ...p,
        name: basicForm.name,
        developer: basicForm.developer,
        type: basicForm.type,
        status: basicForm.status,
        price: basicForm.startingPrice ? `AED ${basicForm.startingPrice}+` : p.price,
        completion: basicForm.handoverDate || p.completion,
        location: locationArea || p.location,
        featured: basicForm.featured,
        published: basicForm.published,
        international: basicForm.international,
        country: basicForm.country
      } : p));
    } else {
      updateProjectList([...projectList, {
        id: Date.now(),
        name: basicForm.name,
        developer: basicForm.developer,
        location: locationArea || 'Dubai',
        type: basicForm.type,
        status: basicForm.status,
        units: parseInt(totalUnits) || 0,
        sold: 0,
        completion: basicForm.handoverDate || 'TBD',
        price: basicForm.startingPrice ? `AED ${basicForm.startingPrice}+` : 'TBD',
        image: projectImages[0]?.url || 'https://images.unsplash.com/photo-1614224352143-ef0bcc52828d',
        alt: basicForm.name,
        featured: basicForm.featured,
        published: basicForm.published,
        international: basicForm.international,
        country: basicForm.country
      }]);
    }
    setShowModal(false);
    resetModal();
    setEditProject(null);
  };

  const handleClose = () => {setShowModal(false);resetModal();setEditProject(null);};

  const inputCls = "w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60";
  const labelCls = "block text-xs text-[#aaa] mb-1";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage new development projects</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          
          <Icon name="PlusIcon" size={14} />
          Add Project
        </button>
      </div>

      <div className="relative max-w-sm mb-5">
        <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 &&
      <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="px-2 py-1.5 bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary/50">
              <option value="">Change Status...</option>
              <option>Active</option><option>Launching</option><option>Completed</option><option>On Hold</option>
            </select>
            <button onClick={handleBulkStatusChange} disabled={!bulkStatusValue} className="px-3 py-1.5 bg-card border border-border text-xs text-foreground hover:border-primary/50 transition-colors disabled:opacity-40">Apply</button>
            <button onClick={() => handleBulkPublish(true)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors">Publish</button>
            <button onClick={() => handleBulkPublish(false)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Unpublish</button>
            <button onClick={() => handleBulkFeatured(true)} className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">Featured</button>
            <button onClick={() => handleBulkFeatured(false)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Unfeatured</button>
            <button onClick={() => setBulkDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <Icon name="TrashIcon" size={13} />Delete
            </button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"><Icon name="XMarkIcon" size={14} /></button>
        </div>
      }

      {/* Select All row */}
      {filtered.length > 0 &&
      <div className="flex items-center gap-2 mb-3 px-1">
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
          <span className="text-xs text-muted-foreground">Select all {filtered.length} projects</span>
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((project) => {
          const soldPct = project.units > 0 ? Math.round(project.sold / project.units * 100) : 0;
          return (
            <div key={project.id} className={`bg-card border overflow-hidden hover:border-primary/30 transition-colors ${selectedIds.has(project.id) ? 'border-primary/40' : 'border-border'}`}>
              <div className="relative h-44 overflow-hidden">
                <AppImage src={project.image} alt={project.alt} fill className="object-cover" sizes="600px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2 items-center">
                  <input type="checkbox" checked={selectedIds.has(project.id)} onChange={() => toggleSelect(project.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" onClick={(e) => e.stopPropagation()} />
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">{project.type}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[project.status] || ''}`}>{project.status}</span>
                  {project.featured && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-400">Featured</span>}
                  {project.international && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-500/20 text-blue-400 flex items-center gap-1">🌐 Intl</span>}
                  {project.published === false && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-500/20 text-gray-400">Draft</span>}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold text-white">{project.name}</h3>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                    <Icon name="MapPinIcon" size={10} />
                    {project.location}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Developer</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{project.developer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{project.completion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Starting Price</p>
                    <p className="text-sm font-semibold text-primary mt-0.5">{project.price}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Units Sold</span>
                    <span className="text-foreground font-semibold">{project.sold}/{project.units} ({soldPct}%)</span>
                  </div>
                  <div className="h-1.5 bg-secondary overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${soldPct}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(project)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Edit</button>
                  <button onClick={() => router.push(`/admin/projects/${project.id}`)} className="flex-1 py-2 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">View Details</button>
                </div>
              </div>
            </div>);

        })}
      </div>

      {/* Bulk Delete Confirm */}
      {bulkDeleteConfirm &&
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Projects</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} project(s) will be deleted</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDeleteConfirmed} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      }

      {/* Add/Edit Project Modal */}
      {showModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-lg font-bold text-white">{editProject ? `Edit Project — ${editProject.name}` : 'Add New Project'}</h2>
              <button onClick={handleClose} className="text-[#666] hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2a2a2a] px-6 pt-3 gap-1">
              {TABS.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ?
              'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/5' :
              'border-transparent text-[#888] hover:text-white'}`
              }>
              
                  {tab.label}
                </button>
            )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* BASIC TAB */}
              {activeTab === 'basic' &&
            <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Project Name *</label>
                      <input className={inputCls} placeholder="e.g., Skyline Residences" value={basicForm.name} onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Developer *</label>
                      <input className={inputCls} placeholder="e.g., Emaar" value={basicForm.developer} onChange={(e) => setBasicForm({ ...basicForm, developer: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Project Type</label>
                      <select className={inputCls} value={basicForm.type} onChange={(e) => setBasicForm({ ...basicForm, type: e.target.value })}>
                        <option>Off-Plan</option><option>Ready</option><option>Under Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select className={inputCls} value={basicForm.status} onChange={(e) => setBasicForm({ ...basicForm, status: e.target.value })}>
                        <option>Active</option><option>Launching</option><option>Completed</option><option>On Hold</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Starting Price (AED)</label>
                      <input className={inputCls} placeholder="e.g., 1200000" value={basicForm.startingPrice} onChange={(e) => setBasicForm({ ...basicForm, startingPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Handover Date</label>
                      <input className={inputCls} placeholder="e.g., Q4 2026" value={basicForm.handoverDate} onChange={(e) => setBasicForm({ ...basicForm, handoverDate: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Project description..." value={basicForm.description} onChange={(e) => setBasicForm({ ...basicForm, description: e.target.value })} />
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={basicForm.featured} onChange={(e) => setBasicForm({ ...basicForm, featured: e.target.checked })} className="accent-[#c9a84c]" />
                      <span className="text-sm text-[#aaa]">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={basicForm.published} onChange={(e) => setBasicForm({ ...basicForm, published: e.target.checked })} className="accent-[#c9a84c]" />
                      <span className="text-sm text-[#aaa]">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={basicForm.international} onChange={(e) => setBasicForm({ ...basicForm, international: e.target.checked })} className="accent-[#c9a84c]" />
                      <span className="text-sm text-[#aaa]">International</span>
                    </label>
                  </div>
                  {basicForm.international && (
                    <div>
                      <label className={labelCls}>Country *</label>
                      <input
                        className={inputCls}
                        placeholder="e.g., United Kingdom, United States, France"
                        value={basicForm.country}
                        onChange={(e) => setBasicForm({ ...basicForm, country: e.target.value })}
                      />
                      <p className="text-xs text-[#555] mt-1">This project will appear on the International page only, not the main Projects page.</p>
                    </div>
                  )}
                </div>
            }

              {/* UNITS TAB */}
              {activeTab === 'units' &&
            <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Total Units</label>
                      <input className={inputCls} value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Available Units</label>
                      <input className={inputCls} value={availableUnits} onChange={(e) => setAvailableUnits(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Min Bedrooms</label>
                      <input className={inputCls} placeholder="0" value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Max Bedrooms</label>
                      <input className={inputCls} placeholder="6" value={maxBedrooms} onChange={(e) => setMaxBedrooms(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Size Range</label>
                    <input className={inputCls} placeholder="e.g., 500 - 5,000 sq.ft" value={sizeRange} onChange={(e) => setSizeRange(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Property Types</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {PROPERTY_TYPES.map((type) =>
                  <button key={type} type="button" onClick={() => toggleTag(selectedPropertyTypes, setSelectedPropertyTypes, type)} className={`px-3 py-1.5 text-xs border transition-colors ${selectedPropertyTypes.includes(type) ? 'bg-[#c9a84c]/20 border-[#c9a84c] text-[#c9a84c]' : 'bg-transparent border-[#333] text-[#aaa] hover:border-[#555]'}`}>{type}</button>
                  )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + ' mb-0'}>Unit Types</label>
                      <button type="button" onClick={addUnitType} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:text-[#e0b85a] transition-colors"><Icon name="PlusIcon" size={12} />Add Unit Type</button>
                    </div>
                    {unitTypes.length === 0 && <p className="text-xs text-[#555] italic">No unit types added yet.</p>}
                    {unitTypes.map((ut) =>
                <div key={ut.id} className="grid grid-cols-3 gap-2 mb-2 items-center">
                        <input className={inputCls} placeholder="Type name" value={ut.name} onChange={(e) => updateUnitType(ut.id, 'name', e.target.value)} />
                        <input className={inputCls} placeholder="Size (sq.ft)" value={ut.size} onChange={(e) => updateUnitType(ut.id, 'size', e.target.value)} />
                        <div className="flex gap-1">
                          <input className={inputCls} placeholder="Price (AED)" value={ut.price} onChange={(e) => updateUnitType(ut.id, 'price', e.target.value)} />
                          <button type="button" onClick={() => removeUnitType(ut.id)} className="text-[#666] hover:text-red-400 transition-colors px-1"><Icon name="XMarkIcon" size={14} /></button>
                        </div>
                      </div>
                )}
                  </div>
                  <div>
                    <label className={labelCls}>Amenities</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {AMENITIES.map((amenity) =>
                  <button key={amenity} type="button" onClick={() => toggleTag(selectedAmenities, setSelectedAmenities, amenity)} className={`px-3 py-1.5 text-xs border transition-colors ${selectedAmenities.includes(amenity) ? 'bg-[#c9a84c]/20 border-[#c9a84c] text-[#c9a84c]' : 'bg-transparent border-[#333] text-[#aaa] hover:border-[#555]'}`}>{amenity}</button>
                  )}
                    </div>
                  </div>
                </div>
            }

              {/* LOCATION TAB */}
              {activeTab === 'location' &&
            <div className="space-y-4">
                  {basicForm.international ? (
                    /* International project — free-text location fields */
                    <>
                      <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 mb-2">
                        <span className="text-blue-400 text-sm">🌐</span>
                        <p className="text-xs text-blue-300">International project — enter the city and country below. This project will appear on the International page only.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Country *</label>
                          <input
                            className={inputCls}
                            placeholder="e.g., United Kingdom"
                            value={basicForm.country}
                            onChange={(e) => setBasicForm({ ...basicForm, country: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>City / Area *</label>
                          <input
                            className={inputCls}
                            placeholder="e.g., London, Mayfair"
                            value={locationArea}
                            onChange={(e) => setLocationArea(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Full Address</label>
                        <input className={inputCls} placeholder="e.g., 10 Downing Street, London SW1A 2AA" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Latitude</label>
                          <input className={inputCls} placeholder="e.g., 51.5074" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>Longitude</label>
                          <input className={inputCls} placeholder="e.g., -0.1278" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* UAE project — emirate/area/community dropdowns */
                    <>
                      {/* Emirate */}
                      <div>
                        <label className={labelCls}>Emirate *</label>
                        <select
                      className={inputCls}
                      value={emirate}
                      onChange={(e) => {
                        setEmirate(e.target.value);
                        const areas = getAreasForEmirate(e.target.value);
                        setAvailableAreas(areas);
                        setLocationArea('');
                        setCommunity('');
                        setAvailableCommunities([]);
                      }}>
                      
                          {UAE_EMIRATES.map((em) =>
                      <option key={em} value={em}>{em}</option>
                      )}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Area / District *</label>
                          <select
                        className={inputCls}
                        value={locationArea}
                        onChange={(e) => {
                          setLocationArea(e.target.value);
                          const comms = getCommunitiesForArea(e.target.value);
                          setAvailableCommunities(comms);
                          setCommunity('');
                        }}>
                        
                            <option value="">Select area...</option>
                            {availableAreas.map((area) =>
                        <option key={area} value={area}>{area}</option>
                        )}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Community *</label>
                          <select
                        className={inputCls}
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        disabled={availableCommunities.length === 0}>
                        
                            <option value="">Select community...</option>
                            {availableCommunities.map((c) =>
                        <option key={c} value={c}>{c}</option>
                        )}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Sub Community</label>
                          <input className={inputCls} value={subCommunity} onChange={(e) => setSubCommunity(e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>Full Address</label>
                          <input className={inputCls} value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
                        </div>
                      </div>
                      <PinLocationMap
                    value={{ lat: parseFloat(latitude) || 25.0657, lng: parseFloat(longitude) || 55.1713, address: fullAddress }}
                    onChange={(val) => {setLatitude(val.lat.toString());setLongitude(val.lng.toString());if (val.address) setFullAddress(val.address);}}
                    label="Pin Location on Map" />
                    </>
                  )}
                </div>
            }

              {/* PAYMENT TAB */}
              {activeTab === 'payment' &&
            <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Payment Plan Summary</label>
                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="e.g., 60/40 payment plan with 5 years post-handover" value={paymentPlanSummary} onChange={(e) => setPaymentPlanSummary(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Post-Handover Plan</label>
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="e.g., 40% over 5 years" value={postHandoverPlan} onChange={(e) => setPostHandoverPlan(e.target.value)} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + ' mb-0'}>Payment Milestones</label>
                      <button type="button" onClick={addMilestone} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:text-[#e0b85a] transition-colors"><Icon name="PlusIcon" size={12} />Add Milestone</button>
                    </div>
                    {milestones.length === 0 && <p className="text-xs text-[#555] italic">No milestones added yet.</p>}
                    {milestones.map((m) =>
                <div key={m.id} className="grid grid-cols-3 gap-2 mb-2 items-center">
                        <input className={inputCls} placeholder="Label (e.g., On Booking)" value={m.label} onChange={(e) => updateMilestone(m.id, 'label', e.target.value)} />
                        <input className={inputCls} placeholder="% (e.g., 10)" value={m.percentage} onChange={(e) => updateMilestone(m.id, 'percentage', e.target.value)} />
                        <div className="flex gap-1">
                          <input className={inputCls} placeholder="Due Date" value={m.dueDate} onChange={(e) => updateMilestone(m.id, 'dueDate', e.target.value)} />
                          <button type="button" onClick={() => removeMilestone(m.id)} className="text-[#666] hover:text-red-400 transition-colors px-1"><Icon name="XMarkIcon" size={14} /></button>
                        </div>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* MEDIA TAB */}
              {activeTab === 'media' &&
            <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + ' mb-0'}>Project Images</label>
                      <button type="button" onClick={addProjectImage} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:text-[#e0b85a] transition-colors"><Icon name="PlusIcon" size={12} />Add Image</button>
                    </div>
                    {projectImages.length === 0 && <p className="text-xs text-[#555] italic">No images added yet.</p>}
                    {projectImages.map((img) =>
                <div key={img.id} className="flex gap-2 mb-2 items-center">
                        <input className={`${inputCls} flex-1`} placeholder="Image URL (https://...)" value={img.url} onChange={(e) => updateProjectImage(img.id, 'url', e.target.value)} />
                        <input className={`${inputCls} w-36`} placeholder="Caption" value={img.caption} onChange={(e) => updateProjectImage(img.id, 'caption', e.target.value)} />
                        <button type="button" onClick={() => removeProjectImage(img.id)} className="text-[#666] hover:text-red-400 transition-colors px-1"><Icon name="XMarkIcon" size={14} /></button>
                      </div>
                )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + ' mb-0'}>Floor Plans</label>
                      <button type="button" onClick={addFloorPlan} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:text-[#e0b85a] transition-colors"><Icon name="PlusIcon" size={12} />Add Floor Plan</button>
                    </div>
                    {floorPlans.length === 0 && <p className="text-xs text-[#555] italic">No floor plans added yet.</p>}
                    {floorPlans.map((fp) =>
                <div key={fp.id} className="flex gap-2 mb-2 items-center">
                        <input className={`${inputCls} flex-1`} placeholder="Floor Plan URL (https://...)" value={fp.url} onChange={(e) => updateFloorPlan(fp.id, 'url', e.target.value)} />
                        <input className={`${inputCls} w-36`} placeholder="Label (e.g., 2BR)" value={fp.label} onChange={(e) => updateFloorPlan(fp.id, 'label', e.target.value)} />
                        <button type="button" onClick={() => removeFloorPlan(fp.id)} className="text-[#666] hover:text-red-400 transition-colors px-1"><Icon name="XMarkIcon" size={14} /></button>
                      </div>
                )}
                  </div>
                  <div>
                    <label className={labelCls}>Master Plan Image URL</label>
                    <input className={inputCls} placeholder="https://..." value={masterPlanUrl} onChange={(e) => setMasterPlanUrl(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Video URL</label>
                      <input className={inputCls} placeholder="YouTube/Vimeo URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Virtual Tour URL</label>
                      <input className={inputCls} placeholder="360° tour URL" value={virtualTourUrl} onChange={(e) => setVirtualTourUrl(e.target.value)} />
                    </div>
                  </div>
                </div>
            }

              {/* DOCS TAB */}
              {activeTab === 'docs' &&
            <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Brochure/Factsheet URL (PDF)</label>
                    <input className={inputCls} placeholder="https://...pdf" value={brochureUrl} onChange={(e) => setBrochureUrl(e.target.value)} />
                    <p className="text-xs text-[#555] mt-1">Downloadable brochure for visitors</p>
                  </div>
                  <div>
                    <label className={labelCls}>Factsheet URL</label>
                    <input className={inputCls} placeholder="https://...pdf" value={factsheetUrl} onChange={(e) => setFactsheetUrl(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Price List URL</label>
                    <input className={inputCls} placeholder="https://...pdf" value={priceListUrl} onChange={(e) => setPriceListUrl(e.target.value)} />
                  </div>
                </div>
            }
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a2a]">
              <button onClick={handleClose} className="px-5 py-2 text-sm text-[#aaa] hover:text-white border border-[#333] hover:border-[#555] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!basicForm.name} className="px-6 py-2 bg-[#c9a84c] text-black text-sm font-bold hover:bg-[#e0b85a] transition-colors disabled:opacity-50">
                {editProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}