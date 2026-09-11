'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DbProperty { id: string; prop_category?: string; listing_type?: string; availability?: string; created_at?: string; }
interface DbProject { id: string; status?: string; created_at?: string; }
interface DbLead { id: string; status?: string; source?: string; created_at?: string; }

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
  const supabase = useMemo(() => createClient(), []);
  const { currentUser, isAgentScoped } = useRole();

  const [properties, setProperties] = useState<DbProperty[]>([]);
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Properties and projects: all agents can see all
        const propsQuery = supabase.from('properties').select('id, prop_category, listing_type, availability, created_at');
        const projQuery = supabase.from('projects').select('id, status, created_at');

        // Leads: agents see only their own
        let leadsQuery = supabase.from('leads').select('id, status, source, created_at');
        if (isAgentScoped) {
          leadsQuery = leadsQuery.eq('assigned_agent', currentUser.name);
        }

        const [propsRes, projRes, leadsRes] = await Promise.all([propsQuery, projQuery, leadsQuery]);
        setProperties(propsRes.data || []);
        setProjects(projRes.data || []);
        setLeads(leadsRes.data || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [supabase, isAgentScoped, currentUser.name]);

  // Computed stats
  const totalProperties = properties.length;
  const totalProjects = projects.length;
  const totalLeads = leads.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;

  // Pipeline stages from leads
  const pipelineStages = [
    { stage: 'New', count: leads.filter(l => l.status === 'New').length, color: '#C9A84C' },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'Qualified').length, color: '#B8963E' },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: '#A07830' },
    { stage: 'Negotiation', count: leads.filter(l => l.status === 'Negotiation').length, color: '#8B6914' },
    { stage: 'Closed', count: leads.filter(l => l.status === 'Closed').length, color: '#6B5010' },
  ];
  const maxPipelineCount = Math.max(...pipelineStages.map(s => s.count), 1);

  // Property category breakdown
  const propCategories = ['Residential', 'Commercial', 'Off-Plan'];
  const propColors = ['#C9A84C', '#B8963E', '#8B6914'];
  const propCatCounts = propCategories.map(c => properties.filter(p => p.prop_category === c).length);
  const totalPropCount = propCatCounts.reduce((s, v) => s + v, 0) || 1;
  const propertyTypeData = propCategories.map((name, i) => ({
    name,
    value: Math.round((propCatCounts[i] / totalPropCount) * 100) || 0,
    color: propColors[i],
  }));

  // Monthly leads (last 6 months based on created_at)
  const now = new Date();
  const leadsData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const monthLeads = leads.filter(l => {
      if (!l.created_at) return false;
      const created = new Date(l.created_at);
      return created >= d && created < nextD;
    }).length;
    const monthClosed = leads.filter(l => {
      if (!l.created_at) return false;
      const created = new Date(l.created_at);
      return created >= d && created < nextD && l.status === 'Closed';
    }).length;
    return {
      month: MONTHS[d.getMonth()],
      leads: monthLeads,
      conversions: monthClosed,
    };
  });

  // Monthly properties added (last 6 months)
  const propertiesData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const count = properties.filter(p => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at);
      return created >= d && created < nextD;
    }).length;
    return {
      month: MONTHS[d.getMonth()],
      properties: count,
      projects: projects.filter(p => {
        if (!p.created_at) return false;
        const created = new Date(p.created_at);
        return created >= d && created < nextD;
      }).length,
    };
  });

  const statCards = [
    { label: 'Total Properties', value: loading ? '—' : totalProperties.toString(), sub: 'in database', change: `${totalProperties}`, icon: 'HomeIcon', positive: totalProperties > 0 },
    { label: 'Total Projects', value: loading ? '—' : totalProjects.toString(), sub: 'all projects', change: `${activeProjects} active`, icon: 'BuildingOffice2Icon', positive: totalProjects > 0 },
    { label: 'Total Leads', value: loading ? '—' : totalLeads.toString(), sub: 'all leads', change: `${newLeads} new`, icon: 'UserPlusIcon', positive: totalLeads > 0 },
    { label: 'Qualified Leads', value: loading ? '—' : qualifiedLeads.toString(), sub: 'qualified', change: `${qualifiedLeads}`, icon: 'BriefcaseIcon', positive: qualifiedLeads > 0 },
  ];

  const secondaryCards = [
    { label: 'Active Projects', value: loading ? '—' : activeProjects.toString(), icon: 'BuildingOfficeIcon' },
    { label: 'Pipeline Leads', value: loading ? '—' : leads.filter(l => !['Closed', 'Lost'].includes(l.status || '')).length.toString(), icon: 'FunnelIcon' },
    { label: 'Lead Sources', value: loading ? '—' : [...new Set(leads.map(l => l.source).filter(Boolean))].length.toString(), icon: 'UsersIcon' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {currentUser.name}
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-primary/30 text-primary bg-primary/5 align-middle">
              {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'marketing' ? 'Marketing' : 'Agent'}
            </span>
          </p>
        </div>
        {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
          <button
            onClick={() => setView(view === 'team' ? 'ceo' : 'team')}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
          >
            <Icon name="UserCircleIcon" size={14} />
            {view === 'ceo' ? 'CEO View' : 'Team View'}
          </button>
        )}
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

        {/* Properties & Projects Added */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="HomeModernIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Properties & Projects Added</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propertiesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="properties" name="Properties" fill="#C9A84C" radius={[2, 2, 0, 0]} />
              <Bar dataKey="projects" name="Projects" fill="#2A2A2A" radius={[2, 2, 0, 0]} />
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
            <h3 className="text-sm font-bold text-foreground">Leads Pipeline</h3>
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

        {/* Properties by Category */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="HomeModernIcon" size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Properties by Category</h3>
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
