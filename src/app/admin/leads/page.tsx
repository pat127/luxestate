'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  budget: string;
  interest: string;
  created_at: string;
  assigned_agent?: string;
  nationality?: string;
  notes?: string;
  follow_up_date?: string;
  project?: string;
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
  'WhatsApp Outsourced': 'text-green-400',
};

interface LeadForm {
  name: string; email: string; phone: string; whatsapp: string;
  source: string; status: string; budget: string; interest: string;
  nationality: string; assignedAgent: string; notes: string; followUpDate: string;
  buyerType: 'individual' | 'company';
  companyName: string;
  referralName: string;
  referralFee: string;
  project: string;
}

const emptyForm: LeadForm = {
  name: '', email: '', phone: '', whatsapp: '', source: 'Website', status: 'New',
  budget: '', interest: '', nationality: '', assignedAgent: '', notes: '', followUpDate: '',
  buyerType: 'individual', companyName: '', referralName: '', referralFee: '',
  project: '',
};

export default function LeadsPage() {
  const supabase = createClient();
  const { currentUser, isAgentScoped } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [agentNames, setAgentNames] = useState<string[]>([]);

  const loadAgentNames = useCallback(async () => {
    const { data } = await supabase
      .from('agents')
      .select('name')
      .eq('agent_status', 'Active')
      .order('name', { ascending: true });
    if (data) setAgentNames(data.map((a: any) => a.name as string));
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    // Agents see only their own leads
    if (isAgentScoped) {
      query = query.eq('assigned_agent', currentUser.name);
    }
    const { data } = await query;
    if (data) setLeads(data);
    setLoading(false);
  }, [isAgentScoped, currentUser.name]);

  useEffect(() => {
    loadLeads();
    loadAgentNames();
  }, [loadLeads, loadAgentNames]);

  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'];

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const allSelected = filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));
  const toggleSelectAll = () => {
    if (allSelected) { const s = new Set(selectedIds); filtered.forEach(l => s.delete(l.id)); setSelectedIds(s); }
    else { const s = new Set(selectedIds); filtered.forEach(l => s.add(l.id)); setSelectedIds(s); }
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!newStatus) return;
    await supabase.from('leads').update({ status: newStatus }).in('id', Array.from(selectedIds));
    setSelectedIds(new Set());
    loadLeads();
  };

  const handleBulkDelete = async () => {
    await supabase.from('leads').delete().in('id', Array.from(selectedIds));
    setSelectedIds(new Set());
    setDeleteConfirm(false);
    loadLeads();
  };

  const openNew = () => {
    loadAgentNames();
    setEditLead(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    loadAgentNames();
    setEditLead(lead);
    setForm({
      name: lead.name || '', email: lead.email || '', phone: lead.phone || '', whatsapp: '',
      source: lead.source || 'Website', status: lead.status || 'New',
      budget: lead.budget || '', interest: lead.interest || '',
      nationality: lead.nationality || '', assignedAgent: lead.assigned_agent || '',
      notes: lead.notes || '', followUpDate: lead.follow_up_date || '',
      buyerType: 'individual', companyName: '', referralName: '', referralFee: '',
      project: lead.project || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    loadLeads();
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (form.buyerType === 'company' && !form.companyName) return;
    setSaving(true);
    const notesWithExtras = [
      form.notes,
      form.buyerType === 'company' && form.companyName ? `Company: ${form.companyName}` : '',
      form.source === 'Referral' && form.referralName ? `Referral by: ${form.referralName}` : '',
      form.source === 'Referral' && form.referralFee ? `Referral fee: ${form.referralFee}` : '',
    ].filter(Boolean).join('\n');
    const payload = {
      name: form.name, email: form.email, phone: form.phone,
      source: form.source, status: form.status, budget: form.budget,
      interest: form.interest, nationality: form.nationality,
      assigned_agent: form.assignedAgent, notes: notesWithExtras,
      follow_up_date: form.followUpDate || null,
      project: form.project || null,
    };
    if (editLead) {
      await supabase.from('leads').update(payload).eq('id', editLead.id);
    } else {
      await supabase.from('leads').insert(payload);
    }

    // Auto-sync to contacts: every lead must also exist as a contact
    const contactPayload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      source: form.source || 'Website',
      nationality: form.nationality || null,
      assigned_agent: form.assignedAgent || null,
      budget: form.budget || null,
      notes: notesWithExtras || null,
      type: 'Buyer',
      status: 'Active',
      last_contact: new Date().toISOString().split('T')[0],
    };

    if (form.email) {
      // Check if a contact with this email already exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', form.email)
        .maybeSingle();

      if (existing) {
        // Update the existing contact to keep it in sync
        await supabase.from('contacts').update({
          name: contactPayload.name,
          phone: contactPayload.phone,
          source: contactPayload.source,
          nationality: contactPayload.nationality,
          assigned_agent: contactPayload.assigned_agent,
          budget: contactPayload.budget,
          notes: contactPayload.notes,
          last_contact: contactPayload.last_contact,
        }).eq('id', existing.id);
      } else {
        // Insert new contact
        await supabase.from('contacts').insert(contactPayload);
      }
    } else {
      // No email — match by name + phone if available
      let existingContact = null;
      if (form.phone) {
        const { data } = await supabase
          .from('contacts')
          .select('id')
          .eq('name', form.name)
          .eq('phone', form.phone)
          .maybeSingle();
        existingContact = data;
      }
      if (existingContact) {
        await supabase.from('contacts').update({
          source: contactPayload.source,
          nationality: contactPayload.nationality,
          assigned_agent: contactPayload.assigned_agent,
          budget: contactPayload.budget,
          notes: contactPayload.notes,
          last_contact: contactPayload.last_contact,
        }).eq('id', existingContact.id);
      } else {
        await supabase.from('contacts').insert(contactPayload);
      }
    }

    setSaving(false);
    setShowModal(false);
    loadLeads();
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60";
  const labelCls = "block text-xs text-[#aaa] mb-1";

  // Stats
  const newCount = leads.filter(l => l.status === 'New').length;
  const qualifiedCount = leads.filter(l => l.status === 'Qualified').length;
  const totalCount = leads.length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage enquiries and lead pipeline</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name="PlusIcon" size={14} />Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: totalCount, color: 'text-foreground' },
          { label: 'New', value: newCount, color: 'text-blue-400' },
          { label: 'Qualified', value: qualifiedCount, color: 'text-primary' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            {['Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map(s => (
              <button key={s} onClick={() => handleBulkStatusChange(s)} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">{s}</button>
            ))}
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
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
          <Icon name="UserGroupIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No leads found.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">Add First Lead</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 px-1">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
            <span className="text-xs text-muted-foreground">Select all {filtered.length} leads</span>
          </div>
          <div className="space-y-2">
            {filtered.map((lead) => (
              <div key={lead.id} className={`bg-card border overflow-hidden hover:border-primary/30 transition-colors ${selectedIds.has(lead.id) ? 'border-primary/40' : 'border-border'}`}>
                <div className="p-4 flex items-center gap-4">
                  <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer flex-shrink-0" />
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="UserIcon" size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{lead.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[lead.status] || 'text-gray-400 bg-gray-400/10'}`}>{lead.status}</span>
                      {lead.source && <span className={`text-[10px] font-bold uppercase tracking-wider ${sourceColors[lead.source] || 'text-muted-foreground'}`}>{lead.source}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                      {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                      {lead.interest && <p className="text-xs text-primary truncate max-w-xs">{lead.interest}</p>}
                    </div>
                    {lead.budget && <p className="text-xs text-muted-foreground mt-0.5">Budget: {lead.budget}</p>}
                    {lead.assigned_agent && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Icon name="UserCircleIcon" size={11} className="text-primary" />
                        Agent: <span className="text-foreground font-medium">{lead.assigned_agent}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : '—'}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openEdit(lead)} className="px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(lead.id)} className="px-3 py-1.5 border border-red-400/20 text-xs text-red-400 hover:bg-red-400/5 transition-colors"><Icon name="TrashIcon" size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0f1117] border border-[#2a3040] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3040]">
              <h2 className="text-base font-bold text-white">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">

                {/* Buyer Type Toggle */}
                <div className="col-span-2">
                  <label className={labelCls}>Buyer Type</label>
                  <div className="flex gap-0 border border-[#333] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, buyerType: 'individual', companyName: '' })}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${form.buyerType === 'individual' ? 'bg-primary text-primary-foreground' : 'bg-[#1a1a1a] text-[#aaa] hover:text-white'}`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, buyerType: 'company' })}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${form.buyerType === 'company' ? 'bg-primary text-primary-foreground' : 'bg-[#1a1a1a] text-[#aaa] hover:text-white'}`}
                    >
                      Company
                    </button>
                  </div>
                </div>

                {/* Company Name — shown only when company is selected */}
                {form.buyerType === 'company' && (
                  <div className="col-span-2">
                    <label className={labelCls}>Company Name *</label>
                    <input
                      className={inputCls}
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Company / Organisation name"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className={labelCls}>{form.buyerType === 'company' ? 'Contact Person Name' : 'Full Name'} *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lead name" />
                </div>
                <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label className={labelCls}>Source</label>
                  <select className={inputCls} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                    {['Website', 'Referral', 'Instagram', 'LinkedIn', 'Walk-in', 'Property Finder', 'Bayut', 'WhatsApp Outsourced', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Referral fields — shown only when source is Referral */}
                {form.source === 'Referral' && (
                  <>
                    <div>
                      <label className={labelCls}>Referral Name *</label>
                      <input
                        className={inputCls}
                        value={form.referralName}
                        onChange={(e) => setForm({ ...form, referralName: e.target.value })}
                        placeholder="Name of referrer"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Referral Fee</label>
                      <input
                        className={inputCls}
                        value={form.referralFee}
                        onChange={(e) => setForm({ ...form, referralFee: e.target.value })}
                        placeholder="e.g. AED 5,000 or 1%"
                      />
                    </div>
                  </>
                )}

                <div><label className={labelCls}>Budget</label><input className={inputCls} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. AED 2M–5M" /></div>
                <div><label className={labelCls}>Nationality</label><input className={inputCls} value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelCls}>Interest / Property</label><input className={inputCls} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} placeholder="e.g. 2BR in Downtown Dubai" /></div>
                <div className="col-span-2">
                  <label className={labelCls}>Project Enquired</label>
                  <input
                    className={inputCls}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="e.g. Emaar Beachfront, Creek Harbour"
                  />
                </div>
                <div>
                  <label className={labelCls}>Assigned To</label>
                  <select
                    className={inputCls}
                    value={form.assignedAgent}
                    onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })}
                  >
                    <option value="">— Select —</option>
                    <option value="CEO Pawan">CEO Pawan</option>
                    {agentNames.filter(n => n !== 'CEO Pawan').map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Follow-up Date</label><input type="date" className={inputCls} value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a3040]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || (form.buyerType === 'company' && !form.companyName)}
                className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editLead ? 'Update Lead' : 'Save Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-foreground mb-2">Delete {selectedIds.size} Leads?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
