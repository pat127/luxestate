'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type UserRole = 'super_admin' | 'admin' | 'marketing' | 'agent';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'CEO Admin', email: 'ceo@luxestate.com', role: 'super_admin', status: 'Active', lastLogin: 'Today' },
  { id: 2, name: 'Admin Manager', email: 'admin@luxestate.com', role: 'admin', status: 'Active', lastLogin: '2 hours ago' },
  { id: 3, name: 'Marketing Team', email: 'marketing@luxestate.com', role: 'marketing', status: 'Active', lastLogin: 'Yesterday' },
  { id: 4, name: 'Sarah Mitchell', email: 'sarah@luxestate.com', role: 'agent', status: 'Active', lastLogin: '3 hours ago' },
  { id: 5, name: 'James Carter', email: 'james@luxestate.com', role: 'agent', status: 'Active', lastLogin: 'Yesterday' },
  { id: 6, name: 'Omar Hassan', email: 'omar@luxestate.com', role: 'agent', status: 'Active', lastLogin: '3 days ago' },
  { id: 7, name: 'Priya Sharma', email: 'priya@luxestate.com', role: 'agent', status: 'Inactive', lastLogin: '1 week ago' },
];

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

const rolePermissions: Record<UserRole, string> = {
  super_admin: 'Full Access + All Calendars',
  admin: 'Full Access (excl. CEO contacts)',
  marketing: 'Marketing + Leads',
  agent: 'Own Leads, Contacts, Deals, Calendar, Tasks',
};

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
}

const emptyForm: UserForm = { name: '', email: '', role: 'agent', status: 'Active' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  const filtered = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);

  const openNew = () => {
    setEditUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editUser) {
      setUsers(users.map((u) => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...form, lastLogin: 'Never' }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} team members</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name="PlusIcon" size={14} />
          Invite User
        </button>
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
              <p className="text-[10px] text-muted-foreground">{rolePermissions[role]}</p>
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
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterRole === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {r === 'all' ? 'All' : roleLabels[r as UserRole]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['User', 'Role', 'Permissions', 'Status', 'Last Login', ''].map((h) => (
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
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">{rolePermissions[user.role]}</td>
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

      {/* Role Permissions Reference */}
      <div className="mt-6 bg-card border border-border p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Role Permissions Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Module</th>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <th key={r} className="text-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{roleLabels[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { module: 'Dashboard', super_admin: true, admin: true, marketing: true, agent: true },
                { module: 'Leads (All)', super_admin: true, admin: true, marketing: true, agent: false },
                { module: 'Leads (Own)', super_admin: true, admin: true, marketing: true, agent: true },
                { module: 'Contacts (All)', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Contacts (Own)', super_admin: true, admin: true, marketing: false, agent: true },
                { module: 'Properties', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Projects', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Deals (All)', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Deals (Own)', super_admin: true, admin: true, marketing: false, agent: true },
                { module: 'Calendar (All)', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Calendar (Own)', super_admin: true, admin: true, marketing: false, agent: true },
                { module: 'Tasks (Own)', super_admin: true, admin: true, marketing: false, agent: true },
                { module: 'Marketing', super_admin: true, admin: true, marketing: true, agent: false },
                { module: 'Documents', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Analytics', super_admin: true, admin: true, marketing: true, agent: false },
                { module: 'User Management', super_admin: true, admin: true, marketing: false, agent: false },
                { module: 'Site Settings', super_admin: true, admin: true, marketing: false, agent: false },
              ].map((row, i) => (
                <tr key={row.module} className={`border-b border-border ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-2 text-xs text-foreground">{row.module}</td>
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <td key={r} className="px-4 py-2 text-center">
                      {(row as any)[r] ? (
                        <Icon name="CheckIcon" size={14} className="text-emerald-400 mx-auto" />
                      ) : (
                        <Icon name="XMarkIcon" size={14} className="text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editUser ? 'Edit User' : 'Invite User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Full name..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="email@luxestate.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabels[r]}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">{rolePermissions[form.role]}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
    </div>
  );
}
