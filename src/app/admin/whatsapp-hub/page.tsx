'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  budget: number;
  spent: number;
  audience: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  source: string;
  campaign: string | null;
  project: string | null;
  created_at: string;
  assigned_agent: string | null;
}

interface BulkSend {
  id: string;
  title: string;
  recipient_type: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_by_name: string;
  created_at: string;
}

interface WhatsAppMessage {
  id: string;
  contact_name: string;
  contact_phone: string;
  direction: string;
  message_body: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  New: 'text-blue-400 bg-blue-400/10',
  Contacted: 'text-yellow-400 bg-yellow-400/10',
  Qualified: 'text-primary bg-primary/10',
  Proposal: 'text-purple-400 bg-purple-400/10',
  Negotiation: 'text-orange-400 bg-orange-400/10',
  Lost: 'text-red-400 bg-red-400/10',
  Active: 'text-emerald-400 bg-emerald-400/10',
  Completed: 'text-blue-400 bg-blue-400/10',
  Draft: 'text-muted-foreground bg-muted/50',
  Paused: 'text-yellow-400 bg-yellow-400/10',
  Scheduled: 'text-primary bg-primary/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
  in_progress: 'text-blue-400 bg-blue-400/10',
  failed: 'text-red-400 bg-red-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
};

type ActiveTab = 'overview' | 'pipeline' | 'campaigns' | 'outreach';

export default function WhatsAppHubPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isRole } = useRole();
  const canAccess = isRole('super_admin', 'admin', 'marketing');

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bulkHistory, setBulkHistory] = useState<BulkSend[]>([]);
  const [recentMessages, setRecentMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampaign, setFilterCampaign] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchLead, setSearchLead] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [campRes, leadsRes, bulkRes, msgRes] = await Promise.all([
      supabase.from('campaigns').select('id, name, channel, status, budget, spent, audience, start_date, end_date').order('created_at', { ascending: false }),
      supabase.from('leads').select('id, name, phone, status, source, campaign, project, created_at, assigned_agent').order('created_at', { ascending: false }).limit(200),
      supabase.from('whatsapp_bulk_sends').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('whatsapp_messages').select('id, contact_name, contact_phone, direction, message_body, status, created_at').order('created_at', { ascending: false }).limit(100),
    ]);
    if (campRes.data) setCampaigns(campRes.data);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (bulkRes.data) setBulkHistory(bulkRes.data);
    if (msgRes.data) setRecentMessages(msgRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ──
  const whatsappCampaigns = campaigns.filter((c) => c.channel === 'WhatsApp');
  const activeCampaigns = whatsappCampaigns.filter((c) => c.status === 'Active').length;
  const totalSent = bulkHistory.reduce((s, b) => s + (b.sent_count || 0), 0);
  const totalFailed = bulkHistory.reduce((s, b) => s + (b.failed_count || 0), 0);
  const deliveryRate = totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0;
  const whatsappLeads = leads.filter((l) => l.source === 'WhatsApp');
  const inboundMessages = recentMessages.filter((m) => m.direction === 'inbound').length;
  const outboundMessages = recentMessages.filter((m) => m.direction === 'outbound').length;

  // Pipeline funnel
  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'];
  const pipelineCounts = pipelineStages.map((s) => ({
    stage: s,
    count: leads.filter((l) => l.status === s).length,
    whatsapp: leads.filter((l) => l.status === s && l.source === 'WhatsApp').length,
  }));
  const maxPipelineCount = Math.max(...pipelineCounts.map((p) => p.count), 1);

  // Campaign options for filter
  const campaignOptions = ['All', ...Array.from(new Set(leads.map((l) => l.campaign).filter(Boolean) as string[])).sort()];

  // Filtered leads for pipeline tab
  const filteredLeads = leads.filter((l) => {
    const matchCampaign = filterCampaign === 'All' || l.campaign === filterCampaign;
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchSearch = !searchLead || l.name.toLowerCase().includes(searchLead.toLowerCase()) || (l.phone || '').includes(searchLead);
    return matchCampaign && matchStatus && matchSearch;
  });

  // Outreach performance by campaign
  const campaignPerf = campaigns
    .filter((c) => c.channel === 'WhatsApp')
    .map((c) => {
      const campLeads = leads.filter((l) => l.campaign === c.name);
      const qualified = campLeads.filter((l) => ['Qualified', 'Proposal', 'Negotiation'].includes(l.status)).length;
      const convRate = campLeads.length > 0 ? Math.round((qualified / campLeads.length) * 100) : 0;
      return { ...c, leadCount: campLeads.length, qualified, convRate };
    });

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'Squares2X2Icon' },
    { id: 'pipeline', label: 'Lead Pipeline', icon: 'FunnelIcon' },
    { id: 'campaigns', label: 'WA Campaigns', icon: 'MegaphoneIcon' },
    { id: 'outreach', label: 'Outreach History', icon: 'PaperAirplaneIcon' },
  ];

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Access restricted to Admin, Marketing, and Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">WhatsApp Marketing Hub</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Campaigns · Lead Pipeline · Outreach Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/whatsapp"
            className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
          >
            <Icon name="PaperAirplaneIcon" size={13} />
            Send Message
          </Link>
          <Link
            href="/admin/campaigns"
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <Icon name="PlusIcon" size={13} />
            New Campaign
          </Link>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active WA Campaigns', value: activeCampaigns, icon: 'MegaphoneIcon', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Messages Sent', value: totalSent.toLocaleString(), icon: 'PaperAirplaneIcon', color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: 'CheckCircleIcon', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'WA Leads', value: whatsappLeads.length, icon: 'UserPlusIcon', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={kpi.icon as any} size={16} className={kpi.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-tight">{kpi.label}</p>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={t.icon as any} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Two-column bento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pipeline funnel — spans 2 cols */}
            <div className="lg:col-span-2 bg-card border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Lead Pipeline Funnel</h2>
                <Link href="/admin/leads" className="text-xs text-primary hover:underline">View all leads →</Link>
              </div>
              <div className="space-y-2.5">
                {pipelineCounts.map((p) => (
                  <div key={p.stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{p.stage}</span>
                    <div className="flex-1 h-6 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full bg-primary/20 border-r-2 border-primary transition-all duration-500"
                        style={{ width: `${(p.count / maxPipelineCount) * 100}%` }}
                      />
                      {p.whatsapp > 0 && (
                        <div
                          className="absolute top-0 left-0 h-full bg-green-500/30 border-r-2 border-green-500 transition-all duration-500"
                          style={{ width: `${(p.whatsapp / maxPipelineCount) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 w-20 justify-end">
                      <span className="text-xs font-semibold text-foreground">{p.count}</span>
                      {p.whatsapp > 0 && (
                        <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5">
                          {p.whatsapp} WA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-1 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-primary/20 border-r-2 border-primary" />
                  <span className="text-[10px] text-muted-foreground">All leads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500/30 border-r-2 border-green-500" />
                  <span className="text-[10px] text-muted-foreground">WhatsApp source</span>
                </div>
              </div>
            </div>

            {/* Message stats */}
            <div className="bg-card border border-border p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground">Message Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-500/10 flex items-center justify-center">
                      <Icon name="ArrowUpIcon" size={12} className="text-green-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">Outbound</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{outboundMessages}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 flex items-center justify-center">
                      <Icon name="ArrowDownIcon" size={12} className="text-blue-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">Inbound</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{inboundMessages}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 flex items-center justify-center">
                      <Icon name="QueueListIcon" size={12} className="text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Bulk Sends</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{bulkHistory.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500/10 flex items-center justify-center">
                      <Icon name="ExclamationCircleIcon" size={12} className="text-red-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">Failed</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{totalFailed}</span>
                </div>
              </div>
              <Link
                href="/admin/whatsapp"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={13} />
                Open Messaging
              </Link>
            </div>
          </div>

          {/* Recent bulk sends */}
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Recent Bulk Sends</h2>
              <button onClick={() => setActiveTab('outreach')} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            {bulkHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Icon name="PaperAirplaneIcon" size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No bulk sends yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bulkHistory.slice(0, 5).map((b) => {
                  const successRate = b.total_recipients > 0 ? Math.round((b.sent_count / b.total_recipients) * 100) : 0;
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                      <div className="w-8 h-8 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="PaperAirplaneIcon" size={14} className="text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{b.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {b.sent_count}/{b.total_recipients} sent · by {b.sent_by_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-foreground">{successRate}%</p>
                          <p className="text-[10px] text-muted-foreground">success</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 ${statusColors[b.status] || 'text-muted-foreground bg-muted/50'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* WA Campaigns quick view */}
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">WhatsApp Campaigns</h2>
              <Link href="/admin/campaigns" className="text-xs text-primary hover:underline">Manage all →</Link>
            </div>
            {whatsappCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Icon name="MegaphoneIcon" size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No WhatsApp campaigns yet</p>
                <Link href="/admin/campaigns" className="mt-2 text-xs text-primary hover:underline">Create one →</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {whatsappCampaigns.slice(0, 5).map((c) => {
                  const pct = c.budget > 0 ? Math.min(Math.round((c.spent / c.budget) * 100), 100) : 0;
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 flex-shrink-0 ${statusColors[c.status] || 'text-muted-foreground bg-muted/50'}`}>
                            {c.status}
                          </span>
                        </div>
                        {c.budget > 0 && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted/30">
                              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              AED {c.spent.toLocaleString()} / {c.budget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: LEAD PIPELINE
      ══════════════════════════════════════════ */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icon name="MagnifyingGlassIcon" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                className="w-full bg-card border border-border pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            >
              {campaignOptions.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Campaigns' : c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            >
              {['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Lost'].map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          {/* Stage summary pills */}
          <div className="flex gap-2 flex-wrap">
            {pipelineCounts.map((p) => (
              <button
                key={p.stage}
                onClick={() => setFilterStatus(filterStatus === p.stage ? 'All' : p.stage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  filterStatus === p.stage
                    ? 'border-primary bg-primary/10 text-primary' :'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.stage}
                <span className="bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold">{p.count}</span>
              </button>
            ))}
          </div>

          {/* Leads table */}
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  {['Lead', 'Status', 'Source', 'Campaign', 'Project', 'Agent', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Loading...</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No leads found</td></tr>
                ) : (
                  filteredLeads.slice(0, 100).map((l, i) => (
                    <tr key={l.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-foreground">{l.name}</p>
                        {l.phone && <p className="text-[10px] text-muted-foreground">{l.phone}</p>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 ${statusColors[l.status] || 'text-muted-foreground bg-muted/50'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{l.source || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[120px]">{l.campaign || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[120px]">{l.project || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{l.assigned_agent || '—'}</td>
                      <td className="px-4 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredLeads.length > 100 && (
            <p className="text-xs text-muted-foreground text-center">Showing 100 of {filteredLeads.length} leads. <Link href="/admin/leads" className="text-primary hover:underline">View all →</Link></p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: WA CAMPAIGNS
      ══════════════════════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{whatsappCampaigns.length} WhatsApp campaign{whatsappCampaigns.length !== 1 ? 's' : ''}</p>
            <Link
              href="/admin/campaigns"
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold hover:bg-accent transition-colors"
            >
              <Icon name="ArrowTopRightOnSquareIcon" size={12} />
              Manage Campaigns
            </Link>
          </div>

          {campaignPerf.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border">
              <Icon name="MegaphoneIcon" size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No WhatsApp campaigns found</p>
              <p className="text-xs mt-1">Create a campaign with channel set to "WhatsApp"</p>
              <Link href="/admin/campaigns" className="mt-3 text-xs text-primary hover:underline">Go to Campaigns →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campaignPerf.map((c) => {
                const budgetPct = c.budget > 0 ? Math.min(Math.round((c.spent / c.budget) * 100), 100) : 0;
                return (
                  <div key={c.id} className="bg-card border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                        {c.audience && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.audience}</p>}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 flex-shrink-0 ${statusColors[c.status] || 'text-muted-foreground bg-muted/50'}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/20 p-2">
                        <p className="text-base font-bold text-foreground">{c.leadCount}</p>
                        <p className="text-[10px] text-muted-foreground">Leads</p>
                      </div>
                      <div className="bg-muted/20 p-2">
                        <p className="text-base font-bold text-emerald-400">{c.qualified}</p>
                        <p className="text-[10px] text-muted-foreground">Qualified</p>
                      </div>
                      <div className="bg-muted/20 p-2">
                        <p className="text-base font-bold text-primary">{c.convRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Conv.</p>
                      </div>
                    </div>

                    {c.budget > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Budget utilization</span>
                          <span>{budgetPct}%</span>
                        </div>
                        <div className="h-1.5 bg-muted/30">
                          <div
                            className={`h-full transition-all ${budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-yellow-400' : 'bg-primary'}`}
                            style={{ width: `${budgetPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>AED {c.spent.toLocaleString()} spent</span>
                          <span>AED {c.budget.toLocaleString()} budget</span>
                        </div>
                      </div>
                    )}

                    {(c.start_date || c.end_date) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border pt-2">
                        <Icon name="CalendarIcon" size={11} />
                        {c.start_date && new Date(c.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        {c.start_date && c.end_date && ' → '}
                        {c.end_date && new Date(c.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: OUTREACH HISTORY
      ══════════════════════════════════════════ */}
      {activeTab === 'outreach' && (
        <div className="space-y-6">
          {/* Bulk send history */}
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Bulk Send History</h2>
              <span className="text-xs text-muted-foreground">{bulkHistory.length} records</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">Loading...</div>
            ) : bulkHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Icon name="PaperAirplaneIcon" size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No bulk sends yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Title', 'Recipients', 'Sent', 'Failed', 'Rate', 'Status', 'By', 'Date'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkHistory.map((b, i) => {
                      const rate = b.total_recipients > 0 ? Math.round((b.sent_count / b.total_recipients) * 100) : 0;
                      return (
                        <tr key={b.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">{b.title}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{b.recipient_type?.replace('_', ' ')}</p>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-foreground font-semibold">{b.total_recipients}</td>
                          <td className="px-4 py-2.5 text-xs text-emerald-400 font-semibold">{b.sent_count}</td>
                          <td className="px-4 py-2.5 text-xs text-red-400 font-semibold">{b.failed_count}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-muted/30">
                                <div className="h-full bg-emerald-400" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{rate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 ${statusColors[b.status] || 'text-muted-foreground bg-muted/50'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.sent_by_name}</td>
                          <td className="px-4 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent individual messages */}
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Recent Messages</h2>
              <Link href="/admin/whatsapp" className="text-xs text-primary hover:underline">Open messaging →</Link>
            </div>
            {recentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Icon name="ChatBubbleLeftRightIcon" size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentMessages.slice(0, 20).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                    <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5 ${m.direction === 'inbound' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                      <Icon
                        name={m.direction === 'inbound' ? 'ArrowDownIcon' : 'ArrowUpIcon'}
                        size={12}
                        className={m.direction === 'inbound' ? 'text-blue-400' : 'text-green-400'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{m.contact_name}</p>
                        <span className="text-[10px] text-muted-foreground">{m.contact_phone}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{m.message_body}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${statusColors[m.status] || 'text-muted-foreground bg-muted/50'}`}>
                        {m.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
