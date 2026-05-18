'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'super_admin' | 'admin' | 'marketing' | 'agent';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'leads_all', label: 'Leads (All)' },
  { key: 'leads_own', label: 'Leads (Own)' },
  { key: 'contacts_all', label: 'Contacts (All)' },
  { key: 'contacts_own', label: 'Contacts (Own)' },
  { key: 'properties', label: 'Properties' },
  { key: 'projects', label: 'Projects' },
  { key: 'deals_all', label: 'Deals (All)' },
  { key: 'deals_own', label: 'Deals (Own)' },
  { key: 'calendar_all', label: 'Calendar (All)' },
  { key: 'calendar_own', label: 'Calendar (Own)' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'documents', label: 'Documents' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'blog', label: 'Blog' },
  { key: 'agents', label: 'Agents' },
  { key: 'users', label: 'User Management' },
  { key: 'settings', label: 'Site Settings' },
  { key: 'syndication', label: 'Syndication' },
];

type Permissions = Record<string, boolean>;

const DEFAULT_PERMISSIONS: Record<UserRole, Permissions> = {
  super_admin: Object.fromEntries(MODULES.map((m) => [m.key, true])),
  admin: Object.fromEntries(MODULES.map((m) => [m.key, !['contacts_own'].includes(m.key)])),
  marketing: Object.fromEntries(MODULES.map((m) => [m.key, ['dashboard', 'leads_all', 'leads_own', 'marketing', 'analytics', 'blog'].includes(m.key)])),
  agent: Object.fromEntries(MODULES.map((m) => [m.key, ['dashboard', 'leads_own', 'contacts_own', 'deals_own', 'calendar_own', 'tasks'].includes(m.key)])),
};

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  phone?: string;
  permissions: Permissions;
  last_login_at?: string;
  created_at?: string;
}

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin / CEO',
  admin: 'Admin',
  marketing: 'Marketing',
  agent: 'Agent',
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'text-primary bg-primary/10',
  admin: 'text-blue-400 bg-blue-400/10',
  marketing: 'text-pink-400 bg-pink-400/10',
  agent: 'text-emerald-400 bg-emerald-400/10',
};

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

interface UserForm {
  full_name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  phone: string;
  permissions: Permissions;
  password: string;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-9 h-5 relative transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [permUser, setPermUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserForm>({
    full_name: '', email: '', role: 'agent', status: 'Active', phone: '',
    permissions: { ...DEFAULT_PERMISSIONS.agent }, password: generatePassword(),
  });
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('super_admin');
  const [saveNotice, setSaveNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setSaveError('');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role, status, phone, permissions, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchUsers error:', error);
      setSaveError('Failed to load users: ' + error.message);
    } else if (data) {
      setUsers(
        data.map((u: any) => ({
          ...u,
          permissions:
            u.permissions && Object.keys(u.permissions).length > 0
              ? u.permissions
              : { ...DEFAULT_PERMISSIONS[(u.role as UserRole) || 'agent'] },
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSaved = (msg = 'Saved') => {
    setSaveNotice(msg);
    setSaveError('');
    setTimeout(() => setSaveNotice(''), 3000);
  };

  const showErr = (msg: string) => {
    setSaveError(msg);
    setSaveNotice('');
    setTimeout(() => setSaveError(''), 6000);
  };

  const filtered = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);

  const openNew = () => {
    setEditUser(null);
    setForm({
      full_name: '', email: '', role: 'agent', status: 'Active', phone: '',
      permissions: { ...DEFAULT_PERMISSIONS.agent }, password: generatePassword(),
    });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (u: UserProfile) => {
    setEditUser(u);
    setForm({
      full_name: u.full_name, email: u.email, role: u.role, status: u.status,
      phone: u.phone || '', permissions: { ...u.permissions }, password: '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const openPermissions = (u: UserProfile) => {
    setPermUser({ ...u, permissions: { ...u.permissions } });
    setShowPermModal(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      showErr('Full name and email are required.');
      return;
    }
    setIsSaving(true);
    setSaveError('');

    if (editUser) {
      // Update existing user profile only (no auth changes needed)
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: form.full_name,
          role: form.role,
          status: form.status,
          phone: form.phone || null,
          permissions: form.permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editUser.id);

      if (error) {
        showErr('Failed to update user: ' + error.message);
        setIsSaving(false);
        return;
      }
      await fetchUsers();
      setShowModal(false);
      showSaved('User updated successfully');
    } else {
      // Create new user via Next.js API route (uses service role key server-side)
      if (!form.password.trim()) {
        showErr('Password is required.');
        setIsSaving(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.full_name,
            email: form.email,
            password: form.password,
            role: form.role,
            permissions: form.permissions,
            phone: form.phone,
            status: form.status,
          }),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          showErr(result.error || `Failed to create user (HTTP ${res.status})`);
          setIsSaving(false);
          return;
        }

        // Success — refresh the list
        await fetchUsers();
        setShowModal(false);
        showSaved('User created successfully');
      } catch (err) {
        showErr(err instanceof Error ? err.message : 'Network error — please try again');
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id);
    if (error) {
      showErr('Failed to delete user: ' + error.message);
      return;
    }
    setDeleteConfirm(null);
    await fetchUsers();
    showSaved('User removed');
  };

  const handleSavePermissions = async () => {
    if (!permUser) return;
    const { error } = await supabase
      .from('user_profiles')
      .update({ permissions: permUser.permissions, updated_at: new Date().toISOString() })
      .eq('id', permUser.id);
    if (error) {
      showErr(error.message);
      return;
    }
    await fetchUsers();
    setShowPermModal(false);
    showSaved('Permissions updated');
  };

  const togglePermUser = (key: string) => {
    if (!permUser) return;
    setPermUser({ ...permUser, permissions: { ...permUser.permissions, [key]: !permUser.permissions[key] } });
  };

  const toggleFormPerm = (key: string) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  const handleRoleChange = (role: UserRole) => {
    setForm({ ...form, role, permissions: { ...DEFAULT_PERMISSIONS[role] } });
  };

  const enabledCount = (perms: Permissions) => Object.values(perms).filter(Boolean).length;

  const formatLastLogin = (ts?: string) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} team members</p>
        </div>
        <div className="flex items-center gap-3">
          {saveNotice && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Icon name="CheckIcon" size={13} /> {saveNotice}
            </span>
          )}
          {saveError && (
            <span className="text-xs text-red-400 font-medium flex items-center gap-1 max-w-xs truncate">
              <Icon name="ExclamationTriangleIcon" size={13} /> {saveError}
            </span>
          )}
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            Create User
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(Object.keys(roleLabels) as UserRole[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${roleColors[role]}`}>
                  {roleLabels[role]}
                </span>
                <span className="text-xl font-bold text-foreground">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {enabledCount(DEFAULT_PERMISSIONS[role])} modules enabled
              </p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex items-center border border-border overflow-hidden mb-4 w-fit">
        {(['all', 'super_admin', 'admin', 'marketing', 'agent'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterRole === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r === 'all' ? 'All' : roleLabels[r as UserRole]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {['User', 'Role', 'Modules Access', 'Status', 'Last Login', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {saveError ? (
                      <span className="text-red-400">{saveError}</span>
                    ) : (
                      'No users found.'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">{user.full_name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.phone && <p className="text-[10px] text-muted-foreground/60">{user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted h-1.5 w-24">
                          <div
                            className="bg-primary h-1.5 transition-all"
                            style={{ width: `${(enabledCount(user.permissions) / MODULES.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {enabledCount(user.permissions)}/{MODULES.length}
                        </span>
                        <button onClick={() => openPermissions(user)} className="text-[10px] text-primary hover:underline font-medium">
                          Edit
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                          user.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-muted-foreground bg-muted/50'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatLastLogin(user.last_login_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                          <Icon name="PencilIcon" size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                          <Icon name="TrashIcon" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Permissions Matrix */}
      <div className="mt-6 bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Role Permissions Matrix</h3>
          <div className="flex border border-border overflow-hidden">
            {(Object.keys(roleLabels) as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRoleTab(r)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeRoleTab === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {roleLabels[r].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODULES.map((mod) => {
            const enabled = DEFAULT_PERMISSIONS[activeRoleTab][mod.key];
            return (
              <div
                key={mod.key}
                className={`flex items-center gap-2 px-3 py-2 border ${enabled ? 'border-primary/20 bg-primary/5' : 'border-border bg-transparent'}`}
              >
                <div className={`w-2 h-2 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <span className={`text-xs ${enabled ? 'text-foreground' : 'text-muted-foreground/50'}`}>{mod.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-foreground mb-2">Remove User</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This will remove the user profile from the system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                {editUser ? 'Edit User' : 'Create User Account'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="Full name..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editUser}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                  placeholder="email@luxestate.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="+971 50 000 0000"
                />
              </div>
              {!editUser && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Temporary Password *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="flex-1 bg-secondary border border-border px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                      placeholder="Auto-generated password"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, password: generatePassword() })}
                      className="px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      title="Regenerate password"
                    >
                      <Icon name="ArrowPathIcon" size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    User can log in immediately with this password. Share it securely.
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabels[r]}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {form.role === 'super_admin' && 'Full access to all modules and settings.'}
                  {form.role === 'admin' && 'Full CRM access, can manage users and settings.'}
                  {form.role === 'marketing' && 'Access to leads, marketing, analytics, and blog.'}
                  {form.role === 'agent' && 'Access to own leads, contacts, deals, and calendar only.'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Module Permissions */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                  Module Access
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {MODULES.map((mod) => (
                    <div key={mod.key} className="flex items-center justify-between py-1.5 px-2 hover:bg-white/2">
                      <span className="text-xs text-foreground">{mod.label}</span>
                      <Toggle checked={!!form.permissions[mod.key]} onChange={() => toggleFormPerm(mod.key)} />
                    </div>
                  ))}
                </div>
              </div>

              {saveError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {saveError}
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.full_name.trim() || !form.email.trim() || isSaving}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                    {editUser ? 'Saving...' : 'Creating...'}
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

      {/* Permissions Modal */}
      {showPermModal && permUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Module Permissions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {permUser.full_name} · {roleLabels[permUser.role]}
                </p>
              </div>
              <button onClick={() => setShowPermModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {enabledCount(permUser.permissions)} of {MODULES.length} modules enabled
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, true])) })}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Enable All
                  </button>
                  <span className="text-muted-foreground/30">|</span>
                  <button
                    onClick={() => setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, false])) })}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Disable All
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {MODULES.map((mod) => (
                  <div
                    key={mod.key}
                    className={`flex items-center justify-between py-2.5 px-3 border transition-colors ${
                      permUser.permissions[mod.key] ? 'border-primary/20 bg-primary/5' : 'border-border bg-transparent'
                    }`}
                  >
                    <span className="text-sm text-foreground">{mod.label}</span>
                    <Toggle checked={!!permUser.permissions[mod.key]} onChange={() => togglePermUser(mod.key)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
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
    </div>
  );
}
