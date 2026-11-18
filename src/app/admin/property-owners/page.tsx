'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/contexts/RoleContext';
import { createClient } from '@/lib/supabase/client';
import WhatsAppConversationPanel from '@/components/WhatsAppConversationPanel';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PropertyOwner {
  id: string;
  name: string;
  mobile: string;
  project: string;
  community: string;
  buildingCluster: string;
  unitNumber: string;
  unitType: string;
  nationality: string;
  notes: string;
  assignedTo: string;
  assignedToId: string;
  createdAt: string;
}

interface OwnerForm {
  name: string;
  mobile: string;
  project: string;
  community: string;
  buildingCluster: string;
  unitNumber: string;
  unitType: string;
  nationality: string;
  notes: string;
  assignedTo: string;
  assignedToId: string;
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface DuplicateResult {
  existing: PropertyOwner;
  matchType: 'mobile' | 'unit';
}

const PAGE_SIZE = 50;
const UNIT_TYPES = ['Apartment', 'Villa', 'Office', 'Townhouse', 'Penthouse', 'Studio', 'Retail', 'Warehouse', 'Land', 'Other'];

const emptyForm: OwnerForm = {
  name: '', mobile: '', project: '', community: '', buildingCluster: '',
  unitNumber: '', unitType: 'Apartment', nationality: '', notes: '',
  assignedTo: '', assignedToId: '',
};

const unitTypeColors: Record<string, string> = {
  Apartment: 'text-primary bg-primary/10',
  Villa: 'text-emerald-400 bg-emerald-400/10',
  Office: 'text-blue-400 bg-blue-400/10',
  Townhouse: 'text-purple-400 bg-purple-400/10',
  Penthouse: 'text-yellow-400 bg-yellow-400/10',
  Studio: 'text-orange-400 bg-orange-400/10',
  Retail: 'text-pink-400 bg-pink-400/10',
  Warehouse: 'text-gray-400 bg-gray-400/10',
  Land: 'text-amber-400 bg-amber-400/10',
  Other: 'text-muted-foreground bg-muted/50',
};

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

function mapCSVRow(row: Record<string, string>): OwnerForm {
  return {
    name: row['name'] || row['owner_name'] || row['full_name'] || '',
    mobile: row['mobile'] || row['phone'] || row['mobile_number'] || '',
    project: row['project'] || row['project_name'] || '',
    community: row['community'] || '',
    buildingCluster: row['building'] || row['building_cluster'] || row['cluster'] || '',
    unitNumber: row['unit'] || row['unit_number'] || row['unit_no'] || '',
    unitType: row['unit_type'] || row['type'] || 'Apartment',
    nationality: row['nationality'] || '',
    notes: row['notes'] || row['remarks'] || '',
    assignedTo: '',
    assignedToId: '',
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyOwnersPage() {
  const { currentUser, isRole } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const canAccess = isRole('super_admin', 'marketing');
  const isSuperAdmin = isRole('super_admin');
  const canDelete = isRole('super_admin', 'admin', 'marketing');

  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters — debounced search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterCommunity, setFilterCommunity] = useState('All');
  const [filterUnitType, setFilterUnitType] = useState('All');

  // Filter option lists (loaded once)
  const [projectOptions, setProjectOptions] = useState<string[]>(['All']);
  const [communityOptions, setCommunityOptions] = useState<string[]>(['All']);

  const [showModal, setShowModal] = useState(false);
  const [editOwner, setEditOwner] = useState<PropertyOwner | null>(null);
  const [form, setForm] = useState<OwnerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<PropertyOwner | null>(null);
  const [assignTarget, setAssignTarget] = useState('');
  const [assignTargetId, setAssignTargetId] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // CSV upload
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvRows, setCSVRows] = useState<OwnerForm[]>([]);
  const [csvDuplicates, setCSVDuplicates] = useState<{ row: OwnerForm; match: string }[]>([]);
  const [csvUploading, setCSVUploading] = useState(false);
  const [csvResult, setCSVResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate check for manual entry
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateResult | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [filterProject, filterCommunity, filterUnitType]);

  // ── Load filter option lists (once) ─────────────────────────────────────────
  const loadFilterOptions = useCallback(async () => {
    const { data } = await supabase
      .from('property_owners')
      .select('project, community')
      .order('project');
    if (data) {
      const projects = Array.from(new Set(data.map((r: any) => r.project).filter(Boolean))).sort() as string[];
      const communities = Array.from(new Set(data.map((r: any) => r.community).filter(Boolean))).sort() as string[];
      setProjectOptions(['All', ...projects]);
      setCommunityOptions(['All', ...communities]);
    }
  }, [supabase]);

  // ── Load paginated owners ────────────────────────────────────────────────────
  const loadOwners = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('property_owners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!canAccess) {
      query = query.eq('assigned_to_id', currentUser.id);
    }
    if (debouncedSearch) {
      query = query.or(
        `name.ilike.%${debouncedSearch}%,mobile.ilike.%${debouncedSearch}%,unit_number.ilike.%${debouncedSearch}%,project.ilike.%${debouncedSearch}%`
      );
    }
    if (filterProject !== 'All') query = query.eq('project', filterProject);
    if (filterCommunity !== 'All') query = query.eq('community', filterCommunity);
    if (filterUnitType !== 'All') query = query.eq('unit_type', filterUnitType);

    const { data, count } = await query;

    setOwners(
      (data || []).map((o: any) => ({
        id: o.id,
        name: o.name || '',
        mobile: o.mobile || '',
        project: o.project || '',
        community: o.community || '',
        buildingCluster: o.building_cluster || '',
        unitNumber: o.unit_number || '',
        unitType: o.unit_type || 'Apartment',
        nationality: o.nationality || '',
        notes: o.notes || '',
        assignedTo: o.assigned_to || '',
        assignedToId: o.assigned_to_id || '',
        createdAt: o.created_at || '',
      }))
    );
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [supabase, canAccess, currentUser.id, currentPage, debouncedSearch, filterProject, filterCommunity, filterUnitType]);

  // ── Load users for assignment ────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, role')
      .in('role', ['agent', 'admin', 'super_admin'])
      .order('full_name');
    if (data) {
      setUserOptions(data.map((u: any) => ({ id: u.id, name: u.full_name || u.email || '', role: u.role })));
    }
  }, [supabase]);

  useEffect(() => { loadOwners(); }, [loadOwners]);
  useEffect(() => { loadUsers(); loadFilterOptions(); }, [loadUsers, loadFilterOptions]);

  // ── Duplicate check via DB ───────────────────────────────────────────────────
  const checkDuplicateDB = useCallback(async (mobile: string, unitNumber: string, project: string, excludeId?: string): Promise<DuplicateResult | null> => {
    if (!mobile && !unitNumber) return null;
    const checks: Promise<DuplicateResult | null>[] = [];

    if (mobile) {
      checks.push(
        supabase
          .from('property_owners')
          .select('id, name, mobile, unit_number, project, community, building_cluster, unit_type, nationality, notes, assigned_to, assigned_to_id, created_at')
          .eq('mobile', mobile)
          .neq('id', excludeId || '00000000-0000-0000-0000-000000000000')
          .limit(1)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const o = data[0];
              return {
                existing: {
                  id: o.id, name: o.name || '', mobile: o.mobile || '', project: o.project || '',
                  community: o.community || '', buildingCluster: o.building_cluster || '',
                  unitNumber: o.unit_number || '', unitType: o.unit_type || 'Apartment',
                  nationality: o.nationality || '', notes: o.notes || '',
                  assignedTo: o.assigned_to || '', assignedToId: o.assigned_to_id || '',
                  createdAt: o.created_at || '',
                },
                matchType: 'mobile' as const,
              };
            }
            return null;
          })
      );
    }

    if (unitNumber && project) {
      checks.push(
        supabase
          .from('property_owners')
          .select('id, name, mobile, unit_number, project, community, building_cluster, unit_type, nationality, notes, assigned_to, assigned_to_id, created_at')
          .eq('unit_number', unitNumber)
          .eq('project', project)
          .neq('id', excludeId || '00000000-0000-0000-0000-000000000000')
          .limit(1)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const o = data[0];
              return {
                existing: {
                  id: o.id, name: o.name || '', mobile: o.mobile || '', project: o.project || '',
                  community: o.community || '', buildingCluster: o.building_cluster || '',
                  unitNumber: o.unit_number || '', unitType: o.unit_type || 'Apartment',
                  nationality: o.nationality || '', notes: o.notes || '',
                  assignedTo: o.assigned_to || '', assignedToId: o.assigned_to_id || '',
                  createdAt: o.created_at || '',
                },
                matchType: 'unit' as const,
              };
            }
            return null;
          })
      );
    }

    const results = await Promise.all(checks);
    return results.find((r) => r !== null) ?? null;
  }, [supabase]);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditOwner(null);
    setForm(emptyForm);
    setFormError('');
    setDuplicateWarning(null);
    setShowModal(true);
  };

  const openEdit = (o: PropertyOwner) => {
    setEditOwner(o);
    setForm({
      name: o.name, mobile: o.mobile, project: o.project, community: o.community,
      buildingCluster: o.buildingCluster, unitNumber: o.unitNumber, unitType: o.unitType,
      nationality: o.nationality, notes: o.notes, assignedTo: o.assignedTo, assignedToId: o.assignedToId,
    });
    setFormError('');
    setDuplicateWarning(null);
    setShowModal(true);
  };

  // Debounced duplicate warning in form
  const dupCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFormChange = (field: keyof OwnerForm, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (field === 'mobile' || field === 'unitNumber' || field === 'project') {
      if (dupCheckTimer.current) clearTimeout(dupCheckTimer.current);
      dupCheckTimer.current = setTimeout(async () => {
        const dup = await checkDuplicateDB(
          field === 'mobile' ? value : updated.mobile,
          field === 'unitNumber' ? value : updated.unitNumber,
          field === 'project' ? value : updated.project,
          editOwner?.id,
        );
        setDuplicateWarning(dup);
      }, 500);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      setFormError('Name and mobile are required.');
      return;
    }
    const dup = await checkDuplicateDB(form.mobile, form.unitNumber, form.project, editOwner?.id);
    if (dup) {
      setFormError(`Duplicate detected: ${dup.matchType === 'mobile' ? 'Mobile number' : 'Unit in this project'} already exists (${dup.existing.name}).`);
      return;
    }
    setSaving(true);
    setFormError('');
    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      project: form.project.trim(),
      community: form.community.trim(),
      building_cluster: form.buildingCluster.trim(),
      unit_number: form.unitNumber.trim(),
      unit_type: form.unitType,
      nationality: form.nationality.trim(),
      notes: form.notes.trim(),
      assigned_to: form.assignedTo,
      assigned_to_id: form.assignedToId || null,
    };
    if (editOwner) {
      await supabase.from('property_owners').update(payload).eq('id', editOwner.id);
    } else {
      await supabase.from('property_owners').insert({ ...payload, created_by: currentUser.name, created_by_id: currentUser.id });
    }
    setSaving(false);
    setShowModal(false);
    loadOwners();
    loadFilterOptions();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('property_owners').delete().eq('id', id);
    setDeleteConfirm(null);
    loadOwners();
  };

  const handleBulkDelete = async () => {
    await supabase.from('property_owners').delete().in('id', Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    loadOwners();
  };

  const allSelected = owners.length > 0 && owners.every((o) => selectedIds.has(o.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      const s = new Set(selectedIds);
      owners.forEach((o) => s.delete(o.id));
      setSelectedIds(s);
    } else {
      const s = new Set(selectedIds);
      owners.forEach((o) => s.add(o.id));
      setSelectedIds(s);
    }
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };

  // ── Assignment ───────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignModal) return;
    await supabase.from('property_owners').update({ assigned_to: assignTarget, assigned_to_id: assignTargetId || null }).eq('id', assignModal.id);
    setAssignModal(null);
    loadOwners();
  };

  // ── CSV Upload ───────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text).map(mapCSVRow).filter((r) => r.name || r.mobile);

      const dups: { row: OwnerForm; match: string }[] = [];
      const seen = new Set<string>();
      const clean: OwnerForm[] = [];

      // ── Bulk-fetch existing mobiles and unit+project combos in 2 queries ──
      const incomingMobiles = [...new Set(rows.map((r) => r.mobile).filter(Boolean))];
      const incomingUnits = rows.filter((r) => r.unitNumber && r.project);

      const [mobileRes, unitRes] = await Promise.all([
        incomingMobiles.length > 0
          ? supabase
              .from('property_owners')
              .select('mobile, name')
              .in('mobile', incomingMobiles)
          : Promise.resolve({ data: [] }),
        incomingUnits.length > 0
          ? supabase
              .from('property_owners')
              .select('unit_number, project, name')
              .in('unit_number', [...new Set(incomingUnits.map((r) => r.unitNumber))])
          : Promise.resolve({ data: [] }),
      ]);

      // Build lookup maps for O(1) checks
      const existingMobiles = new Map<string, string>(
        (mobileRes.data || []).map((r: any) => [r.mobile, r.name])
      );
      const existingUnits = new Map<string, string>(
        (unitRes.data || []).map((r: any) => [`${r.unit_number}|${r.project}`, r.name])
      );

      // In-memory duplicate detection — no more per-row DB calls
      for (const row of rows) {
        const key = `${row.mobile}|${row.unitNumber}|${row.project}`;
        if (seen.has(key)) {
          dups.push({ row, match: `Duplicate within CSV: ${row.name}` });
          continue;
        }
        const mobileOwner = row.mobile ? existingMobiles.get(row.mobile) : undefined;
        if (mobileOwner) {
          dups.push({ row, match: `Mobile ${row.mobile} exists (${mobileOwner})` });
          continue;
        }
        const unitOwner = row.unitNumber && row.project ? existingUnits.get(`${row.unitNumber}|${row.project}`) : undefined;
        if (unitOwner) {
          dups.push({ row, match: `Unit ${row.unitNumber} in ${row.project} exists (${unitOwner})` });
          continue;
        }
        seen.add(key);
        clean.push(row);
      }

      setCSVRows(clean);
      setCSVDuplicates(dups);
      setCSVResult(null);
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = async () => {
    if (csvRows.length === 0) return;
    setCSVUploading(true);
    const payload = csvRows.map((r) => ({
      name: r.name,
      mobile: r.mobile,
      project: r.project,
      community: r.community,
      building_cluster: r.buildingCluster,
      unit_number: r.unitNumber,
      unit_type: r.unitType || 'Apartment',
      nationality: r.nationality,
      notes: r.notes,
      created_by: currentUser.name,
      created_by_id: currentUser.id,
    }));

    // Split into chunks of 500 and insert in parallel batches of 5
    const CHUNK_SIZE = 500;
    const PARALLEL = 5;
    const chunks: typeof payload[] = [];
    for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
      chunks.push(payload.slice(i, i + CHUNK_SIZE));
    }

    let hasError = false;
    for (let i = 0; i < chunks.length; i += PARALLEL) {
      const batch = chunks.slice(i, i + PARALLEL);
      const results = await Promise.all(batch.map((chunk) => supabase.from('property_owners').insert(chunk)));
      if (results.some((r) => r.error)) { hasError = true; break; }
    }

    setCSVUploading(false);
    if (!hasError) {
      setCSVResult({ inserted: csvRows.length, skipped: csvDuplicates.length });
      setCSVRows([]);
      loadOwners();
      loadFilterOptions();
    }
  };

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Access guard ─────────────────────────────────────────────────────────────
  if (!canAccess && !isRole('admin', 'agent')) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Access restricted.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-card/50 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-foreground">Property Owners</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{totalCount} record{totalCount !== 1 ? 's' : ''} · Superadmin &amp; Marketing access</p>
          </div>
          {canAccess && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowCSVModal(true); setCSVRows([]); setCSVDuplicates([]); setCSVResult(null); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Icon name="ArrowUpTrayIcon" size={14} />
                Bulk CSV Upload
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Icon name="PlusIcon" size={14} />
                Add Owner
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, mobile, unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50">
            <option value="All">All Projects</option>
            {projectOptions.filter((p) => p !== 'All').map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)} className="px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50">
            <option value="All">All Communities</option>
            {communityOptions.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterUnitType} onChange={(e) => setFilterUnitType(e.target.value)} className="px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50">
            <option value="All">All Types</option>
            {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-primary/5 border-b border-primary/20 px-6 py-2.5 flex-shrink-0">
          <span className="text-sm font-semibold text-primary mr-1">{selectedIds.size} selected</span>
          {canDelete && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Icon name="TrashIcon" size={11} />
              Delete Selected
            </button>
          )}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : owners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Icon name="UserGroupIcon" size={32} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No property owners found</p>
            {canAccess && (
              <button onClick={openAdd} className="text-xs text-primary hover:underline">Add your first owner</button>
            )}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#C5A47E] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Owner</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Mobile</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Project</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Community</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Bldg / Cluster</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Unit</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Nationality</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Assigned To</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {owners.map((o) => (
                <tr key={o.id} className={`transition-colors group ${selectedIds.has(o.id) ? 'bg-primary/5' : 'hover:bg-white/3'}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      className="w-4 h-4 accent-[#C5A47E] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-[10px] font-bold">{o.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{o.name}</p>
                        {o.notes && <p className="text-muted-foreground text-[10px] truncate max-w-[120px]">{o.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground font-mono">{o.mobile}</td>
                  <td className="px-4 py-3 text-foreground">{o.project || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-foreground">{o.community || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-foreground">{o.buildingCluster || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{o.unitNumber || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold ${unitTypeColors[o.unitType] || unitTypeColors['Other']}`}>
                      {o.unitType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.nationality || '—'}</td>
                  <td className="px-4 py-3">
                    {o.assignedTo ? (
                      <span className="text-emerald-400 text-[10px] font-medium">{o.assignedTo}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canAccess && (
                        <>
                          <button
                            onClick={() => { setAssignModal(o); setAssignTarget(o.assignedTo); setAssignTargetId(o.assignedToId); }}
                            className="p-1.5 text-muted-foreground hover:text-blue-400 transition-colors"
                            title="Assign"
                          >
                            <Icon name="UserPlusIcon" size={13} />
                          </button>
                          <button onClick={() => openEdit(o)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Edit">
                            <Icon name="PencilIcon" size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(o.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                            <Icon name="TrashIcon" size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card/50 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} · {totalCount} total records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const page = start + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 text-xs transition-colors ${page === currentPage ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ─────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">{editOwner ? 'Edit Owner' : 'Add Property Owner'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Duplicate warning banner */}
              {duplicateWarning && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                  <Icon name="ExclamationTriangleIcon" size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Possible duplicate: <strong>{duplicateWarning.existing.name}</strong> — {duplicateWarning.matchType === 'mobile' ? `same mobile (${duplicateWarning.existing.mobile})` : `same unit ${duplicateWarning.existing.unitNumber} in ${duplicateWarning.existing.project}`}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="Full name" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mobile *</label>
                  <input type="text" value={form.mobile} onChange={(e) => handleFormChange('mobile', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Project</label>
                  <input type="text" value={form.project} onChange={(e) => handleFormChange('project', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Marina Heights" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Community</label>
                  <input type="text" value={form.community} onChange={(e) => handleFormChange('community', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Dubai Marina" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Building / Cluster</label>
                  <input type="text" value={form.buildingCluster} onChange={(e) => handleFormChange('buildingCluster', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Tower A / Cluster 3" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Number</label>
                  <input type="text" value={form.unitNumber} onChange={(e) => handleFormChange('unitNumber', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. 1204" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Type</label>
                  <select value={form.unitType} onChange={(e) => handleFormChange('unitType', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50">
                    {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nationality</label>
                  <input type="text" value={form.nationality} onChange={(e) => handleFormChange('nationality', e.target.value)} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. British" />
                </div>
                {canAccess && (
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Assign To</label>
                    <select
                      value={form.assignedToId}
                      onChange={(e) => {
                        const u = userOptions.find((u) => u.id === e.target.value);
                        handleFormChange('assignedToId', e.target.value);
                        setForm((prev) => ({ ...prev, assignedTo: u?.name || '', assignedToId: e.target.value }));
                      }}
                      className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Unassigned</option>
                      {userOptions.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => handleFormChange('notes', e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Any additional notes..." />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <Icon name="ExclamationCircleIcon" size={14} />
                  {formError}
                </div>
              )}
            </div>
            {/* WhatsApp Conversation History (edit mode only) */}
            {editOwner && (
              <div className="px-6 py-4 border-t border-border bg-background/50">
                <WhatsAppConversationPanel
                  contactId={editOwner.id}
                  contactName={editOwner.name}
                  contactPhone={editOwner.mobile || ''}
                  contactType="property_owner"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editOwner ? 'Save Changes' : 'Add Owner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ───────────────────────────────────────────────────────── */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Assign Owner Record</h2>
              <button onClick={() => setAssignModal(null)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-muted-foreground">Assign <strong className="text-foreground">{assignModal.name}</strong> to an agent or admin:</p>
              <select
                value={assignTargetId}
                onChange={(e) => {
                  const u = userOptions.find((u) => u.id === e.target.value);
                  setAssignTargetId(e.target.value);
                  setAssignTarget(u?.name || '');
                }}
                className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="">Unassigned</option>
                {userOptions.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
              <button onClick={handleAssign} className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirm ────────────────────────────────────────────────── */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name="TrashIcon" size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Delete {selectedIds.size} Owner Record{selectedIds.size !== 1 ? 's' : ''}?</p>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="px-4 py-2 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name="TrashIcon" size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Delete Owner Record?</p>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV Upload Modal ───────────────────────────────────────────────────── */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Bulk CSV Upload</h2>
              <button onClick={() => setShowCSVModal(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Template hint */}
              <div className="px-3 py-2.5 bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Expected CSV columns:</p>
                <p className="font-mono text-[10px]">name, mobile, project, community, building_cluster, unit_number, unit_type, nationality, notes</p>
              </div>

              {/* File input */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer p-8 flex flex-col items-center gap-2"
              >
                <Icon name="ArrowUpTrayIcon" size={24} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select CSV file</p>
                <p className="text-[10px] text-muted-foreground/60">Supports .csv files</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

              {/* Preview */}
              {csvRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">{csvRows.length} valid row{csvRows.length !== 1 ? 's' : ''} ready to import</p>
                  <div className="max-h-40 overflow-y-auto border border-border">
                    <table className="w-full text-[10px]">
                      <thead className="bg-card sticky top-0">
                        <tr>
                          {['Name', 'Mobile', 'Project', 'Community', 'Bldg/Cluster', 'Unit', 'Type'].map((h) => (
                            <th key={h} className="text-left px-2 py-1.5 text-muted-foreground font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvRows.slice(0, 20).map((r, i) => (
                          <tr key={i} className="hover:bg-white/3">
                            <td className="px-2 py-1.5 text-foreground">{r.name}</td>
                            <td className="px-2 py-1.5 font-mono">{r.mobile}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.project}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.community}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.buildingCluster}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.unitNumber}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{r.unitType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvRows.length > 20 && <p className="text-[10px] text-muted-foreground px-2 py-1.5">...and {csvRows.length - 20} more</p>}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {csvDuplicates.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Icon name="ExclamationTriangleIcon" size={13} />
                    {csvDuplicates.length} duplicate{csvDuplicates.length !== 1 ? 's' : ''} skipped
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {csvDuplicates.map((d, i) => (
                      <div key={i} className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400">
                        {d.row.name} — {d.match}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {csvResult && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <Icon name="CheckCircleIcon" size={14} />
                  Successfully imported {csvResult.inserted} record{csvResult.inserted !== 1 ? 's' : ''}. {csvResult.skipped > 0 ? `${csvResult.skipped} duplicate${csvResult.skipped !== 1 ? 's' : ''} skipped.` : ''}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowCSVModal(false)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">Close</button>
              {csvRows.length > 0 && !csvResult && (
                <button onClick={handleCSVUpload} disabled={csvUploading} className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {csvUploading ? 'Uploading...' : `Import ${csvRows.length} Records`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
