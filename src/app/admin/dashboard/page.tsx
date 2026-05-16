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

  // Derived stats
  const totalLeads = leads.length;
  const overdueFollowUps = leads.filter(l => isOverdue(l.follow_up_date)).length;
  const dueTodayFollowUps = leads.filter(l => isDueToday(l.follow_up_date)).length;
  const convertedLeads = leads.filter(l => conversionStatuses.includes(l.status)).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;

  // Follow-up leads sorted by urgency
  const followUpLeads = leads
    .filter(l => l.follow_up_date)
    .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime());

  // Converted/pipeline leads
  const convertedLeadsList = leads.filter(l => conversionStatuses.includes(l.status));

  // Activity timeline — derive from leads sorted by created_at
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, <span className="text-primary font-semibold">{currentUser.name}</span>
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="UserPlusIcon" size={14} />
          Manage Leads
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.bg} flex items-center justify-center`}>
                <Icon name={card.icon as any} size={18} className={card.color} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{loading ? '—' : card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Leads Table + Activity Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leads Panel — takes 2/3 */}
        <div className="xl:col-span-2 bg-card border border-border flex flex-col">
          {/* Tabs */}
          <div className="flex items-center border-b border-border px-5 pt-4">
            {[
              { key: 'all', label: 'All Leads', count: totalLeads },
              { key: 'followup', label: 'Follow-ups', count: followUpLeads.length },
              { key: 'converted', label: 'In Pipeline', count: convertedLeadsList.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 ${
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
          <div className="flex-1 overflow-y-auto max-h-[520px]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icon name="UserGroupIcon" size={36} className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No leads in this category.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {displayedLeads.map((lead) => {
                  const overdue = isOverdue(lead.follow_up_date);
                  const today = isDueToday(lead.follow_up_date);
                  const soon = isDueSoon(lead.follow_up_date);
                  return (
                    <div key={lead.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-sm font-bold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{lead.name}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${statusColors[lead.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                              {lead.status}
                            </span>
                            {lead.source && (
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{lead.source}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                            {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                          </div>
                          {lead.interest && (
                            <p className="text-xs text-primary mt-0.5 truncate">{lead.interest}</p>
                          )}
                          {lead.budget && (
                            <p className="text-xs text-muted-foreground mt-0.5">Budget: {lead.budget}</p>
                          )}
                        </div>

                        {/* Follow-up date */}
                        <div className="flex-shrink-0 text-right">
                          {lead.follow_up_date ? (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wider ${
                              overdue
                                ? 'bg-red-400/10 border-red-400/30 text-red-400'
                                : today
                                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                                : soon
                                ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' :'bg-card border-border text-muted-foreground'
                            }`}>
                              <Icon name="CalendarDaysIcon" size={11} />
                              {overdue ? 'Overdue' : today ? 'Today' : soon ? 'Soon' : formatDate(lead.follow_up_date)}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">No follow-up</span>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Added {formatDate(lead.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Notes preview */}
                      {lead.notes && (
                        <div className="mt-2 ml-12 px-3 py-2 bg-white/[0.03] border-l-2 border-primary/30">
                          <p className="text-xs text-muted-foreground line-clamp-1">{lead.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline — takes 1/3 */}
        <div className="bg-card border border-border flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Icon name="ClockIcon" size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead Activity</h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[520px] p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activityTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon name="ClockIcon" size={32} className="text-muted-foreground mb-3" />
                <p className="text-xs text-muted-foreground">No activity yet.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-5">
                  {activityTimeline.map((event, idx) => (
                    <div key={`${event.id}-${idx}`} className="flex gap-4 relative">
                      {/* Dot */}
                      <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-card z-10 ${statusDotColors[event.status || ''] || 'bg-muted-foreground'}`}>
                        <Icon name="UserIcon" size={11} className="text-black" />
                      </div>

                      {/* Content */}
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

          {/* Footer link */}
          <div className="border-t border-border px-5 py-3">
            <Link
              href="/admin/leads"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon name="ArrowRightIcon" size={12} />
              View all leads
            </Link>
          </div>
        </div>
      </div>

      {/* Conversion Status Breakdown */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="FunnelIcon" size={15} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Conversion Pipeline</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed'].map((stage) => {
              const count = leads.filter(l => l.status === stage).length;
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={stage} className="bg-background border border-border p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusDotColors[stage] || 'bg-muted-foreground'}`} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stage}</p>
                  </div>
                  <p className={`text-2xl font-bold ${statusColors[stage]?.split(' ')[0] || 'text-foreground'}`}>{count}</p>
                  <div className="w-full bg-border h-1">
                    <div
                      className={`h-1 transition-all duration-500 ${statusDotColors[stage] || 'bg-muted-foreground'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
