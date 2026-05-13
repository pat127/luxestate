'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  agent_status: string;
  leads: number;
  deals: number;
  commission: string;
  joined: string;
  nationality?: string;
  languages?: string[];
  specialization?: string;
  license_no?: string;
  bio?: string;
}

const roleColors: Record<string, string> = {
  'CEO / Senior Agent': 'text-yellow-400 bg-yellow-400/10',
  'Senior Agent': 'text-primary bg-primary/10',
  'Agent': 'text-blue-400 bg-blue-400/10',
  'Junior Agent': 'text-muted-foreground bg-muted/50',
  'Team Lead': 'text-purple-400 bg-purple-400/10',
};

interface AgentForm {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  agent_status: string;
  nationality: string;
  languages: string;
  specialization: string;
  license_no: string;
  bio: string;
}

const emptyForm: AgentForm = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  role: 'Agent',
  agent_status: 'Active',
  nationality: '',
  languages: '',
  specialization: '',
  license_no: '',
  bio: '',
};

export default function AgentsPage() {
  const supabase = createClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState<AgentForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('agents').select('*').order('created_at', { ascending: true });
    if (data) setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadAgents();
  }, [loadAgents]);

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach(a => newSet.delete(a.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach(a => newSet.add(a.id));
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
    await supabase.from('agents').delete().in('id', Array.from(selectedIds));
    setDeleteConfirm(false);
    clearSelection();
    showSaved();
    loadAgents();
  };

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const openNew = () => {
    setEditAgent(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (agent: Agent) => {
    setEditAgent(agent);
    setForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      whatsapp: '',
      role: agent.role,
      agent_status: agent.agent_status,
      nationality: agent.nationality || '',
      languages: (agent.languages || []).join(', '),
      specialization: agent.specialization || '',
      license_no: agent.license_no || '',
      bio: agent.bio || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    const langs = form.languages.split(',').map(l => l.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      agent_status: form.agent_status,
      nationality: form.nationality,
      languages: langs,
      specialization: form.specialization,
      license_no: form.license_no,
      bio: form.bio,
    };

    if (editAgent) {
      await supabase.from('agents').update(payload).eq('id', editAgent.id);
    } else {
      await supabase.from('agents').insert({
        ...payload,
        leads: 0,
        deals: 0,
        commission: 'AED 0',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
    }
    setSaving(false);
    setShowModal(false);
    showSaved();
    loadAgents();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('agents').delete().eq('id', id);
    showSaved();
    loadAgents();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{agents.length} team members</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-emerald-400 font-semibold">✓ Saved</span>}
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Agents', value: agents.length.toString(), icon: 'UsersIcon' },
          { label: 'Active', value: agents.filter(a => a.agent_status === 'Active').length.toString(), icon: 'CheckCircleIcon' },
          { label: 'Total Deals', value: agents.reduce((s, a) => s + a.deals, 0).toString(), icon: 'BriefcaseIcon' },
          { label: 'Total Leads', value: agents.reduce((s, a) => s + a.leads, 0).toString(), icon: 'UserPlusIcon' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={stat.icon as any} size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
                </th>
                {['Agent', 'Role', 'Status', 'Specialization', 'License', 'Leads', 'Deals', 'Commission', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent, i) => (
                <tr key={agent.id} className={`border-b border-border hover:bg-white/2 transition-colors ${selectedIds.has(agent.id) ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(agent.id)} onChange={() => toggleSelect(agent.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">{agent.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${roleColors[agent.role] || ''}`}>{agent.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${agent.agent_status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-muted-foreground bg-muted/50'}`}>{agent.agent_status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{agent.specialization || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{agent.license_no || '—'}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-semibold">{agent.leads}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-semibold">{agent.deals}</td>
                  <td className="px-4 py-3 text-sm text-primary font-semibold">{agent.commission}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{agent.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(agent)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                      <button onClick={() => handleDelete(agent.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">No agents found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {deleteConfirm && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Agents</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} agent(s) will be deleted</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Agent Modal */}
      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editAgent ? 'Edit Agent' : 'Add New Agent'}</h2>
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
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="email@luxestate.com" />
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
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>CEO / Senior Agent</option><option>Junior Agent</option><option>Agent</option><option>Senior Agent</option><option>Team Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.agent_status} onChange={(e) => setForm({ ...form, agent_status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Specialization</label>
                <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option value="">Select specialization</option>
                  <option>Luxury Residential</option><option>Off-Plan</option><option>Commercial</option><option>Residential</option><option>Investment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Languages (comma-separated)</label>
                <input type="text" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. English, Arabic, French" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">RERA License No.</label>
                <input type="text" value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="RERA-XXXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Agent bio for website profile..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">{saving ? 'Saving...' : editAgent ? 'Update Agent' : 'Save Agent'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
