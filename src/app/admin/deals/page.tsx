'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/contexts/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface Deal {
  id: string;
  refNo: string;
  property: string;
  propertyRef: string;
  lead: string;
  client: string;
  agent: string;
  value: number;
  commission: number;
  stage: string;
  type: string;
  date: string;
  notes?: string;
}

const stageColors: Record<string, string> = {
  Qualified: 'text-blue-400 bg-blue-400/10',
  Proposal: 'text-yellow-400 bg-yellow-400/10',
  Negotiation: 'text-orange-400 bg-orange-400/10',
  'Closed Won': 'text-emerald-400 bg-emerald-400/10',
  'Closed Lost': 'text-red-400 bg-red-400/10',
};

const stages = ['All', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

interface DealForm {
  propertyRef: string;
  property: string;
  lead: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  agent: string;
  value: string;
  commission: string;
  stage: string;
  type: string;
  closingDate: string;
  notes: string;
}

const emptyForm: DealForm = {
  propertyRef: '',
  property: '',
  lead: '',
  client: '',
  clientEmail: '',
  clientPhone: '',
  agent: '',
  value: '',
  commission: '',
  stage: 'Qualified',
  type: 'Sale',
  closingDate: '',
  notes: '',
};

function generateDealRef(count: number): string {
  const year = new Date().getFullYear();
  const next = count + 1;
  return `DL-${year}-${String(next).padStart(3, '0')}`;
}

export default function DealsPage() {
  const { currentUser, isAgentScoped } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [crmLeads, setCrmLeads] = useState<string[]>([]);
  const [crmAgents, setCrmAgents] = useState<string[]>([]);
  const [crmProperties, setCrmProperties] = useState<{ ref: string; name: string }[]>([]);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (isAgentScoped) {
      query = query.eq('agent', currentUser.name);
    }
    const { data } = await query;
    if (data) {
      setDeals(
        data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          refNo: (d.ref_no as string) || '',
          property: (d.property as string) || '',
          propertyRef: (d.property_ref as string) || '',
          lead: (d.lead as string) || '',
          client: (d.client as string) || '',
          agent: (d.agent as string) || '',
          value: (d.value as number) || 0,
          commission: (d.commission as number) || 0,
          stage: (d.stage as string) || 'Qualified',
          type: (d.type as string) || 'Sale',
          date: d.created_at
            ? new Date(d.created_at as string).toLocaleDateString()
            : '',
          notes: (d.notes as string) || '',
        }))
      );
    }
    setLoading(false);
  }, [supabase, isAgentScoped, currentUser.name]);

  useEffect(() => {
    loadDeals();

    (async () => {
      const { data: leads } = await supabase.from('leads').select('name');
      if (leads && leads.length > 0) {
        setCrmLeads(leads.map((l: { name: string }) => l.name).filter(Boolean));
      }

      const { data: agents } = await supabase.from('agents').select('name');
      if (agents && agents.length > 0) {
        setCrmAgents(agents.map((a: { name: string }) => a.name).filter(Boolean));
      }

      const { data: props } = await supabase.from('properties').select('id, title, reference_number');
      if (props && props.length > 0) {
        setCrmProperties(
          props.map((p: { id: string; title: string; reference_number: string }) => ({
            ref: p.reference_number || p.id,
            name: p.title || 'Unnamed Property',
          }))
        );
      }
    })();
  }, [loadDeals, supabase]);

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const filtered = deals.filter((d) => {
    const matchStage = filterStage === 'All' || d.stage === filterStage;
    const matchSearch = search === '' ||
      d.property.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase()) ||
      d.agent.toLowerCase().includes(search.toLowerCase()) ||
      d.refNo.toLowerCase().includes(search.toLowerCase()) ||
      d.lead.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const allSelected = filtered.length > 0 && filtered.every(d => selectedIds.has(d.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach(d => newSet.delete(d.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach(d => newSet.add(d.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    await supabase.from('deals').delete().in('id', Array.from(selectedIds));
    clearSelection();
    setDeleteConfirm(false);
    await loadDeals();
    showSaved();
  };

  const openNew = () => {
    setEditDeal(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setForm({
      propertyRef: deal.propertyRef,
      property: deal.property,
      lead: deal.lead,
      client: deal.client,
      clientEmail: '',
      clientPhone: '',
      agent: deal.agent,
      value: String(deal.value),
      commission: String(deal.commission),
      stage: deal.stage,
      type: deal.type,
      closingDate: '',
      notes: deal.notes || '',
    });
    setShowModal(true);
  };

  const handlePropertyRefChange = (ref: string) => {
    const prop = crmProperties.find((p) => p.ref === ref);
    setForm((f) => ({ ...f, propertyRef: ref, property: prop?.name || '' }));
  };

  const handleLeadChange = (lead: string) => {
    setForm((f) => ({ ...f, lead, client: lead }));
  };

  const handleSave = async () => {
    if (!form.propertyRef || !form.lead) return;
    const valueNum = parseInt(form.value) || 0;
    const commissionNum = parseInt(form.commission) || 0;

    if (editDeal) {
      await supabase
        .from('deals')
        .update({
          property: form.property,
          property_ref: form.propertyRef,
          lead: form.lead,
          client: form.client,
          client_email: form.clientEmail || null,
          client_phone: form.clientPhone || null,
          agent: form.agent,
          value: valueNum,
          commission: commissionNum,
          stage: form.stage,
          type: form.type,
          closing_date: form.closingDate || null,
          notes: form.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editDeal.id);
    } else {
      const refNo = generateDealRef(deals.length);
      await supabase.from('deals').insert({
        ref_no: refNo,
        property: form.property,
        property_ref: form.propertyRef,
        lead: form.lead,
        client: form.client,
        client_email: form.clientEmail || null,
        client_phone: form.clientPhone || null,
        agent: form.agent,
        value: valueNum,
        commission: commissionNum,
        stage: form.stage,
        type: form.type,
        closing_date: form.closingDate || null,
        notes: form.notes,
      });
    }
    await loadDeals();
    setShowModal(false);
    setForm(emptyForm);
    showSaved();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('deals').delete().eq('id', id);
    await loadDeals();
    showSaved();
  };

  const totalValue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((s, d) => s + d.value, 0);

  const pipelineValue = deals
    .filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deals.length} deals in pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-emerald-400 font-semibold">✓ Saved</span>}
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Deals', value: deals.length.toString(), icon: 'BriefcaseIcon' },
          { label: 'Pipeline Value', value: `AED ${(pipelineValue / 1000000).toFixed(1)}M`, icon: 'FunnelIcon' },
          { label: 'Closed Won', value: deals.filter((d) => d.stage === 'Closed Won').length.toString(), icon: 'CheckCircleIcon' },
          { label: 'Revenue Closed', value: `AED ${(totalValue / 1000000).toFixed(1)}M`, icon: 'CurrencyDollarIcon' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={s.icon as any} size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search deals, ref no, leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center border border-border overflow-hidden">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterStage === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Icon name="TrashIcon" size={13} />Delete Selected
          </button>
          <button onClick={clearSelection} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
              </th>
              {['Deal Ref', 'Property Ref', 'Property', 'Lead / Client', 'Agent', 'Value', 'Stage', 'Type', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal, i) => (
              <tr key={deal.id} className={`border-b border-border hover:bg-white/2 transition-colors ${selectedIds.has(deal.id) ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(deal.id)} onChange={() => toggleSelect(deal.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-bold text-primary">{deal.refNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-muted-foreground">{deal.property}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{deal.property}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{deal.client}</p>
                  <p className="text-xs text-muted-foreground">Lead: {deal.lead}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{deal.agent}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">AED {deal.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">AED {deal.commission.toLocaleString()}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${stageColors[deal.stage] || ''}`}>{deal.stage}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{deal.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{deal.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(deal)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                    <button onClick={() => handleDelete(deal.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {loading ? 'Loading deals...' : 'No deals found'}
          </div>
        )}
      </div>

      {/* Bulk Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Deals</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} deal(s) will be deleted</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">{editDeal ? 'Edit Deal' : 'New Deal'}</h2>
                {!editDeal && (
                  <p className="text-xs text-muted-foreground mt-0.5">Ref will be auto-generated: <span className="text-primary font-mono">{generateDealRef(deals.length)}</span></p>
                )}
                {editDeal && (
                  <p className="text-xs text-muted-foreground mt-0.5">Ref: <span className="text-primary font-mono">{editDeal.refNo}</span></p>
                )}
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Property Reference */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Property Reference <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.propertyRef}
                  onChange={(e) => handlePropertyRefChange(e.target.value)}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select Property...</option>
                  {crmProperties.map((p) => (
                    <option key={p.ref} value={p.ref}>{p.name}</option>
                  ))}
                </select>
              </div>

              {form.property && (
                <div className="bg-primary/5 border border-primary/20 px-3 py-2 flex items-center gap-2">
                  <Icon name="HomeIcon" size={14} className="text-primary" />
                  <span className="text-xs text-foreground">{form.property}</span>
                </div>
              )}

              {/* Lead */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Lead <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.lead}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select Lead...</option>
                  {crmLeads.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Email</label>
                  <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="client@email.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Phone</label>
                  <input type="text" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="+971 50 000 0000" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Assigned Agent</label>
                <select value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select Agent...</option>
                  {crmAgents.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Deal Value (AED)</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Commission (AED)</label>
                  <input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                    {['Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                    {['Sale', 'Off-Plan', 'Rental', 'Commercial'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Closing Date</label>
                <input type="date" value={form.closingDate} onChange={(e) => setForm({ ...form, closingDate: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" placeholder="Deal notes..." />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!form.propertyRef || !form.lead}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editDeal ? 'Save Changes' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
