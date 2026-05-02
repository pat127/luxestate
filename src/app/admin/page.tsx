'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const leadsData = [
  { month: 'Dec', leads: 55, conversions: 8 },
  { month: 'Jan', leads: 80, conversions: 12 },
  { month: 'Feb', leads: 110, conversions: 18 },
  { month: 'Mar', leads: 165, conversions: 28 },
  { month: 'Apr', leads: 220, conversions: 35 },
  { month: 'May', leads: 190, conversions: 30 },
];

const commissionData = [
  { month: 'Dec', commission: 0.8, target: 2.5 },
  { month: 'Jan', commission: 1.2, target: 2.5 },
  { month: 'Feb', commission: 1.8, target: 2.5 },
  { month: 'Mar', commission: 2.1, target: 2.5 },
  { month: 'Apr', commission: 1.9, target: 2.5 },
  { month: 'May', commission: 2.3, target: 2.5 },
];

const pipelineData = [
  { stage: 'New', count: 45, color: '#C9A84C' },
  { stage: 'Qualified', count: 28, color: '#B8963E' },
  { stage: 'Proposal', count: 16, color: '#A07830' },
  { stage: 'Negotiation', count: 8, color: '#8B6914' },
  { stage: 'Closed', count: 4, color: '#6B5010' },
];

const propertyTypeData = [
  { name: 'Residential', value: 58, color: '#C9A84C' },
  { name: 'Commercial', value: 24, color: '#B8963E' },
  { name: 'Off-Plan', value: 18, color: '#8B6914' },
];

const statCards = [
  { label: 'My Leads', value: '220', sub: 'this month', change: '+0', icon: 'UserPlusIcon', positive: true },
  { label: 'My Listings', value: '38', sub: 'total', change: '+38', icon: 'HomeIcon', positive: true },
  { label: 'My Deals', value: '0', sub: 'this month', change: '+0', icon: 'BriefcaseIcon', positive: false },
  { label: 'My Commission', value: 'AED 0', sub: 'this month', change: 'AED 0', icon: 'CurrencyDollarIcon', positive: false },
];

const secondaryCards = [
  { label: 'My Tasks', value: '7', icon: 'ClipboardDocumentListIcon' },
  { label: 'Upcoming Viewings', value: '0', icon: 'CalendarIcon' },
  { label: 'My Contacts', value: '1', icon: 'UsersIcon' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [view, setView] = useState<'team' | 'ceo'>('team');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Admin</p>
        </div>
        <button
          onClick={() => setView(view === 'team' ? 'ceo' : 'team')}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
        >
          <Icon name="UserCircleIcon" size={14} />
          {view === 'ceo' ? 'CEO View' : 'Team View'}
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Icon name={card.icon as any} size={18} className="text-primary" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 ${card.positive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                <Icon name="ArrowTrendingUpIcon" size={12} />
                {card.change}
              </span>
            </div>
            <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {secondaryCards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={card.icon as any} size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Leads & Conversions */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="ArrowTrendingUpIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">My Leads & Conversions</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={leadsData}>
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#C9A84C" strokeWidth={2} fill="url(#leadsGrad)" />
              <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#8B6914" strokeWidth={2} fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commission vs Target */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="CurrencyDollarIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">My Commission vs Target</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={commissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="commission" name="Commission (M)" fill="#C9A84C" radius={[2, 2, 0, 0]} />
              <Bar dataKey="target" name="Target (M)" fill="#2A2A2A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Deals Pipeline */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="FunnelIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">My Deals Pipeline</h3>
          </div>
          <div className="space-y-3">
            {pipelineData.map((stage) => {
              const pct = (stage.count / pipelineData[0].count) * 100;
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-2 bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-6 text-right">{stage.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties by Type */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="HomeModernIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">My Properties by Type</h3>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {propertyTypeData.map((item) => (
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
      </div>
    </div>
  );
}
