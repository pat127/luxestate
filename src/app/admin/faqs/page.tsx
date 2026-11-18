'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

interface FAQForm {
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

const emptyForm: FAQForm = {
  question: '',
  answer: '',
  category: 'General',
  sort_order: 0,
  is_published: true,
};

const CATEGORIES = ['General', 'Buying', 'Selling', 'Renting', 'Services', 'Legal', 'Finance'];

export default function AdminFAQsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('General');
  const [bulkError, setBulkError] = useState('');
  const [bulkPreview, setBulkPreview] = useState<{ question: string; answer: string }[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setFaqs(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchSearch =
        !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'All' || f.category === filterCategory;
      const matchStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Published' && f.is_published) ||
        (filterStatus === 'Draft' && !f.is_published);
      return matchSearch && matchCat && matchStatus;
    });
  }, [faqs, search, filterCategory, filterStatus]);

  const openAdd = () => {
    setEditFaq(null);
    setForm({ ...emptyForm, sort_order: faqs.length + 1 });
    setShowModal(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_published: faq.is_published,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    if (editFaq) {
      await supabase.from('faqs').update({ ...form }).eq('id', editFaq.id);
    } else {
      await supabase.from('faqs').insert({ ...form });
    }
    setSaving(false);
    setShowModal(false);
    fetchFaqs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    fetchFaqs();
  };

  const handleTogglePublish = async (faq: FAQ) => {
    await supabase.from('faqs').update({ is_published: !faq.is_published }).eq('id', faq.id);
    fetchFaqs();
  };

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} FAQs?`)) return;
    setBulkLoading(true);
    await supabase.from('faqs').delete().in('id', Array.from(selected));
    setSelected(new Set());
    setBulkLoading(false);
    fetchFaqs();
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (!selected.size) return;
    setBulkLoading(true);
    await supabase.from('faqs').update({ is_published: publish }).in('id', Array.from(selected));
    setSelected(new Set());
    setBulkLoading(false);
    fetchFaqs();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.id)));
    }
  };

  // Bulk upload parsing
  const parseBulkText = (text: string) => {
    setBulkError('');
    const lines = text.trim().split('\n').filter((l) => l.trim());
    const pairs: { question: string; answer: string }[] = [];

    // Try JSON format first
    if (text.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.question && item.answer) {
              pairs.push({ question: item.question.trim(), answer: item.answer.trim() });
            }
          }
          setBulkPreview(pairs);
          return;
        }
      } catch {
        setBulkError('Invalid JSON format. Check your JSON array syntax.');
        setBulkPreview([]);
        return;
      }
    }

    // Try Q: / A: format
    let currentQ = '';
    let currentA = '';
    for (const line of lines) {
      if (line.startsWith('Q:') || line.startsWith('Q.') || line.toLowerCase().startsWith('question:')) {
        if (currentQ && currentA) pairs.push({ question: currentQ.trim(), answer: currentA.trim() });
        currentQ = line.replace(/^Q[:.]\s*/i, '').replace(/^question:\s*/i, '').trim();
        currentA = '';
      } else if (line.startsWith('A:') || line.startsWith('A.') || line.toLowerCase().startsWith('answer:')) {
        currentA = line.replace(/^A[:.]\s*/i, '').replace(/^answer:\s*/i, '').trim();
      } else if (currentA) {
        currentA += ' ' + line.trim();
      }
    }
    if (currentQ && currentA) pairs.push({ question: currentQ.trim(), answer: currentA.trim() });

    if (pairs.length === 0) {
      setBulkError('Could not parse any Q&A pairs. Use Q: / A: format or JSON array format.');
    }
    setBulkPreview(pairs);
  };

  const handleBulkUpload = async () => {
    if (!bulkPreview.length) return;
    setBulkUploading(true);
    const maxOrder = faqs.length;
    const rows = bulkPreview.map((p, i) => ({
      question: p.question,
      answer: p.answer,
      category: bulkCategory,
      sort_order: maxOrder + i + 1,
      is_published: true,
    }));
    await supabase.from('faqs').insert(rows);
    setBulkUploading(false);
    setShowBulkModal(false);
    setBulkText('');
    setBulkPreview([]);
    setBulkError('');
    fetchFaqs();
  };

  const existingCategories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category)));
    return Array.from(new Set([...CATEGORIES, ...cats]));
  }, [faqs]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">FAQs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{faqs.length} total questions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowBulkModal(true); setBulkText(''); setBulkPreview([]); setBulkError(''); }}
            className="flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            <Icon name="ArrowUpTrayIcon" size={14} />
            Bulk Upload
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors duration-200"
          >
            <Icon name="PlusIcon" size={14} />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="All">All Categories</option>
          {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/30">
          <span className="text-xs font-semibold text-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => handleBulkPublish(true)} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
              Publish
            </button>
            <button onClick={() => handleBulkPublish(false)} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors">
              Unpublish
            </button>
            <button onClick={handleBulkDelete} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
              Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-card border-b border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="QuestionMarkCircleIcon" size={32} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No FAQs found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-primary"
                  />
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Question</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground w-28">Category</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground w-24">Status</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((faq) => (
                <tr key={faq.id} className={`hover:bg-white/5 transition-colors ${selected.has(faq.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(faq.id)}
                      onChange={() => toggleSelect(faq.id)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{faq.question}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{faq.answer}</p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5">{faq.category}</span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 ${faq.is_published ? 'text-emerald-400 bg-emerald-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                      {faq.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleTogglePublish(faq)}
                        title={faq.is_published ? 'Unpublish' : 'Publish'}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon name={faq.is_published ? 'EyeSlashIcon' : 'EyeIcon'} size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(faq)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon name="PencilIcon" size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editFaq ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Enter the question..."
                  className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Enter the answer..."
                  rows={5}
                  className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, is_published: !form.is_published })}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.is_published ? 'bg-primary' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-foreground">{form.is_published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.question.trim() || !form.answer.trim()}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editFaq ? 'Save Changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowBulkModal(false)}>
          <div className="bg-card border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Bulk Upload FAQs</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Upload multiple Q&amp;A pairs at once</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Format guide */}
              <div className="bg-background border border-border p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Supported Formats</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">Format 1 — Q: / A:</p>
                    <pre className="text-[11px] text-muted-foreground bg-card border border-border p-2 leading-relaxed whitespace-pre-wrap">{`Q: What is your commission?
A: Our standard commission is 2%.

Q: Do you handle off-plan?
A: Yes, we work with all major developers.`}</pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">Format 2 — JSON Array</p>
                    <pre className="text-[11px] text-muted-foreground bg-card border border-border p-2 leading-relaxed whitespace-pre-wrap">{`[
  {
    "question": "What is your commission?",
    "answer": "Our standard commission is 2%."
  }
]`}</pre>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Default Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Paste Q&amp;A Content</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => { setBulkText(e.target.value); parseBulkText(e.target.value); }}
                  placeholder="Paste your Q&A pairs here..."
                  rows={8}
                  className="w-full px-3 py-2.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none font-mono"
                />
              </div>

              {bulkError && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <Icon name="ExclamationCircleIcon" size={14} className="flex-shrink-0 mt-0.5" />
                  {bulkError}
                </div>
              )}

              {bulkPreview.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Preview — {bulkPreview.length} Q&amp;A pair{bulkPreview.length !== 1 ? 's' : ''} detected
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bulkPreview.map((p, i) => (
                      <div key={i} className="px-3 py-2.5 bg-background border border-border">
                        <p className="text-xs font-semibold text-foreground">{p.question}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={bulkUploading || bulkPreview.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Icon name="ArrowUpTrayIcon" size={13} />
                {bulkUploading ? 'Uploading...' : `Upload ${bulkPreview.length} FAQ${bulkPreview.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
