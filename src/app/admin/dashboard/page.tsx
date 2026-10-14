'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
}

interface ActivityEvent {
  id: string;
  lead_id: string;
  lead_name: string;
  type: 'created' | 'status_change' | 'follow_up' | 'note';
  description: string;
  timestamp: string;
  status?: string;
}

const statusColors: Record<string, string> = {
  New: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Contacted: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Qualified: 'text-primary bg-primary/10 border-primary/20',
  Proposal: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Negotiation: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Lost: 'text-red-400 bg-red-400/10 border-red-400/20',
  Closed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

const statusDotColors: Record<string, string> = {
  New: 'bg-blue-400',
  Contacted: 'bg-yellow-400',
  Qualified: 'bg-primary',
  Proposal: 'bg-purple-400',
  Negotiation: 'bg-orange-400',
  Lost: 'bg-red-400',
  Closed: 'bg-emerald-400',
};

const conversionStatuses = ['Qualified', 'Proposal', 'Negotiation', 'Closed'];

function isOverdue(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isDueToday(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isDueSoon(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 3;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AgentDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const { currentUser, isAgentScoped } = useRole();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'followup' | 'converted'>('all');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (isAgentScoped) {
      query = query.eq('assigned_agent', currentUser.name);
    }
    const { data } = await query;
    if (data) setLeads(data);
    setLoading(false);
  }, [supabase, isAgentScoped, currentUser.name]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const totalLeads = leads.length;
  const overdueFollowUps = leads.filter(l => isOverdue(l.follow_up_date)).length;
  const dueTodayFollowUps = leads.filter(l => isDueToday(l.follow_up_date)).length;
  const convertedLeads = leads.filter(l => conversionStatuses.includes(l.status)).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;

  const followUpLeads = leads
    .filter(l => l.follow_up_date)
    .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime());

  const convertedLeadsList = leads.filter(l => conversionStatuses.includes(l.status));

  const activityTimeline: ActivityEvent[] = leads
    .slice(0, 20)
    .map(l => ({
      id: l.id,
      lead_id: l.id,
      lead_name: l.name,
      type: 'created' as const,
      description: `Lead added from ${l.source || 'unknown source'}`,
      timestamp: l.created_at,
      status: l.status,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12);

  const displayedLeads =
    activeTab === 'followup'
      ? followUpLeads
      : activeTab === 'converted'
      ? convertedLeadsList
      : leads;

  const statCards = [
    {
      label: 'Assigned Leads',
      value: totalLeads,
      icon: 'UserGroupIcon',
      color: 'text-primary',
      bg: 'bg-primary/10',
      sub: `${leads.filter(l => l.status === 'New').length} new`,
    },
    {
      label: 'Follow-ups Due',
      value: dueTodayFollowUps + overdueFollowUps,
      icon: 'CalendarDaysIcon',
      color: overdueFollowUps > 0 ? 'text-red-400' : 'text-yellow-400',
      bg: overdueFollowUps > 0 ? 'bg-red-400/10' : 'bg-yellow-400/10',
      sub: `${overdueFollowUps} overdue`,
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: 'ArrowTrendingUpIcon',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      sub: `${convertedLeads} in pipeline`,
    },
    {
      label: 'Closed Deals',
      value: closedLeads,
      icon: 'CheckBadgeIcon',
      color: 'text-primary',
      bg: 'bg-primary/10',
      sub: 'successfully closed',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Agent Portal</h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Welcome, <span className="text-primary font-semibold">{currentUser.name}</span>
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="UserPlusIcon" size={13} />
          <span className="hidden sm:inline">Manage </span>Leads
        </Link>
      </div>

      {/* ─── STAT CARDS — 2-col on mobile, 4-col on desktop ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-4 hover:border-primary/30 transition-colors">
            <div className={`w-8 h-8 ${card.bg} flex items-center justify-center mb-3`}>
              <Icon name={card.icon as any} size={16} className={card.color} />
            </div>
            <p className="text-muted-foreground text-[10px] lg:text-xs mb-0.5 leading-tight">{card.label}</p>
            <p className={`text-xl lg:text-2xl font-bold ${card.color}`}>{loading ? '—' : card.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── PIPELINE BREAKDOWN (mobile-first horizontal scroll) ─── */}
      <div className="bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="FunnelIcon" size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Conversion Pipeline</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed'].map((stage) => {
              const count = leads.filter(l => l.status === stage).length;
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={stage} className="bg-background border border-border p-3 flex flex-col gap-1.5 min-w-[90px] flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColors[stage] || 'bg-muted-foreground'}`} />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">{stage}</p>
                  </div>
                  <p className={`text-xl font-bold ${statusColors[stage]?.split(' ')[0] || 'text-foreground'}`}>{count}</p>
                  <div className="w-full bg-border h-1">
                    <div className={`h-1 transition-all duration-500 ${statusDotColors[stage] || 'bg-muted-foreground'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground">{pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── LEADS + ACTIVITY (stacked on mobile, side-by-side on xl) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">

        {/* Leads Panel */}
        <div className="xl:col-span-2 bg-card border border-border flex flex-col">
          {/* Tabs */}
          <div className="flex items-center border-b border-border px-4 pt-3 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: 'All', count: totalLeads },
              { key: 'followup', label: 'Follow-ups', count: followUpLeads.length },
              { key: 'converted', label: 'Pipeline', count: convertedLeadsList.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${activeTab === tab.key ? 'bg-primary/20 text-primary' : 'bg-border text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Lead List */}
          <div className="flex-1 overflow-y-auto max-h-[420px] lg:max-h-[520px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon name="UserGroupIcon" size={32} className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No leads in this category.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {displayedLeads.map((lead) => {
                  const overdue = isOverdue(lead.follow_up_date);
                  const today = isDueToday(lead.follow_up_date);
                  const soon = isDueSoon(lead.follow_up_date);
                  return (
                    <div key={lead.id} className="p-3 lg:p-4 hover:bg-white/[0.02] transition-colors active:bg-white/[0.04]">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 lg:w-9 lg:h-9 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-sm font-bold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{lead.name}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${statusColors[lead.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                              {lead.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                            {lead.source && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{lead.source}</p>}
                          </div>
                          {lead.interest && (
                            <p className="text-xs text-primary mt-0.5 truncate">{lead.interest}</p>
                          )}
                        </div>

                        {/* Follow-up badge */}
                        <div className="flex-shrink-0 text-right">
                          {lead.follow_up_date ? (
                            <div className={`flex items-center gap-1 px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${
                              overdue
                                ? 'bg-red-400/10 border-red-400/30 text-red-400'
                                : today
                                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                                : soon
                                ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' :'bg-card border-border text-muted-foreground'
                            }`}>
                              <Icon name="CalendarDaysIcon" size={10} />
                              {overdue ? 'Overdue' : today ? 'Today' : soon ? 'Soon' : formatDate(lead.follow_up_date)}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <Link href="/admin/leads" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Icon name="ArrowRightIcon" size={12} />
              View all leads
            </Link>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-card border border-border flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Icon name="ClockIcon" size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead Activity</h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[320px] lg:max-h-[520px] p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activityTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Icon name="ClockIcon" size={28} className="text-muted-foreground mb-3" />
                <p className="text-xs text-muted-foreground">No activity yet.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {activityTimeline.map((event, idx) => (
                    <div key={`${event.id}-${idx}`} className="flex gap-3 relative">
                      <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-card z-10 ${statusDotColors[event.status || ''] || 'bg-muted-foreground'}`}>
                        <Icon name="UserIcon" size={11} className="text-black" />
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-xs font-semibold text-foreground truncate">{event.lead_name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {event.status && (
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${statusColors[event.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                              {event.status}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{timeAgo(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <Link href="/admin/leads" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Icon name="ArrowRightIcon" size={12} />
              View all leads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
