'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

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
  admin: Object.fromEntries(MODULES.map((m) => [m.key, !['contacts_own'].includes(m.key) ? true : false])),
  marketing: Object.fromEntries(MODULES.map((m) => [m.key, ['dashboard', 'leads_all', 'leads_own', 'marketing', 'analytics', 'blog'].includes(m.key)])),
  agent: Object.fromEntries(MODULES.map((m) => [m.key, ['dashboard', 'leads_own', 'contacts_own', 'deals_own', 'calendar_own', 'tasks'].includes(m.key)])),
};

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  permissions: Permissions;
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

const STORAGE_KEY = 'admin_users';

const seedUsers: User[] = [
  { id: 1, name: 'CEO Admin', email: 'ceo@luxestate.com', role: 'super_admin', status: 'Active', lastLogin: 'Today', permissions: { ...DEFAULT_PERMISSIONS.super_admin } },
  { id: 2, name: 'Admin Manager', email: 'admin@luxestate.com', role: 'admin', status: 'Active', lastLogin: '2 hours ago', permissions: { ...DEFAULT_PERMISSIONS.admin } },
  { id: 3, name: 'Marketing Team', email: 'marketing@luxestate.com', role: 'marketing', status: 'Active', lastLogin: 'Yesterday', permissions: { ...DEFAULT_PERMISSIONS.marketing } },
  { id: 4, name: 'Sarah Mitchell', email: 'sarah@luxestate.com', role: 'agent', status: 'Active', lastLogin: '3 hours ago', permissions: { ...DEFAULT_PERMISSIONS.agent } },
  { id: 5, name: 'James Carter', email: 'james@luxestate.com', role: 'agent', status: 'Active', lastLogin: 'Yesterday', permissions: { ...DEFAULT_PERMISSIONS.agent } },
  { id: 6, name: 'Omar Hassan', email: 'omar@luxestate.com', role: 'agent', status: 'Active', lastLogin: '3 days ago', permissions: { ...DEFAULT_PERMISSIONS.agent } },
];

function loadUsers(): User[] {
  if (typeof window === 'undefined') return seedUsers;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User[];
  } catch {}
  return seedUsers;
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  permissions: Permissions;
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
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [hydrated, setHydrated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>({ name: '', email: '', role: 'agent', status: 'Active', permissions: { ...DEFAULT_PERMISSIONS.agent } });
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('super_admin');
  const [saveNotice, setSaveNotice] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    setUsers(loadUsers());
    setHydrated(true);
  }, []);

  // Persist users to localStorage whenever they change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveUsers(users);
    }
  }, [users, hydrated]);

  const showSaved = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  const filtered = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);

  const openNew = () => {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'agent', status: 'Active', permissions: { ...DEFAULT_PERMISSIONS.agent } });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status, permissions: { ...u.permissions } });
    setShowModal(true);
  };

  const openPermissions = (u: User) => {
    setPermUser({ ...u, permissions: { ...u.permissions } });
    setShowPermModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editUser) {
      setUsers(users.map((u) => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...form, lastLogin: 'Never' }]);
    }
    setShowModal(false);
    showSaved();
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    showSaved();
  };

  const handleSavePermissions = () => {
    if (!permUser) return;
    setUsers(users.map((u) => u.id === permUser.id ? { ...u, permissions: { ...permUser.permissions } } : u));
    setShowPermModal(false);
    showSaved();
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
              <Icon name="CheckIcon" size={13} /> Saved
            </span>
          )}
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PlusIcon" size={14} />
            Invite User
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
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${roleColors[role]}`}>{roleLabels[role]}</span>
                <span className="text-xl font-bold text-foreground">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{enabledCount(DEFAULT_PERMISSIONS[role])} modules enabled</p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex items-center border border-border overflow-hidden mb-4 w-fit">
        {(['all', 'super_admin', 'admin', 'marketing', 'agent'] as const).map((r) => (
          <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterRole === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {r === 'all' ? 'All' : roleLabels[r as UserRole]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['User', 'Role', 'Modules Access', 'Status', 'Last Login', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={user.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${roleColors[user.role]}`}>{roleLabels[user.role]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted h-1.5 w-24">
                      <div className="bg-primary h-1.5 transition-all" style={{ width: `${(enabledCount(user.permissions) / MODULES.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{enabledCount(user.permissions)}/{MODULES.length}</span>
                    <button onClick={() => openPermissions(user)} className="text-[10px] text-primary hover:underline font-medium">Edit</button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${user.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-muted-foreground bg-muted/50'}`}>{user.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(user)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions Matrix */}
      <div className="mt-6 bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Role Permissions Matrix</h3>
          <div className="flex border border-border overflow-hidden">
            {(Object.keys(roleLabels) as UserRole[]).map((r) => (
              <button key={r} onClick={() => setActiveRoleTab(r)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRoleTab === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {roleLabels[r].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODULES.map((mod) => {
            const enabled = DEFAULT_PERMISSIONS[activeRoleTab][mod.key];
            return (
              <div key={mod.key} className={`flex items-center gap-2 px-3 py-2 border ${enabled ? 'border-primary/20 bg-primary/5' : 'border-border bg-transparent'}`}>
                <div className={`w-2 h-2 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <span className={`text-xs ${enabled ? 'text-foreground' : 'text-muted-foreground/50'}`}>{mod.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editUser ? 'Edit User' : 'Invite User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Full name..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="email@luxestate.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => handleRoleChange(e.target.value as UserRole)} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabels[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Module Permissions */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Module Access</label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {MODULES.map((mod) => (
                    <div key={mod.key} className="flex items-center justify-between py-1.5 px-2 hover:bg-white/2">
                      <span className="text-xs text-foreground">{mod.label}</span>
                      <Toggle checked={!!form.permissions[mod.key]} onChange={() => toggleFormPerm(mod.key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!form.name || !form.email} className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">
                {editUser ? 'Save Changes' : 'Send Invite'}
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
                <p className="text-xs text-muted-foreground mt-0.5">{permUser.name} · {roleLabels[permUser.role]}</p>
              </div>
              <button onClick={() => setShowPermModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{enabledCount(permUser.permissions)} of {MODULES.length} modules enabled</span>
                <div className="flex gap-2">
                  <button onClick={() => setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, true])) })} className="text-[10px] text-primary hover:underline">Enable All</button>
                  <span className="text-muted-foreground/30">|</span>
                  <button onClick={() => setPermUser({ ...permUser, permissions: Object.fromEntries(MODULES.map((m) => [m.key, false])) })} className="text-[10px] text-muted-foreground hover:text-foreground">Disable All</button>
                </div>
              </div>
              <div className="space-y-1">
                {MODULES.map((mod) => (
                  <div key={mod.key} className={`flex items-center justify-between py-2.5 px-3 border transition-colors ${permUser.permissions[mod.key] ? 'border-primary/20 bg-primary/5' : 'border-border bg-transparent'}`}>
                    <div>
                      <span className="text-sm text-foreground">{mod.label}</span>
                    </div>
                    <Toggle checked={!!permUser.permissions[mod.key]} onChange={() => togglePermUser(mod.key)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowPermModal(false)} className="flex-1 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSavePermissions} className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
