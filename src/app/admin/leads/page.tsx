'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  budget: string;
  interest: string;
  date: string;
  assignedAgent?: string;
  nationality?: string;
  notes?: string;
}

const LEADS_STORAGE_KEY = 'admin_leads';
const IMPORT_STORAGE_KEY = 'imported_leads';

const seedLeads: Lead[] = [
  { id: 1, name: 'Alexander Webb', email: 'alex@example.com', phone: '+971 50 111 2222', source: 'Website', status: 'New', budget: 'AED 5M+', interest: 'Penthouse', date: 'Today', assignedAgent: 'Sarah Mitchell', nationality: 'British' },
  { id: 2, name: 'Natasha Ivanova', email: 'natasha@example.com', phone: '+971 55 333 4444', source: 'Referral', status: 'Contacted', budget: 'AED 2-5M', interest: 'Villa', date: 'Yesterday', assignedAgent: 'Omar Hassan', nationality: 'Russian' },
  { id: 3, name: 'Omar Al-Farsi', email: 'omar@example.com', phone: '+971 52 555 6666', source: 'Instagram', status: 'Qualified', budget: 'AED 10M+', interest: 'Commercial', date: '3 days ago', assignedAgent: 'James Carter', nationality: 'Emirati' },
  { id: 4, name: 'Emily Thornton', email: 'emily@example.com', phone: '+971 56 777 8888', source: 'LinkedIn', status: 'Proposal', budget: 'AED 1-2M', interest: 'Apartment', date: '1 week ago', assignedAgent: 'Priya Sharma', nationality: 'Australian' },
  { id: 5, name: 'Raj Patel', email: 'raj@example.com', phone: '+971 58 999 0000', source: 'Walk-in', status: 'Negotiation', budget: 'AED 3-5M', interest: 'Townhouse', date: '2 weeks ago', assignedAgent: 'Sarah Mitchell', nationality: 'Indian' },
  { id: 6, name: 'Chloe Beaumont', email: 'chloe@example.com', phone: '+971 50 222 3333', source: 'Website', status: 'Lost', budget: 'AED 500K-1M', interest: 'Studio', date: '1 month ago', assignedAgent: 'James Carter', nationality: 'French' },
];

function loadLeads(): Lead[] {
  if (typeof window === 'undefined') return seedLeads;
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Lead[];
    let base: Lead[] = stored ? JSON.parse(stored) : seedLeads;
    // Merge imported leads that aren't already in base (by id)
    const existingIds = new Set(base.map(l => l.id));
    const newImports = imported.filter(l => !existingIds.has(l.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
      // Clear imported after merging so they don't re-appear on next load
      localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(base));
    }
    return base;
  } catch {
    return seedLeads;
  }
}

function saveLeads(leads: Lead[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}

const statusColors: Record<string, string> = {
  New: 'text-blue-400 bg-blue-400/10',
  Contacted: 'text-yellow-400 bg-yellow-400/10',
  Qualified: 'text-primary bg-primary/10',
  Proposal: 'text-purple-400 bg-purple-400/10',
  Negotiation: 'text-orange-400 bg-orange-400/10',
  Lost: 'text-red-400 bg-red-400/10',
};

const sourceColors: Record<string, string> = {
  Website: 'text-emerald-400',
  Referral: 'text-primary',
  Instagram: 'text-pink-400',
  LinkedIn: 'text-blue-400',
  'Walk-in': 'text-orange-400',
  'Property Finder': 'text-red-400',
  Bayut: 'text-orange-400',
  Import: 'text-purple-400',
};

interface LeadForm {
  name: string; email: string; phone: string; whatsapp: string;
  source: string; status: string; budget: string; interest: string;
  nationality: string; assignedAgent: string; notes: string; followUpDate: string;
}

const emptyForm: LeadForm = {
  name: '', email: '', phone: '', whatsapp: '', source: 'Website', status: 'New',
  budget: '', interest: '', nationality: '', assignedAgent: '', notes: '', followUpDate: '',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  // Poll for new imports every 2 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Lead[];
      if (imported.length > 0) {
        setLeads(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newImports = imported.filter(l => !existingIds.has(l.id));
          if (newImports.length === 0) return prev;
          const updated = [...prev, ...newImports];
          localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateLeads = (updated: Lead[]) => {
    setLeads(updated);
    saveLeads(updated);
  };

  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'];

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const allSelected = filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach((l) => newSet.delete(l.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach((l) => newSet.add(l.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = () => {
    if (!bulkStatusValue) return;
    updateLeads(leads.map((l) => selectedIds.has(l.id) ? { ...l, status: bulkStatusValue } : l));
    setBulkStatusValue('');
    clearSelection();
  };

  const handleBulkDelete = () => {
    updateLeads(leads.filter((l) => !selectedIds.has(l.id)));
    setDeleteConfirm(false);
    clearSelection();
  };

  const openNew = () => { setEditLead(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({ name: lead.name, email: lead.email, phone: lead.phone, whatsapp: '', source: lead.source, status: lead.status, budget: lead.budget, interest: lead.interest, nationality: lead.nationality || '', assignedAgent: lead.assignedAgent || '', notes: lead.notes || '', followUpDate: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editLead) {
      updateLeads(leads.map(l => l.id === editLead.id ? { ...l, name: form.name, email: form.email, phone: form.phone, source: form.source, status: form.status, budget: form.budget, interest: form.interest, nationality: form.nationality, assignedAgent: form.assignedAgent, notes: form.notes } : l));
    } else {
      updateLeads([...leads, { id: Date.now(), name: form.name, email: form.email, phone: form.phone, source: form.source, status: form.status, budget: form.budget, interest: form.interest, date: 'Just now', nationality: form.nationality, assignedAgent: form.assignedAgent, notes: form.notes }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => updateLeads(leads.filter(l => l.id !== id));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Icon name="ArrowUpTrayIcon" size={14} />Import
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Icon name="ArrowDownTrayIcon" size={14} />Export
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PlusIcon" size={14} />Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        {statuses.slice(1).map((s) => {
          const count = leads.filter((l) => l.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s === filterStatus ? 'All' : s)} className={`p-3 border text-center transition-colors ${filterStatus === s ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}>
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="px-2 py-1.5 bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary/50">
              <option value="">Change Status...</option>
              {statuses.slice(1).map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkStatusChange} disabled={!bulkStatusValue} className="px-3 py-1.5 bg-card border border-border text-xs text-foreground hover:border-primary/50 transition-colors disabled:opacity-40">Apply</button>
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <Icon name="TrashIcon" size={13} />Delete Selected
            </button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
              </th>
              {['Name', 'Source', 'Status', 'Budget', 'Interest', 'Agent', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <tr key={lead.id} className={`border-b border-border hover:bg-white/2 transition-colors ${selectedIds.has(lead.id) ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">{lead.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${sourceColors[lead.source] || 'text-muted-foreground'}`}>{lead.source}</span></td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[lead.status] || ''}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">{lead.budget}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.interest}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.assignedAgent || '—'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(lead)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                    <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Leads</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} lead(s) will be deleted</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. All selected leads will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">WhatsApp</label>
                  <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Nationality</label>
                  <input type="text" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. British" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Website</option><option>Referral</option><option>Instagram</option><option>LinkedIn</option><option>Walk-in</option><option>Property Finder</option><option>Bayut</option><option>Dubizzle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>New</option><option>Contacted</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Lost</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Budget Range</label>
                  <input type="text" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. AED 2M - 5M" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Property Interest</label>
                  <input type="text" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Villa, Penthouse" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Assigned Agent</label>
                  <select value={form.assignedAgent} onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="">Select agent</option>
                    <option>Sarah Mitchell</option><option>James Carter</option><option>Omar Hassan</option><option>Priya Sharma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Follow-up Date</label>
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Lead notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editLead ? 'Update Lead' : 'Save Lead'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
