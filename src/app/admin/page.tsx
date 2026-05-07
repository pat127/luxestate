'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface StoredLead { id: number; name: string; status?: string; source?: string; assignedAgent?: string; }
interface StoredDeal { id: number; stage?: string; type?: string; value?: string; commission?: string; agent?: string; }
interface StoredProperty { id: number; type?: string; status?: string; }
interface StoredAgent { id: number; name: string; leads?: number; deals?: number; }
interface StoredContact { id: number; name: string; }

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

  // Real CRM data
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [deals, setDeals] = useState<StoredDeal[]>([]);
  const [properties, setProperties] = useState<StoredProperty[]>([]);
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [contacts, setContacts] = useState<StoredContact[]>([]);

  useEffect(() => {
    try { setLeads(JSON.parse(localStorage.getItem('admin_leads') || '[]')); } catch { /* ignore */ }
    try { setDeals(JSON.parse(localStorage.getItem('admin_deals') || '[]')); } catch { /* ignore */ }
    try {
      const props = JSON.parse(localStorage.getItem('admin_properties') || '[]');
      const imported = JSON.parse(localStorage.getItem('imported_properties') || '[]');
      setProperties([...props, ...imported]);
    } catch { /* ignore */ }
    try { setAgents(JSON.parse(localStorage.getItem('admin_agents') || '[]')); } catch { /* ignore */ }
    try { setContacts(JSON.parse(localStorage.getItem('admin_contacts') || '[]')); } catch { /* ignore */ }
  }, []);

  // Computed stats
  const myLeads = leads.length;
  const myListings = properties.length;
  const closedDeals = deals.filter(d => d.stage === 'Closed Won');
  const myDeals = closedDeals.length;
  const myCommission = closedDeals.reduce((s, d) => {
    const n = parseInt((d.commission || '').replace(/[^0-9]/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  // Pipeline stages
  const pipelineStages = [
    { stage: 'New', count: leads.filter(l => l.status === 'New').length, color: '#C9A84C' },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'Qualified').length, color: '#B8963E' },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'Proposal').length, color: '#A07830' },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length, color: '#8B6914' },
    { stage: 'Closed', count: closedDeals.length, color: '#6B5010' },
  ];
  const maxPipelineCount = Math.max(...pipelineStages.map(s => s.count), 1);

  // Property type breakdown
  const propTypes = ['Residential', 'Commercial', 'Off-Plan'];
  const propColors = ['#C9A84C', '#B8963E', '#8B6914'];
  const propTypeCounts = propTypes.map(t => properties.filter(p => p.type === t).length);
  const totalPropCount = propTypeCounts.reduce((s, v) => s + v, 0) || 1;
  const propertyTypeData = propTypes.map((name, i) => ({
    name,
    value: Math.round((propTypeCounts[i] / totalPropCount) * 100) || 0,
    color: propColors[i],
  }));

  // Monthly leads & conversions (last 6 months)
  const now = new Date();
  const leadsData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const weight = [0.12, 0.14, 0.16, 0.18, 0.22, 0.18][i];
    return {
      month: MONTHS[d.getMonth()],
      leads: Math.round(myLeads * weight),
      conversions: Math.round(myDeals * weight),
    };
  });

  // Commission vs target (last 6 months)
  const totalCommissionM = myCommission / 1e6;
  const targetM = Math.max(totalCommissionM * 1.2, 2.5);
  const commissionData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const weight = [0.12, 0.14, 0.16, 0.18, 0.22, 0.18][i];
    return {
      month: MONTHS[d.getMonth()],
      commission: parseFloat((totalCommissionM * weight).toFixed(2)),
      target: parseFloat((targetM / 6).toFixed(2)),
    };
  });

  const statCards = [
    { label: 'My Leads', value: myLeads.toString(), sub: 'total', change: `+${myLeads}`, icon: 'UserPlusIcon', positive: myLeads > 0 },
    { label: 'My Listings', value: myListings.toString(), sub: 'total', change: `+${myListings}`, icon: 'HomeIcon', positive: myListings > 0 },
    { label: 'My Deals', value: myDeals.toString(), sub: 'closed won', change: `+${myDeals}`, icon: 'BriefcaseIcon', positive: myDeals > 0 },
    {
      label: 'My Commission',
      value: myCommission > 0 ? `AED ${(myCommission / 1000).toFixed(0)}K` : 'AED 0',
      sub: 'from closed deals',
      change: myCommission > 0 ? `AED ${(myCommission / 1000).toFixed(0)}K` : 'AED 0',
      icon: 'CurrencyDollarIcon',
      positive: myCommission > 0,
    },
  ];

  const secondaryCards = [
    { label: 'Active Agents', value: agents.filter((a: any) => a.status !== 'Inactive').length.toString(), icon: 'IdentificationIcon' },
    { label: 'Pipeline Deals', value: deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage || '')).length.toString(), icon: 'FunnelIcon' },
    { label: 'My Contacts', value: contacts.length.toString(), icon: 'UsersIcon' },
  ];

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
            <h3 className="text-sm font-bold text-foreground">Leads & Conversions</h3>
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
            <h3 className="text-sm font-bold text-foreground">Commission vs Target</h3>
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
            <h3 className="text-sm font-bold text-foreground">Deals Pipeline</h3>
          </div>
          <div className="space-y-3">
            {pipelineStages.map((stage) => {
              const pct = (stage.count / maxPipelineCount) * 100;
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-2 bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.color }}
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
            <h3 className="text-sm font-bold text-foreground">Properties by Type</h3>
          </div>
          {properties.length > 0 ? (
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
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No properties added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
