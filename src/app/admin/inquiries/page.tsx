'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  budget: string;
  interest: string;
  notes: string;
  nationality: string;
  assigned_agent: string;
  follow_up_date: string;
  created_at: string;
  form_type: string;
}

const STATUS_OPTIONS = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'];
const SOURCE_OPTIONS = ['All', 'Website', 'Contact Form', 'Property Enquiry', 'Project Registration', 'Referral', 'Instagram', 'LinkedIn', 'Walk-in', 'Property Finder', 'Bayut', 'Other'];
const FORM_TYPE_OPTIONS = ['All', 'contact', 'property_inquiry', 'project_registration'];

const statusBadge: Record<string, string> = {
  New: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Contacted: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  Qualified: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Proposal: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Negotiation: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  Lost: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const sourceBadge: Record<string, string> = {
  Website: 'text-emerald-400',
  'Contact Form': 'text-emerald-400',
  'Property Enquiry': 'text-primary',
  'Project Registration': 'text-purple-400',
  Referral: 'text-blue-400',
  Instagram: 'text-pink-400',
  LinkedIn: 'text-sky-400',
  'Walk-in': 'text-orange-400',
  'Property Finder': 'text-red-400',
  Bayut: 'text-orange-400',
};

const formTypeBadge: Record<string, { label: string; cls: string }> = {
  contact: { label: 'Contact Form', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  property_inquiry: { label: 'Property Enquiry', cls: 'bg-primary/10 text-primary border border-primary/20' },
  project_registration: { label: 'Project Registration', cls: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function InquiriesPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isAgentScoped, currentUser } = useRole();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterFormType, setFilterFormType] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [sortField, setSortField] = useState<'created_at' | 'name' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (isAgentScoped) {
      query = query.eq('assigned_agent', currentUser.name);
    }

    const { data } = await query;
    if (data) setInquiries(data);
    setLoading(false);
  }, [isAgentScoped, currentUser.name]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Derived filtered + sorted list
  const filtered = inquiries
    .filter((i) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.phone?.toLowerCase().includes(q) ||
        i.interest?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || i.status === filterStatus;
      const matchSource = filterSource === 'All' || i.source === filterSource;
      const matchFormType = filterFormType === 'All' || i.form_type === filterFormType;
      const matchFrom = !filterDateFrom || new Date(i.created_at) >= new Date(filterDateFrom);
      const matchTo = !filterDateTo || new Date(i.created_at) <= new Date(filterDateTo + 'T23:59:59');
      return matchSearch && matchStatus && matchSource && matchFormType && matchFrom && matchTo;
    })
    .sort((a, b) => {
      let valA: string = a[sortField] ?? '';
      let valB: string = b[sortField] ?? '';
      const cmp = valA.localeCompare(valB);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // Stats
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const qualifiedCount = inquiries.filter((i) => i.status === 'Qualified').length;
  const todayCount = inquiries.filter((i) => {
    const d = new Date(i.created_at);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;
  const contactFormCount = inquiries.filter((i) => i.form_type === 'contact').length;
  const propertyInquiryCount = inquiries.filter((i) => i.form_type === 'property_inquiry').length;
  const projectRegCount = inquiries.filter((i) => i.form_type === 'project_registration').length;

  // Selection
  const allSelected = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const toggleSelectAll = () => {
    const s = new Set(selectedIds);
    if (allSelected) filtered.forEach((i) => s.delete(i.id));
    else filtered.forEach((i) => s.add(i.id));
    setSelectedIds(s);
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedIds(s);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    setUpdatingId(null);
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (!newStatus) return;
    await supabase.from('leads').update({ status: newStatus }).in('id', Array.from(selectedIds));
    setInquiries((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, status: newStatus } : i))
    );
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    await supabase.from('leads').delete().in('id', Array.from(selectedIds));
    setInquiries((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setDeleteConfirm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSort = (field: 'created_at' | 'name' | 'status') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterSource('All');
    setFilterFormType('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = search || filterStatus !== 'All' || filterSource !== 'All' || filterFormType !== 'All' || filterDateFrom || filterDateTo;

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <Icon name="ChevronUpDownIcon" size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc'
      ? <Icon name="ChevronUpIcon" size={12} className="text-primary" />
      : <Icon name="ChevronDownIcon" size={12} className="text-primary" />;
  };

  const inputCls = 'bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors';

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries & Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All form submissions from property and contact forms</p>
        </div>
        <button
          onClick={loadInquiries}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Icon name="ArrowPathIcon" size={14} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Inquiries', value: totalCount, icon: 'InboxIcon', color: 'text-foreground', bg: 'bg-foreground/5' },
          { label: 'New Today', value: todayCount, icon: 'SparklesIcon', color: 'text-blue-400', bg: 'bg-blue-400/5' },
          { label: 'Uncontacted', value: newCount, icon: 'BellAlertIcon', color: 'text-amber-400', bg: 'bg-amber-400/5' },
          { label: 'Qualified', value: qualifiedCount, icon: 'CheckBadgeIcon', color: 'text-primary', bg: 'bg-primary/5' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-card border border-border p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={icon as any} size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Type Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Contact Forms', value: contactFormCount, formType: 'contact', color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-500/20' },
          { label: 'Property Enquiries', value: propertyInquiryCount, formType: 'property_inquiry', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
          { label: 'Project Registrations', value: projectRegCount, formType: 'project_registration', color: 'text-purple-400', bg: 'bg-purple-400/5', border: 'border-purple-500/20' },
        ].map(({ label, value, formType, color, bg, border }) => (
          <button
            key={formType}
            onClick={() => setFilterFormType(filterFormType === formType ? 'All' : formType)}
            className={`bg-card border p-3 flex items-center justify-between transition-colors hover:border-primary/30 ${filterFormType === formType ? `${border} ${bg}` : 'border-border'}`}
          >
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-left">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
            {filterFormType === formType && (
              <Icon name="FunnelIcon" size={14} className={color} />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, phone, interest…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-9 w-full`}
            />
          </div>

          {/* Status filter */}
          <div className="min-w-[140px]">
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Source filter */}
          <div className="min-w-[160px]">
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Source</label>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className={inputCls}>
              {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Form Type filter */}
          <div className="min-w-[180px]">
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Form Type</label>
            <select value={filterFormType} onChange={(e) => setFilterFormType(e.target.value)} className={inputCls}>
              {FORM_TYPE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Types' : s === 'contact' ? 'Contact Form' : s === 'property_inquiry' ? 'Property Enquiry' : 'Project Registration'}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">From Date</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className={inputCls} />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">To Date</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className={inputCls} />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 transition-colors"
            >
              <Icon name="XMarkIcon" size={13} />
              Clear
            </button>
          )}
        </div>

        {/* Status quick-filter pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
              {s !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  {inquiries.filter((i) => i.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            <span className="text-xs text-muted-foreground">Mark as:</span>
            {['Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Icon name="TrashIcon" size={13} />
              Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> of{' '}
          <span className="text-foreground font-semibold">{totalCount}</span> inquiries
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-card border border-border">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border">
          <Icon name="InboxIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No inquiries match your filters.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#C5A47E] cursor-pointer"
                    />
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      Contact <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Form Type
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Interest / Property
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Budget
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      Status <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Agent
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1.5">
                      Received <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr
                      className={`hover:bg-white/[0.02] transition-colors ${
                        selectedIds.has(inquiry.id) ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inquiry.id)}
                          onChange={() => toggleSelect(inquiry.id)}
                          className="w-4 h-4 accent-[#C5A47E] cursor-pointer"
                        />
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-xs font-bold">
                              {inquiry.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">{inquiry.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.email || '—'}</p>
                            {inquiry.phone && (
                              <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${sourceBadge[inquiry.source] || 'text-muted-foreground'}`}>
                          {inquiry.source || '—'}
                        </span>
                      </td>

                      {/* Form Type */}
                      <td className="px-4 py-3">
                        {inquiry.form_type && formTypeBadge[inquiry.form_type] ? (
                          <span className={`text-[11px] font-bold px-2 py-1 ${formTypeBadge[inquiry.form_type].cls}`}>
                            {formTypeBadge[inquiry.form_type].label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Interest */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-xs text-foreground truncate" title={inquiry.interest || ''}>
                          {inquiry.interest || <span className="text-muted-foreground">—</span>}
                        </p>
                        {inquiry.nationality && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{inquiry.nationality}</p>
                        )}
                      </td>

                      {/* Budget */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-foreground whitespace-nowrap">
                          {inquiry.budget || <span className="text-muted-foreground">—</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {updatingId === inquiry.id ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <select
                            value={inquiry.status || 'New'}
                            onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 cursor-pointer focus:outline-none bg-transparent ${
                              statusBadge[inquiry.status] || 'text-muted-foreground'
                            }`}
                          >
                            {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map((s) => (
                              <option key={s} value={s} className="bg-card text-foreground normal-case tracking-normal font-normal text-sm">
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          {inquiry.assigned_agent || <span className="text-muted-foreground/40">Unassigned</span>}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-foreground">{formatDate(inquiry.created_at)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTime(inquiry.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                            title="View details"
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Icon name={expandedId === inquiry.id ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(inquiry.id)}
                            title="Delete"
                            className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <Icon name="TrashIcon" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === inquiry.id && (
                      <tr className="bg-background/40">
                        <td colSpan={10} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {inquiry.notes && (
                              <div className="md:col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Message / Notes</p>
                                <p className="text-sm text-foreground leading-relaxed bg-card border border-border px-3 py-2">
                                  {inquiry.notes}
                                </p>
                              </div>
                            )}
                            <div className="space-y-2">
                              {inquiry.follow_up_date && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Follow-up Date</p>
                                  <p className="text-sm text-foreground flex items-center gap-1.5">
                                    <Icon name="CalendarIcon" size={13} className="text-primary" />
                                    {inquiry.follow_up_date}
                                  </p>
                                </div>
                              )}
                              {inquiry.nationality && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Nationality</p>
                                  <p className="text-sm text-foreground">{inquiry.nationality}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Lead ID</p>
                                <p className="text-[11px] text-muted-foreground font-mono">{inquiry.id}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-foreground mb-2">Delete {selectedIds.size} Inquiries?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2 bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
