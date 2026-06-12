'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

import { createClient } from '@/lib/supabase/client';
import PinLocationMap from '@/components/ui/PinLocationMap';
import { useRole } from '@/contexts/RoleContext';
import { usePropertyFields } from '@/hooks/usePropertyFields';
import { useCommunities } from '@/hooks/useCommunities';
import { useApprovalWorkflow } from '@/hooks/useApprovalWorkflow';

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
  unitNo: string;
  floor: string;
  ownerName: string;
  ownerEmail: string;
  ownerContact: string;
  custom_fields: Record<string, string>;
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
  unitNo: '',
  floor: '',
  ownerName: '',
  ownerEmail: '',
  ownerContact: '',
  custom_fields: {},
};

const statusColors: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-400/10',
  'Under Offer': 'text-yellow-400 bg-yellow-400/10',
  Sold: 'text-red-400 bg-red-400/10',
};

function generateRefNumber(listingType?: string) {
  const prefix = listingType === 'For Rent' ? 'CR-' : 'CS-';
  return prefix + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const FALLBACK_RESIDENTIAL_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'];
const FALLBACK_COMMERCIAL_TYPES = ['Office', 'Retail', 'Warehouse', 'Investment', 'Land'];

type PropertyTypeFilter = 'residential' | 'commercial' | 'all';

function resolvePropertyTypesForCategory(
  category: string,
  residentialTypes: string[],
  commercialTypes: string[],
  allTypes: string[],
): { filter: PropertyTypeFilter; types: string[]; residential: string[]; commercial: string[] } {
  const residential =
    residentialTypes.length > 0 ? residentialTypes : FALLBACK_RESIDENTIAL_TYPES;
  const commercial =
    commercialTypes.length > 0 ? commercialTypes : FALLBACK_COMMERCIAL_TYPES;

  if (category === 'Commercial') {
    return { filter: 'commercial', types: commercial, residential, commercial };
  }
  if (category === 'Residential') {
    return { filter: 'residential', types: residential, residential, commercial };
  }
  if (category === 'Investment') {
    const types =
      allTypes.length > 0
        ? allTypes
        : [...residential, ...commercial.filter((t) => !residential.includes(t))];
    return { filter: 'all', types, residential, commercial };
  }
  return { filter: 'residential', types: residential, residential, commercial };
}

function defaultPropertyTypeForCategory(
  category: string,
  residentialTypes: string[],
  commercialTypes: string[],
  allTypes: string[],
): string {
  return resolvePropertyTypesForCategory(category, residentialTypes, commercialTypes, allTypes).types[0] ?? 'Apartment';
}

// Approval status for a property
interface PropertyApprovalStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  comments?: string;
  requestId?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { isAgentScoped, isAssignedAgent, canViewAll, canEditProperty, currentUser, isRole } = useRole();
  const pf = usePropertyFields();
  const comm = useCommunities();
  const { submitForApproval, getApprovalStatus } = useApprovalWorkflow();

  const isCeo = isRole('super_admin');
  // Non-CEO roles must go through approval
  const requiresApproval = !isCeo;

  const [activeType, setActiveType] = useState<PropertyType>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('basic');
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);

  const propertyTypeOptions = useMemo(
    () =>
      resolvePropertyTypesForCategory(
        formData.propCategory,
        pf.residentialTypes,
        pf.commercialTypes,
        pf.types,
      ),
    [formData.propCategory, pf.residentialTypes, pf.commercialTypes, pf.types],
  );

  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);
  const [copied, setCopied] = useState(false);
  const [agentNames, setAgentNames] = useState<string[]>([]);

  const [availableAreas, setAvailableAreas] = useState<string[]>(comm.getAreasForEmirate('Dubai'));
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number; errors: string[] }>({ done: 0, total: 0, errors: [] });

  // Approval state
  const [approvalStatuses, setApprovalStatuses] = useState<Record<string, PropertyApprovalStatus>>({});
  const [editingApprovalStatus, setEditingApprovalStatus] = useState<PropertyApprovalStatus>({ status: 'none' });
  const [sendingApproval, setSendingApproval] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);

  const loadAgentNames = useCallback(async () => {
    const { data } = await supabase
      .from('agents')
      .select('name')
      .eq('agent_status', 'Active')
      .order('name', { ascending: true });
    const dbNames: string[] = data ? data.map((a: any) => a.name as string) : [];

    const { data: userData } = await supabase
      .from('user_profiles')
      .select('full_name, role, status')
      .in('role', ['super_admin', 'admin'])
      .eq('status', 'Active');
    const extraNames: string[] = userData ? userData.map((u: any) => u.full_name).filter(Boolean) : [];

    const merged = Array.from(new Set([...extraNames, ...dbNames])).sort((a, b) => a.localeCompare(b));
    setAgentNames(merged);
  }, [supabase]);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, reference_number, location_area, price_aed, prop_category, availability, bedrooms, bathrooms, area_sqft, image_urls, agent_name, agent_phone, agent_email, published, featured, created_at')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading properties:', error.message, error);
        setLoadError(error.message);
      } else if (data) {
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
      } else {
        setPropertyList([]);
      }
    } catch (err: any) {
      console.error('Unexpected error loading properties:', err);
      setLoadError(err?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load approval statuses for all properties
  const loadApprovalStatuses = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const { data } = await supabase
      .from('approval_requests')
      .select('item_id, status, comments, id')
      .eq('item_type', 'property')
      .in('item_id', ids)
      .order('created_at', { ascending: false });

    if (data) {
      const map: Record<string, PropertyApprovalStatus> = {};
      // Take the most recent request per item
      for (const row of data) {
        if (!map[row.item_id]) {
          map[row.item_id] = {
            status: row.status as any,
            comments: row.comments,
            requestId: row.id,
          };
        }
      }
      setApprovalStatuses(map);
    }
  }, [supabase]);

  useEffect(() => { loadProperties(); loadAgentNames(); }, [loadProperties, loadAgentNames]);

  useEffect(() => {
    if (propertyList.length > 0) {
      loadApprovalStatuses(propertyList.map(p => p.id));
    }
  }, [propertyList, loadApprovalStatuses]);

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
    if (requiresApproval && publish) {
      // Non-CEO cannot bulk publish directly — they must use Send for Approval
      return;
    }
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
    if (requiresApproval && !current) {
      // Non-CEO cannot publish directly
      return;
    }
    await supabase.from('properties').update({ published: !current }).eq('id', id);
    loadProperties();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData, referenceNumber: generateRefNumber(defaultFormData.listingType) });
    setEditingApprovalStatus({ status: 'none' });
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
        unitNo: data.unit_no || '',
        floor: data.floor || '',
        ownerName: data.owner_name || '',
        ownerEmail: data.owner_email || '',
        ownerContact: data.owner_contact || '',
        custom_fields: data.custom_fields || {},
      });
      setAvailableAreas(comm.getAreasForEmirate(data.emirate || 'Dubai'));
      if (data.location_area) setAvailableCommunities(comm.getCommunitiesForArea(data.location_area));
      setEditingId(id);
      setActiveTab('basic');
      // Load approval status for this property
      const approvalStatus = approvalStatuses[id] || { status: 'none' };
      setEditingApprovalStatus(approvalStatus);
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
      // Non-CEO cannot set published=true directly
      published: requiresApproval ? false : formData.published,
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
      unit_no: formData.unitNo,
      floor: formData.floor,
      owner_name: formData.ownerName,
      owner_email: formData.ownerEmail,
      owner_contact: formData.ownerContact,
      custom_fields: formData.custom_fields,
    };

    let error: any = null;
    let savedId = editingId;
    if (editingId) {
      const result = await supabase.from('properties').update(payload).eq('id', editingId);
      error = result.error;
    } else {
      const result = await supabase.from('properties').insert(payload).select('id').single();
      error = result.error;
      if (result.data) savedId = result.data.id;
    }

    if (!error && formData.ownerName) {
      try {
        const { data: existingContacts } = await supabase
          .from('contacts')
          .select('id')
          .eq('name', formData.ownerName)
          .or(`phone.eq.${formData.ownerContact || ''},email.eq.${formData.ownerEmail || ''}`)
          .limit(1);

        if (!existingContacts || existingContacts.length === 0) {
          await supabase.from('contacts').insert({
            name: formData.ownerName,
            email: formData.ownerEmail || '',
            phone: formData.ownerContact || '',
            type: 'Seller',
            status: 'Active',
            last_contact: 'Just now',
            nationality: '',
            assigned_agent: formData.agentName || '',
            source: 'Property Listing',
            notes: `Owner of property: ${formData.title}${formData.referenceNumber ? ` (${formData.referenceNumber})` : ''}`,
          });
        }
      } catch {
        // silently ignore contact save errors
      }
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
    return savedId;
  };

  const handleSendForApproval = async () => {
    if (!formData.title) {
      setSaveError('Please fill in the property title before submitting for approval.');
      return;
    }
    setSendingApproval(true);
    setSaveError(null);

    // Save first
    let savedId = await handleSave();
    if (!savedId) {
      setSendingApproval(false);
      return;
    }

    // Submit for approval
    const result = await submitForApproval({
      itemType: 'property',
      itemId: savedId,
      itemTitle: formData.title,
      itemRef: formData.referenceNumber,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      submittedByEmail: currentUser.email,
      submittedByRole: currentUser.role,
    });

    setSendingApproval(false);
    if (result.success) {
      setApprovalSuccess(`"${formData.title}" has been submitted for CEO approval. You will be notified once reviewed.`);
      setTimeout(() => setApprovalSuccess(null), 5000);
      loadProperties();
      loadApprovalStatuses([savedId]);
    } else {
      setSaveError(result.error || 'Failed to submit for approval');
    }
  };

  const handlePublishApproved = async (id: string, currentPublished: boolean) => {
    // CEO can publish directly; non-CEO can publish only if approved
    const approvalStatus = approvalStatuses[id];
    if (requiresApproval && !currentPublished && approvalStatus?.status !== 'approved') {
      return; // Should not happen — button is hidden
    }
    await supabase.from('properties').update({ published: !currentPublished }).eq('id', id);
    loadProperties();
  };

  const handleUploadToStorage = async () => {
    const urls = formData.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const externalUrls = urls.filter(u => !u.includes(supabaseHost));
    const alreadyUploaded = urls.filter(u => u.includes(supabaseHost));

    if (externalUrls.length === 0) return;

    setUploading(true);
    setUploadProgress({ done: 0, total: externalUrls.length, errors: [] });

    try {
      const res = await fetch('/api/admin/upload-property-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: externalUrls,
          propertyId: editingId || undefined,
          referenceNumber: formData.referenceNumber || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadProgress(prev => ({ ...prev, errors: [data.error || 'Upload failed'] }));
        setUploading(false);
        return;
      }

      const newUrls: string[] = [...alreadyUploaded];
      const errors: string[] = [];

      for (const result of data.results) {
        if ('uploaded' in result) {
          newUrls.push(result.uploaded);
        } else {
          errors.push(`${result.original.slice(0, 40)}... — ${result.error}`);
          newUrls.push(result.original);
        }
      }

      setFormData(prev => ({ ...prev, imageUrls: newUrls.join(', ') }));
      setUploadProgress({ done: externalUrls.length - errors.length, total: externalUrls.length, errors });
    } catch (err: any) {
      setUploadProgress(prev => ({ ...prev, errors: [err?.message || 'Network error'] }));
    } finally {
      setUploading(false);
    }
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60";
  const labelCls = "block text-xs text-[#aaa] mb-1";

  const firstImage = (urls: string) => {
    const list = urls.split(',').map(u => u.trim()).filter(Boolean);
    return list[0] || '';
  };

  const getApprovalBadge = (propertyId: string) => {
    const s = approvalStatuses[propertyId];
    if (!s || s.status === 'none') return null;
    if (s.status === 'pending') return { label: 'Pending Approval', cls: 'bg-amber-500/20 text-amber-400' };
    if (s.status === 'approved') return { label: 'Approved', cls: 'bg-emerald-500/20 text-emerald-400' };
    if (s.status === 'rejected') return { label: 'Changes Needed', cls: 'bg-orange-500/20 text-orange-400' };
    return null;
  };

  return (
    <div className="p-6">
      {/* Approval success toast */}
      {approvalSuccess && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30">
          <Icon name="CheckCircleIcon" size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">{approvalSuccess}</p>
        </div>
      )}

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

      {/* Approval workflow notice for non-CEO */}
      {requiresApproval && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
          <Icon name="ShieldCheckIcon" size={14} />
          <span>Properties require CEO approval before publishing. Use <strong>"Send for Approval"</strong> after saving.</span>
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
            {isCeo && (
              <>
                <button onClick={() => handleBulkPublish(true)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors">Publish</button>
                <button onClick={() => handleBulkPublish(false)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Unpublish</button>
              </>
            )}
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
      ) : loadError ? (
        <div className="text-center py-20 border border-red-500/20 bg-red-500/5">
          <Icon name="ExclamationTriangleIcon" size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-sm font-semibold mb-1">Failed to load properties</p>
          <p className="text-muted-foreground text-xs mb-4">{loadError}</p>
          <button onClick={loadProperties} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            Retry
          </button>
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
              const approvalBadge = getApprovalBadge(property.id);
              const approvalStatus = approvalStatuses[property.id];
              const canPublishNow = isCeo || (approvalStatus?.status === 'approved');
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
                    <div className="absolute top-3 left-3 flex gap-2 items-center flex-wrap">
                      <input type="checkbox" checked={selectedIds.has(property.id)} onChange={() => toggleSelect(property.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[property.availability] || 'text-gray-400 bg-gray-400/10'}`}>{property.availability}</span>
                      {property.featured && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-400">Featured</span>}
                      {!property.published && !approvalBadge && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-500/20 text-gray-400">Draft</span>}
                      {approvalBadge && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${approvalBadge.cls}`}>{approvalBadge.label}</span>
                      )}
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
                    {/* Listing agent info */}
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

                    {/* Rejection comments */}
                    {approvalStatus?.status === 'rejected' && approvalStatus.comments && (
                      <div className="mb-3 px-2.5 py-2 bg-orange-400/5 border border-orange-400/20">
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">CEO Comments</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{approvalStatus.comments}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {canEditProperty(property.agentName) && (
                        <button onClick={() => openEdit(property.id)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Edit</button>
                      )}
                      <button onClick={() => router.push(`/admin/properties/${property.id}`)} className="flex-1 py-2 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors">View</button>
                      <button
                        onClick={() => handleToggleFeatured(property.id, property.featured)}
                        title={property.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`px-3 py-2 border text-xs transition-colors ${property.featured ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-400/30'}`}>
                        <Icon name="StarIcon" size={13} />
                      </button>
                      {/* Publish button: CEO always, others only if approved */}
                      {canPublishNow && (
                        <button
                          onClick={() => handlePublishApproved(property.id, property.published)}
                          title={property.published ? 'Unpublish' : 'Publish'}
                          className={`px-3 py-2 border text-xs transition-colors ${property.published ? 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'border-border text-muted-foreground hover:text-emerald-400 hover:border-emerald-400/30'}`}>
                          <Icon name={property.published ? 'EyeIcon' : 'EyeSlashIcon'} size={13} />
                        </button>
                      )}
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
          <div className="relative w-full max-w-3xl bg-[#0f1117] border border-[#2a3040] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#2a3040]">
              <h2 className="text-base font-bold text-white">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 flex border-b border-[#2a3040] overflow-x-auto px-6 bg-[#0f1117]">
              {(['basic', 'dimensions', 'features', 'location', 'media'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-[#666] hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Property Info */}
                  <section>
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Property Information</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3">
                        <label className={labelCls}>Property Title *</label>
                        <input className={inputCls} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Luxury Penthouse in Downtown Dubai" />
                      </div>
                      <div>
                        <label className={labelCls}>Reference Number</label>
                        <input className={inputCls} value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <select
                          className={inputCls}
                          value={formData.propCategory}
                          onChange={(e) => {
                            const newCategory = e.target.value;
                            const { types } = resolvePropertyTypesForCategory(
                              newCategory,
                              pf.residentialTypes,
                              pf.commercialTypes,
                              pf.types,
                            );
                            const propertyType = types.includes(formData.propertyType)
                              ? formData.propertyType
                              : defaultPropertyTypeForCategory(
                                  newCategory,
                                  pf.residentialTypes,
                                  pf.commercialTypes,
                                  pf.types,
                                );
                            setFormData({ ...formData, propCategory: newCategory, propertyType });
                          }}>
                          {pf.categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Property Type</label>
                        <select className={inputCls} value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}>
                          {propertyTypeOptions.filter === 'all' ? (
                            <>
                              <optgroup label="Residential">
                                {propertyTypeOptions.residential.map(t => <option key={`r-${t}`}>{t}</option>)}
                              </optgroup>
                              <optgroup label="Commercial">
                                {propertyTypeOptions.commercial.map(t => <option key={`c-${t}`}>{t}</option>)}
                              </optgroup>
                            </>
                          ) : (
                            propertyTypeOptions.types.map(t => <option key={t}>{t}</option>)
                          )}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Listing Type</label>
                        <select className={inputCls} value={formData.listingType} onChange={(e) => {
                          const newListingType = e.target.value;
                          const newRef = !editingId ? generateRefNumber(newListingType) : formData.referenceNumber;
                          setFormData({ ...formData, listingType: newListingType, referenceNumber: newRef });
                        }}>
                          <option>For Sale</option><option>For Rent</option><option>Off-Plan</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Availability</label>
                        <select className={inputCls} value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })}>
                          {pf.statuses.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Completion</label>
                        <select className={inputCls} value={formData.completion} onChange={(e) => setFormData({ ...formData, completion: e.target.value })}>
                          {pf.completion.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Pricing */}
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Pricing</p>
                    <div className="grid grid-cols-3 gap-4">
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
                    </div>
                  </section>

                  {/* Agent Info */}
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Agent Information</p>
                    <div className="grid grid-cols-3 gap-4">
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
                          <span>Contact details are only visible to the listing agent.</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Owner Details */}
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Owner Details</p>
                    {(!isAgentScoped || isAssignedAgent(formData.agentName)) ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>Unit No</label>
                          <input className={inputCls} value={formData.unitNo} onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })} placeholder="e.g. 2401" />
                        </div>
                        <div>
                          <label className={labelCls}>Floor</label>
                          <input className={inputCls} value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} placeholder="e.g. 24" />
                        </div>
                        <div>
                          <label className={labelCls}>Owner Name</label>
                          <input className={inputCls} value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} placeholder="e.g. Mohammed Al Rashid" />
                        </div>
                        <div>
                          <label className={labelCls}>Owner Contact</label>
                          <input className={inputCls} value={formData.ownerContact} onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })} placeholder="e.g. +971 50 123 4567" />
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Owner Email</label>
                          <input className={inputCls} value={formData.ownerEmail} onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })} placeholder="e.g. owner@email.com" />
                        </div>
                        <div className="col-span-3">
                          <p className="text-[10px] text-[#555] flex items-center gap-1.5">
                            <Icon name="InformationCircleIcon" size={11} />
                            Owner details are automatically saved to Contacts when the property is saved.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/20 border border-border text-xs text-muted-foreground">
                        <Icon name="LockClosedIcon" size={13} />
                        <span>Unit No, Floor, and Owner details are restricted to the listing agent and admins only.</span>
                      </div>
                    )}
                  </section>

                  {/* Description */}
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Description</p>
                    <textarea className={inputCls} rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Property description..." />
                  </section>

                  {/* Toggles / Approval Status */}
                  <section className="pt-5 border-t border-[#2a3040]">
                    <div className="flex items-center gap-6 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-[#c9a84c]" />
                        <span className="text-xs text-[#aaa]">Featured</span>
                      </label>
                      {isCeo ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-4 h-4 accent-[#c9a84c]" />
                          <span className="text-xs text-[#aaa]">Published</span>
                        </label>
                      ) : (
                        <div className="flex items-center gap-2">
                          {editingApprovalStatus.status === 'pending' && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-400 px-2.5 py-1 bg-amber-400/10 border border-amber-400/30">
                              <Icon name="ClockIcon" size={12} />Pending CEO Approval
                            </span>
                          )}
                          {editingApprovalStatus.status === 'approved' && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 px-2.5 py-1 bg-emerald-400/10 border border-emerald-400/30">
                              <Icon name="CheckCircleIcon" size={12} />Approved — Ready to Publish
                            </span>
                          )}
                          {editingApprovalStatus.status === 'rejected' && (
                            <div>
                              <span className="flex items-center gap-1.5 text-xs text-orange-400 px-2.5 py-1 bg-orange-400/10 border border-orange-400/30 mb-1">
                                <Icon name="ExclamationCircleIcon" size={12} />Changes Requested
                              </span>
                              {editingApprovalStatus.comments && (
                                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">{editingApprovalStatus.comments}</p>
                              )}
                            </div>
                          )}
                          {editingApprovalStatus.status === 'none' && (
                            <span className="text-xs text-muted-foreground">Not yet submitted for approval</span>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'dimensions' && (
                <div className="space-y-6">
                  <section>
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Room Configuration</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Bedrooms</label>
                        <input className={inputCls} value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} placeholder="e.g. 3" />
                      </div>
                      <div>
                        <label className={labelCls}>Bathrooms</label>
                        <input className={inputCls} value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} placeholder="e.g. 4" />
                      </div>
                    </div>
                  </section>
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Area Measurements</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Area (Sq Ft)</label>
                        <input className={inputCls} value={formData.areaSqft} onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })} placeholder="e.g. 2,500" />
                      </div>
                      <div>
                        <label className={labelCls}>Built-up Area (Sq Ft)</label>
                        <input className={inputCls} value={formData.builtUpArea} onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Plot Area (Sq Ft)</label>
                        <input className={inputCls} value={formData.plotArea} onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })} />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-6">
                  <section>
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Property Details</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Furnishing</label>
                        <select className={inputCls} value={formData.furnishing} onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}>
                          <option value="">Select...</option>
                          {pf.furnishing.map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>View</label>
                        <select className={inputCls} value={formData.viewType} onChange={(e) => setFormData({ ...formData, viewType: e.target.value })}>
                          <option value="">Select...</option>
                          {pf.views.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </section>
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Amenities</p>
                    <textarea className={inputCls} rows={3} value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="Swimming Pool, Gym, Concierge, Parking..." />
                  </section>
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Additional Features</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-3">
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
                  </section>
                  {pf.customGroups.length > 0 && (
                    <section className="pt-5 border-t border-[#2a3040]">
                      <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Custom Fields</p>
                      <div className="grid grid-cols-3 gap-4">
                        {pf.customGroups.map((cg) => (
                          <div key={cg.key}>
                            <label className={labelCls}>{cg.label}</label>
                            <select className={inputCls} value={formData.custom_fields?.[cg.key] ?? ''} onChange={(e) => setFormData({ ...formData, custom_fields: { ...formData.custom_fields, [cg.key]: e.target.value } })}>
                              <option value="">Select...</option>
                              {cg.options.map((o) => <option key={o.id} value={o.value}>{o.value}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-6">
                  <section>
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Location</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Emirate</label>
                        <select className={inputCls} value={formData.emirate} onChange={(e) => {
                          const em = e.target.value;
                          setFormData({ ...formData, emirate: em, locationArea: '', community: '' });
                          setAvailableAreas(comm.getAreasForEmirate(em));
                          setAvailableCommunities([]);
                        }}>
                          {comm.emirates.map(em => <option key={em}>{em}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Area</label>
                        <select className={inputCls} value={formData.locationArea} onChange={(e) => {
                          const area = e.target.value;
                          setFormData({ ...formData, locationArea: area, community: '' });
                          setAvailableCommunities(comm.getCommunitiesForArea(area));
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
                      <div className="col-span-3">
                        <label className={labelCls}>Full Address</label>
                        <input className={inputCls} value={formData.fullAddress} onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })} placeholder="Full property address" />
                      </div>
                    </div>
                  </section>
                  <section className="pt-5 border-t border-[#2a3040]">
                    <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Map Pin</p>
                    <PinLocationMap
                      label="Pin Location on Map"
                      value={{
                        lat: parseFloat(formData.latitude) || 25.2048,
                        lng: parseFloat(formData.longitude) || 55.2708,
                        address: formData.fullAddress,
                      }}
                      onChange={(val) => setFormData({ ...formData, latitude: String(val.lat), longitude: String(val.lng), fullAddress: val.address || formData.fullAddress })}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className={labelCls}>Latitude</label>
                        <input className={inputCls} value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="e.g. 25.2048" />
                      </div>
                      <div>
                        <label className={labelCls}>Longitude</label>
                        <input className={inputCls} value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="e.g. 55.2708" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'media' && (() => {
                const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const imageList = formData.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
                const externalCount = imageList.filter(u => !u.includes(supabaseHost)).length;

                return (
                  <div className="space-y-6">
                    <section>
                      <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Images</p>
                      <textarea
                        className={inputCls}
                        rows={4}
                        value={formData.imageUrls}
                        onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, ..." />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-[#555]">Paste image URLs separated by commas</p>
                        {imageList.length > 0 && externalCount > 0 && (
                          <button
                            type="button"
                            onClick={handleUploadToStorage}
                            disabled={uploading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a84c] text-black text-[11px] font-bold uppercase tracking-wider hover:bg-[#d4b86a] transition-colors disabled:opacity-50">
                            {uploading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Uploading {uploadProgress.done}/{uploadProgress.total}...
                              </>
                            ) : (
                              <>
                                <Icon name="CloudArrowUpIcon" size={13} />
                                Upload {externalCount} to Storage
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {uploadProgress.done > 0 && !uploading && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                          <Icon name="CheckCircleIcon" size={13} />
                          {uploadProgress.done} image{uploadProgress.done > 1 ? 's' : ''} uploaded to Supabase Storage
                        </div>
                      )}

                      {uploadProgress.errors.length > 0 && !uploading && (
                        <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-1">
                          <p className="font-semibold flex items-center gap-1.5"><Icon name="ExclamationTriangleIcon" size={13} />Some uploads failed:</p>
                          {uploadProgress.errors.map((err, i) => <p key={i} className="text-[11px] pl-5">{err}</p>)}
                        </div>
                      )}

                      {imageList.length > 0 && (
                        <div className="mt-3">
                          <div className="flex gap-2 flex-wrap">
                            {imageList.slice(0, 12).map((url, i) => {
                              const isStored = url.includes(supabaseHost);
                              return (
                                <div key={i} className="relative group">
                                  <div className={`relative w-20 h-14 border overflow-hidden ${isStored ? 'border-emerald-500/40' : 'border-[#333]'}`}>
                                    <AppImage src={url} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="80px" />
                                  </div>
                                  <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold ${isStored ? 'bg-emerald-500 text-white' : 'bg-[#333] text-[#888]'}`}>
                                    {isStored ? <Icon name="CheckIcon" size={9} /> : i + 1}
                                  </span>
                                </div>
                              );
                            })}
                            {imageList.length > 12 && (
                              <div className="w-20 h-14 border border-[#333] flex items-center justify-center text-xs text-[#666]">
                                +{imageList.length - 12}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </section>
                    <section className="pt-5 border-t border-[#2a3040]">
                      <p className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider mb-3">Video & Virtual Tour</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Video URL</label>
                          <input className={inputCls} value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="YouTube or Vimeo URL" />
                        </div>
                        <div>
                          <label className={labelCls}>Virtual Tour URL</label>
                          <input className={inputCls} value={formData.virtualTourUrl} onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })} placeholder="Matterport or 360 tour URL" />
                        </div>
                      </div>
                    </section>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a3040] flex-wrap gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors">Cancel</button>
              <div className="flex items-center gap-3 flex-wrap">
                {saveError && <p className="text-xs text-red-400 max-w-xs text-right">{saveError}</p>}
                {/* CEO: normal Save + Published toggle */}
                {isCeo ? (
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.title}
                    className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : editingId ? 'Update Property' : 'Save Property'}
                  </button>
                ) : (
                  <>
                    {/* Save as Draft */}
                    <button
                      onClick={handleSave}
                      disabled={saving || sendingApproval || !formData.title}
                      className="px-4 py-2 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    {/* Send for Approval */}
                    {(editingApprovalStatus.status === 'none' || editingApprovalStatus.status === 'rejected') && (
                      <button
                        onClick={handleSendForApproval}
                        disabled={saving || sendingApproval || !formData.title}
                        className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors disabled:opacity-50">
                        {sendingApproval ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Icon name="PaperAirplaneIcon" size={13} />
                            Send for Approval
                          </>
                        )}
                      </button>
                    )}
                    {/* Publish (only if approved) */}
                    {editingApprovalStatus.status === 'approved' && !formData.published && (
                      <button
                        onClick={async () => {
                          if (editingId) {
                            await supabase.from('properties').update({ published: true }).eq('id', editingId);
                            setFormData(prev => ({ ...prev, published: true }));
                            loadProperties();
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors">
                        <Icon name="GlobeAltIcon" size={13} />
                        Publish
                      </button>
                    )}
                    {editingApprovalStatus.status === 'pending' && (
                      <span className="flex items-center gap-1.5 text-xs text-amber-400 px-3 py-2 bg-amber-400/10 border border-amber-400/30">
                        <Icon name="ClockIcon" size={12} />Awaiting CEO Review
                      </span>
                    )}
                  </>
                )}
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
              <input type="text" readOnly value={`https://coveestate.com/properties/${shareProperty.id}`} className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(`https://coveestate.com/properties/${shareProperty.id}`);
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