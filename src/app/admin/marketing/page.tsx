'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  subject: string;
  audience: string;
  sent: number;
  opens: number;
  clicks: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ScheduledCampaign {
  id: string;
  name: string;
  channel: string;
  scheduled_date: string;
  audience: string;
  status: string;
  budget: number;
  created_at: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Completed: 'text-blue-400 bg-blue-400/10',
  Draft: 'text-muted-foreground bg-muted/50',
  Paused: 'text-yellow-400 bg-yellow-400/10',
  Scheduled: 'text-primary bg-primary/10',
  Planned: 'text-purple-400 bg-purple-400/10',
};

const channelColors: Record<string, string> = {
  Email: 'text-primary bg-primary/10',
  Social: 'text-pink-400 bg-pink-400/10',
  WhatsApp: 'text-emerald-400 bg-emerald-400/10',
  SMS: 'text-blue-400 bg-blue-400/10',
};

interface CampaignForm {
  name: string;
  channel: string;
  status: string;
  subject: string;
  audience: string;
  startDate: string;
  endDate: string;
  content: string;
  budget: string;
}

const emptyForm: CampaignForm = {
  name: '',
  channel: 'Email',
  status: 'Draft',
  subject: '',
  audience: '',
  startDate: '',
  endDate: '',
  content: '',
  budget: '',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color || p.fill }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('AED') ? `AED ${p.value.toLocaleString()}` : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MarketingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'budget' | 'scheduler' | 'analytics'>('campaigns');
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);

  const [totalBudget, setTotalBudget] = useState(100000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [budgetMonthlyData, setBudgetMonthlyData] = useState<{ month: string; budget: number; spent: number; leads: number }[]>([]);

  const loadCampaigns = useCallback(async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data);
  }, [supabase]);

  const loadScheduled = useCallback(async () => {
    const { data } = await supabase.from('scheduled_campaigns').select('*').order('scheduled_date', { ascending: true });
    if (data) setScheduled(data);
  }, [supabase]);

  const loadBudget = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('data').eq('key', 'marketing_budget').single();
    if (data?.data && typeof data.data === 'number') setTotalBudget(data.data);
  }, [supabase]);

  const saveBudget = useCallback(async (amount: number) => {
    setTotalBudget(amount);
    await supabase.from('site_settings').upsert(
      { key: 'marketing_budget', data: amount, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
  }, [supabase]);

  const loadMonthlyData = useCallback(async () => {
    const { data: allCampaigns } = await supabase.from('campaigns').select('budget, spent, start_date, created_at');
    const { data: allLeads } = await supabase.from('leads').select('created_at');

    const monthMap: Record<string, { budget: number; spent: number; leads: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { budget: 0, spent: 0, leads: 0 };
    }

    (allCampaigns || []).forEach((c: any) => {
      const dateStr = c.start_date || c.created_at;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      if (monthMap[key]) {
        monthMap[key].budget += c.budget || 0;
        monthMap[key].spent += c.spent || 0;
      }
    });

    (allLeads || []).forEach((l: any) => {
      if (!l.created_at) return;
      const key = l.created_at.substring(0, 7);
      if (monthMap[key]) monthMap[key].leads += 1;
    });

    const result = Object.entries(monthMap).map(([key, val]) => ({
      month: MONTH_NAMES[parseInt(key.split('-')[1]) - 1],
      ...val,
    }));
    setBudgetMonthlyData(result);
  }, [supabase]);

  useEffect(() => {
    loadCampaigns();
    loadScheduled();
    loadBudget();
    loadMonthlyData();
  }, [loadCampaigns, loadScheduled, loadBudget, loadMonthlyData]);

  const openNew = () => {
    setEditCampaign(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Campaign) => {
    setEditCampaign(c);
    setForm({ name: c.name, channel: c.channel, status: c.status, subject: c.subject || '', audience: c.audience || '', startDate: c.start_date || '', endDate: c.end_date || '', content: c.content || '', budget: String(c.budget) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editCampaign) {
      await supabase.from('campaigns').update({
        name: form.name, channel: form.channel, status: form.status, subject: form.subject,
        audience: form.audience, budget: parseInt(form.budget) || 0, start_date: form.startDate || null,
        end_date: form.endDate || null, content: form.content,
      }).eq('id', editCampaign.id);
    } else if (form.status === 'Scheduled' || form.status === 'Planned') {
      await supabase.from('scheduled_campaigns').insert({
        name: form.name, channel: form.channel, status: form.status,
        audience: form.audience, budget: parseInt(form.budget) || 0,
        scheduled_date: form.startDate || null,
      });
      await loadScheduled();
    } else {
      await supabase.from('campaigns').insert({
        name: form.name, channel: form.channel, status: form.status, subject: form.subject,
        audience: form.audience, budget: parseInt(form.budget) || 0, start_date: form.startDate || null,
        end_date: form.endDate || null, content: form.content,
      });
      await loadCampaigns();
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('campaigns').delete().eq('id', id);
    await loadCampaigns();
  };

  const handleDeleteScheduled = async (id: string) => {
    await supabase.from('scheduled_campaigns').delete().eq('id', id);
    await loadScheduled();
  };

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalAllocated = campaigns.reduce((s, c) => s + c.budget, 0);
  const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Campaigns, budget management & scheduler</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
          <Icon name="PlusIcon" size={14} />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'Active').length.toString(), icon: 'MegaphoneIcon' },
          { label: 'Total Budget', value: `AED ${(totalBudget / 1000).toFixed(0)}K`, icon: 'CurrencyDollarIcon' },
          { label: 'Total Spent', value: `AED ${(totalSpent / 1000).toFixed(1)}K`, icon: 'BanknotesIcon' },
          { label: 'Budget Used', value: `${budgetUtilization}%`, icon: 'ChartBarIcon' },
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

      {/* Tabs */}
      <div className="flex items-center border-b border-border mb-6">
        {[
          { id: 'campaigns', label: 'Campaigns' },
          { id: 'budget', label: 'Budget Management' },
          { id: 'scheduler', label: 'Campaign Scheduler' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                {['Campaign', 'Channel', 'Status', 'Budget', 'Spent', 'Sent', 'Opens', 'Clicks', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => {
                const roi = c.spent > 0 ? ((c.clicks / c.spent) * 1000).toFixed(1) : '—';
                return (
                  <tr key={c.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      {c.subject && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{c.subject}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${channelColors[c.channel] || ''}`}>{c.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[c.status] || ''}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">AED {c.budget.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground">AED {c.spent.toLocaleString()}</p>
                      <div className="w-16 h-1 bg-secondary mt-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min((c.spent / c.budget) * 100, 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.opens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Budget Management Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Annual Marketing Budget</h3>
              <button
                onClick={() => { setNewBudget(totalBudget.toString()); setShowBudgetModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <Icon name="PencilIcon" size={12} />
                Edit Budget
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">AED {totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Allocated to Campaigns</p>
                <p className="text-2xl font-bold text-primary">AED {totalAllocated.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                <p className="text-2xl font-bold text-emerald-400">AED {(totalBudget - totalAllocated).toLocaleString()}</p>
              </div>
            </div>
            <div className="h-3 bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{((totalAllocated / totalBudget) * 100).toFixed(1)}% of budget allocated</p>
          </div>

          {/* Per Campaign Budget */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Campaign Budget Breakdown</h3>
            <div className="space-y-3">
              {campaigns.map((c) => {
                const pct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
                return (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="w-40 flex-shrink-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${channelColors[c.channel] || ''}`}>{c.channel}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>AED {c.spent.toLocaleString()} spent</span>
                        <span>AED {c.budget.toLocaleString()} budget</span>
                      </div>
                      <div className="h-2 bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-primary'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground w-12 text-right flex-shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget vs Leads Chart */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Monthly Budget vs Leads Generated</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="budget" name="Budget (AED)" fill="#2A2A2A" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="left" dataKey="spent" name="Spent (AED)" fill="#C9A84C" radius={[2, 2, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#8B6914" strokeWidth={2} dot={{ fill: '#8B6914', r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Campaign Scheduler Tab */}
      {activeTab === 'scheduler' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Upcoming & Planned Campaigns</h3>
            <button
              onClick={() => { setForm({ ...emptyForm, status: 'Scheduled' }); setEditCampaign(null); setShowModal(true); }}
              className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Icon name="PlusIcon" size={12} />
              Schedule Campaign
            </button>
          </div>

          {/* Calendar-style timeline */}
          <div className="bg-card border border-border p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">June 2026 Schedule</h4>
            <div className="space-y-3">
              {scheduled.map((sc) => (
                <div key={sc.id} className="flex items-center gap-4 p-3 border border-border hover:border-primary/30 transition-colors">
                  <div className="w-16 text-center flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{new Date(sc.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-primary">{new Date(sc.scheduled_date).getDate()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{sc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${channelColors[sc.channel] || ''}`}>{sc.channel}</span>
                      <span className="text-xs text-muted-foreground">→ {sc.audience}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-foreground">AED {sc.budget.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${statusColors[sc.status] || ''}`}>{sc.status}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteScheduled(sc.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Icon name="TrashIcon" size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gantt-style view */}
          <div className="bg-card border border-border p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Active Campaign Timeline</h4>
            <div className="space-y-3">
              {campaigns.filter((c) => c.status === 'Active' && c.start_date && c.end_date).map((c) => {
                const start = new Date(c.start_date);
                const end = new Date(c.end_date);
                const now = new Date('2026-05-01');
                const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const progress = Math.min((elapsed / totalDays) * 100, 100);
                return (
                  <div key={c.id} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-40 flex-shrink-0 truncate">{c.name}</span>
                    <div className="flex-1 h-6 bg-secondary overflow-hidden relative">
                      <div className="h-full bg-primary/30 absolute inset-0" />
                      <div className="h-full bg-primary absolute left-0 top-0 transition-all duration-700" style={{ width: `${progress}%` }} />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-foreground">{progress.toFixed(0)}% elapsed</span>
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right flex-shrink-0">{c.end_date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Sent', value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString(), icon: 'PaperAirplaneIcon' },
              { label: 'Total Opens', value: campaigns.reduce((s, c) => s + c.opens, 0).toLocaleString(), icon: 'EyeIcon' },
              { label: 'Total Clicks', value: campaigns.reduce((s, c) => s + c.clicks, 0).toLocaleString(), icon: 'CursorArrowRaysIcon' },
              { label: 'Avg Open Rate', value: `${(campaigns.filter((c) => c.sent > 0).reduce((s, c) => s + (c.opens / c.sent) * 100, 0) / Math.max(campaigns.filter((c) => c.sent > 0).length, 1)).toFixed(1)}%`, icon: 'ArrowTrendingUpIcon' },
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

          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Campaign Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Campaign', 'Channel', 'Open Rate', 'Click Rate', 'Cost per Click', 'ROI'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.filter((c) => c.sent > 0 || c.opens > 0).map((c, i) => {
                    const openRate = c.sent > 0 ? ((c.opens / c.sent) * 100).toFixed(1) : '—';
                    const clickRate = c.opens > 0 ? ((c.clicks / c.opens) * 100).toFixed(1) : '—';
                    const cpc = c.clicks > 0 ? `AED ${(c.spent / c.clicks).toFixed(0)}` : '—';
                    const roi = c.spent > 0 ? `${((c.clicks * 500 - c.spent) / c.spent * 100).toFixed(0)}%` : '—';
                    return (
                      <tr key={c.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{c.name}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${channelColors[c.channel] || ''}`}>{c.channel}</span></td>
                        <td className="px-4 py-3 text-sm text-foreground">{openRate}{openRate !== '—' ? '%' : ''}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{clickRate}{clickRate !== '—' ? '%' : ''}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{cpc}</td>
                        <td className="px-4 py-3 text-sm text-emerald-400 font-semibold">{roi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Campaign name..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Channel</label>
                  <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                    {['Email', 'Social', 'WhatsApp', 'SMS'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                    {['Draft', 'Scheduled', 'Active', 'Paused', 'Completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Subject / Title</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Email subject or campaign title..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target Audience</label>
                <input type="text" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="e.g. HNW Investors, All Leads..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Budget (AED)</label>
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Content / Notes</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" placeholder="Campaign content or notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">
                {editCampaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Set Annual Budget</h2>
              <button onClick={() => setShowBudgetModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Total Annual Budget (AED)</label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowBudgetModal(false)} className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                onClick={() => { saveBudget(parseInt(newBudget) || totalBudget); setShowBudgetModal(false); }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
