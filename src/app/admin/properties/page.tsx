'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

import { UAE_EMIRATES, getAreasForEmirate, getCommunitiesForArea } from '@/lib/uaeLocations';
import { createClient } from '@/lib/supabase/client';
import PinLocationMap from '@/components/ui/PinLocationMap';
import { useRole } from '@/contexts/RoleContext';

type PropertyType = 'All' | 'Residential' | 'Commercial';
type ModalTab = 'basic' | 'dimensions' | 'features' | 'location' | 'media';

interface Property {
  id: string;
  title: string;
  referenceNumber: string;
  locationArea: string;
  priceAed: string;
  propCategory: string;
  availability: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  imageUrls: string;
  agentName: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

interface PropertyFormData {
  title: string;
  referenceNumber: string;
  availability: string;
  completion: string;
  description: string;
  propertyType: string;
  listingType: string;
  priceAed: string;
  pricePerSqft: string;
  serviceCharge: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  builtUpArea: string;
  plotArea: string;
  furnishing: string;
  viewType: string;
  balcony: boolean;
  maidRoom: boolean;
  studyRoom: boolean;
  privatePool: boolean;
  privateGarden: boolean;
  amenities: string;
  featured: boolean;
  published: boolean;
  emirate: string;
  locationArea: string;
  community: string;
  fullAddress: string;
  latitude: string;
  longitude: string;
  imageUrls: string;
  videoUrl: string;
  virtualTourUrl: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  propCategory: string;
}

const defaultFormData: PropertyFormData = {
  title: '',
  referenceNumber: '',
  availability: 'Available',
  completion: 'Ready',
  description: '',
  propertyType: 'Apartment',
  listingType: 'For Sale',
  priceAed: '',
  pricePerSqft: '',
  serviceCharge: '',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  builtUpArea: '',
  plotArea: '',
  furnishing: '',
  viewType: '',
  balcony: false,
  maidRoom: false,
  studyRoom: false,
  privatePool: false,
  privateGarden: false,
  amenities: '',
  featured: false,
  published: false,
  emirate: 'Dubai',
  locationArea: '',
  community: '',
  fullAddress: '',
  latitude: '',
  longitude: '',
  imageUrls: '',
  videoUrl: '',
  virtualTourUrl: '',
  agentName: '',
  agentPhone: '',
  agentEmail: '',
  propCategory: 'Residential',
};

const statusColors: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-400/10',
  'Under Offer': 'text-yellow-400 bg-yellow-400/10',
  Sold: 'text-red-400 bg-red-400/10',
};

function generateRefNumber() {
  return 'LUX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PropertiesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { isAgentScoped, isAssignedAgent, canViewAll } = useRole();

  const [activeType, setActiveType] = useState<PropertyType>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('basic');
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);
  const [copied, setCopied] = useState(false);
  const [agentNames, setAgentNames] = useState<string[]>([]);

  const [availableAreas, setAvailableAreas] = useState<string[]>(getAreasForEmirate('Dubai'));
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);

  const loadAgentNames = useCallback(async () => {
    const { data } = await supabase
      .from('agents')
      .select('name')
      .eq('agent_status', 'Active')
      .order('name', { ascending: true });
    if (data) setAgentNames(data.map((a: any) => a.name as string));
  }, [supabase]);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, reference_number, location_area, price_aed, prop_category, availability, bedrooms, bathrooms, area_sqft, image_urls, agent_name, agent_phone, agent_email, published, featured, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading properties:', error.message);
    }
    if (!error && data) {
      setPropertyList(data.map((p: any) => ({
        id: p.id,
        title: p.title,
        referenceNumber: p.reference_number || '',
        locationArea: p.location_area || '',
        priceAed: p.price_aed || '',
        propCategory: p.prop_category || 'Residential',
        availability: p.availability || 'Available',
        bedrooms: p.bedrooms || '',
        bathrooms: p.bathrooms || '',
        areaSqft: p.area_sqft || '',
        imageUrls: p.image_urls || '',
        agentName: p.agent_name || '',
        published: p.published ?? false,
        featured: p.featured ?? false,
        createdAt: p.created_at || '',
      })));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadProperties(); loadAgentNames(); }, [loadProperties, loadAgentNames]);

  const filtered = propertyList.filter((p) => {
    const matchType = activeType === 'All' || p.propCategory === activeType;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.locationArea.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await supabase.from('properties').delete().in('id', ids);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    loadProperties();
  };

  const handleBulkPublish = async (publish: boolean) => {
    const ids = Array.from(selectedIds);
    await supabase.from('properties').update({ published: publish }).in('id', ids);
    setSelectedIds(new Set());
    loadProperties();
  };

  const handleBulkFeatured = async (featured: boolean) => {
    const ids = Array.from(selectedIds);
    await supabase.from('properties').update({ featured }).in('id', ids);
    setSelectedIds(new Set());
    loadProperties();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('properties').update({ featured: !current }).eq('id', id);
    loadProperties();
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    await supabase.from('properties').update({ published: !current }).eq('id', id);
    loadProperties();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData, referenceNumber: generateRefNumber() });
    setActiveTab('basic');
    loadAgentNames();
    setShowModal(true);
  };

  const openEdit = async (id: string) => {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        title: data.title || '',
        referenceNumber: data.reference_number || '',
        availability: data.availability || 'Available',
        completion: data.completion || 'Ready',
        description: data.description || '',
        propertyType: data.property_type || 'Apartment',
        listingType: data.listing_type || 'For Sale',
        priceAed: data.price_aed || '',
        pricePerSqft: data.price_per_sqft || '',
        serviceCharge: data.service_charge || '',
        bedrooms: data.bedrooms || '',
        bathrooms: data.bathrooms || '',
        areaSqft: data.area_sqft || '',
        builtUpArea: data.built_up_area || '',
        plotArea: data.plot_area || '',
        furnishing: data.furnishing || '',
        viewType: data.view_type || '',
        balcony: data.balcony ?? false,
        maidRoom: data.maid_room ?? false,
        studyRoom: data.study_room ?? false,
        privatePool: data.private_pool ?? false,
        privateGarden: data.private_garden ?? false,
        amenities: data.amenities || '',
        featured: data.featured ?? false,
        published: data.published ?? false,
        emirate: data.emirate || 'Dubai',
        locationArea: data.location_area || '',
        community: data.community || '',
        fullAddress: data.full_address || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        imageUrls: data.image_urls || '',
        videoUrl: data.video_url || '',
        virtualTourUrl: data.virtual_tour_url || '',
        agentName: data.agent_name || '',
        agentPhone: data.agent_phone || '',
        agentEmail: data.agent_email || '',
        propCategory: data.prop_category || 'Residential',
      });
      setAvailableAreas(getAreasForEmirate(data.emirate || 'Dubai'));
      if (data.location_area) setAvailableCommunities(getCommunitiesForArea(data.location_area));
      setEditingId(id);
      setActiveTab('basic');
      loadAgentNames();
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await supabase.from('properties').delete().eq('id', id);
    loadProperties();
  };

  const handleSave = async () => {
    if (!formData.title) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      title: formData.title,
      reference_number: formData.referenceNumber,
      availability: formData.availability,
      completion: formData.completion,
      description: formData.description,
      property_type: formData.propertyType,
      listing_type: formData.listingType,
      price_aed: formData.priceAed,
      price_per_sqft: formData.pricePerSqft,
      service_charge: formData.serviceCharge,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      area_sqft: formData.areaSqft,
      built_up_area: formData.builtUpArea,
      plot_area: formData.plotArea,
      furnishing: formData.furnishing,
      view_type: formData.viewType,
      balcony: formData.balcony,
      maid_room: formData.maidRoom,
      study_room: formData.studyRoom,
      private_pool: formData.privatePool,
      private_garden: formData.privateGarden,
      amenities: formData.amenities,
      featured: formData.featured,
      published: formData.published,
      emirate: formData.emirate,
      location_area: formData.locationArea,
      community: formData.community,
      full_address: formData.fullAddress,
      latitude: formData.latitude,
      longitude: formData.longitude,
      image_urls: formData.imageUrls,
      video_url: formData.videoUrl,
      virtual_tour_url: formData.virtualTourUrl,
      agent_name: formData.agentName,
      agent_phone: formData.agentPhone,
      agent_email: formData.agentEmail,
      prop_category: formData.propCategory,
    };

    let error: any = null;
    if (editingId) {
      const result = await supabase.from('properties').update(payload).eq('id', editingId);
      error = result.error;
    } else {
      const result = await supabase.from('properties').insert(payload);
      error = result.error;
    }

    setSaving(false);
    if (error) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save property. Please try again.');
      return;
    }
    setShowModal(false);
    setSaveError(null);
    loadProperties();
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60";
  const labelCls = "block text-xs text-[#aaa] mb-1";

  const firstImage = (urls: string) => {
    const list = urls.split(',').map(u => u.trim()).filter(Boolean);
    return list[0] || '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage property listings</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name="PlusIcon" size={14} />
          Add Property
        </button>
      </div>

      {/* Agent scope notice */}
      {isAgentScoped && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/20 text-xs text-primary">
          <Icon name="InformationCircleIcon" size={14} />
          <span>All properties are visible. Owner and contact details are restricted to the listing agent only.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative max-w-sm flex-1">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1">
          {(['All', 'Residential', 'Commercial'] as PropertyType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeType === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setViewMode('grid')} className={`p-2 border ${viewMode === 'grid' ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
            <Icon name="Squares2X2Icon" size={14} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 border ${viewMode === 'list' ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
            <Icon name="ListBulletIcon" size={14} />
          </button>
        </div>
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
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="HomeIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No properties found.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            Add First Property
          </button>
        </div>
      ) : (
        <>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
              <span className="text-xs text-muted-foreground">Select all {filtered.length} properties</span>
            </div>
          )}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map((property) => {
              const img = firstImage(property.imageUrls);
              const isListing = isAssignedAgent(property.agentName);
              return (
                <div key={property.id} className={`bg-card border overflow-hidden hover:border-primary/30 transition-colors ${selectedIds.has(property.id) ? 'border-primary/40' : 'border-border'}`}>
                  <div className="relative h-44 overflow-hidden">
                    {img ? (
                      <AppImage src={img} alt={property.title} fill className="object-cover" sizes="400px" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Icon name="HomeIcon" size={32} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2 items-center">
                      <input type="checkbox" checked={selectedIds.has(property.id)} onChange={() => toggleSelect(property.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[property.availability] || 'text-gray-400 bg-gray-400/10'}`}>{property.availability}</span>
                      {property.featured && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-400">Featured</span>}
                      {!property.published && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-500/20 text-gray-400">Draft</span>}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-base font-bold text-white truncate">{property.title}</h3>
                      <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                        <Icon name="MapPinIcon" size={10} />
                        {property.locationArea || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-semibold text-primary mt-0.5 truncate">{property.priceAed ? `AED ${property.priceAed}` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Beds</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{property.bedrooms || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Area</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{property.areaSqft ? `${property.areaSqft} sqft` : '—'}</p>
                      </div>
                    </div>
                    {/* Listing agent info — restricted to assigned agent or admins */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground">Listing Agent</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{property.agentName || '—'}</p>
                      {isListing ? (
                        <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Icon name="CheckCircleIcon" size={10} />Your listing
                        </p>
                      ) : isAgentScoped ? (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                          <Icon name="LockClosedIcon" size={10} />Owner details restricted
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(property.id)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Edit</button>
                      <button onClick={() => router.push(`/admin/properties/${property.id}`)} className="flex-1 py-2 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">View</button>
                      <button
                        onClick={() => handleToggleFeatured(property.id, property.featured)}
                        title={property.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`px-3 py-2 border text-xs transition-colors ${property.featured ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-400/30'}`}>
                        <Icon name="StarIcon" size={13} />
                      </button>
                      <button onClick={() => handleDelete(property.id)} className="px-3 py-2 border border-red-400/20 text-xs text-red-400 hover:bg-red-400/5 transition-colors">
                        <Icon name="TrashIcon" size={13} />
                      </button>
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
              <h2 className="text-base font-bold text-white">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2a3040] overflow-x-auto">
              {(['basic', 'dimensions', 'features', 'location', 'media'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-[#666] hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Property Title *</label>
                      <input className={inputCls} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Luxury Penthouse in Downtown Dubai" />
                    </div>
                    <div>
                      <label className={labelCls}>Reference Number</label>
                      <input className={inputCls} value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={formData.propCategory} onChange={(e) => setFormData({ ...formData, propCategory: e.target.value })}>
                        <option>Residential</option><option>Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Property Type</label>
                      <select className={inputCls} value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}>
                        {['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex', 'Office', 'Retail', 'Warehouse', 'Land'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Listing Type</label>
                      <select className={inputCls} value={formData.listingType} onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}>
                        <option>For Sale</option><option>For Rent</option><option>Off-Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Availability</label>
                      <select className={inputCls} value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })}>
                        <option>Available</option><option>Under Offer</option><option>Sold</option><option>Rented</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Completion</label>
                      <select className={inputCls} value={formData.completion} onChange={(e) => setFormData({ ...formData, completion: e.target.value })}>
                        <option>Ready</option><option>Off-Plan</option><option>Under Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Price (AED)</label>
                      <input className={inputCls} value={formData.priceAed} onChange={(e) => setFormData({ ...formData, priceAed: e.target.value })} placeholder="e.g. 2,500,000" />
                    </div>
                    <div>
                      <label className={labelCls}>Price per Sq Ft (AED)</label>
                      <input className={inputCls} value={formData.pricePerSqft} onChange={(e) => setFormData({ ...formData, pricePerSqft: e.target.value })} placeholder="e.g. 1,200" />
                    </div>
                    <div>
                      <label className={labelCls}>Service Charge</label>
                      <input className={inputCls} value={formData.serviceCharge} onChange={(e) => setFormData({ ...formData, serviceCharge: e.target.value })} placeholder="e.g. AED 15,000/year" />
                    </div>
                    <div>
                      <label className={labelCls}>Agent Name</label>
                      {agentNames.length > 0 ? (
                        <select className={inputCls} value={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}>
                          <option value="">— Select Agent —</option>
                          {agentNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                      ) : (
                        <input className={inputCls} value={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })} />
                      )}
                    </div>
                    {/* Owner/agent contact info — only visible to listing agent or admins */}
                    {(!isAgentScoped || isAssignedAgent(formData.agentName)) ? (
                      <>
                        <div>
                          <label className={labelCls}>Agent Phone</label>
                          <input className={inputCls} value={formData.agentPhone} onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelCls}>Agent Email</label>
                          <input className={inputCls} value={formData.agentEmail} onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })} />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center gap-2 px-3 py-2.5 bg-muted/20 border border-border text-xs text-muted-foreground">
                        <Icon name="LockClosedIcon" size={13} />
                        <span>Owner contact details are only visible to the listing agent.</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea className={inputCls} rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Property description..." />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-[#c9a84c]" />
                        <span className="text-xs text-[#aaa]">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-4 h-4 accent-[#c9a84c]" />
                        <span className="text-xs text-[#aaa]">Published</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'dimensions' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Bedrooms</label><input className={inputCls} value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} placeholder="e.g. 3" /></div>
                  <div><label className={labelCls}>Bathrooms</label><input className={inputCls} value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} placeholder="e.g. 4" /></div>
                  <div><label className={labelCls}>Area (Sq Ft)</label><input className={inputCls} value={formData.areaSqft} onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })} placeholder="e.g. 2,500" /></div>
                  <div><label className={labelCls}>Built-up Area (Sq Ft)</label><input className={inputCls} value={formData.builtUpArea} onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })} /></div>
                  <div><label className={labelCls}>Plot Area (Sq Ft)</label><input className={inputCls} value={formData.plotArea} onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })} /></div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Furnishing</label>
                      <select className={inputCls} value={formData.furnishing} onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}>
                        <option value="">Select...</option><option>Furnished</option><option>Semi-Furnished</option><option>Unfurnished</option>
                      </select>
                    </div>
                    <div><label className={labelCls}>View</label><input className={inputCls} value={formData.viewType} onChange={(e) => setFormData({ ...formData, viewType: e.target.value })} placeholder="e.g. Sea View, Burj View" /></div>
                  </div>
                  <div>
                    <label className={labelCls}>Amenities (comma-separated)</label>
                    <textarea className={inputCls} rows={3} value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="Swimming Pool, Gym, Concierge, Parking..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'balcony', label: 'Balcony' },
                      { key: 'maidRoom', label: 'Maid Room' },
                      { key: 'studyRoom', label: 'Study Room' },
                      { key: 'privatePool', label: 'Private Pool' },
                      { key: 'privateGarden', label: 'Private Garden' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(formData as any)[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} className="w-4 h-4 accent-[#c9a84c]" />
                        <span className="text-xs text-[#aaa]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Emirate</label>
                    <select className={inputCls} value={formData.emirate} onChange={(e) => {
                      const em = e.target.value;
                      setFormData({ ...formData, emirate: em, locationArea: '', community: '' });
                      setAvailableAreas(getAreasForEmirate(em));
                      setAvailableCommunities([]);
                    }}>
                      {UAE_EMIRATES.map(em => <option key={em}>{em}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Area</label>
                    <select className={inputCls} value={formData.locationArea} onChange={(e) => {
                      const area = e.target.value;
                      setFormData({ ...formData, locationArea: area, community: '' });
                      setAvailableCommunities(getCommunitiesForArea(area));
                    }}>
                      <option value="">Select area...</option>
                      {availableAreas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Community</label>
                    <select className={inputCls} value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })}>
                      <option value="">Select community...</option>
                      {availableCommunities.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Full Address</label>
                    <input className={inputCls} value={formData.fullAddress} onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })} placeholder="Full property address" />
                  </div>
                  <div className="col-span-2">
                    <PinLocationMap
                      label="Pin Location on Map"
                      value={{
                        lat: parseFloat(formData.latitude) || 25.2048,
                        lng: parseFloat(formData.longitude) || 55.2708,
                        address: formData.fullAddress,
                      }}
                      onChange={(val) => setFormData({ ...formData, latitude: String(val.lat), longitude: String(val.lng), fullAddress: val.address || formData.fullAddress })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Latitude</label>
                    <input className={inputCls} value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="e.g. 25.2048" />
                  </div>
                  <div>
                    <label className={labelCls}>Longitude</label>
                    <input className={inputCls} value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="e.g. 55.2708" />
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Image URLs (comma-separated)</label>
                    <textarea
                      className={inputCls}
                      rows={5}
                      value={formData.imageUrls}
                      onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, ..." />
                    <p className="text-xs text-[#555] mt-1">Paste multiple image URLs separated by commas</p>
                  </div>
                  <div>
                    <label className={labelCls}>Video URL</label>
                    <input className={inputCls} value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="YouTube or Vimeo URL" />
                  </div>
                  <div>
                    <label className={labelCls}>Virtual Tour URL</label>
                    <input className={inputCls} value={formData.virtualTourUrl} onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })} placeholder="Matterport or 360 tour URL" />
                  </div>
                  {formData.imageUrls && (
                    <div>
                      <p className="text-xs text-[#aaa] mb-2">Preview</p>
                      <div className="flex gap-2 flex-wrap">
                        {formData.imageUrls.split(',').map(u => u.trim()).filter(Boolean).slice(0, 6).map((url, i) => (
                          <div key={i} className="relative w-20 h-14 border border-[#333] overflow-hidden">
                            <AppImage src={url} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="80px" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a3040]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors">Cancel</button>
              <div className="flex items-center gap-3">
                {saveError && <p className="text-xs text-red-400 max-w-xs text-right">{saveError}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.title}
                  className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Property' : 'Save Property'}
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
            <h3 className="text-base font-bold text-foreground mb-2">Delete {selectedIds.size} Properties?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShareProperty(null)} />
          <div className="relative w-full max-w-md bg-[#12151f] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Share Property</h3>
              <button onClick={() => setShareProperty(null)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <input type="text" readOnly value={`https://luxestate6357.builtwithrocket.new/properties/${shareProperty.id}`} className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(`https://luxestate6357.builtwithrocket.new/properties/${shareProperty.id}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}