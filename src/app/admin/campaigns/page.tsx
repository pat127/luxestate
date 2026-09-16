'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  channel: string;
  status: string;
  subject: string | null;
  audience: string | null;
  budget: number;
  spent: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface CampaignForm {
  name: string;
  description: string;
  channel: string;
  status: string;
  subject: string;
  audience: string;
  budget: string;
  spent: string;
  startDate: string;
  endDate: string;
}

const emptyForm: CampaignForm = {
  name: '',
  description: '',
  channel: 'Email',
  status: 'Draft',
  subject: '',
  audience: '',
  budget: '',
  spent: '',
  startDate: '',
  endDate: '',
};

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Completed: 'text-blue-400 bg-blue-400/10',
  Draft: 'text-muted-foreground bg-muted/50',
  Paused: 'text-yellow-400 bg-yellow-400/10',
  Scheduled: 'text-primary bg-primary/10',
};

const channelColors: Record<string, string> = {
  Email: 'text-primary bg-primary/10',
  Social: 'text-pink-400 bg-pink-400/10',
  WhatsApp: 'text-emerald-400 bg-emerald-400/10',
  SMS: 'text-blue-400 bg-blue-400/10',
};

export default function CampaignsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('id, name, description, channel, status, subject, audience, budget, spent, start_date, end_date, created_at')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const openNew = () => {
    setEditCampaign(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Campaign) => {
    setEditCampaign(c);
    setForm({
      name: c.name,
      description: c.description || '',
      channel: c.channel,
      status: c.status,
      subject: c.subject || '',
      audience: c.audience || '',
      budget: String(c.budget || ''),
      spent: String(c.spent || ''),
      startDate: c.start_date || '',
      endDate: c.end_date || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      channel: form.channel,
      status: form.status,
      subject: form.subject.trim() || null,
      audience: form.audience.trim() || null,
      budget: parseInt(form.budget) || 0,
      spent: parseInt(form.spent) || 0,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      updated_at: new Date().toISOString(),
    };

    if (editCampaign) {
      await supabase.from('campaigns').update(payload).eq('id', editCampaign.id);
    } else {
      await supabase.from('campaigns').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    await loadCampaigns();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('campaigns').delete().eq('id', id);
    setDeleteConfirmId(null);
    await loadCampaigns();
  };

  const filtered = campaigns.filter((c) => {
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your marketing campaign portfolio</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Campaigns', value: campaigns.length.toString(), icon: 'MegaphoneIcon' },
          { label: 'Active', value: activeCampaigns.toString(), icon: 'PlayIcon' },
          { label: 'Total Budget', value: `AED ${totalBudget.toLocaleString()}`, icon: 'CurrencyDollarIcon' },
          { label: 'Total Spent', value: `AED ${totalSpent.toLocaleString()}`, icon: 'BanknotesIcon' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={s.icon as any} size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          {['All', 'Draft', 'Active', 'Scheduled', 'Paused', 'Completed'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Loading campaigns...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Icon name="MegaphoneIcon" size={32} className="mb-2 opacity-30" />
          <p className="text-sm">No campaigns found</p>
          <button onClick={openNew} className="mt-3 text-xs text-primary hover:underline">Create your first campaign</button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-card border border-border overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {['Campaign', 'Channel', 'Status', 'Budget', 'Spent', 'Utilization', 'Dates', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const pct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
                  return (
                    <tr key={c.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{c.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${channelColors[c.channel] || ''}`}>{c.channel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[c.status] || ''}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">AED {(c.budget || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-foreground">AED {(c.spent || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-secondary overflow-hidden">
                            <div
                              className={`h-full transition-all duration-700 ${pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.start_date && <span>{c.start_date}</span>}
                        {c.start_date && c.end_date && <span className="mx-1">→</span>}
                        {c.end_date && <span>{c.end_date}</span>}
                        {!c.start_date && !c.end_date && <span>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                            <Icon name="PencilIcon" size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                            <Icon name="TrashIcon" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => {
              const pct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
              return (
                <div key={c.id} className="bg-card border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Icon name="PencilIcon" size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 text-muted-foreground hover:text-red-400">
                        <Icon name="TrashIcon" size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${channelColors[c.channel] || ''}`}>{c.channel}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[c.status] || ''}`}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground">AED {(c.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-semibold text-foreground">AED {(c.spent || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  {(c.start_date || c.end_date) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.start_date || '—'} → {c.end_date || '—'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-card border border-border w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-base font-bold text-foreground">{editCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Campaign Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="e.g. Summer 2026 Launch"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  placeholder="Campaign goals, target audience, key messages..."
                />
              </div>

              {/* Channel + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Channel</label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {['Email', 'Social', 'WhatsApp', 'SMS'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {['Draft', 'Scheduled', 'Active', 'Paused', 'Completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Subject / Title</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="Email subject or campaign headline..."
                />
              </div>

              {/* Audience */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Audience</label>
                <input
                  type="text"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="e.g. HNW Investors, All Leads..."
                />
              </div>

              {/* Budget + Spent */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Budget (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Amount Spent (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.spent}
                    onChange={(e) => setForm({ ...form, spent: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editCampaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-400/10 flex items-center justify-center flex-shrink-0">
                <Icon name="TrashIcon" size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Delete Campaign</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
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
