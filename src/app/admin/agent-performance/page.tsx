'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface Lead {
  id: string;
  name: string;
  source: string;
  status: string;
  budget: string;
  assigned_agent: string;
  created_at: string;
}

interface AgentStat {
  name: string;
  totalLeads: number;
  closedThisMonth: number;
  conversionRate: number;
  avgDealValue: number;
  pipeline: number;
}

const CLOSED_STATUSES = ['Closed'];
const CONVERTED_STATUSES = ['Qualified', 'Proposal', 'Negotiation', 'Closed'];

const CHART_COLORS = ['#c9a96e', '#60a5fa', '#a78bfa', '#34d399', '#f87171', '#fb923c', '#e879f9', '#22d3ee'];

const SOURCE_COLOR_MAP: Record<string, string> = {
  Website: '#c9a96e',
  'Contact Form': '#60a5fa',
  'Property Enquiry': '#a78bfa',
  'Project Registration': '#34d399',
  Referral: '#f87171',
  Instagram: '#fb923c',
  LinkedIn: '#22d3ee',
  'Walk-in': '#e879f9',
  'Property Finder': '#facc15',
  Bayut: '#f97316',
  'Residential Inquiry': '#86efac',
  'Commercial Inquiry': '#93c5fd',
  Other: '#6b7280',
};

function parseBudget(budget: string | null | undefined): number {
  if (!budget) return 0;
  const cleaned = budget.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `AED ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `AED ${(val / 1_000).toFixed(0)}K`;
  return val > 0 ? `AED ${val.toLocaleString()}` : '—';
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="leading-relaxed">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0];
  return (
    <div className="bg-card border border-border px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-foreground">{name}</p>
      <p className="text-muted-foreground">{value} leads · {(percent * 100).toFixed(1)}%</p>
    </div>
  );
};

export default function AgentPerformancePage() {
  const supabase = useMemo(() => createClient(), []);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof AgentStat>('totalLeads');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('id, name, source, status, budget, assigned_agent, created_at')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Build per-agent stats
  const agentStats = useMemo<AgentStat[]>(() => {
    const map: Record<string, Lead[]> = {};
    leads.forEach((l) => {
      const agent = l.assigned_agent?.trim() || 'Unassigned';
      if (!map[agent]) map[agent] = [];
      map[agent].push(l);
    });

    return Object.entries(map).map(([name, agentLeads]) => {
      const totalLeads = agentLeads.length;
      const closedThisMonth = agentLeads.filter(
        (l) => CLOSED_STATUSES.includes(l.status) && isThisMonth(l.created_at)
      ).length;
      const converted = agentLeads.filter((l) => CONVERTED_STATUSES.includes(l.status)).length;
      const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
      const pipeline = agentLeads.filter((l) => CONVERTED_STATUSES.includes(l.status) && l.status !== 'Closed').length;

      const closedLeads = agentLeads.filter((l) => l.status === 'Closed');
      const budgets = closedLeads.map((l) => parseBudget(l.budget)).filter((v) => v > 0);
      const avgDealValue = budgets.length > 0 ? budgets.reduce((a, b) => a + b, 0) / budgets.length : 0;

      return { name, totalLeads, closedThisMonth, conversionRate, avgDealValue, pipeline };
    });
  }, [leads]);

  const sortedStats = useMemo(() => {
    return [...agentStats].sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [agentStats, sortKey, sortDir]);

  // Lead source breakdown
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.source?.trim() || 'Other';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // Bar chart data — top 8 agents by leads
  const barData = useMemo(() => {
    return [...agentStats]
      .sort((a, b) => b.totalLeads - a.totalLeads)
      .slice(0, 8)
      .map((a) => ({
        name: a.name.split(' ')[0], // first name only for chart
        fullName: a.name,
        'Total Leads': a.totalLeads,
        'Closed This Month': a.closedThisMonth,
        'In Pipeline': a.pipeline,
      }));
  }, [agentStats]);

  // Summary totals
  const totalLeadsAll = leads.length;
  const totalClosedMonth = leads.filter((l) => CLOSED_STATUSES.includes(l.status) && isThisMonth(l.created_at)).length;
  const totalAgents = agentStats.filter((a) => a.name !== 'Unassigned').length;
  const avgConversion = agentStats.length > 0
    ? Math.round(agentStats.reduce((s, a) => s + a.conversionRate, 0) / agentStats.length)
    : 0;

  const handleSort = (key: keyof AgentStat) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: keyof AgentStat }) => {
    if (sortKey !== field) return <Icon name="ChevronUpDownIcon" size={11} className="text-muted-foreground/40" />;
    return sortDir === 'asc'
      ? <Icon name="ChevronUpIcon" size={11} className="text-primary" />
      : <Icon name="ChevronDownIcon" size={11} className="text-primary" />;
  };

  const conversionColor = (rate: number) => {
    if (rate >= 60) return 'text-emerald-400';
    if (rate >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Agent Performance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Lead counts, conversion rates, deal values &amp; monthly closings</p>
        </div>
        <button
          onClick={loadLeads}
          className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Icon name="ArrowPathIcon" size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: loading ? '—' : totalAgents, icon: 'IdentificationIcon', color: 'text-primary', bg: 'bg-primary/10', sub: 'with assigned leads' },
          { label: 'Total Leads', value: loading ? '—' : totalLeadsAll, icon: 'UserGroupIcon', color: 'text-blue-400', bg: 'bg-blue-400/10', sub: 'across all agents' },
          { label: 'Closed This Month', value: loading ? '—' : totalClosedMonth, icon: 'CheckBadgeIcon', color: 'text-emerald-400', bg: 'bg-emerald-400/10', sub: 'deals closed' },
          { label: 'Avg Conversion', value: loading ? '—' : `${avgConversion}%`, icon: 'ArrowTrendingUpIcon', color: 'text-yellow-400', bg: 'bg-yellow-400/10', sub: 'team average' },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border p-4 hover:border-primary/30 transition-colors">
            <div className={`w-8 h-8 ${card.bg} flex items-center justify-center mb-3`}>
              <Icon name={card.icon as any} size={16} className={card.color} />
            </div>
            <p className="text-muted-foreground text-[10px] lg:text-xs mb-0.5 leading-tight">{card.label}</p>
            <p className={`text-xl lg:text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar Chart — Lead & Closing Activity */}
        <div className="xl:col-span-2 bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="ChartBarIcon" size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead &amp; Closing Activity by Agent</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-52">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : barData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af', paddingTop: 8 }} />
                <Bar dataKey="Total Leads" fill="#60a5fa" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Closed This Month" fill="#c9a96e" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="In Pipeline" fill="#a78bfa" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Lead Source Breakdown */}
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="ChartPieIcon" size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead Source Breakdown</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-52">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sourceData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={SOURCE_COLOR_MAP[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend list */}
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {sourceData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SOURCE_COLOR_MAP[entry.name] || CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-[10px] text-muted-foreground truncate">{entry.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-foreground flex-shrink-0">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-card border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="TableCellsIcon" size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Per-Agent Breakdown</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">{sortedStats.length} agents</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Agent</th>
                  {(
                    [
                      { key: 'totalLeads', label: 'Total Leads' },
                      { key: 'closedThisMonth', label: 'Closed (Month)' },
                      { key: 'conversionRate', label: 'Conversion %' },
                      { key: 'avgDealValue', label: 'Avg Deal Value' },
                      { key: 'pipeline', label: 'In Pipeline' },
                    ] as { key: keyof AgentStat; label: string }[]
                  ).map(({ key, label }) => (
                    <th
                      key={key}
                      className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => handleSort(key)}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {label}
                        <SortIcon field={key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedStats.map((agent, idx) => (
                  <tr key={agent.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-[10px] font-bold">{agent.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{agent.name}</p>
                          {idx === 0 && sortKey === 'totalLeads' && (
                            <p className="text-[9px] text-primary font-medium">Top performer</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-foreground">{agent.totalLeads}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${agent.closedThisMonth > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {agent.closedThisMonth}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-border h-1 hidden sm:block">
                          <div
                            className="h-1 transition-all duration-500"
                            style={{
                              width: `${agent.conversionRate}%`,
                              backgroundColor: agent.conversionRate >= 60 ? '#34d399' : agent.conversionRate >= 30 ? '#facc15' : '#f87171',
                            }}
                          />
                        </div>
                        <span className={`font-bold ${conversionColor(agent.conversionRate)}`}>
                          {agent.conversionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-foreground">{formatCurrency(agent.avgDealValue)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${agent.pipeline > 0 ? 'text-purple-400' : 'text-muted-foreground'}`}>
                        {agent.pipeline}
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedStats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      No agent data found. Assign leads to agents to see performance metrics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
