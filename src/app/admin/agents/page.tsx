'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  leads: number;
  deals: number;
  commission: string;
  joined: string;
  nationality?: string;
  languages?: string[];
  specialization?: string;
  licenseNo?: string;
}

const initialAgents: Agent[] = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah@luxestate.com', phone: '+971 50 100 2000', role: 'Senior Agent', status: 'Active', leads: 45, deals: 12, commission: 'AED 280,000', joined: 'Jan 2022', nationality: 'British', languages: ['English', 'French'], specialization: 'Luxury Residential', licenseNo: 'RERA-12345' },
  { id: 2, name: 'James Carter', email: 'james@luxestate.com', phone: '+971 55 200 3000', role: 'Agent', status: 'Active', leads: 32, deals: 8, commission: 'AED 190,000', joined: 'Mar 2022', nationality: 'American', languages: ['English'], specialization: 'Off-Plan', licenseNo: 'RERA-23456' },
  { id: 3, name: 'Omar Hassan', email: 'omar@luxestate.com', phone: '+971 52 300 4000', role: 'Senior Agent', status: 'Active', leads: 58, deals: 15, commission: 'AED 420,000', joined: 'Sep 2021', nationality: 'Emirati', languages: ['Arabic', 'English'], specialization: 'Commercial', licenseNo: 'RERA-34567' },
  { id: 4, name: 'Priya Sharma', email: 'priya@luxestate.com', phone: '+971 56 400 5000', role: 'Junior Agent', status: 'Active', leads: 18, deals: 4, commission: 'AED 85,000', joined: 'Jun 2023', nationality: 'Indian', languages: ['English', 'Hindi'], specialization: 'Residential', licenseNo: 'RERA-45678' },
  { id: 5, name: 'Lucas Fontaine', email: 'lucas@luxestate.com', phone: '+971 58 500 6000', role: 'Agent', status: 'Inactive', leads: 22, deals: 6, commission: 'AED 140,000', joined: 'Nov 2022', nationality: 'French', languages: ['French', 'English'], specialization: 'Luxury Residential', licenseNo: 'RERA-56789' },
];

const roleColors: Record<string, string> = {
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
  status: string;
  nationality: string;
  languages: string;
  specialization: string;
  licenseNo: string;
  bio: string;
}

const emptyForm: AgentForm = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  role: 'Agent',
  status: 'Active',
  nationality: '',
  languages: '',
  specialization: '',
  licenseNo: '',
  bio: '',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [showModal, setShowModal] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState<AgentForm>(emptyForm);
  const [search, setSearch] = useState('');

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

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
      status: agent.status,
      nationality: agent.nationality || '',
      languages: (agent.languages || []).join(', '),
      specialization: agent.specialization || '',
      licenseNo: agent.licenseNo || '',
      bio: '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    const langs = form.languages.split(',').map(l => l.trim()).filter(Boolean);
    if (editAgent) {
      setAgents(agents.map(a => a.id === editAgent.id ? { ...a, name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status, nationality: form.nationality, languages: langs, specialization: form.specialization, licenseNo: form.licenseNo } : a));
    } else {
      setAgents([...agents, { id: Date.now(), name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status, leads: 0, deals: 0, commission: 'AED 0', joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), nationality: form.nationality, languages: langs, specialization: form.specialization, licenseNo: form.licenseNo }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{agents.length} team members</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          Add Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Agents', value: agents.length.toString(), icon: 'UsersIcon' },
          { label: 'Active', value: agents.filter(a => a.status === 'Active').length.toString(), icon: 'CheckCircleIcon' },
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

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              {['Agent', 'Role', 'Status', 'Specialization', 'License', 'Leads', 'Deals', 'Commission', 'Joined', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((agent, i) => (
              <tr key={agent.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
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
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${agent.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-muted-foreground bg-muted/50'}`}>{agent.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{agent.specialization || '—'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{agent.licenseNo || '—'}</td>
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
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No agents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
                    <option>Junior Agent</option><option>Agent</option><option>Senior Agent</option><option>Team Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
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
                <input type="text" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="RERA-XXXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Agent bio for website profile..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editAgent ? 'Update Agent' : 'Save Agent'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
