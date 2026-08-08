'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/contexts/RoleContext';
import { createClient } from '@/lib/supabase/client';

// ─── Contacts types ───────────────────────────────────────────────────────────
interface Contact {
  id: string;
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

const emptyContactForm: ContactForm = {
  name: '', email: '', phone: '', whatsapp: '', type: 'Buyer', status: 'Active',
  nationality: '', assignedAgent: '', source: 'Website', budget: '', notes: '',
};

// ─── Institutional Client types ───────────────────────────────────────────────
interface InstitutionalClient {
  id: string;
  companyName: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  country: string;
  city: string;
  notes: string;
  status: string;
  createdAt: string;
}

interface InstitutionalForm {
  companyName: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  country: string;
  city: string;
  notes: string;
  status: string;
}

const emptyInstitutionalForm: InstitutionalForm = {
  companyName: '', category: 'Developer', contactPerson: '', email: '',
  phone: '', whatsapp: '', website: '', country: '', city: '', notes: '', status: 'Active',
};

const INSTITUTIONAL_CATEGORIES = ['Developer', 'Investment Co', 'Family Office', 'Fund', 'REIT', 'Bank', 'Other'];

const categoryColors: Record<string, string> = {
  Developer: 'text-primary bg-primary/10',
  'Investment Co': 'text-blue-400 bg-blue-400/10',
  'Family Office': 'text-purple-400 bg-purple-400/10',
  Fund: 'text-orange-400 bg-orange-400/10',
  REIT: 'text-emerald-400 bg-emerald-400/10',
  Bank: 'text-yellow-400 bg-yellow-400/10',
  Other: 'text-muted-foreground bg-muted/50',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const { currentUser, isAgentScoped, isRole } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const isSuperAdmin = isRole('super_admin');

  // Tab state
  const [activeTab, setActiveTab] = useState<'contacts' | 'institutional'>('contacts');

  // ── Contacts state ──────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyContactForm);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [bulkTypeValue, setBulkTypeValue] = useState('');
  const [convertConfirm, setConvertConfirm] = useState(false);

  // ── Institutional state ─────────────────────────────────────────────────────
  const [instClients, setInstClients] = useState<InstitutionalClient[]>([]);
  const [instLoading, setInstLoading] = useState(false);
  const [instSearch, setInstSearch] = useState('');
  const [instFilterCategory, setInstFilterCategory] = useState('All');
  const [instShowModal, setInstShowModal] = useState(false);
  const [editInstClient, setEditInstClient] = useState<InstitutionalClient | null>(null);
  const [instForm, setInstForm] = useState<InstitutionalForm>(emptyInstitutionalForm);
  const [instDeleteConfirm, setInstDeleteConfirm] = useState<string | null>(null);

  // ── Load contacts ───────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (isAgentScoped) {
      query = query.eq('assigned_agent', currentUser.name);
    }
    const { data } = await query;
    if (data) {
      setContacts(data.map((c: any) => ({
        id: c.id,
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        type: c.type || 'Buyer',
        status: c.status || 'Active',
        lastContact: c.last_contact || '',
        deals: c.deals || 0,
        nationality: c.nationality || '',
        assignedAgent: c.assigned_agent || '',
        notes: c.notes || '',
        source: c.source || '',
      })));
    }
    setLoading(false);
  }, [supabase, isAgentScoped, currentUser.name]);

  // ── Load institutional clients ──────────────────────────────────────────────
  const loadInstClients = useCallback(async () => {
    if (!isSuperAdmin) return;
    setInstLoading(true);
    const { data } = await supabase
      .from('institutional_clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setInstClients(data.map((c: any) => ({
        id: c.id,
        companyName: c.company_name || '',
        category: c.category || 'Developer',
        contactPerson: c.contact_person || '',
        email: c.email || '',
        phone: c.phone || '',
        whatsapp: c.whatsapp || '',
        website: c.website || '',
        country: c.country || '',
        city: c.city || '',
        notes: c.notes || '',
        status: c.status || 'Active',
        createdAt: c.created_at || '',
      })));
    }
    setInstLoading(false);
  }, [supabase, isSuperAdmin]);

  useEffect(() => { loadContacts(); }, [loadContacts]);
  useEffect(() => {
    if (activeTab === 'institutional' && isSuperAdmin) loadInstClients();
  }, [activeTab, loadInstClients, isSuperAdmin]);

  // ── Contacts helpers ────────────────────────────────────────────────────────
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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatusChange = async () => {
    if (!bulkStatusValue) return;
    await supabase.from('contacts').update({ status: bulkStatusValue }).in('id', Array.from(selectedIds));
    setBulkStatusValue('');
    clearSelection();
    loadContacts();
  };

  const handleBulkTypeChange = async () => {
    if (!bulkTypeValue) return;
    await supabase.from('contacts').update({ type: bulkTypeValue }).in('id', Array.from(selectedIds));
    setBulkTypeValue('');
    clearSelection();
    loadContacts();
  };

  const handleConvertToLead = async () => {
    const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
    const leadsToInsert = selectedContacts.map(c => ({
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      source: c.source || 'Website',
      status: 'New',
      nationality: c.nationality || null,
      assigned_agent: c.assignedAgent || null,
      notes: c.notes || null,
    }));
    if (leadsToInsert.length > 0) {
      await supabase.from('leads').insert(leadsToInsert);
    }
    setConvertConfirm(false);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await supabase.from('contacts').delete().in('id', Array.from(selectedIds));
    clearSelection();
    loadContacts();
  };

  const openNew = () => { setEditContact(null); setForm(emptyContactForm); setShowModal(true); };

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    setForm({ name: contact.name, email: contact.email, phone: contact.phone, whatsapp: '', type: contact.type, status: contact.status, nationality: contact.nationality || '', assignedAgent: contact.assignedAgent || '', source: contact.source || 'Website', budget: '', notes: contact.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    if (editContact) {
      await supabase.from('contacts').update({ name: form.name, email: form.email, phone: form.phone, type: form.type, status: form.status, nationality: form.nationality, assigned_agent: form.assignedAgent, notes: form.notes, source: form.source }).eq('id', editContact.id);
    } else {
      await supabase.from('contacts').insert({ name: form.name, email: form.email, phone: form.phone, type: form.type, status: form.status, nationality: form.nationality, assigned_agent: form.assignedAgent, notes: form.notes, source: form.source, budget: form.budget, last_contact: 'Just now' });
    }
    setShowModal(false);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    loadContacts();
  };

  // ── Institutional helpers ───────────────────────────────────────────────────
  const filteredInst = instClients.filter((c) => {
    const matchSearch =
      c.companyName.toLowerCase().includes(instSearch.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(instSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(instSearch.toLowerCase());
    const matchCat = instFilterCategory === 'All' || c.category === instFilterCategory;
    return matchSearch && matchCat;
  });

  const openNewInst = () => { setEditInstClient(null); setInstForm(emptyInstitutionalForm); setInstShowModal(true); };

  const openEditInst = (client: InstitutionalClient) => {
    setEditInstClient(client);
    setInstForm({
      companyName: client.companyName,
      category: client.category,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      website: client.website,
      country: client.country,
      city: client.city,
      notes: client.notes,
      status: client.status,
    });
    setInstShowModal(true);
  };

  const handleInstSave = async () => {
    if (!instForm.companyName) return;
    const payload = {
      company_name: instForm.companyName,
      category: instForm.category,
      contact_person: instForm.contactPerson,
      email: instForm.email,
      phone: instForm.phone,
      whatsapp: instForm.whatsapp,
      website: instForm.website,
      country: instForm.country,
      city: instForm.city,
      notes: instForm.notes,
      status: instForm.status,
    };
    if (editInstClient) {
      await supabase.from('institutional_clients').update(payload).eq('id', editInstClient.id);
    } else {
      await supabase.from('institutional_clients').insert(payload);
    }
    setInstShowModal(false);
    loadInstClients();
  };

  const handleInstDelete = async (id: string) => {
    await supabase.from('institutional_clients').delete().eq('id', id);
    setInstDeleteConfirm(null);
    loadInstClients();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeTab === 'contacts' ? `${contacts.length} total contacts` : `${instClients.length} institutional clients`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'contacts' ? (
            <>
              <button className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <Icon name="ArrowDownTrayIcon" size={14} />Export
              </button>
              <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                <Icon name="PlusIcon" size={14} />Add Contact
              </button>
            </>
          ) : (
            <button onClick={openNewInst} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
              <Icon name="PlusIcon" size={14} />Add Client
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <span className="flex items-center gap-2">
            <Icon name="UsersIcon" size={13} />
            Contacts
          </span>
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'institutional' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <span className="flex items-center gap-2">
              <Icon name="BuildingOffice2Icon" size={13} />
              Institutional Clients
            </span>
          </button>
        )}
      </div>

      {/* ── CONTACTS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'contacts' && (
        <>
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

          {/* Contacts Table */}
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
                {loading ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                ) : filtered.map((contact, i) => (
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
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No contacts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── INSTITUTIONAL CLIENTS TAB ─────────────────────────────────────────── */}
      {activeTab === 'institutional' && isSuperAdmin && (
        <>
          {/* Category stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            {INSTITUTIONAL_CATEGORIES.map((cat) => {
              const count = instClients.filter(c => c.category === cat).length;
              return (
                <button key={cat} onClick={() => setInstFilterCategory(cat === instFilterCategory ? 'All' : cat)}
                  className={`p-3 border text-center transition-colors ${instFilterCategory === cat ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${categoryColors[cat]?.split(' ')[0] || 'text-muted-foreground'}`}>{cat}</p>
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search clients..." value={instSearch} onChange={(e) => setInstSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <select value={instFilterCategory} onChange={(e) => setInstFilterCategory(e.target.value)} className="px-3 py-2 bg-card border border-border text-xs text-muted-foreground focus:outline-none focus:border-primary/50">
              <option value="All">All Categories</option>
              {INSTITUTIONAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Institutional Clients Table */}
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contact Person</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {instLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                ) : filteredInst.map((client, i) => (
                  <tr key={client.id} className={`border-b border-border hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon name="BuildingOffice2Icon" size={14} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{client.companyName}</span>
                          {client.website && <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{client.website}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${categoryColors[client.category] || 'text-muted-foreground bg-muted/50'}`}>{client.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{client.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{client.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                      {[client.city, client.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${statusColors[client.status] || ''}`}>{client.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditInst(client)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                        <button onClick={() => setInstDeleteConfirm(client.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!instLoading && filteredInst.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-primary/5 border border-primary/10 flex items-center justify-center">
                          <Icon name="BuildingOffice2Icon" size={22} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No institutional clients yet</p>
                        <button onClick={openNewInst} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                          <Icon name="PlusIcon" size={13} />Add First Client
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── MODALS ────────────────────────────────────────────────────────────── */}

      {/* Convert to Lead Confirm */}
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

      {/* Add/Edit Institutional Client Modal */}
      {instShowModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <Icon name="BuildingOffice2Icon" size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editInstClient ? 'Edit Institutional Client' : 'Add Institutional Client'}</h2>
              </div>
              <button onClick={() => setInstShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Company Name *</label>
                <input type="text" value={instForm.companyName} onChange={(e) => setInstForm({ ...instForm, companyName: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Emaar Properties" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={instForm.category} onChange={(e) => setInstForm({ ...instForm, category: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    {INSTITUTIONAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={instForm.status} onChange={(e) => setInstForm({ ...instForm, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Contact Person</label>
                <input type="text" value={instForm.contactPerson} onChange={(e) => setInstForm({ ...instForm, contactPerson: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Primary contact name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={instForm.email} onChange={(e) => setInstForm({ ...instForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="contact@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="text" value={instForm.phone} onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 4 000 0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">WhatsApp</label>
                  <input type="text" value={instForm.whatsapp} onChange={(e) => setInstForm({ ...instForm, whatsapp: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="+971 50 000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Website</label>
                  <input type="text" value={instForm.website} onChange={(e) => setInstForm({ ...instForm, website: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="https://company.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">City</label>
                  <input type="text" value={instForm.city} onChange={(e) => setInstForm({ ...instForm, city: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Dubai" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Country</label>
                  <input type="text" value={instForm.country} onChange={(e) => setInstForm({ ...instForm, country: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. UAE" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea rows={3} value={instForm.notes} onChange={(e) => setInstForm({ ...instForm, notes: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Investment focus, asset preferences, deal history..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setInstShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleInstSave} disabled={!instForm.companyName} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">{editInstClient ? 'Update Client' : 'Save Client'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Institutional Client Confirm */}
      {instDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Client</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this institutional client? All associated data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setInstDeleteConfirm(null)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleInstDelete(instDeleteConfirm)} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
