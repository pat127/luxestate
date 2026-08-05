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
  campaign?: string;
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
  WhatsApp: 'text-green-400',
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
  campaign: string;
}

const emptyForm: LeadForm = {
  name: '', email: '', phone: '', whatsapp: '', source: 'Website', status: 'New',
  budget: '', interest: '', nationality: '', assignedAgent: '', notes: '', followUpDate: '',
  buyerType: 'individual', companyName: '', referralName: '', referralFee: '',
  project: '', campaign: '',
};

export default function LeadsPage() {
  const supabase = createClient();
  const { currentUser, isAgentScoped } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterCampaign, setFilterCampaign] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [agentNames, setAgentNames] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [campaignNames, setCampaignNames] = useState<string[]>([]);
  const [bulkAgentOpen, setBulkAgentOpen] = useState(false);
  const [bulkCampaignOpen, setBulkCampaignOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkSourceOpen, setBulkSourceOpen] = useState(false);

  const loadAgentNames = useCallback(async () => {
    const { data } = await supabase
      .from('agents')
      .select('name')
      .eq('agent_status', 'Active')
      .order('name', { ascending: true });
    if (data) setAgentNames(data.map((a: any) => a.name as string));
  }, []);

  const loadCampaigns = useCallback(async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('name')
      .order('name', { ascending: true });
    if (data) setCampaignNames(data.map((c: any) => c.name as string));
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
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
    loadCampaigns();
  }, [loadLeads, loadAgentNames, loadCampaigns]);

  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'];
  const sources = ['All', 'Website', 'Referral', 'Instagram', 'LinkedIn', 'Walk-in', 'Property Finder', 'Bayut', 'WhatsApp', 'Other'];
  const projectOptions = ['All', ...Array.from(new Set(leads.map(l => l.project).filter(Boolean) as string[])).sort()];
  const campaignOptions = ['All', ...Array.from(new Set([
    ...campaignNames,
    ...leads.map(l => l.campaign).filter(Boolean) as string[],
  ])).sort()];

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchSource = filterSource === 'All' || l.source === filterSource;
    const matchProject = filterProject === 'All' || l.project === filterProject;
    const matchCampaign = filterCampaign === 'All' || l.campaign === filterCampaign;
    return matchSearch && matchStatus && matchSource && matchProject && matchCampaign;
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
    setBulkStatusOpen(false);
    loadLeads();
  };

  const sendLeadAssignmentEmail = async (agentName: string, assignedLeads: Lead[]) => {
    try {
      // Fetch agent email from agents table
      const { data: agentData } = await supabase
        .from('agents')
        .select('email')
        .eq('name', agentName)
        .maybeSingle();

      if (!agentData?.email) return;

      await supabase.functions.invoke('send-lead-assignment', {
        body: {
          agent_name: agentName,
          agent_email: agentData.email,
          leads: assignedLeads.map((l) => ({
            name: l.name,
            phone: l.phone,
            email: l.email,
            status: l.status,
            source: l.source,
            budget: l.budget,
            interest: l.interest,
          })),
          is_bulk: assignedLeads.length > 1,
          assigned_by: currentUser?.name || null,
        },
      });
    } catch (_err) {
      // Silent fail — email is non-blocking
    }
  };

  const handleBulkAssignAgent = async (agentName: string) => {
    if (!agentName) return;
    const ids = Array.from(selectedIds);
    await supabase.from('leads').update({ assigned_agent: agentName }).in('id', ids);

    // Send email notification to assigned agent
    const assignedLeads = leads.filter((l) => ids.includes(l.id));
    sendLeadAssignmentEmail(agentName, assignedLeads);

    setSelectedIds(new Set());
    setBulkAgentOpen(false);
    loadLeads();
  };

  const handleBulkAddCampaign = async (campaignName: string) => {
    if (!campaignName) return;
    await supabase.from('leads').update({ campaign: campaignName }).in('id', Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkCampaignOpen(false);
    loadLeads();
  };

  const handleBulkUpdateSource = async (newSource: string) => {
    if (!newSource) return;
    await supabase.from('leads').update({ source: newSource }).in('id', Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkSourceOpen(false);
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
      campaign: lead.campaign || '',
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
      campaign: form.campaign || null,
    };

    const previousAgent = editLead?.assigned_agent || '';
    const newAgent = form.assignedAgent;
    const agentChanged = newAgent && newAgent !== previousAgent;

    if (editLead) {
      await supabase.from('leads').update(payload).eq('id', editLead.id);
    } else {
      await supabase.from('leads').insert(payload);
    }

    // Send email notification if agent was assigned or reassigned
    if (agentChanged) {
      const leadForEmail: Lead = {
        id: editLead?.id || '',
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: form.source,
        status: form.status,
        budget: form.budget,
        interest: form.interest,
        created_at: editLead?.created_at || new Date().toISOString(),
        assigned_agent: newAgent,
        nationality: form.nationality,
        notes: notesWithExtras,
        follow_up_date: form.followUpDate || undefined,
        project: form.project || undefined,
        campaign: form.campaign || undefined,
      };
      sendLeadAssignmentEmail(newAgent, [leadForEmail]);
    }

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
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', form.email)
        .maybeSingle();
      if (existing) {
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
        await supabase.from('contacts').insert(contactPayload);
      }
    } else {
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
        }).eq('id', (existingContact as any).id);
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

  const newCount = leads.filter(l => l.status === 'New').length;
  const qualifiedCount = leads.filter(l => l.status === 'Qualified').length;
  const totalCount = leads.length;

  const activeFilterCount = [
    filterStatus !== 'All',
    filterSource !== 'All',
    filterProject !== 'All',
    filterCampaign !== 'All',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-style sticky header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Leads</h1>
          <p className="text-[11px] text-muted-foreground">{totalCount} total · {newCount} new</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={13} />
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats row — horizontal scroll on mobile */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: totalCount, color: 'text-foreground' },
            { label: 'New', value: newCount, color: 'text-blue-400' },
            { label: 'Qualified', value: qualifiedCount, color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter toggle row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 border text-xs font-semibold transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Icon name="FunnelIcon" size={14} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="bg-card border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-2.5 py-2 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  {sources.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Project</label>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-2.5 py-2 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  {projectOptions.map(p => (
                    <option key={p} value={p}>{p === 'All' ? 'All Projects' : p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Campaign</label>
                <select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="w-full px-2.5 py-2 bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  {campaignOptions.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Campaigns' : c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterSource('All'); setFilterProject('All'); setFilterCampaign('All'); setFilterStatus('All'); }}
                    className="w-full px-2.5 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            {/* Status pills */}
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
              <div className="flex gap-1.5 flex-wrap">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/5 border border-primary/20 px-3 py-2.5">
            <span className="text-sm font-semibold text-primary mr-1">{selectedIds.size} selected</span>

            {/* Assign Agent dropdown */}
            <div className="relative">
              <button
                onClick={() => { setBulkAgentOpen(!bulkAgentOpen); setBulkCampaignOpen(false); setBulkStatusOpen(false); setBulkSourceOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="UserCircleIcon" size={12} />
                Assign Agent
                <Icon name="ChevronDownIcon" size={10} />
              </button>
              {bulkAgentOpen && (
                <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border shadow-lg min-w-[160px] max-h-48 overflow-y-auto">
                  {agentNames.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No agents found</p>
                  ) : agentNames.map(name => (
                    <button
                      key={name}
                      onClick={() => handleBulkAssignAgent(name)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Update Status dropdown */}
            <div className="relative">
              <button
                onClick={() => { setBulkStatusOpen(!bulkStatusOpen); setBulkAgentOpen(false); setBulkCampaignOpen(false); setBulkSourceOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ArrowPathIcon" size={12} />
                Update Status
                <Icon name="ChevronDownIcon" size={10} />
              </button>
              {bulkStatusOpen && (
                <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border shadow-lg min-w-[140px]">
                  {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleBulkStatusChange(s)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Campaign Tag dropdown */}
            <div className="relative">
              <button
                onClick={() => { setBulkCampaignOpen(!bulkCampaignOpen); setBulkAgentOpen(false); setBulkStatusOpen(false); setBulkSourceOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="TagIcon" size={12} />
                Campaign Tag
                <Icon name="ChevronDownIcon" size={10} />
              </button>
              {bulkCampaignOpen && (
                <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border shadow-lg min-w-[160px] max-h-48 overflow-y-auto">
                  {campaignNames.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No campaigns found</p>
                  ) : campaignNames.map(name => (
                    <button
                      key={name}
                      onClick={() => handleBulkAddCampaign(name)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Update Source dropdown */}
            <div className="relative">
              <button
                onClick={() => { setBulkSourceOpen(!bulkSourceOpen); setBulkAgentOpen(false); setBulkStatusOpen(false); setBulkCampaignOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="GlobeAltIcon" size={12} />
                Update Source
                <Icon name="ChevronDownIcon" size={10} />
              </button>
              {bulkSourceOpen && (
                <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border shadow-lg min-w-[160px]">
                  {['Website', 'Referral', 'Instagram', 'LinkedIn', 'Walk-in', 'Property Finder', 'Bayut', 'WhatsApp', 'Other'].map(src => (
                    <button
                      key={src}
                      onClick={() => handleBulkUpdateSource(src)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {src}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete */}
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors">
              <Icon name="TrashIcon" size={11} />Delete
            </button>

            <button
              onClick={() => { setSelectedIds(new Set()); setBulkAgentOpen(false); setBulkCampaignOpen(false); setBulkStatusOpen(false); setBulkSourceOpen(false); }}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-border bg-card">
            <Icon name="UserGroupIcon" size={36} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">No leads found</p>
            <p className="text-muted-foreground text-xs mt-1 mb-4">Try adjusting your filters or add a new lead</p>
            <button onClick={openNew} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">Add First Lead</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
              <span className="text-xs text-muted-foreground">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── DESKTOP TABLE (lg+) ── */}
            <div className="hidden lg:block border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="w-8 px-3 py-3">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lead</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone / Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Campaign</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`transition-colors ${selectedIds.has(lead.id) ? 'bg-primary/5' : 'bg-background hover:bg-card/60'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 accent-[#C5A47E] cursor-pointer"
                        />
                      </td>

                      {/* Lead name + agent */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Icon name="UserIcon" size={14} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{lead.name}</p>
                            {lead.assigned_agent && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Icon name="UserCircleIcon" size={10} className="text-primary flex-shrink-0" />
                                <span className="truncate max-w-[140px]">{lead.assigned_agent}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone / Email */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {lead.phone && <p className="text-xs text-foreground">{lead.phone}</p>}
                          {lead.email && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{lead.email}</p>}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3">
                        {lead.source ? (
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${sourceColors[lead.source] || 'text-muted-foreground'}`}>
                            {lead.source}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>

                      {/* Campaign */}
                      <td className="px-4 py-3">
                        {lead.campaign ? (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-2 py-0.5 whitespace-nowrap">
                            {lead.campaign}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 whitespace-nowrap ${statusColors[lead.status] || 'text-gray-400 bg-gray-400/10'}`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Edit / Delete */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(lead)}
                            className="px-2.5 py-1.5 border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="px-2 py-1.5 border border-red-400/20 text-[11px] text-red-400 hover:bg-red-400/5 transition-colors"
                          >
                            <Icon name="TrashIcon" size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS (below lg) ── */}
            <div className="space-y-2 lg:hidden">
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  className={`bg-card border overflow-hidden transition-colors ${selectedIds.has(lead.id) ? 'border-primary/40' : 'border-border hover:border-primary/30'}`}
                >
                  {/* Card top row */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-4 h-4 accent-[#C5A47E] cursor-pointer flex-shrink-0 mt-0.5"
                      />
                      <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="UserIcon" size={16} className="text-primary" />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Name + status row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{lead.name}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[lead.status] || 'text-gray-400 bg-gray-400/10'}`}>
                            {lead.status}
                          </span>
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {lead.email && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{lead.email}</p>}
                          {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                        </div>

                        {/* Tags row: source, project, campaign */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {lead.source && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sourceColors[lead.source] || 'text-muted-foreground'}`}>
                              {lead.source}
                            </span>
                          )}
                          {lead.project && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5">
                              {lead.project}
                            </span>
                          )}
                          {lead.campaign && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-2 py-0.5">
                              {lead.campaign}
                            </span>
                          )}
                        </div>

                        {/* Interest + budget */}
                        {lead.interest && <p className="text-xs text-primary truncate mt-1">{lead.interest}</p>}
                        {lead.budget && <p className="text-xs text-muted-foreground mt-0.5">Budget: {lead.budget}</p>}
                        {lead.assigned_agent && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Icon name="UserCircleIcon" size={11} className="text-primary" />
                            <span className="text-foreground font-medium">{lead.assigned_agent}</span>
                          </p>
                        )}
                      </div>

                      {/* Right side: date + actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : '—'}
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(lead)}
                            className="px-2.5 py-1.5 border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="px-2.5 py-1.5 border border-red-400/20 text-[11px] text-red-400 hover:bg-red-400/5 transition-colors"
                          >
                            <Icon name="TrashIcon" size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-[#0f1117] border border-[#2a3040] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] sm:mx-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3040]">
              <h2 className="text-base font-bold text-white">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                <div>
                  <label className={labelCls}>Source</label>
                  <select className={inputCls} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                    {['Website', 'Referral', 'Instagram', 'LinkedIn', 'Walk-in', 'Property Finder', 'Bayut', 'WhatsApp', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

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
                <div className="col-span-2">
                  <label className={labelCls}>Interest / Property</label>
                  <input className={inputCls} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} placeholder="e.g. 2BR in Downtown Dubai" />
                </div>

                {/* Project + Campaign side by side */}
                <div>
                  <label className={labelCls}>Project Enquired</label>
                  <input
                    className={inputCls}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="e.g. Emaar Beachfront"
                  />
                </div>
                <div>
                  <label className={labelCls}>Campaign</label>
                  <input
                    className={inputCls}
                    value={form.campaign}
                    onChange={(e) => setForm({ ...form, campaign: e.target.value })}
                    placeholder="e.g. Summer 2025"
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
                    {agentNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Follow-up Date</label>
                  <input type="date" className={inputCls} value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#2a3040]">
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
