'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/contexts/RoleContext';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  lastContact: string;
  deals: number;
  nationality?: string;
  assignedAgent?: string;
  notes?: string;
  source?: string;
}

const CONTACTS_STORAGE_KEY = 'admin_contacts';
const IMPORT_STORAGE_KEY = 'imported_contacts';

const seedContacts: Contact[] = [];

function loadContacts(): Contact[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
    const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Contact[];
    let base: Contact[] = stored ? JSON.parse(stored) : [];
    const existingIds = new Set(base.map(c => c.id));
    const newImports = imported.filter(c => !existingIds.has(c.id));
    if (newImports.length > 0) {
      base = [...base, ...newImports];
      localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(base));
    }
    return base;
  } catch {
    return [];
  }
}

function saveContacts(contacts: Contact[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Inactive: 'text-muted-foreground bg-muted/50',
};

const typeColors: Record<string, string> = {
  Buyer: 'text-primary bg-primary/10',
  Investor: 'text-blue-400 bg-blue-400/10',
  Seller: 'text-orange-400 bg-orange-400/10',
  Tenant: 'text-purple-400 bg-purple-400/10',
  Landlord: 'text-emerald-400 bg-emerald-400/10',
};

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  type: string;
  status: string;
  nationality: string;
  assignedAgent: string;
  source: string;
  budget: string;
  notes: string;
}

const emptyForm: ContactForm = {
  name: '', email: '', phone: '', whatsapp: '', type: 'Buyer', status: 'Active',
  nationality: '', assignedAgent: '', source: 'Website', budget: '', notes: '',
};

export default function ContactsPage() {
  const { currentUser, isAgentScoped } = useRole();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [bulkTypeValue, setBulkTypeValue] = useState('');
  const [convertConfirm, setConvertConfirm] = useState(false);

  useEffect(() => {
    const allContacts = loadContacts();
    // Agents see only contacts assigned to them
    if (isAgentScoped) {
      setContacts(allContacts.filter(c => 
        (c.assignedAgent || '').toLowerCase().trim() === currentUser.name.toLowerCase().trim()
      ));
    } else {
      setContacts(allContacts);
    }
  }, [isAgentScoped, currentUser.name]);

  // Poll for new imports
  useEffect(() => {
    const interval = setInterval(() => {
      const imported = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]') as Contact[];
      if (imported.length > 0) {
        setContacts(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newImports = imported.filter(c => !existingIds.has(c.id));
          if (newImports.length === 0) return prev;
          // For agents, only include imports assigned to them
          const filtered = isAgentScoped
            ? newImports.filter(c => (c.assignedAgent || '').toLowerCase().trim() === currentUser.name.toLowerCase().trim())
            : newImports;
          if (filtered.length === 0) return prev;
          const updated = [...prev, ...filtered];
          localStorage.setItem(IMPORT_STORAGE_KEY, '[]');
          if (!isAgentScoped) localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAgentScoped, currentUser.name]);

  const updateContacts = (updated: Contact[]) => {
    setContacts(updated);
    // Only persist full list for non-agents; agents work with filtered view
    if (!isAgentScoped) {
      saveContacts(updated);
    } else {
      // Merge agent's updated contacts back into full list
      const all = loadContacts();
      const agentIds = new Set(updated.map(c => c.id));
      const others = all.filter(c => 
        (c.assignedAgent || '').toLowerCase().trim() !== currentUser.name.toLowerCase().trim()
      );
      saveContacts([...others, ...updated]);
    }
  };

  const types = ['All', 'Buyer', 'Investor', 'Seller', 'Tenant', 'Landlord'];

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchType = filterType === 'All' || c.type === filterType;
    return matchSearch && matchType;
  });

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach((c) => newSet.delete(c.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach((c) => newSet.add(c.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = () => {
    if (!bulkStatusValue) return;
    updateContacts(contacts.map((c) => selectedIds.has(c.id) ? { ...c, status: bulkStatusValue } : c));
    setBulkStatusValue('');
    clearSelection();
  };

  const handleBulkTypeChange = () => {
    if (!bulkTypeValue) return;
    updateContacts(contacts.map((c) => selectedIds.has(c.id) ? { ...c, type: bulkTypeValue } : c));
    setBulkTypeValue('');
    clearSelection();
  };

  const handleConvertToLead = () => {
    setConvertConfirm(false);
    clearSelection();
    alert(`${selectedIds.size} contact(s) converted to leads successfully.`);
  };

  const handleBulkDelete = () => {
    updateContacts(contacts.filter((c) => !selectedIds.has(c.id)));
    clearSelection();
  };

  const openNew = () => { setEditContact(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    setForm({ name: contact.name, email: contact.email, phone: contact.phone, whatsapp: '', type: contact.type, status: contact.status, nationality: contact.nationality || '', assignedAgent: contact.assignedAgent || '', source: contact.source || 'Website', budget: '', notes: contact.notes || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editContact) {
      updateContacts(contacts.map(c => c.id === editContact.id ? { ...c, name: form.name, email: form.email, phone: form.phone, type: form.type, status: form.status, nationality: form.nationality, assignedAgent: form.assignedAgent, source: form.source, notes: form.notes } : c));
    } else {
      updateContacts([...contacts, { id: Date.now(), name: form.name, email: form.email, phone: form.phone, type: form.type, status: form.status, lastContact: 'Just now', deals: 0, nationality: form.nationality, assignedAgent: form.assignedAgent, source: form.source, notes: form.notes }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => updateContacts(contacts.filter(c => c.id !== id));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} total contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Icon name="ArrowDownTrayIcon" size={14} />Export
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
            <Icon name="PlusIcon" size={14} />Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {types.slice(1).map((t) => {
          const count = contacts.filter(c => c.type === t).length;
          return (
            <button key={t} onClick={() => setFilterType(t === filterType ? 'All' : t)} className={`p-3 border text-center transition-colors ${filterType === t ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}>
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${typeColors[t]?.split(' ')[0] || 'text-muted-foreground'}`}>{t}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-card border border-border text-xs text-muted-foreground focus:outline-none focus:border-primary/50">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-2">
            <div className="flex items-center gap-1">
              <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="px-2 py-1.5 bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary/50">
                <option value="">Change Status...</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <button onClick={handleBulkStatusChange} disabled={!bulkStatusValue} className="px-3 py-1.5 bg-card border border-border text-xs text-foreground hover:border-primary/50 transition-colors disabled:opacity-40">Apply</button>
            </div>
            <div className="flex items-center gap-1">
              <select value={bulkTypeValue} onChange={(e) => setBulkTypeValue(e.target.value)} className="px-2 py-1.5 bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary/50">
                <option value="">Change Type...</option>
                <option>Buyer</option><option>Investor</option><option>Seller</option><option>Tenant</option><option>Landlord</option>
              </select>
              <button onClick={handleBulkTypeChange} disabled={!bulkTypeValue} className="px-3 py-1.5 bg-card border border-border text-xs text-foreground hover:border-primary/50 transition-colors disabled:opacity-40">Apply</button>
            </div>
            <button onClick={() => setConvertConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
              <Icon name="ArrowRightCircleIcon" size={13} />Convert to Lead
            </button>
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              <Icon name="TrashIcon" size={13} />Delete
            </button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Source</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Last Contact</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Deals</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((contact, i) => (
              <tr key={contact.id} className={`border-b border-border hover:bg-white/2 transition-colors ${selectedIds.has(contact.id) ? 'bg-primary/5' : i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(contact.id)} onChange={() => toggleSelect(contact.id)} className="w-4 h-4 accent-[#C5A47E] cursor-pointer rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">{contact.name[0]}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{contact.name}</span>
                      {contact.nationality && <p className="text-[10px] text-muted-foreground">{contact.nationality}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{contact.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{contact.phone}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${typeColors[contact.type] || 'text-muted-foreground bg-muted/50'}`}>{contact.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[contact.status] || ''}`}>{contact.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{contact.source || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">{contact.lastContact}</td>
                <td className="px-4 py-3 text-sm text-foreground font-semibold hidden xl:table-cell">{contact.deals}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(contact)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No contacts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Convert to Lead Confirm Modal */}
      {convertConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Icon name="ArrowRightCircleIcon" size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Convert to Lead</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIds.size} contact(s) will be converted</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Selected contacts will be added to the Leads pipeline with status "New". This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConvertConfirm(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleConvertToLead} className="flex-1 py-2 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors">Convert</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">WhatsApp</label>
                  <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Nationality</label>
                  <input type="text" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. British" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Contact Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Buyer</option><option>Investor</option><option>Seller</option><option>Tenant</option><option>Landlord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Website</option><option>Referral</option><option>Instagram</option><option>LinkedIn</option><option>Walk-in</option><option>Property Finder</option><option>Bayut</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Assigned Agent</label>
                  <select value={form.assignedAgent} onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="">Select agent</option>
                    <option>Sarah Mitchell</option><option>James Carter</option><option>Omar Hassan</option><option>Priya Sharma</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Budget Range</label>
                <input type="text" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. AED 2M - 5M" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editContact ? 'Update Contact' : 'Save Contact'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
