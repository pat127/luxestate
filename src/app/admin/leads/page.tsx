'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  followUpDate?: string;
  statusHistory?: { status: string; date: string; note?: string }[];
}

const LEADS_STORAGE_KEY = 'admin_leads';
const IMPORT_STORAGE_KEY = 'imported_leads';

// Pipeline stages in order
const PIPELINE_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'];

// Allowed transitions: each stage can only move to specific next stages
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  New: ['Contacted', 'Lost'],
  Contacted: ['Qualified', 'Lost'],
  Qualified: ['Proposal', 'Lost'],
  Proposal: ['Negotiation', 'Lost'],
  Negotiation: ['Qualified', 'Lost'], // can go back to Qualified
  Lost: ['New'], // can re-open a lost lead
};

function canTransition(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? true;
}

function loadLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Lead[];
    const hasBeenInitialized = localStorage.getItem('admin_leads_initialized');
    let base: Lead[] = stored ? JSON.parse(stored) : (hasBeenInitialized ? [] : []);
    if (!hasBeenInitialized && !stored) {
      localStorage.setItem('admin_leads_initialized', '1');
    }
    const existingIds = new Set(base.map(l => l.id));
    const newImports = imported.filter(l => !existingIds.has(l.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
      localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(base));
    }
    return base;
  } catch {
    return [];
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

const statusDotColors: Record<string, string> = {
  New: 'bg-blue-400',
  Contacted: 'bg-yellow-400',
  Qualified: 'bg-primary',
  Proposal: 'bg-purple-400',
  Negotiation: 'bg-orange-400',
  Lost: 'bg-red-400',
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

function sendNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

function checkLeadReminders(leads: Lead[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  leads.forEach((lead) => {
    if (lead.followUpDate) {
      const followUp = new Date(lead.followUpDate);
      followUp.setHours(0, 0, 0, 0);
      if (followUp.getTime() === today.getTime()) {
        sendNotification(`Lead Follow-Up Due Today`, `Follow up with ${lead.name} (${lead.status}) — ${lead.interest || 'No interest specified'}`);
      } else if (followUp.getTime() === tomorrow.getTime()) {
        sendNotification(`Lead Follow-Up Due Tomorrow`, `Reminder: Follow up with ${lead.name} (${lead.status}) tomorrow.`);
      }
    }
  });
}

// Pipeline Kanban view component
function PipelineView({ leads, onStatusChange }: { leads: Lead[]; onStatusChange: (id: number, newStatus: string, note?: string) => void }) {
  const [transitionNote, setTransitionNote] = useState('');
  const [pendingTransition, setPendingTransition] = useState<{ id: number; from: string; to: string } | null>(null);

  const handleDrop = (leadId: number, fromStatus: string, toStatus: string) => {
    if (!canTransition(fromStatus, toStatus)) {
      alert(`Cannot move lead from "${fromStatus}" to "${toStatus}". Invalid transition.`);
      return;
    }
    setPendingTransition({ id: leadId, from: fromStatus, to: toStatus });
  };

  const confirmTransition = () => {
    if (!pendingTransition) return;
    onStatusChange(pendingTransition.id, pendingTransition.to, transitionNote);
    setPendingTransition(null);
    setTransitionNote('');
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage);
          return (
            <div
              key={stage}
              className="min-w-[160px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data) {
                  const { id, status } = JSON.parse(data);
                  handleDrop(id, status, stage);
                }
              }}
            >
              <div className={`flex items-center gap-2 mb-3 px-2 py-1.5 border-b border-border`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColors[stage]}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">{stage}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{stageLeads.length}</span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({ id: lead.id, status: lead.status }));
                    }}
                    className="bg-card border border-border p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-[10px] font-bold">{lead.name[0]}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate">{lead.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{lead.interest || '—'}</p>
                    <p className="text-[10px] text-primary font-medium mt-1">{lead.budget || '—'}</p>
                    {/* Quick transition buttons */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {ALLOWED_TRANSITIONS[stage]?.map((nextStage) => (
                        <button
                          key={nextStage}
                          onClick={() => handleDrop(lead.id, stage, nextStage)}
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border transition-colors ${
                            nextStage === 'Lost' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-primary/30 text-primary hover:bg-primary/10'
                          }`}
                        >
                          → {nextStage}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="border border-dashed border-border/50 p-4 text-center">
                    <p className="text-[10px] text-muted-foreground/50">Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transition Confirmation Modal */}
      {pendingTransition && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <h3 className="text-sm font-bold text-foreground mb-1">Confirm Status Change</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Moving lead from <span className={`font-bold ${statusColors[pendingTransition.from]?.split(' ')[0]}`}>{pendingTransition.from}</span> → <span className={`font-bold ${statusColors[pendingTransition.to]?.split(' ')[0]}`}>{pendingTransition.to}</span>
            </p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Note (optional)</label>
              <textarea
                rows={2}
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="Add a note about this status change..."
                className="w-full px-3 py-2 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPendingTransition(null); setTransitionNote(''); }} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={confirmTransition} className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status History Timeline
function StatusHistory({ lead }: { lead: Lead }) {
  const history = lead.statusHistory || [];
  if (history.length === 0) return null;
  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status History</p>
      <div className="space-y-2">
        {history.map((h, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${statusDotColors[h.status] || 'bg-muted-foreground'}`} />
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${statusColors[h.status] || ''}`}>{h.status}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{h.date}</span>
              {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const notifiedIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => setNotifPermission(perm));
      }
    }
  }, []);

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
          if (notifPermission === 'granted') {
            sendNotification('New Leads Imported', `${newImports.length} new lead${newImports.length > 1 ? 's' : ''} imported successfully.`);
          }
          return updated;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [notifPermission]);

  useEffect(() => {
    if (leads.length > 0 && notifPermission === 'granted') {
      checkLeadReminders(leads);
    }
  }, [leads.length, notifPermission]);

  const updateLeads = (updated: Lead[]) => {
    setLeads(updated);
    saveLeads(updated);
  };

  const handleStatusChange = (id: number, newStatus: string, note?: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const historyEntry = {
      status: newStatus,
      date: new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }),
      note,
    };
    const updatedHistory = [...(lead.statusHistory || [{ status: lead.status, date: lead.date }]), historyEntry];
    updateLeads(leads.map(l => l.id === id ? { ...l, status: newStatus, statusHistory: updatedHistory } : l));
    if (detailLead?.id === id) {
      setDetailLead(prev => prev ? { ...prev, status: newStatus, statusHistory: updatedHistory } : null);
    }
  };

  const statuses = ['All', ...PIPELINE_STAGES];

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
    updateLeads(leads.map((l) => {
      if (!selectedIds.has(l.id)) return l;
      if (!canTransition(l.status, bulkStatusValue)) return l; // skip invalid transitions
      const historyEntry = {
        status: bulkStatusValue,
        date: new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      return { ...l, status: bulkStatusValue, statusHistory: [...(l.statusHistory || []), historyEntry] };
    }));
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
    setForm({ name: lead.name, email: lead.email, phone: lead.phone, whatsapp: '', source: lead.source, status: lead.status, budget: lead.budget, interest: lead.interest, nationality: lead.nationality || '', assignedAgent: lead.assignedAgent || '', notes: lead.notes || '', followUpDate: lead.followUpDate || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editLead) {
      // Validate status transition
      if (form.status !== editLead.status && !canTransition(editLead.status, form.status)) {
        alert(`Cannot change status from "${editLead.status}" to "${form.status}". Use the pipeline view or allowed transitions.`);
        return;
      }
      const historyEntry = form.status !== editLead.status ? [{
        status: form.status,
        date: new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }),
      }] : [];
      updateLeads(leads.map(l => l.id === editLead.id ? {
        ...l, name: form.name, email: form.email, phone: form.phone, source: form.source,
        status: form.status, budget: form.budget, interest: form.interest,
        nationality: form.nationality, assignedAgent: form.assignedAgent, notes: form.notes,
        followUpDate: form.followUpDate,
        statusHistory: [...(l.statusHistory || []), ...historyEntry],
      } : l));
    } else {
      const newLead: Lead = {
        id: Date.now(), name: form.name, email: form.email, phone: form.phone,
        source: form.source, status: 'New', budget: form.budget, interest: form.interest,
        date: 'Just now', nationality: form.nationality, assignedAgent: form.assignedAgent,
        notes: form.notes, followUpDate: form.followUpDate,
        statusHistory: [{ status: 'New', date: 'Just now' }],
      };
      updateLeads([...leads, newLead]);
      if (notifPermission === 'granted') {
        sendNotification('New Lead Added', `${form.name} — ${form.interest || 'No interest specified'}. Budget: ${form.budget}`);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => updateLeads(leads.filter(l => l.id !== id));

  // Pipeline stats
  const pipelineStats = PIPELINE_STAGES.map(s => ({ stage: s, count: leads.filter(l => l.status === s).length }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex border border-border overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon name="TableCellsIcon" size={14} />
            </button>
            <button onClick={() => setViewMode('pipeline')} className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === 'pipeline' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon name="ViewColumnsIcon" size={14} />
            </button>
          </div>
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

      {/* Pipeline Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        {pipelineStats.map(({ stage, count }) => (
          <button key={stage} onClick={() => setFilterStatus(stage === filterStatus ? 'All' : stage)} className={`p-3 border text-center transition-colors ${filterStatus === stage ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}>
            <p className="text-lg font-bold text-foreground">{count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stage}</p>
          </button>
        ))}
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Pipeline View</span>
            <span className="text-xs text-muted-foreground">— Drag cards or use quick-transition buttons to move leads through stages</span>
          </div>
          <PipelineView leads={leads} onStatusChange={handleStatusChange} />
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
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
                  {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
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
                          <button onClick={() => setDetailLead(lead)} className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left">{lead.name}</button>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold ${sourceColors[lead.source] || 'text-muted-foreground'}`}>{lead.source}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[lead.status] || ''}`}>{lead.status}</span>
                        {/* Quick status change */}
                        <select
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            if (!canTransition(lead.status, e.target.value)) {
                              alert(`Cannot move from "${lead.status}" to "${e.target.value}"`);
                              return;
                            }
                            handleStatusChange(lead.id, e.target.value);
                          }}
                          className="text-[10px] bg-transparent border-none text-muted-foreground cursor-pointer focus:outline-none"
                          title="Change status"
                        >
                          <option value="">↓</option>
                          {ALLOWED_TRANSITIONS[lead.status]?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{lead.budget}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.interest}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{lead.assignedAgent || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{lead.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailLead(lead)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="View history"><Icon name="ClockIcon" size={13} /></button>
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
        </>
      )}

      {/* Lead Detail / Status History Panel */}
      {detailLead && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <div>
                <h2 className="text-sm font-bold text-foreground">{detailLead.name}</h2>
                <p className="text-xs text-muted-foreground">{detailLead.email}</p>
              </div>
              <button onClick={() => setDetailLead(null)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5">
              {/* Current Status */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Status:</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[detailLead.status] || ''}`}>{detailLead.status}</span>
              </div>

              {/* Pipeline Progress */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Pipeline Progress</p>
                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.filter(s => s !== 'Lost').map((stage, i, arr) => {
                    const currentIdx = arr.indexOf(detailLead.status);
                    const stageIdx = i;
                    const isActive = stageIdx <= currentIdx;
                    const isCurrent = stage === detailLead.status;
                    return (
                      <React.Fragment key={stage}>
                        <div className={`flex flex-col items-center gap-1 flex-1`}>
                          <div className={`w-full h-1.5 ${isActive ? 'bg-primary' : 'bg-border'} transition-all`} />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}>{stage}</span>
                        </div>
                        {i < arr.length - 1 && <div className={`w-2 h-1.5 flex-shrink-0 ${isActive && stageIdx < currentIdx ? 'bg-primary' : 'bg-border'}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                {detailLead.status === 'Lost' && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-red-400 font-bold">Lost</span>
                  </div>
                )}
              </div>

              {/* Quick Transition */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Move to Next Stage</p>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_TRANSITIONS[detailLead.status]?.map((nextStage) => (
                    <button
                      key={nextStage}
                      onClick={() => {
                        handleStatusChange(detailLead.id, nextStage);
                        setDetailLead(prev => prev ? { ...prev, status: nextStage } : null);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                        nextStage === 'Lost' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-primary/30 text-primary hover:bg-primary/10'
                      }`}
                    >
                      → {nextStage}
                    </button>
                  ))}
                </div>
              </div>

              <StatusHistory lead={detailLead} />
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Status
                    {editLead && form.status !== editLead.status && !canTransition(editLead.status, form.status) && (
                      <span className="text-red-400 ml-1 normal-case font-normal">(invalid transition)</span>
                    )}
                  </label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    {editLead ? (
                      // Show current + allowed transitions
                      [editLead.status, ...(ALLOWED_TRANSITIONS[editLead.status] || [])].map(s => <option key={s} value={s}>{s}</option>)
                    ) : (
                      <option value="New">New</option>
                    )}
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
