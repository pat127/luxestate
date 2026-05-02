'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Deal {
  id: number;
  refNo: string;
  property: string;
  propertyRef: string;
  lead: string;
  client: string;
  agent: string;
  value: string;
  commission: string;
  stage: string;
  type: string;
  date: string;
  notes?: string;
}

const initialDeals: Deal[] = [
  { id: 1, refNo: 'DL-2026-001', property: 'Obsidian Penthouse', propertyRef: 'LX-RES-001', lead: 'James Harrington', client: 'James Harrington', agent: 'Sarah Mitchell', value: 'AED 28,500,000', commission: 'AED 570,000', stage: 'Negotiation', type: 'Sale', date: '2 days ago', notes: 'Client wants to close by end of month' },
  { id: 2, refNo: 'DL-2026-002', property: 'Atlas Tower Office', propertyRef: 'LX-COM-002', lead: 'Sofia Al-Rashid', client: 'Sofia Al-Rashid', agent: 'Omar Hassan', value: 'AED 12,000,000', commission: 'AED 240,000', stage: 'Proposal', type: 'Sale', date: '5 days ago', notes: '' },
  { id: 3, refNo: 'DL-2026-003', property: 'Marina Bay Unit 12B', propertyRef: 'LX-RES-003', lead: 'Marcus Chen', client: 'Marcus Chen', agent: 'James Carter', value: 'AED 2,400,000', commission: 'AED 48,000', stage: 'Closed Won', type: 'Sale', date: '1 week ago', notes: 'Deal closed successfully' },
  { id: 4, refNo: 'DL-2026-004', property: 'Meridian Villa', propertyRef: 'LX-RES-004', lead: 'Priya Sharma', client: 'Priya Sharma', agent: 'Sarah Mitchell', value: 'AED 42,000,000', commission: 'AED 840,000', stage: 'Qualified', type: 'Sale', date: '2 weeks ago', notes: '' },
  { id: 5, refNo: 'DL-2026-005', property: 'Creek Horizon Unit 5A', propertyRef: 'LX-OP-005', lead: 'David Okonkwo', client: 'David Okonkwo', agent: 'Priya Sharma', value: 'AED 1,800,000', commission: 'AED 36,000', stage: 'Closed Lost', type: 'Off-Plan', date: '3 weeks ago', notes: 'Client went with competitor' },
];

const mockProperties = [
  { ref: 'LX-RES-001', name: 'Obsidian Penthouse' },
  { ref: 'LX-COM-002', name: 'Atlas Tower Office' },
  { ref: 'LX-RES-003', name: 'Marina Bay Unit 12B' },
  { ref: 'LX-RES-004', name: 'Meridian Villa' },
  { ref: 'LX-OP-005', name: 'Creek Horizon Unit 5A' },
  { ref: 'LX-RES-006', name: 'Palm Grove Villa' },
  { ref: 'LX-COM-007', name: 'DIFC Office Suite' },
];

const mockLeads = [
  'Alexander Webb', 'Natasha Ivanova', 'Omar Al-Farsi', 'Emily Thornton',
  'Raj Patel', 'Chloe Beaumont', 'James Harrington', 'Sofia Al-Rashid',
  'Marcus Chen', 'Priya Sharma', 'David Okonkwo',
];

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

function generateDealRef(deals: Deal[]): string {
  const year = new Date().getFullYear();
  const next = deals.length + 1;
  return `DL-${year}-${String(next).padStart(3, '0')}`;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [filterStage, setFilterStage] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState<DealForm>(emptyForm);

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
      value: deal.value.replace('AED ', '').replace(/,/g, ''),
      commission: deal.commission.replace('AED ', '').replace(/,/g, ''),
      stage: deal.stage,
      type: deal.type,
      closingDate: '',
      notes: deal.notes || '',
    });
    setShowModal(true);
  };

  const handlePropertyRefChange = (ref: string) => {
    const prop = mockProperties.find((p) => p.ref === ref);
    setForm((f) => ({ ...f, propertyRef: ref, property: prop?.name || '' }));
  };

  const handleLeadChange = (lead: string) => {
    setForm((f) => ({ ...f, lead, client: lead }));
  };

  const handleSave = () => {
    if (!form.propertyRef || !form.lead) return;
    const fmtVal = form.value ? `AED ${parseInt(form.value).toLocaleString()}` : 'AED 0';
    const fmtComm = form.commission ? `AED ${parseInt(form.commission).toLocaleString()}` : 'AED 0';
    if (editDeal) {
      setDeals(deals.map((d) =>
        d.id === editDeal.id
          ? { ...d, propertyRef: form.propertyRef, property: form.property, lead: form.lead, client: form.client, agent: form.agent, value: fmtVal, commission: fmtComm, stage: form.stage, type: form.type, notes: form.notes }
          : d
      ));
    } else {
      const newDeal: Deal = {
        id: Date.now(),
        refNo: generateDealRef(deals),
        propertyRef: form.propertyRef,
        property: form.property,
        lead: form.lead,
        client: form.client,
        agent: form.agent,
        value: fmtVal,
        commission: fmtComm,
        stage: form.stage,
        type: form.type,
        date: 'Just now',
        notes: form.notes,
      };
      setDeals([newDeal, ...deals]);
    }
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: number) => {
    setDeals(deals.filter((d) => d.id !== id));
  };

  const totalValue = deals.filter((d) => d.stage === 'Closed Won').reduce((s, d) => {
    const n = parseInt(d.value.replace(/[^0-9]/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const pipelineValue = deals.filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => {
    const n = parseInt(d.value.replace(/[^0-9]/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deals.length} deals in pipeline</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          New Deal
        </button>
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

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              {['Deal Ref', 'Property Ref', 'Property', 'Lead / Client', 'Agent', 'Value', 'Stage', 'Type', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal, i) => (
              <tr key={deal.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-bold text-primary">{deal.refNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-muted-foreground">{deal.propertyRef}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{deal.property}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{deal.client}</p>
                  <p className="text-xs text-muted-foreground">Lead: {deal.lead}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{deal.agent}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{deal.value}</p>
                  <p className="text-xs text-muted-foreground">{deal.commission}</p>
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
          <div className="text-center py-12 text-muted-foreground text-sm">No deals found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">{editDeal ? 'Edit Deal' : 'New Deal'}</h2>
                {!editDeal && (
                  <p className="text-xs text-muted-foreground mt-0.5">Ref will be auto-generated: <span className="text-primary font-mono">{generateDealRef(deals)}</span></p>
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
                  {mockProperties.map((p) => (
                    <option key={p.ref} value={p.ref}>{p.ref} — {p.name}</option>
                  ))}
                </select>
              </div>

              {form.property && (
                <div className="bg-primary/5 border border-primary/20 px-3 py-2 flex items-center gap-2">
                  <Icon name="HomeIcon" size={14} className="text-primary" />
                  <span className="text-xs text-foreground">{form.property}</span>
                  <span className="text-xs font-mono text-primary ml-auto">{form.propertyRef}</span>
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
                  {mockLeads.map((l) => (
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
                  {['Sarah Mitchell', 'Omar Hassan', 'James Carter', 'Priya Sharma'].map((a) => (
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
