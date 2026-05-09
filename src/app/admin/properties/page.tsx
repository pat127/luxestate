'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import PinLocationMap from '@/components/ui/PinLocationMap';
import { UAE_EMIRATES, getAreasForEmirate, getCommunitiesForArea } from '@/lib/uaeLocations';

type PropertyType = 'All' | 'Residential' | 'Commercial';
type ModalTab = 'basic' | 'dimensions' | 'features' | 'location' | 'media';

interface Property {
  id: number;
  name: string;
  location: string;
  price: string;
  type: 'Residential' | 'Commercial';
  status: string;
  beds?: number;
  baths?: number;
  sqft: string;
  image: string;
  alt: string;
  agent: string;
  published?: boolean;
  featured?: boolean;
}

interface PropertyFormData {
  // Basic Info
  title: string;
  referenceNumber: string;
  availability: string;
  completion: string;
  description: string;
  propertyType: string;
  listingType: string;
  priceAED: string;
  pricePerSqFt: string;
  serviceCharge: string;
  // Dimensions
  bedrooms: string;
  bathrooms: string;
  areaSqFt: string;
  builtUpArea: string;
  plotArea: string;
  // Villa-specific
  buaVilla: string;
  plotAreaVilla: string;
  // Land-specific
  gfa: string;
  plotAreaLand: string;
  landUse: string;
  heightLimit: string;
  // Features
  furnishing: string;
  view: string;
  balcony: boolean;
  maidRoom: boolean;
  studyRoom: boolean;
  privatePool: boolean;
  privateGarden: boolean;
  amenities: string;
  featuredProperty: boolean;
  published: boolean;
  // Location
  emirate: string;
  locationArea: string;
  community: string;
  fullAddress: string;
  latitude: string;
  longitude: string;
  // Media
  imageUrls: string;
  videoUrl: string;
  virtualTourUrl: string;
}

const defaultFormData: PropertyFormData = {
  title: '',
  referenceNumber: '',
  availability: 'Available',
  completion: 'Ready',
  description: '',
  propertyType: 'Apartment',
  listingType: 'For Sale',
  priceAED: '',
  pricePerSqFt: '',
  serviceCharge: '',
  bedrooms: '',
  bathrooms: '',
  areaSqFt: '',
  builtUpArea: '',
  plotArea: '',
  buaVilla: '',
  plotAreaVilla: '',
  gfa: '',
  plotAreaLand: '',
  landUse: '',
  heightLimit: '',
  furnishing: '',
  view: '',
  balcony: false,
  maidRoom: false,
  studyRoom: false,
  privatePool: false,
  privateGarden: false,
  amenities: '',
  featuredProperty: false,
  published: false,
  emirate: 'Dubai',
  locationArea: '',
  community: '',
  fullAddress: '',
  latitude: '',
  longitude: '',
  imageUrls: '',
  videoUrl: '',
  virtualTourUrl: ''
};

const DRAFT_KEY = 'property_draft';
const PROPERTIES_STORAGE_KEY = 'admin_properties';
const IMPORT_STORAGE_KEY = 'imported_properties';

const properties: Property[] = [];


function loadProperties(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Property[];
    let base: Property[] = stored ? JSON.parse(stored) : [];
    const existingIds = new Set(base.map((p) => p.id));
    const newImports = imported.filter((p) => !existingIds.has(p.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
      localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(base));
    }
    return base;
  } catch {
    return [];
  }
}

function saveProperties(list: Property[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(list));
}

const statusColors: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-400/10',
  'Under Offer': 'text-yellow-400 bg-yellow-400/10',
  Sold: 'text-red-400 bg-red-400/10'
};

function generateRefNumber() {
  return 'LUX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PropertiesPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PropertyType>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('basic');
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTime, setDraftTime] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState<number | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [propertyList, setPropertyList] = useState<Property[]>([]);

  // UAE location cascading
  const [availableAreas, setAvailableAreas] = useState<string[]>(getAreasForEmirate('Dubai'));
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setPropertyList(loadProperties());
  }, []);

  // Poll for new imports
  useEffect(() => {
    const interval = setInterval(() => {
      const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Property[];
      if (imported.length > 0) {
        setPropertyList((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newImports = imported.filter((p) => !existingIds.has(p.id));
          if (newImports.length === 0) return prev;
          const updated = [...prev, ...newImports];
          localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
          localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const updatePropertyList = (updated: Property[]) => {
    setPropertyList(updated);
    saveProperties(updated);
  };

  // Check for existing draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHasDraft(true);
          setDraftTime(parsed.savedAt || 'Just now');
        } catch {


          // ignore
        }}}
  }, []);

  // Auto-save draft when modal is open and form changes
  useEffect(() => {
    if (!showModal) return;
    const hasContent = Object.entries(formData).some(([k, v]) => {
      if (typeof v === 'boolean') return v;
      return v !== '' && v !== defaultFormData[k as keyof PropertyFormData];
    });
    if (hasContent) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...formData, savedAt: 'Just now' }));
        setHasDraft(true);
        setDraftTime('Just now');
      }
    }
  }, [formData, showModal]);

  // Auto-calculate price per sq ft
  useEffect(() => {
    const price = parseFloat(formData.priceAED.replace(/,/g, ''));
    const area = parseFloat(formData.areaSqFt.replace(/,/g, ''));
    if (!isNaN(price) && !isNaN(area) && area > 0) {
      setFormData((prev) => ({ ...prev, pricePerSqFt: Math.round(price / area).toLocaleString() }));
    } else {
      setFormData((prev) => ({ ...prev, pricePerSqFt: '' }));
    }
  }, [formData.priceAED, formData.areaSqFt]);

  // Update areas when emirate changes
  useEffect(() => {
    const areas = getAreasForEmirate(formData.emirate);
    setAvailableAreas(areas);
    setAvailableCommunities([]);
  }, [formData.emirate]);

  // Update communities when area changes
  useEffect(() => {
    if (formData.locationArea) {
      const comms = getCommunitiesForArea(formData.locationArea);
      setAvailableCommunities(comms);
    } else {
      setAvailableCommunities([]);
    }
  }, [formData.locationArea]);

  const handleOpenModal = () => {
    setEditingProperty(null);
    setFormData(defaultFormData);
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      ...defaultFormData,
      title: property.name,
      locationArea: property.location,
      priceAED: property.price.replace('AED ', '').replace(/,/g, ''),
      propertyType: property.type === 'Residential' ? 'Apartment' : 'Office',
      availability: property.status,
      bedrooms: property.beds?.toString() || '',
      bathrooms: property.baths?.toString() || '',
      areaSqFt: property.sqft?.replace(/,/g, '') || ''
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleDiscard = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
    setHasDraft(false);
    setDraftTime('');
    setFormData(defaultFormData);
  };

  const handleRestore = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const { savedAt, ...rest } = parsed;
          setFormData({ ...defaultFormData, ...rest });
          setShowModal(true);
          setActiveTab('basic');
        } catch {


          // ignore
        }}}
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProperty(null);
  };

  const handleChange = useCallback((field: keyof PropertyFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAiGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const title = formData.title || 'Luxury Property';
      const location = formData.locationArea || 'Dubai';
      setFormData((prev) => ({
        ...prev,
        description: `Discover this exceptional ${title} nestled in the heart of ${location}. This stunning property offers an unparalleled living experience with world-class amenities, breathtaking views, and meticulous attention to detail. Perfect for discerning buyers seeking the pinnacle of luxury real estate.`
      }));
      setAiGenerating(false);
    }, 1200);
  };

  const handleAutoGenerateRef = () => {
    setFormData((prev) => ({ ...prev, referenceNumber: generateRefNumber() }));
  };

  const handleCreateProperty = () => {
    if (editingProperty) {
      const updated = propertyList.map((p) =>
      p.id === editingProperty.id ?
      {
        ...p,
        name: formData.title || p.name,
        location: formData.locationArea || p.location,
        price: formData.priceAED ? `AED ${parseInt(formData.priceAED).toLocaleString()}` : p.price,
        status: formData.availability || p.status,
        beds: formData.bedrooms ? parseInt(formData.bedrooms) : p.beds,
        baths: formData.bathrooms ? parseInt(formData.bathrooms) : p.baths,
        sqft: formData.areaSqFt || p.sqft,
        image: formData.imageUrls.split(',')[0].trim() || p.image,
        alt: formData.title || p.alt,
        published: formData.published,
        featured: formData.featuredProperty,
      } :
      p
      );
      updatePropertyList(updated);
    } else {
      const newProp: Property = {
        id: Date.now(),
        name: formData.title || 'New Property',
        location: formData.locationArea || '',
        price: formData.priceAED ? `AED ${parseInt(formData.priceAED).toLocaleString()}` : 'TBD',
        type: ['Office', 'Retail', 'Warehouse'].includes(formData.propertyType) ? 'Commercial' : 'Residential',
        status: formData.availability || 'Available',
        beds: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        baths: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        sqft: formData.areaSqFt || '',
        image: formData.imageUrls.split(',')[0].trim() || 'https://images.unsplash.com/photo-1613724962881-c5171beaeea2',
        alt: formData.title || 'Property',
        agent: '',
        published: formData.published,
        featured: formData.featuredProperty,
      };
      updatePropertyList([...propertyList, newProp]);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
    setHasDraft(false);
    setShowModal(false);
    setEditingProperty(null);
  };

  const handleShareProperty = (property: Property) => {
    setShareProperty(property);
    setCopied(false);
  };

  const handleCopyLink = (id: number) => {
    const url = `https://luxestate6357.builtwithrocket.new/properties/${id}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownloadPDF = (property: Property) => {
    setPdfGenerating(property.id);
    if (typeof window !== 'undefined') {
      const printContent = `
        <!DOCTYPE html><html><head><title>${property.name} - LuxEstate Brochure</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; }
          .brochure { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #c9a84c; letter-spacing: 2px; }
          .hero-img { width: 100%; height: 350px; object-fit: cover; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
          .location { font-size: 16px; color: #666; margin-bottom: 20px; }
          .price { font-size: 28px; font-weight: bold; color: #c9a84c; margin-bottom: 30px; }
          .specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #f8f6f0; padding: 20px; margin-bottom: 30px; }
          .spec { text-align: center; }
          .spec-val { font-size: 20px; font-weight: bold; color: #1a1a1a; }
          .spec-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .agent-section { background: #1a1a1a; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
          .agent-name { font-size: 16px; font-weight: bold; color: #c9a84c; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e0d5; font-size: 11px; color: #aaa; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style></head><body>
        <div class="brochure">
          <div class="header"><div class="logo">COVE ESTATES</div><div style="font-size:12px;color:#666">${property.type} Property</div></div>
          <img class="hero-img" src="${property.image}" alt="${property.alt}" />
          <div class="title">${property.name}</div>
          <div class="location">📍 ${property.location}</div>
          <div class="price">${property.price}</div>
          <div class="specs">
            ${property.beds ? `<div class="spec"><div class="spec-val">${property.beds}</div><div class="spec-lbl">Bedrooms</div></div>` : ''}
            ${property.baths ? `<div class="spec"><div class="spec-val">${property.baths}</div><div class="spec-lbl">Bathrooms</div></div>` : ''}
            <div class="spec"><div class="spec-val">${property.sqft}</div><div class="spec-lbl">Sq Ft</div></div>
          </div>
          <div class="agent-section">
            <div><div class="agent-name">${property.agent}</div><div style="font-size:12px;color:#aaa">Listing Agent</div></div>
            <div style="text-align:right;color:#c9a84c;font-size:18px;font-weight:bold">COVE ESTATES</div>
          </div>
          <div class="footer">© Cove Estates ${new Date().getFullYear()} · All details subject to change</div>
        </div>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
        </body></html>
      `;
      const pw = window.open('', '_blank');
      if (pw) {pw.document.write(printContent);pw.document.close();}
    }
    setTimeout(() => setPdfGenerating(null), 1500);
  };

  const allFilteredProperties = propertyList.filter((p) => {
    const matchType = activeType === 'All' || p.type === activeType;
    const matchSearch =
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const filtered = allFilteredProperties;

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
    updatePropertyList(propertyList.map((p) => selectedIds.has(p.id) ? { ...p, status: bulkStatusValue } : p));
    setBulkStatusValue('');
    clearSelection();
  };

  const handleBulkPublish = (publish: boolean) => {
    clearSelection();
  };

  const handleBulkFeatured = (featured: boolean) => {
    clearSelection();
  };

  const handleBulkDeleteConfirmed = () => {
    updatePropertyList(propertyList.filter((p) => !selectedIds.has(p.id)));
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const tabs: {id: ModalTab;label: string;}[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'features', label: 'Features' },
  { id: 'location', label: 'Location' },
  { id: 'media', label: 'Media' }];


  const inputClass =
  'w-full bg-[#1a1f2e] border border-[#2a3040] text-sm text-white placeholder:text-gray-500 px-3 py-2.5 focus:outline-none focus:border-[#c9a84c]/50 transition-colors';
  const labelClass = 'block text-xs font-medium text-gray-300 mb-1.5';
  const selectClass =
  'w-full bg-[#1a1f2e] border border-[#2a3040] text-sm text-white px-3 py-2.5 focus:outline-none focus:border-[#c9a84c]/50 transition-colors appearance-none cursor-pointer';

  const isVilla = formData.propertyType === 'Villa';
  const isLand = formData.propertyType === 'Land';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your property listings</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          
          <Icon name="PlusIcon" size={14} />
          Add Property
        </button>
      </div>

      {/* Draft Banner */}
      {hasDraft && !showModal &&
      <div className="mb-4 flex items-center justify-between bg-[#1a2035] border border-[#2a3a5c] px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Icon name="DocumentTextIcon" size={15} className="text-blue-400" />
            <span>You have an unsaved draft from {draftTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1">
            
              <Icon name="TrashIcon" size={13} />Discard
            </button>
            <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 text-xs bg-[#c9a84c] text-black font-semibold px-3 py-1.5 hover:bg-[#d4b86a] transition-colors">
            
              <Icon name="ArrowPathIcon" size={13} />Restore
            </button>
          </div>
        </div>
      }

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center border border-border">
          {(['All', 'Residential', 'Commercial'] as PropertyType[]).map((t) =>
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeType === t ?
            'bg-primary text-primary-foreground' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {t}
            </button>
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Icon
            name="MagnifyingGlassIcon"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          
        </div>
        <div className="ml-auto flex items-center border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
            viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
            }>
            
            <Icon name="Squares2X2Icon" size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
            viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
            }>
            
            <Icon name="ListBulletIcon" size={14} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 &&
      <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="px-2 py-1.5 bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary/50">
              <option value="">Change Status...</option>
              <option>Available</option><option>Under Offer</option><option>Sold</option>
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

      {viewMode === 'grid' ?
      <div>
          {/* Select All row for grid view */}
          {filtered.length > 0 &&
        <div className="flex items-center gap-2 mb-3 px-1">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
              <span className="text-xs text-muted-foreground">Select all {filtered.length} properties</span>
            </div>
        }
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((property) =>
          <div
            key={property.id}
            className={`bg-card border overflow-hidden hover:border-primary/30 transition-colors group ${selectedIds.has(property.id) ? 'border-primary/40' : 'border-border'}`}>
            
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-2 left-2 z-10">
                    <input type="checkbox" checked={selectedIds.has(property.id)} onChange={() => toggleSelect(property.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" onClick={(e) => e.stopPropagation()} />
                  </div>
                  <AppImage
                src={property.image}
                alt={property.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="400px" />
              
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
                      {property.type}
                    </span>
                    <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                  statusColors[property.status] || ''}`
                  }>
                  
                      {property.status}
                    </span>
                  </div>
                  {/* Quick action buttons on hover */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                  onClick={() => handleShareProperty(property)}
                  title="Share"
                  className="w-7 h-7 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors">
                  
                      <Icon name="ShareIcon" size={12} />
                    </button>
                    <button
                  onClick={() => handleDownloadPDF(property)}
                  title="PDF Brochure"
                  disabled={pdfGenerating === property.id}
                  className="w-7 h-7 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors disabled:opacity-60">
                  
                      <Icon name="DocumentArrowDownIcon" size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-foreground">{property.name}</h3>
                    <span className="text-primary text-sm font-bold">{property.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <Icon name="MapPinIcon" size={11} className="text-primary" />
                    {property.location}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    {property.beds &&
                <span className="flex items-center gap-1">
                        <Icon name="HomeIcon" size={11} className="text-primary" />
                        {property.beds} Beds
                      </span>
                }
                    {property.baths &&
                <span className="flex items-center gap-1">
                        <Icon name="SparklesIcon" size={11} className="text-primary" />
                        {property.baths} Baths
                      </span>
                }
                    <span className="flex items-center gap-1">
                      <Icon name="ArrowsPointingOutIcon" size={11} className="text-primary" />
                      {property.sqft} sqft
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{property.agent}</span>
                    <div className="flex gap-1">
                      <button
                    onClick={() => handleShareProperty(property)}
                    title="Share"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    
                        <Icon name="ShareIcon" size={13} />
                      </button>
                      <button
                    onClick={() => handleDownloadPDF(property)}
                    title="PDF"
                    disabled={pdfGenerating === property.id}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-60">
                    
                        <Icon name="DocumentArrowDownIcon" size={13} />
                      </button>
                      <button
                    onClick={() => router.push(`/admin/properties/${property.id}`)}
                    title="View Details"
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    
                        <Icon name="EyeIcon" size={13} />
                      </button>
                      <button
                    onClick={() => handleEditProperty(property)}
                    title="Edit"
                    className="p-1.5 text-muted-foreground hover:text-[#c9a84c] transition-colors">
                    
                        <Icon name="PencilIcon" size={13} />
                      </button>
                      <button
                    onClick={() => setPropertyList(propertyList.filter((p) => p.id !== property.id))}
                    title="Delete"
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                    
                        <Icon name="TrashIcon" size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
          </div>
        </div> :

      <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
                </th>
                {['Property', 'Type', 'Location', 'Price', 'Status', 'Agent', 'Actions'].map((h) =>
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) =>
            <tr
              key={p.id}
              className={`border-b border-border hover:bg-white/2 transition-colors ${
              selectedIds.has(p.id) ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-white/[0.01]'}`
              }>
              
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.location}</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">{p.price}</td>
                  <td className="px-4 py-3">
                    <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                  statusColors[p.status] || ''}`
                  }>
                  
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.agent}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                    onClick={() => handleShareProperty(p)}
                    title="Share"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    
                        <Icon name="ShareIcon" size={13} />
                      </button>
                      <button
                    onClick={() => handleDownloadPDF(p)}
                    title="PDF"
                    disabled={pdfGenerating === p.id}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-60">
                    
                        <Icon name="DocumentArrowDownIcon" size={13} />
                      </button>
                      <button
                    onClick={() => router.push(`/admin/properties/${p.id}`)}
                    title="View"
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    
                        <Icon name="EyeIcon" size={13} />
                      </button>
                      <button
                    onClick={() => handleEditProperty(p)}
                    title="Edit"
                    className="p-1.5 text-muted-foreground hover:text-[#c9a84c] transition-colors">
                    
                        <Icon name="PencilIcon" size={13} />
                      </button>
                      <button
                    onClick={() => setPropertyList(propertyList.filter((pr) => pr.id !== p.id))}
                    title="Delete"
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                    
                        <Icon name="TrashIcon" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      {/* Bulk Delete Confirm */}
      {bulkDeleteConfirm &&
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Properties</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} property(ies) will be deleted</p>
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

      {/* Share Modal */}
      {shareProperty &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShareProperty(null)} />
          <div className="relative w-full max-w-md bg-[#12151f] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Share Property</h3>
              <button
              onClick={() => setShareProperty(null)}
              className="text-gray-400 hover:text-white transition-colors">
              
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 bg-[#1a1a1a] border border-[#2a2a2a]">
              <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden">
                <AppImage
                src={shareProperty.image}
                alt={shareProperty.alt}
                fill
                className="object-cover"
                sizes="48px" />
              
              </div>
              <div>
                <p className="text-sm font-bold text-white">{shareProperty.name}</p>
                <p className="text-xs text-[#c9a84c]">{shareProperty.price}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">Share via:</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
            { label: 'WhatsApp', icon: 'ChatBubbleLeftRightIcon', color: 'text-emerald-400', href: `https://wa.me/?text=${encodeURIComponent(shareProperty.name + ' - ' + shareProperty.price + ' | https://luxestate6357.builtwithrocket.new/admin/properties/' + shareProperty.id)}` },
            { label: 'Email', icon: 'EnvelopeIcon', color: 'text-blue-400', href: `mailto:?subject=${encodeURIComponent(shareProperty.name)}&body=${encodeURIComponent('Check out this property: https://luxestate6357.builtwithrocket.new/admin/properties/' + shareProperty.id)}` },
            { label: 'LinkedIn', icon: 'GlobeAltIcon', color: 'text-sky-400', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://luxestate6357.builtwithrocket.new/admin/properties/' + shareProperty.id)}` }].
            map(({ label, icon, color, href }) =>
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 border border-[#2a3040] hover:border-[#c9a84c]/40 transition-colors">
              
                  <Icon name={icon as any} size={20} className={color} />
                  <span className="text-xs text-gray-300">{label}</span>
                </a>
            )}
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Copy link:</p>
              <div className="flex gap-2">
                <input
                type="text"
                readOnly
                value={`https://luxestate6357.builtwithrocket.new/admin/properties/${shareProperty.id}`}
                className="flex-1 bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 px-3 py-2 focus:outline-none" />
              
                <button
                onClick={() => handleCopyLink(shareProperty.id)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                copied ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-[#d4b86a]'}`
                }>
                
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button
            onClick={() => {handleDownloadPDF(shareProperty);setShareProperty(null);}}
            disabled={pdfGenerating === shareProperty.id}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c9a84c]/40 text-sm text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-60">
            
              <Icon name="DocumentArrowDownIcon" size={14} />
              {pdfGenerating === shareProperty.id ? 'Generating...' : 'Download PDF Brochure'}
            </button>
          </div>
        </div>
      }

      {/* Add/Edit Property Modal */}
      {showModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
          <div className="relative w-full max-w-2xl bg-[#12151f] border border-[#2a3040] shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3040]">
              <h2 className="text-lg font-bold text-white">
                {editingProperty ? `Edit Property — ${editingProperty.name}` : 'Add New Property'}
              </h2>
              <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1">
              
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Draft Banner */}
            {hasDraft && !editingProperty &&
          <div className="mx-6 mt-4 flex items-center justify-between bg-[#1a2035] border border-[#2a3a5c] px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <Icon name="DocumentTextIcon" size={15} className="text-blue-400" />
                  <span>You have an unsaved draft from {draftTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1">
                
                    <Icon name="TrashIcon" size={13} />
                    Discard
                  </button>
                  <button
                onClick={handleRestore}
                className="flex items-center gap-1.5 text-xs bg-[#c9a84c] text-black font-semibold px-3 py-1.5 hover:bg-[#d4b86a] transition-colors">
                
                    <Icon name="ArrowPathIcon" size={13} />
                    Restore
                  </button>
                </div>
              </div>
          }

            {/* Tabs */}
            <div className="flex border-b border-[#2a3040] px-6 mt-4">
              {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ?
              'border-[#c9a84c] text-[#c9a84c]' :
              'border-transparent text-gray-400 hover:text-white'}`
              }>
              
                  {tab.label}
                </button>
            )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Basic Info Tab */}
              {activeTab === 'basic' &&
            <div className="space-y-4">
                  {/* Property Title */}
                  <div>
                    <label className={labelClass}>Property Title *</label>
                    <input
                  type="text"
                  placeholder="e.g., Luxury Villa in Palm Jumeirah"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={inputClass} />
                
                  </div>

                  {/* Reference Number + Availability */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Reference Number{' '}
                        <span className="text-gray-500 font-normal">(auto-generated if empty)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                      type="text"
                      placeholder="Leave empty to auto-generate"
                      value={formData.referenceNumber}
                      onChange={(e) => handleChange('referenceNumber', e.target.value)}
                      className={inputClass} />
                    
                        <button
                      onClick={handleAutoGenerateRef}
                      title="Auto-generate"
                      className="px-2.5 bg-[#1a1f2e] border border-[#2a3040] text-gray-400 hover:text-[#c9a84c] transition-colors flex-shrink-0">
                      
                          <Icon name="ArrowPathIcon" size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Availability</label>
                      <div className="relative">
                        <select
                      value={formData.availability}
                      onChange={(e) => handleChange('availability', e.target.value)}
                      className={selectClass}>
                      
                          <option>Available</option>
                          <option>Under Offer</option>
                          <option>Sold</option>
                          <option>Rented</option>
                          <option>Off Market</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Completion */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Completion</label>
                      <div className="relative">
                        <select
                      value={formData.completion}
                      onChange={(e) => handleChange('completion', e.target.value)}
                      className={selectClass}>
                      
                          <option>Ready</option>
                          <option>Under Construction</option>
                          <option>Off Plan</option>
                          <option>Q1 2025</option>
                          <option>Q2 2025</option>
                          <option>Q3 2025</option>
                          <option>Q4 2025</option>
                          <option>2026</option>
                          <option>2027</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass + ' mb-0'}>Description *</label>
                      <button
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-xs bg-[#1a1f2e] border border-[#2a3040] text-[#c9a84c] px-3 py-1.5 hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-60">
                    
                        <Icon name="SparklesIcon" size={13} />
                        {aiGenerating ? 'Generating...' : 'AI Generate'}
                      </button>
                    </div>
                    <textarea
                  placeholder="Detailed property description..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className={inputClass + ' resize-none'} />
                
                  </div>

                  {/* Property Type + Listing Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Property Type *</label>
                      <div className="relative">
                        <select
                      value={formData.propertyType}
                      onChange={(e) => handleChange('propertyType', e.target.value)}
                      className={selectClass}>
                      
                          <option>Apartment</option>
                          <option>Villa</option>
                          <option>Townhouse</option>
                          <option>Penthouse</option>
                          <option>Duplex</option>
                          <option>Studio</option>
                          <option>Office</option>
                          <option>Retail</option>
                          <option>Warehouse</option>
                          <option>Land</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Listing Type *</label>
                      <div className="relative">
                        <select
                      value={formData.listingType}
                      onChange={(e) => handleChange('listingType', e.target.value)}
                      className={selectClass}>
                      
                          <option>For Sale</option>
                          <option>For Rent</option>
                          <option>Short Term</option>
                          <option>Off Plan</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Price AED + Price per Sq Ft */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Price (AED) *</label>
                      <input
                    type="text"
                    placeholder="5000000"
                    value={formData.priceAED}
                    onChange={(e) => handleChange('priceAED', e.target.value)}
                    className={inputClass} />
                  
                    </div>
                    <div>
                      <label className={labelClass}>Price per Sq Ft</label>
                      <input
                    type="text"
                    placeholder="Auto-calculated or enter"
                    value={formData.pricePerSqFt}
                    onChange={(e) => handleChange('pricePerSqFt', e.target.value)}
                    className={inputClass + ' text-gray-400'} />
                  
                    </div>
                  </div>

                  {/* Service Charge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Service Charge (AED/year)</label>
                      <input
                    type="text"
                    placeholder="e.g., 25000"
                    value={formData.serviceCharge}
                    onChange={(e) => handleChange('serviceCharge', e.target.value)}
                    className={inputClass} />
                  
                    </div>
                  </div>
                </div>
            }

              {/* Dimensions Tab */}
              {activeTab === 'dimensions' &&
            <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="HomeIcon" size={16} className="text-[#c9a84c]" />
                    <h3 className="text-base font-semibold text-white">
                      {isLand ? 'Land Dimensions' : isVilla ? 'Villa Dimensions' : 'Property Dimensions'}
                    </h3>
                  </div>

                  {/* Standard fields for non-land types */}
                  {!isLand &&
              <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Bedrooms</label>
                        <input type="number" placeholder="0" value={formData.bedrooms} onChange={(e) => handleChange('bedrooms', e.target.value)} className={inputClass} min="0" />
                      </div>
                      <div>
                        <label className={labelClass}>Bathrooms</label>
                        <input type="number" placeholder="0" value={formData.bathrooms} onChange={(e) => handleChange('bathrooms', e.target.value)} className={inputClass} min="0" />
                      </div>
                      <div>
                        <label className={labelClass}>Area (sq ft) *</label>
                        <input type="text" placeholder="0" value={formData.areaSqFt} onChange={(e) => handleChange('areaSqFt', e.target.value)} className={inputClass} />
                      </div>
                    </div>
              }

                  {/* Villa-specific fields */}
                  {isVilla &&
              <div className="space-y-4">
                      <div className="flex items-center gap-2 py-2 px-3 bg-[#c9a84c]/10 border border-[#c9a84c]/20">
                        <Icon name="HomeModernIcon" size={14} className="text-[#c9a84c]" />
                        <span className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wider">Villa Specific Fields</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>BUA — Built-Up Area (sq ft) *</label>
                          <input type="text" placeholder="e.g., 5000" value={formData.buaVilla} onChange={(e) => handleChange('buaVilla', e.target.value)} className={inputClass} />
                          <p className="text-[10px] text-gray-500 mt-1">Total built-up area including all floors</p>
                        </div>
                        <div>
                          <label className={labelClass}>Plot Area (sq ft) *</label>
                          <input type="text" placeholder="e.g., 8000" value={formData.plotAreaVilla} onChange={(e) => handleChange('plotAreaVilla', e.target.value)} className={inputClass} />
                          <p className="text-[10px] text-gray-500 mt-1">Total land/plot area</p>
                        </div>
                      </div>
                    </div>
              }

                  {/* Land-specific fields */}
                  {isLand &&
              <div className="space-y-4">
                      <div className="flex items-center gap-2 py-2 px-3 bg-[#c9a84c]/10 border border-[#c9a84c]/20">
                        <Icon name="MapIcon" size={14} className="text-[#c9a84c]" />
                        <span className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wider">Land Specific Fields</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>GFA — Gross Floor Area (sq ft)</label>
                          <input type="text" placeholder="e.g., 15000" value={formData.gfa} onChange={(e) => handleChange('gfa', e.target.value)} className={inputClass} />
                          <p className="text-[10px] text-gray-500 mt-1">Maximum permissible gross floor area</p>
                        </div>
                        <div>
                          <label className={labelClass}>Plot Area (sq ft) *</label>
                          <input type="text" placeholder="e.g., 10000" value={formData.plotAreaLand} onChange={(e) => handleChange('plotAreaLand', e.target.value)} className={inputClass} />
                          <p className="text-[10px] text-gray-500 mt-1">Total land plot area</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Land Use</label>
                          <div className="relative">
                            <select value={formData.landUse} onChange={(e) => handleChange('landUse', e.target.value)} className={selectClass}>
                              <option value="">Select land use</option>
                              <option>Residential</option>
                              <option>Commercial</option>
                              <option>Mixed Use</option>
                              <option>Industrial</option>
                              <option>Agricultural</option>
                              <option>Hospitality</option>
                              <option>Retail</option>
                              <option>Office</option>
                              <option>Warehouse</option>
                              <option>Educational</option>
                              <option>Healthcare</option>
                              <option>Community</option>
                            </select>
                            <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Height Limit (floors / meters)</label>
                          <input type="text" placeholder="e.g., G+4 or 20m" value={formData.heightLimit} onChange={(e) => handleChange('heightLimit', e.target.value)} className={inputClass} />
                          <p className="text-[10px] text-gray-500 mt-1">Maximum permissible building height</p>
                        </div>
                      </div>
                    </div>
              }

                  {/* Built-up Area + Plot Area for non-villa, non-land */}
                  {!isVilla && !isLand &&
              <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Built-up Area (sq ft)</label>
                        <input type="text" placeholder="0" value={formData.builtUpArea} onChange={(e) => handleChange('builtUpArea', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Plot Area (sq ft)</label>
                        <input type="text" placeholder="0" value={formData.plotArea} onChange={(e) => handleChange('plotArea', e.target.value)} className={inputClass} />
                      </div>
                    </div>
              }
                </div>
            }

              {/* Features Tab */}
              {activeTab === 'features' &&
            <div className="space-y-5">
                  {/* Furnishing + View */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Furnishing</label>
                      <div className="relative">
                        <select value={formData.furnishing} onChange={(e) => handleChange('furnishing', e.target.value)} className={selectClass}>
                          <option value="">Select furnishing</option>
                          <option>Furnished</option>
                          <option>Semi-Furnished</option>
                          <option>Unfurnished</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>View</label>
                      <div className="relative">
                        <select value={formData.view} onChange={(e) => handleChange('view', e.target.value)} className={selectClass}>
                          <option value="">Select view</option>
                          <option>Sea View</option>
                          <option>Burj Khalifa View</option>
                          <option>City View</option>
                          <option>Garden View</option>
                          <option>Pool View</option>
                          <option>Golf View</option>
                          <option>Canal View</option>
                          <option>Community View</option>
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                { key: 'balcony', label: 'Balcony' },
                { key: 'maidRoom', label: 'Maid Room' },
                { key: 'studyRoom', label: 'Study Room' },
                { key: 'privatePool', label: 'Private Pool' },
                { key: 'privateGarden', label: 'Private Garden' }].
                map(({ key, label }) =>
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                    type="checkbox"
                    checked={formData[key as keyof PropertyFormData] as boolean}
                    onChange={(e) => handleChange(key as keyof PropertyFormData, e.target.checked)}
                    className="w-4 h-4 border border-[#2a3040] bg-[#1a1f2e] accent-[#c9a84c] cursor-pointer" />
                  
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
                      </label>
                )}
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className={labelClass}>Amenities (comma separated)</label>
                    <input
                  type="text"
                  placeholder="e.g., Swimming Pool, Gym, Concierge, Beach Access"
                  value={formData.amenities}
                  onChange={(e) => handleChange('amenities', e.target.value)}
                  className={inputClass} />
                
                  </div>

                  {/* Featured + Published */}
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={formData.featuredProperty} onChange={(e) => handleChange('featuredProperty', e.target.checked)} className="w-4 h-4 border border-[#2a3040] bg-[#1a1f2e] accent-[#c9a84c] cursor-pointer" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Featured Property</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={formData.published} onChange={(e) => handleChange('published', e.target.checked)} className="w-4 h-4 border border-[#2a3040] bg-[#1a1f2e] accent-[#c9a84c] cursor-pointer" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Published</span>
                    </label>
                  </div>
                </div>
            }

              {/* Location Tab */}
              {activeTab === 'location' &&
            <div className="space-y-4">
                  {/* Emirate */}
                  <div>
                    <label className={labelClass}>Emirate *</label>
                    <div className="relative">
                      <select
                    value={formData.emirate}
                    onChange={(e) => handleChange('emirate', e.target.value)}
                    className={selectClass}>
                    
                        {UAE_EMIRATES.map((em) =>
                    <option key={em} value={em}>{em}</option>
                    )}
                      </select>
                      <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Area + Community */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Area / District *</label>
                      <div className="relative">
                        <select
                      value={formData.locationArea}
                      onChange={(e) => handleChange('locationArea', e.target.value)}
                      className={selectClass}>
                      
                          <option value="">Select area...</option>
                          {availableAreas.map((area) =>
                      <option key={area} value={area}>{area}</option>
                      )}
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Community *</label>
                      <div className="relative">
                        <select
                      value={formData.community}
                      onChange={(e) => handleChange('community', e.target.value)}
                      className={selectClass}
                      disabled={availableCommunities.length === 0}>
                      
                          <option value="">Select community...</option>
                          {availableCommunities.map((c) =>
                      <option key={c} value={c}>{c}</option>
                      )}
                        </select>
                        <Icon name="ChevronDownIcon" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className={labelClass}>Full Address</label>
                    <input
                  type="text"
                  placeholder="Full street address"
                  value={formData.fullAddress}
                  onChange={(e) => handleChange('fullAddress', e.target.value)}
                  className={inputClass} />
                
                  </div>

                  {/* Pin Location Map */}
                  <PinLocationMap
                value={{ lat: parseFloat(formData.latitude) || 25.2048, lng: parseFloat(formData.longitude) || 55.2708, address: formData.fullAddress }}
                onChange={(val) => {handleChange('latitude', val.lat.toString());handleChange('longitude', val.lng.toString());if (val.address) handleChange('fullAddress', val.address);}}
                label="Pin Location on Map" />
              
                </div>
            }

              {/* Media Tab */}
              {activeTab === 'media' &&
            <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Image URLs (comma separated)</label>
                    <textarea
                  placeholder="https://image1.jpg, https://image2.jpg"
                  value={formData.imageUrls}
                  onChange={(e) => handleChange('imageUrls', e.target.value)}
                  rows={3}
                  className={inputClass + ' resize-none'} />
                
                  </div>
                  <div>
                    <label className={labelClass}>Video URL (YouTube/Vimeo)</label>
                    <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                  className={inputClass} />
                
                  </div>
                  <div>
                    <label className={labelClass}>Virtual Tour URL</label>
                    <input
                  type="text"
                  placeholder="https://matterport.com/..."
                  value={formData.virtualTourUrl}
                  onChange={(e) => handleChange('virtualTourUrl', e.target.value)}
                  className={inputClass} />
                
                  </div>
                </div>
            }
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a3040]">
              <button
              onClick={handleClose}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white border border-[#2a3040] hover:border-[#3a4050] transition-colors">
              
                Cancel
              </button>
              <button
              onClick={handleCreateProperty}
              className="px-5 py-2 text-sm font-semibold bg-[#c9a84c] text-black hover:bg-[#d4b86a] transition-colors">
              
                {editingProperty ? 'Save Changes' : 'Create Property'}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}