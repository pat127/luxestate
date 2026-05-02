'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Funnel } from 'recharts';

const salesFunnelData = [
  { stage: 'Website Visitors', value: 12000, fill: '#C9A84C' },
  { stage: 'Leads Generated', value: 820, fill: '#B8963E' },
  { stage: 'Qualified Leads', value: 310, fill: '#A07830' },
  { stage: 'Proposals Sent', value: 140, fill: '#8B6914' },
  { stage: 'Negotiations', value: 65, fill: '#7A5C10' },
  { stage: 'Deals Closed', value: 28, fill: '#6B5010' },
];

const monthlyData = [
  { month: 'Dec', leads: 55, deals: 4, revenue: 0.8, conversion: 7.3 },
  { month: 'Jan', leads: 80, deals: 6, revenue: 1.2, conversion: 7.5 },
  { month: 'Feb', leads: 110, deals: 10, revenue: 1.8, conversion: 9.1 },
  { month: 'Mar', leads: 165, deals: 16, revenue: 2.1, conversion: 9.7 },
  { month: 'Apr', leads: 220, deals: 22, revenue: 1.9, conversion: 10.0 },
  { month: 'May', leads: 190, deals: 18, revenue: 2.3, conversion: 9.5 },
];

const revenueByType = [
  { name: 'Residential Sale', value: 42, color: '#C9A84C' },
  { name: 'Commercial Sale', value: 28, color: '#B8963E' },
  { name: 'Off-Plan', value: 20, color: '#8B6914' },
  { name: 'Rental', value: 10, color: '#6B5010' },
];

const agentPerformance = [
  { agent: 'Sarah M.', leads: 48, deals: 8, revenue: 2.4 },
  { agent: 'Omar H.', leads: 35, deals: 6, revenue: 1.8 },
  { agent: 'James C.', leads: 42, deals: 5, revenue: 1.5 },
  { agent: 'Priya S.', leads: 28, deals: 4, revenue: 1.1 },
];

const sourceData = [
  { source: 'Website', leads: 88, pct: 40 },
  { source: 'Referral', leads: 55, pct: 25 },
  { source: 'Instagram', leads: 44, pct: 20 },
  { source: 'LinkedIn', leads: 22, pct: 10 },
  { source: 'Walk-in', leads: 11, pct: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'6m' | '1y' | 'all'>('6m');

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0).toFixed(1);
  const totalLeads = monthlyData.reduce((s, d) => s + d.leads, 0);
  const totalDeals = monthlyData.reduce((s, d) => s + d.deals, 0);
  const avgConversion = (monthlyData.reduce((s, d) => s + d.conversion, 0) / monthlyData.length).toFixed(1);
  const funnelConversion = ((salesFunnelData[salesFunnelData.length - 1].value / salesFunnelData[0].value) * 100).toFixed(2);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time performance metrics & sales funnel</p>
        </div>
        <div className="flex items-center border border-border">
          {(['6m', '1y', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p === '6m' ? '6 Months' : p === '1y' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: totalLeads.toString(), change: '+18%', icon: 'UserPlusIcon', sub: 'this period' },
          { label: 'Deals Closed', value: totalDeals.toString(), change: '+24%', icon: 'BriefcaseIcon', sub: 'this period' },
          { label: 'Revenue (AED M)', value: totalRevenue + 'M', change: '+31%', icon: 'CurrencyDollarIcon', sub: 'this period' },
          { label: 'Conversion Rate', value: avgConversion + '%', change: '+0.8%', icon: 'ArrowTrendingUpIcon', sub: 'lead → deal' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                <Icon name={kpi.icon as any} size={15} className="text-primary" />
              </div>
              <span className="text-xs text-emerald-400 font-semibold">{kpi.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Funnel */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="FunnelIcon" size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Property/Project Sales Funnel</h3>
          <span className="ml-auto text-xs text-muted-foreground">Overall conversion: <span className="text-primary font-bold">{funnelConversion}%</span></span>
        </div>
        <div className="space-y-2">
          {salesFunnelData.map((stage, i) => {
            const pct = (stage.value / salesFunnelData[0].value) * 100;
            const convRate = i > 0 ? ((stage.value / salesFunnelData[i - 1].value) * 100).toFixed(0) : '100';
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{stage.stage}</span>
                <div className="flex-1 h-7 bg-secondary overflow-hidden relative">
                  <div
                    className="h-full flex items-center px-3 transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: stage.fill }}
                  >
                    <span className="text-[10px] font-bold text-black/70 whitespace-nowrap">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
                {i > 0 && (
                  <span className="text-[10px] text-muted-foreground w-12 text-right flex-shrink-0">{convRate}% ↓</span>
                )}
                {i === 0 && <span className="w-12 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads, Deals, Revenue Over Time */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="ArrowTrendingUpIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Leads & Deals Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="leadsGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#C9A84C" strokeWidth={2} fill="url(#leadsGrad2)" />
              <Line type="monotone" dataKey="deals" name="Deals" stroke="#8B6914" strokeWidth={2} dot={{ fill: '#8B6914', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="CurrencyDollarIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Revenue vs Conversion Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (M AED)" fill="#C9A84C" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="conversion" name="Conversion %" stroke="#8B6914" strokeWidth={2} dot={{ fill: '#8B6914', r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Type + Lead Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="HomeModernIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Revenue by Property Type</h3>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={revenueByType} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {revenueByType.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {revenueByType.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="ChartBarIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead Sources</h3>
          </div>
          <div className="space-y-3">
            {sourceData.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.source}</span>
                <div className="flex-1 h-2 bg-secondary overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground w-8 text-right">{s.leads}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="IdentificationIcon" size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Agent Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                {['Agent', 'Leads', 'Deals Closed', 'Revenue (AED M)', 'Conversion Rate'].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((a, i) => (
                <tr key={a.agent} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{a.agent}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{a.leads}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{a.deals}</td>
                  <td className="px-4 py-3 text-sm text-primary font-semibold">{a.revenue}M</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 font-semibold">{((a.deals / a.leads) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
