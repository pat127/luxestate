'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

type UserRole = 'super_admin' | 'admin' | 'marketing' | 'agent';
type UserStatus = 'Active' | 'Inactive';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  permissions: Record<string, boolean>;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserForm {
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  permissions: Record<string, boolean>;
  password: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', group: 'Core' },
  { key: 'leads_all', label: 'Leads (All)', group: 'CRM' },
  { key: 'leads_own', label: 'Leads (Own)', group: 'CRM' },
  { key: 'contacts_all', label: 'Contacts (All)', group: 'CRM' },
  { key: 'contacts_own', label: 'Contacts (Own)', group: 'CRM' },
  { key: 'properties', label: 'Properties', group: 'Listings' },
  { key: 'projects', label: 'Projects', group: 'Listings' },
  { key: 'deals_all', label: 'Deals (All)', group: 'Sales' },
  { key: 'deals_own', label: 'Deals (Own)', group: 'Sales' },
  { key: 'calendar_all', label: 'Calendar (All)', group: 'Tools' },
  { key: 'calendar_own', label: 'Calendar (Own)', group: 'Tools' },
  { key: 'tasks', label: 'Tasks', group: 'Tools' },
  { key: 'marketing', label: 'Marketing', group: 'Tools' },
  { key: 'documents', label: 'Documents', group: 'Tools' },
  { key: 'analytics', label: 'Analytics', group: 'Admin' },
  { key: 'blog', label: 'Blog', group: 'Admin' },
  { key: 'agents', label: 'Agents', group: 'Admin' },
  { key: 'users', label: 'User Management', group: 'Admin' },
  { key: 'settings', label: 'Site Settings', group: 'Admin' },
  { key: 'syndication', label: 'Syndication', group: 'Admin' },
];

const MODULE_GROUPS = ['Core', 'CRM', 'Listings', 'Sales', 'Tools', 'Admin'];

const DEFAULT_PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  super_admin: Object.fromEntries(MODULES.map((m) => [m.key, true])),
  admin: Object.fromEntries(
    MODULES.map((m) => [m.key, !['contacts_own', 'leads_own', 'deals_own', 'calendar_own'].includes(m.key)])
  ),
  marketing: Object.fromEntries(
    MODULES.map((m) => [
      m.key,
      ['dashboard', 'leads_all', 'leads_own', 'marketing', 'analytics', 'blog', 'properties', 'projects'].includes(m.key),
    ])
  ),
  agent: Object.fromEntries(
    MODULES.map((m) => [
      m.key,
      ['dashboard', 'leads_own', 'contacts_own', 'deals_own', 'calendar_own', 'tasks', 'properties', 'projects'].includes(m.key),
    ])
  ),
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  marketing: 'Marketing',
  agent: 'Agent',
};

const ROLE_COLORS: Record<UserRole, { badge: string; dot: string }> = {
  super_admin: { badge: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  admin: { badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  marketing: { badge: 'text-pink-400 bg-pink-400/10 border-pink-400/20', dot: 'bg-pink-400' },
  agent: { badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatLastLogin(ts: string | null): string {
  if (!ts) return 'Never';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function enabledCount(perms: Record<string, boolean>): number {
  return Object.values(perms).filter(Boolean).length;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-9 h-5 relative transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 border text-sm font-medium shadow-xl ${
        type === 'success' ?'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <Icon name={type === 'success' ? 'CheckCircleIcon' : 'ExclamationCircleIcon'} size={16} />
      {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [permUser, setPermUser] = useState<UserProfile | null>(null);

  // Form
  const [form, setForm] = useState<UserForm>({
    full_name: '',
    email: '',
    role: 'agent',
    status: 'Active',
    phone: '',
    permissions: { ...DEFAULT_PERMISSIONS.agent },
    password: generatePassword(),
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Roles tab
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('super_admin');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load users');
      setUsers((result.users as UserProfile[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load users';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Toast Helper ───────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Filtered Users ─────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  // ─── Modal Handlers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditUser(null);
    setFormError(null);
    setForm({
      full_name: '',
      email: '',
      role: 'agent',
      status: 'Active',
      phone: '',
      permissions: { ...DEFAULT_PERMISSIONS.agent },
      password: generatePassword(),
    });
    setShowUserModal(true);
  };

  const openEdit = (user: UserProfile) => {
    setEditUser(user);
    setFormError(null);
    setForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      permissions: { ...(user.permissions || DEFAULT_PERMISSIONS[user.role]) },
      password: '',
    });
    setShowUserModal(true);
  };

  const openPermissions = (user: UserProfile) => {
    setPermUser({
      ...user,
      permissions: { ...(user.permissions || DEFAULT_PERMISSIONS[user.role]) },
    });
    setShowPermModal(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setForm((prev) => ({ ...prev, role, permissions: { ...DEFAULT_PERMISSIONS[role] } }));
  };

  // ─── Save User ──────────────────────────────────────────────────────────────

  const handleSaveUser = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      setFormError('Full name and email are required.');
      return;
    }
    if (!editUser && !form.password.trim()) {
      setFormError('Password is required for new users.');
      return;
    }
    setFormSaving(true);
    setFormError(null);

    try {
      if (editUser) {
        // Update existing profile via admin API route
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editUser.id,
            updates: {
              full_name: form.full_name.trim(),
              email: form.email.trim(),
              role: form.role,
              status: form.status,
              phone: form.phone.trim() || null,
              permissions: form.permissions,
            },
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update user');
        showToast('User updated successfully');
      } else {
        // Create new user via server-side API route (uses service role key)
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password.trim(),
            full_name: form.full_name.trim(),
            role: form.role,
            status: form.status,
            phone: form.phone.trim() || null,
            permissions: form.permissions,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create user');
        showToast('User created successfully');
      }

      await fetchUsers();
      setShowUserModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save user';
      setFormError(msg);
    } finally {
      setFormSaving(false);
    }
  };

  // ─── Delete User ────────────────────────────────────────────────────────────

  const handleDeleteUser = async (id: string) => {
    try {
      // Use server-side API route to delete both auth user and profile
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User removed');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // ─── Save Permissions ───────────────────────────────────────────────────────

  const handleSavePermissions = async () => {
    if (!permUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: permUser.id,
          updates: { permissions: permUser.permissions },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save permissions');
      setUsers((prev) => prev.map((u) => (u.id === permUser.id ? { ...u, permissions: permUser.permissions } : u)));
      showToast('Permissions saved');
      setShowPermModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save permissions', 'error');
    }
  };

  // ─── Toggle Status ──────────────────────────────────────────────────────────

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          updates: { status: newStatus },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update status');
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      showToast(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading...' : `${users.length} team member${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const active = users.filter((u) => u.role === role && u.status === 'Active').length;
          return (
            <div
              key={role}
              onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
              className={`bg-card border p-4 cursor-pointer transition-all ${
                filterRole === role ? 'border-primary' : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${ROLE_COLORS[role].badge}`}>
                  {ROLE_LABELS[role]}
                </span>
                <span className="text-xl font-bold text-foreground">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {active} active · {enabledCount(DEFAULT_PERMISSIONS[role])} modules
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-5">
        {(['users', 'roles'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'users' ? 'Users' : 'Role Permissions'}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex border border-border overflow-hidden">
              {(['all', 'super_admin', 'admin', 'marketing', 'agent'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    filterRole === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r === 'all' ? 'All' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">
              <Icon name="ExclamationCircleIcon" size={16} />
              {error}
              <button onClick={fetchUsers} className="ml-auto text-xs underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-card border border-border overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                <span className="text-sm">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Icon name="UsersIcon" size={32} className="opacity-30" />
                <p className="text-sm">No users found</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-xs text-primary hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {['User', 'Role', 'Module Access', 'Status', 'Last Login', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const perms = user.permissions && Object.keys(user.permissions).length > 0
                      ? user.permissions
                      : DEFAULT_PERMISSIONS[user.role];
                    const enabled = enabledCount(perms);
                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border text-xs font-bold ${ROLE_COLORS[user.role].badge}`}
                            >
                              {getInitials(user.full_name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground leading-tight">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              {user.phone && <p className="text-[10px] text-muted-foreground/60">{user.phone}</p>}
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${ROLE_COLORS[user.role].badge}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        {/* Module Access */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted h-1 w-20">
                              <div
                                className="bg-primary h-1 transition-all"
                                style={{ width: `${(enabled / MODULES.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {enabled}/{MODULES.length}
                            </span>
                            <button
                              onClick={() => openPermissions(user)}
                              className="text-[10px] text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border transition-colors ${
                              user.status === 'Active' ?'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20' :'text-muted-foreground bg-muted/30 border-border hover:bg-muted/50'
                            }`}
                          >
                            {user.status}
                          </button>
                        </td>
                        {/* Last Login */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatLastLogin(user.last_login_at)}
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(user)}
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit user"
                            >
                              <Icon name="PencilIcon" size={13} />
                            </button>
                            <button
                              onClick={() => openPermissions(user)}
                              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                              title="Edit permissions"
                            >
                              <Icon name="ShieldCheckIcon" size={13} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                              title="Remove user"
                            >
                              <Icon name="TrashIcon" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredUsers.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2 text-right">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </>
      )}

      {/* ── ROLES TAB ── */}
      {activeTab === 'roles' && (
        <div className="space-y-5">
          {/* Role selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRoleTab(role)}
                className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all ${
                  activeRoleTab === role
                    ? `${ROLE_COLORS[role].badge} border-current`
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`w-2 h-2 ${activeRoleTab === role ? ROLE_COLORS[role].dot : 'bg-muted-foreground/30'}`} />
                {ROLE_LABELS[role]}
                <span className="ml-1 opacity-60">({users.filter((u) => u.role === activeRoleTab).length})</span>
              </button>
            ))}
          </div>

          {/* Role description */}
          <div className="bg-card border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{ROLE_LABELS[activeRoleTab]} — Default Permissions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {enabledCount(DEFAULT_PERMISSIONS[activeRoleTab])} of {MODULES.length} modules enabled by default
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${ROLE_COLORS[activeRoleTab].badge}`}>
                {users.filter((u) => u.role === activeRoleTab).length} user{users.filter((u) => u.role === activeRoleTab).length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Permissions by group */}
            <div className="space-y-4">
              {MODULE_GROUPS.map((group) => {
                const groupModules = MODULES.filter((m) => m.group === group);
                return (
                  <div key={group}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">{group}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {groupModules.map((mod) => {
                        const enabled = DEFAULT_PERMISSIONS[activeRoleTab][mod.key];
                        return (
                          <div
                            key={mod.key}
                            className={`flex items-center gap-2 px-3 py-2 border text-xs transition-colors ${
                              enabled
                                ? 'border-primary/20 bg-primary/5 text-foreground'
                                : 'border-border bg-transparent text-muted-foreground/40'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                            {mod.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users with this role */}
          {users.filter((u) => u.role === activeRoleTab).length > 0 && (
            <div className="bg-card border border-border">
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Users with {ROLE_LABELS[activeRoleTab]} role
                </h4>
              </div>
              <div className="divide-y divide-border">
                {users
                  .filter((u) => u.role === activeRoleTab)
                  .map((user) => (
                    <div key={user.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold border ${ROLE_COLORS[user.role].badge}`}
                        >
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                            user.status === 'Active' ?'text-emerald-400 bg-emerald-400/10' :'text-muted-foreground bg-muted/30'
                          }`}
                        >
                          {user.status}
                        </span>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon name="PencilIcon" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT USER MODAL ── */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {editUser ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editUser ? `Editing ${editUser.full_name}` : 'Create a new team member account'}
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="e.g. Sarah Mitchell"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="user@luxestate.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="+971 50 000 0000"
                />
              </div>

              {/* Password (create only) */}
              {!editUser && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Temporary Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      className="flex-1 bg-secondary border border-border px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, password: generatePassword() }))}
                      className="px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      title="Regenerate"
                    >
                      <Icon name="ArrowPathIcon" size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Share this password with the user to log in.</p>
                </div>
              )}

              {/* Role + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as UserStatus }))}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Module Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Module Access
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {enabledCount(form.permissions)}/{MODULES.length} enabled
                  </span>
                </div>
                <div className="border border-border max-h-52 overflow-y-auto divide-y divide-border">
                  {MODULE_GROUPS.map((group) => {
                    const groupMods = MODULES.filter((m) => m.group === group);
                    return (
                      <div key={group}>
                        <div className="px-3 py-1.5 bg-secondary/50">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">{group}</span>
                        </div>
                        {groupMods.map((mod) => (
                          <div
                            key={mod.key}
                            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02]"
                          >
                            <span className="text-xs text-foreground">{mod.label}</span>
                            <Toggle
                              checked={!!form.permissions[mod.key]}
                              onChange={() =>
                                setForm((p) => ({
                                  ...p,
                                  permissions: { ...p.permissions, [mod.key]: !p.permissions[mod.key] },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <Icon name="ExclamationCircleIcon" size={14} />
                  {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={!form.full_name.trim() || !form.email.trim() || formSaving}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formSaving ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : editUser ? (
                  'Save Changes'
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSIONS MODAL ── */}
      {showPermModal && permUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">Module Permissions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {permUser.full_name} · {ROLE_LABELS[permUser.role]}
                </p>
              </div>
              <button onClick={() => setShowPermModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {enabledCount(permUser.permissions)} of {MODULES.length} enabled
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, true])) })
                    }
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    Enable All
                  </button>
                  <span className="text-muted-foreground/30">|</span>
                  <button
                    onClick={() =>
                      setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, false])) })
                    }
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Disable All
                  </button>
                  <span className="text-muted-foreground/30">|</span>
                  <button
                    onClick={() =>
                      setPermUser({ ...permUser, permissions: { ...DEFAULT_PERMISSIONS[permUser.role] } })
                    }
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Reset to Role
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {MODULE_GROUPS.map((group) => {
                  const groupMods = MODULES.filter((m) => m.group === group);
                  return (
                    <div key={group}>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">{group}</p>
                      <div className="space-y-1">
                        {groupMods.map((mod) => (
                          <div
                            key={mod.key}
                            className={`flex items-center justify-between py-2.5 px-3 border transition-colors ${
                              permUser.permissions[mod.key]
                                ? 'border-primary/20 bg-primary/5' :'border-border bg-transparent'
                            }`}
                          >
                            <span className="text-sm text-foreground">{mod.label}</span>
                            <Toggle
                              checked={!!permUser.permissions[mod.key]}
                              onChange={() =>
                                setPermUser({
                                  ...permUser,
                                  permissions: {
                                    ...permUser.permissions,
                                    [mod.key]: !permUser.permissions[mod.key],
                                  },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowPermModal(false)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Remove User</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will remove the user profile. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
