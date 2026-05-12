'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormField {
  fieldId: string;   // e.g. {{date}}
  label: string;
  fieldType: 'Text' | 'Long Text' | 'Number' | 'Date';
  required: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  form_fields: FormField[];
  requires_approval: boolean;
  created_at: string;
}

interface FilledDocument {
  id: string;
  template_id: string | null;
  template_name: string;
  category: string;
  title: string;
  field_values: Record<string, string>;
  notes: string;
  doc_status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  ceo_signature: string | null;
  approved_at: string | null;
  submitted_by: string;
  created_at: string;
}

type ActiveTab = 'templates' | 'documents';
type ModalMode = 'create' | 'edit' | null;

const CATEGORIES = ['NDA', 'Sales Contract', 'Rental Agreement', 'Offer Letter', 'Custom'];
const FIELD_TYPES: FormField['fieldType'][] = ['Text', 'Long Text', 'Number', 'Date'];

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-white/5 text-white/50 border border-white/10',
  'Pending Approval': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>,
  File: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>,
  Detect: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>,
  Print: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractPlaceholders(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const keys = matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
  return [...new Set(keys)];
}

function placeholderToLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fillContent(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (_, key) => values[key.trim()] || `___________`);
}

function fmtDate(val: string) {
  if (!val) return '___________';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return val; }
}

// ─── Template Modal ───────────────────────────────────────────────────────────
function TemplateModal({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: ModalMode;
  initial?: DocumentTemplate | null;
  onSave: (data: Omit<DocumentTemplate, 'id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'Custom');
  const [description, setDescription] = useState(initial?.description || '');
  const [content, setContent] = useState(initial?.content || '');
  const [fields, setFields] = useState<FormField[]>(initial?.form_fields || []);
  const [requiresApproval, setRequiresApproval] = useState(initial?.requires_approval ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const detectFields = () => {
    const keys = extractPlaceholders(content);
    const existing = new Map(fields.map(f => [f.fieldId, f]));
    const merged: FormField[] = keys.map(key => {
      const fid = `{{${key}}}`;
      if (existing.has(fid)) return existing.get(fid)!;
      const lbl = placeholderToLabel(key);
      const isDate = key.toLowerCase().includes('date');
      const isNum = key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('deposit') || key.toLowerCase().includes('rent') || key.toLowerCase().includes('sqft') || key.toLowerCase().includes('cheque') || key.toLowerCase().includes('period');
      const isLong = key.toLowerCase().includes('address') || key.toLowerCase().includes('terms') || key.toLowerCase().includes('conditions') || key.toLowerCase().includes('schedule') || key.toLowerCase().includes('description');
      return { fieldId: fid, label: lbl, fieldType: isDate ? 'Date' : isNum ? 'Number' : isLong ? 'Long Text' : 'Text', required: true };
    });
    setFields(merged);
  };

  const addField = () => {
    setFields(prev => [...prev, { fieldId: '', label: '', fieldType: 'Text', required: true }]);
  };

  const updateField = (idx: number, patch: Partial<FormField>) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const removeField = (idx: number) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return; }
    if (!content.trim()) { setError('Document content is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), category, description: description.trim(), content, form_fields: fields, requires_approval: requiresApproval });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">{mode === 'create' ? 'Create Template' : 'Edit Template'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">&lt;Icon.X /&gt;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Template Name <span className="text-primary">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sales Contract"
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50 placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              rows={2}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50 placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Document Content */}
          <div>
            <label className="block text-xs text-white/50 mb-1">Document Content</label>
            <p className="text-[11px] text-white/30 mb-2">Use {'{{field_id}}'} to insert placeholders (e.g. {'{{client_name}}'}, {'{{contract_date}}'})</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white/80 text-xs px-3 py-3 focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed"
              placeholder={'This Agreement is made on {{date}} between {{party_a}} and {{party_b}}...\n\nPROPERTY: {{property_address}}\nPURCHASE PRICE: AED {{purchase_price}}\n\nTerms and Conditions:\n{{terms_and_conditions}}'}
            />
          </div>

          {/* Form Fields */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <label className="block text-xs text-white/50">Form Fields</label>
                <p className="text-[11px] text-white/30 mt-0.5">Define fields that users must fill in. Click &quot;Detect from Content&quot; to auto-generate.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={detectFields}
                  className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-1.5 transition-colors"
                >
                  <Icon.Detect /> Detect from Content
                </button>
                <button
                  onClick={addField}
                  className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-1.5 transition-colors"
                >
                  <Icon.Plus /> Add Field
                </button>
              </div>
            </div>

            <div className="border border-white/10 bg-[#0a0a0a] mt-2">
              {fields.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-white/20 text-xs">No fields defined yet</div>
                  <div className="text-white/15 text-[11px] mt-1">Add {'{{placeholders}}'} in content, then click &quot;Detect from Content&quot;</div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_1fr_120px_80px_32px] gap-3 px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider">
                    <span>Field ID (in content)</span>
                    <span>Display Label</span>
                    <span>Field Type</span>
                    <span>Required</span>
                    <span></span>
                  </div>
                  {fields.map((field, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_120px_80px_32px] gap-3 px-4 py-3 items-center">
                      <input
                        value={field.fieldId}
                        onChange={e => updateField(idx, { fieldId: e.target.value })}
                        placeholder="{{field_name}}"
                        className="bg-white/5 border border-white/10 text-white/70 text-xs px-2 py-1.5 focus:outline-none focus:border-primary/40 font-mono"
                      />
                      <input
                        value={field.label}
                        onChange={e => updateField(idx, { label: e.target.value })}
                        placeholder="Display Label"
                        className="bg-white/5 border border-white/10 text-white/70 text-xs px-2 py-1.5 focus:outline-none focus:border-primary/40"
                      />
                      <select
                        value={field.fieldType}
                        onChange={e => updateField(idx, { fieldType: e.target.value as FormField['fieldType'] })}
                        className="bg-white/5 border border-white/10 text-white/70 text-xs px-2 py-1.5 focus:outline-none focus:border-primary/40"
                      >
                        {FIELD_TYPES.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => updateField(idx, { required: e.target.checked })}
                          className="accent-primary"
                        />
                        <span className="text-[11px] text-white/50">Required</span>
                      </label>
                      <button onClick={() => removeField(idx)} className="text-white/20 hover:text-red-400 transition-colors flex items-center justify-center">
                        <Icon.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Requires Approval */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={e => setRequiresApproval(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-white/70">Requires CEO/Admin approval</span>
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="text-sm text-white/50 hover:text-white px-4 py-2 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm bg-primary hover:bg-primary/90 text-black font-semibold px-5 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fill Document Modal ──────────────────────────────────────────────────────
function FillDocumentModal({
  template,
  onSave,
  onClose,
}: {
  template: DocumentTemplate;
  onSave: (values: Record<string, string>, title: string, notes: string) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(`${template.name} — ${new Date().toLocaleDateString('en-GB')}`);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const missing = template.form_fields.filter(f => f.required && !values[f.fieldId.replace(/\{\{|\}\}/g, '').trim()]);
    if (missing.length > 0) { setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(values, title, notes);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  const setValue = (fieldId: string, val: string) => {
    const key = fieldId.replace(/\{\{|\}\}/g, '').trim();
    setValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl rounded-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white">Fill Document</h2>
            <p className="text-xs text-white/40 mt-0.5">{template.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">&lt;Icon.X /&gt;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Document Title */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Document Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Fields */}
          {template.form_fields.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">Fill in the fields below</p>
              {template.form_fields.map((field) => {
                const key = field.fieldId.replace(/\{\{|\}\}/g, '').trim();
                return (
                  <div key={field.fieldId}>
                    <label className="block text-xs text-white/60 mb-1.5">
                      {field.label} {field.required && <span className="text-primary">*</span>}
                    </label>
                    {field.fieldType === 'Long Text' ? (
                      <textarea
                        value={values[key] || ''}
                        onChange={e => setValue(field.fieldId, e.target.value)}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50 resize-none"
                      />
                    ) : (
                      <input
                        type={field.fieldType === 'Date' ? 'date' : field.fieldType === 'Number' ? 'number' : 'text'}
                        value={values[key] || ''}
                        onChange={e => setValue(field.fieldId, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Internal Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-primary/50 resize-none placeholder:text-white/20"
              placeholder="Any internal notes..."
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="text-sm text-white/50 hover:text-white px-4 py-2 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm bg-primary hover:bg-primary/90 text-black font-semibold px-5 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreviewModal({
  doc,
  template,
  onClose,
  onApprove,
  onSendForApproval,
}: {
  doc: FilledDocument;
  template: DocumentTemplate | null;
  onClose: () => void;
  onApprove?: (sig: string) => void;
  onSendForApproval?: () => void;
}) {
  const [ceoSig, setCeoSig] = useState('');
  const [showSignInput, setShowSignInput] = useState(false);

  const refNo = `CE/${doc.category.replace(/\s+/g, '').substring(0, 4).toUpperCase()}/${new Date(doc.created_at).getFullYear()}/${String(new Date(doc.created_at).getMonth() + 1).padStart(2, '0')}/${doc.id.substring(0, 6).toUpperCase()}`;

  const filledContent = template ? fillContent(template.content, doc.field_values) : '';

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${doc.title}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .page{max-width:760px;margin:0 auto;padding:64px}
      .ref-strip{display:flex;justify-content:space-between;border-bottom:1px solid #e8e3d8;padding-bottom:14px;margin-bottom:40px}
      .ref-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#b0a080;font-weight:600}
      .ref-no{font-size:9px;color:#8a7040;font-weight:600}
      .title-block{text-align:center;margin-bottom:48px}
      .cat-label{font-size:7px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;margin-bottom:14px;font-weight:700}
      .doc-title{font-size:20px;font-weight:700;letter-spacing:1px;color:#0f0f0f;text-transform:uppercase;line-height:1.3}
      .gold-rule{width:48px;height:2px;background:#C9A84C;margin:16px auto 0}
      .content{font-size:11px;color:#333;line-height:1.9;white-space:pre-wrap;margin-bottom:48px}
      .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:48px;margin-bottom:40px}
      .sig-line{min-height:56px;border-bottom:1.5px solid #1a1a1a;margin-bottom:10px}
      .sig-role{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
      .sig-date{font-size:10px;color:#aaa;margin-top:6px}
      .approved-stamp{border:1.5px solid #22c55e;background:#f0fdf4;padding:20px;text-align:center;margin-bottom:32px}
      .footer-rule{border-top:1px solid #e8e3d8;padding-top:12px;display:flex;justify-content:space-between}
      .footer-text{font-size:8px;color:#c0b080;letter-spacing:1.5px;text-transform:uppercase}
      @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><div class="page">
      <div class="ref-strip"><div class="ref-label">Cove Estates · Confidential</div><div class="ref-no">Ref: ${refNo}</div></div>
      <div class="title-block"><div class="cat-label">${doc.category}</div><div class="doc-title">${doc.template_name}</div><div class="gold-rule"></div></div>
      <div class="content">${filledContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      <div class="sig-grid">
        <div><div class="sig-line"></div><div class="sig-role">Authorised Signatory</div><div class="sig-date">Date: _______________</div></div>
        <div><div class="sig-line"></div><div class="sig-role">Authorised Signatory</div><div class="sig-date">Date: _______________</div></div>
      </div>
      ${doc.ceo_signature ? `<div class="approved-stamp"><div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#16a34a;margin-bottom:8px">✓ Approved &amp; Executed</div><div style="font-size:28px;font-style:italic;color:#C9A84C;font-family:Georgia,serif">${doc.ceo_signature}</div><div style="font-size:9px;color:#888;margin-top:6px">Authorised on ${doc.approved_at}</div></div>` : ''}
      <div class="footer-rule"><div class="footer-text">Confidential · Not for Distribution</div><div class="footer-text">${refNo}</div></div>
    </div><script>window.onload=function(){window.print()}<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary">&lt;Icon.File /&gt;</div>
            <div>
              <h2 className="text-sm font-bold text-white">{doc.template_name}</h2>
              <p className="text-xs text-white/40">{doc.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${STATUS_STYLES[doc.doc_status]}`}>{doc.doc_status}</span>
            <button onClick={onClose} className="text-white/40 hover:text-white ml-2">&lt;Icon.X /&gt;</button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-2xl mx-auto bg-white shadow-lg px-12 py-10">
            {/* Ref strip */}
            <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #e8e3d8', paddingBottom:'14px', marginBottom:'40px' }}>
              <span style={{ fontSize:'9px', letterSpacing:'2.5px', textTransform:'uppercase', color:'#b0a080', fontWeight:600 }}>Cove Estates · Confidential</span>
              <span style={{ fontSize:'9px', color:'#8a7040', fontWeight:600 }}>Ref: {refNo}</span>
            </div>
            {/* Title */}
            <div style={{ textAlign:'center', marginBottom:'40px' }}>
              <div style={{ fontSize:'7px', letterSpacing:'4px', textTransform:'uppercase', color:'#C9A84C', marginBottom:'12px', fontWeight:700 }}>{doc.category}</div>
              <div style={{ fontSize:'18px', fontWeight:700, letterSpacing:'1px', color:'#0f0f0f', textTransform:'uppercase', lineHeight:1.3 }}>{doc.template_name}</div>
              <div style={{ width:'48px', height:'2px', background:'#C9A84C', margin:'14px auto 0' }} />
            </div>
            {/* Content */}
            <div style={{ fontSize:'11px', color:'#333', lineHeight:1.9, whiteSpace:'pre-wrap', marginBottom:'48px', fontFamily:"'Helvetica Neue', Arial, sans-serif" }}>
              {filledContent}
            </div>
            {/* Signatures */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', marginTop:'48px', marginBottom:'32px' }}>
              <div>
                <div style={{ minHeight:'56px', borderBottom:'1.5px solid #1a1a1a', marginBottom:'10px' }} />
                <div style={{ fontSize:'9px', color:'#888', textTransform:'uppercase', letterSpacing:'1.5px' }}>Authorised Signatory</div>
                <div style={{ fontSize:'10px', color:'#aaa', marginTop:'6px' }}>Date: _______________</div>
              </div>
              <div>
                <div style={{ minHeight:'56px', borderBottom:'1.5px solid #1a1a1a', marginBottom:'10px' }} />
                <div style={{ fontSize:'9px', color:'#888', textTransform:'uppercase', letterSpacing:'1.5px' }}>Authorised Signatory</div>
                <div style={{ fontSize:'10px', color:'#aaa', marginTop:'6px' }}>Date: _______________</div>
              </div>
            </div>
            {/* CEO Stamp */}
            {doc.doc_status === 'Approved' && doc.ceo_signature && (
              <div style={{ border:'1.5px solid #22c55e', background:'#f0fdf4', padding:'20px', textAlign:'center', marginBottom:'32px' }}>
                <div style={{ fontSize:'7px', fontWeight:700, textTransform:'uppercase', letterSpacing:'2.5px', color:'#16a34a', marginBottom:'8px' }}>✓ Approved & Executed</div>
                <div style={{ fontSize:'28px', fontStyle:'italic', color:'#C9A84C', fontFamily:'Georgia, serif' }}>{doc.ceo_signature}</div>
                <div style={{ fontSize:'9px', color:'#888', marginTop:'6px' }}>Authorised on {doc.approved_at}</div>
              </div>
            )}
            {/* Footer */}
            <div style={{ borderTop:'1px solid #e8e3d8', paddingTop:'12px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'8px', color:'#c0b080', letterSpacing:'1.5px', textTransform:'uppercase' }}>Confidential · Not for Distribution</span>
              <span style={{ fontSize:'8px', color:'#c0b080' }}>{refNo}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#111]">
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-2 transition-colors">
              <Icon.Print /> Print / PDF
            </button>
            {doc.doc_status === 'Pending Approval' && (
              <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-2 transition-colors">
                <Icon.Download /> Download PDF
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {doc.doc_status === 'Draft' && onSendForApproval && (
              <button onClick={onSendForApproval} className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-3 py-2 transition-colors">
                <Icon.Send /> Send for Approval
              </button>
            )}
            {doc.doc_status === 'Pending Approval' && onApprove && (
              <>
                {!showSignInput ? (
                  <button onClick={() => setShowSignInput(true)} className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-2 transition-colors">
                    <Icon.Check /> Review & E-Sign
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={ceoSig}
                      onChange={e => setCeoSig(e.target.value)}
                      placeholder="Type your signature..."
                      className="bg-white/5 border border-white/10 text-white text-sm px-3 py-1.5 focus:outline-none focus:border-primary/50 w-44"
                    />
                    <button
                      onClick={() => { if (ceoSig.trim() && onApprove) onApprove(ceoSig.trim()); }}
                      disabled={!ceoSig.trim()}
                      className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-3 py-2 transition-colors disabled:opacity-40"
                    >
                      <Icon.Check /> Approve
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>('templates');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<FilledDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals
  const [templateModal, setTemplateModal] = useState<{ mode: ModalMode; template?: DocumentTemplate | null }>({ mode: null });
  const [fillModal, setFillModal] = useState<DocumentTemplate | null>(null);
  const [previewDoc, setPreviewDoc] = useState<FilledDocument | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setTemplates(data as DocumentTemplate[]);
  }, [supabase]);

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('filled_documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setDocuments(data as FilledDocument[]);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchDocuments()]);
      setLoading(false);
    };
    load();
  }, [fetchTemplates, fetchDocuments]);

  // ── Template CRUD ──────────────────────────────────────────────────────────
  const saveTemplate = async (data: Omit<DocumentTemplate, 'id' | 'created_at'>) => {
    if (templateModal.mode === 'edit' && templateModal.template) {
      const { error } = await supabase
        .from('document_templates')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', templateModal.template.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('document_templates').insert(data);
      if (error) throw error;
    }
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template? Filled documents will not be affected.')) return;
    await supabase.from('document_templates').delete().eq('id', id);
    await fetchTemplates();
  };

  // ── Document CRUD ──────────────────────────────────────────────────────────
  const createDocument = async (values: Record<string, string>, title: string, notes: string) => {
    if (!fillModal) return;
    const { error } = await supabase.from('filled_documents').insert({
      template_id: fillModal.id,
      template_name: fillModal.name,
      category: fillModal.category,
      title,
      field_values: values,
      notes,
      doc_status: 'Draft',
      submitted_by: 'Admin',
    });
    if (error) throw error;
    await fetchDocuments();
    setActiveTab('documents');
  };

  const sendForApproval = async (docId: string) => {
    await supabase.from('filled_documents').update({ doc_status: 'Pending Approval' }).eq('id', docId);
    await fetchDocuments();
    if (previewDoc?.id === docId) setPreviewDoc(prev => prev ? { ...prev, doc_status: 'Pending Approval' } : null);
  };

  const approveDocument = async (docId: string, sig: string) => {
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    await supabase.from('filled_documents').update({ doc_status: 'Approved', ceo_signature: sig, approved_at: now }).eq('id', docId);
    await fetchDocuments();
    setPreviewDoc(null);
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await supabase.from('filled_documents').delete().eq('id', id);
    await fetchDocuments();
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const allCategories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const filteredDocuments = documents.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.template_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || d.category === filterCategory;
    return matchSearch && matchCat;
  });

  const previewTemplate = previewDoc ? templates.find(t => t.id === previewDoc.template_id) || null : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Document Center</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage document templates and filled documents</p>
          </div>
          <button
            onClick={() => setTemplateModal({ mode: 'create' })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black text-sm font-semibold px-4 py-2 transition-colors"
          >
            <Icon.Plus /> New Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-white/10">
          {(['templates', 'documents'] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              {tab === 'templates' ? `Templates (${templates.length})` : `My Documents (${documents.length})`}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">&lt;Icon.Search /&gt;</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 text-white text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 placeholder:text-white/20"
            />
          </div>
          <div className="flex items-center gap-1">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-3 py-1.5 border transition-colors ${filterCategory === cat ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeTab === 'templates' ? (
          /* ── Templates Grid ── */
          filteredTemplates.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm">No templates yet. Create your first template.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="bg-[#111] border border-white/10 hover:border-white/20 transition-colors p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Icon.File />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTemplateModal({ mode: 'edit', template })}
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                        title="Edit template"
                      >
                        <Icon.Edit />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                        title="Delete template"
                      >
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug mb-1">{template.name}</h3>
                  <p className="text-xs text-white/40 mb-3 flex-1 line-clamp-2">{template.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-[10px] bg-white/5 border border-white/10 text-white/50 px-2 py-0.5">{template.category}</span>
                    <span className="text-[10px] text-white/30">{template.form_fields.length} fields</span>
                    {template.requires_approval && (
                      <span className="text-[10px] text-amber-400/70">· Requires approval</span>
                    )}
                  </div>
                  <button
                    onClick={() => setFillModal(template)}
                    className="w-full text-sm bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-medium py-2 transition-colors"
                  >
                    Fill Document
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── Documents List ── */
          filteredDocuments.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">No documents yet. Fill a template to create one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="bg-[#111] border border-white/10 hover:border-white/20 transition-colors px-5 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-white/40 flex-shrink-0">
                    <Icon.File />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{doc.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{doc.template_name} · {doc.category} · {new Date(doc.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 flex-shrink-0 ${STATUS_STYLES[doc.doc_status]}`}>
                    {doc.doc_status}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-white/30 hover:text-white transition-colors"
                      title="Preview"
                    >
                      <Icon.Eye />
                    </button>
                    {doc.doc_status === 'Draft' && (
                      <button
                        onClick={() => sendForApproval(doc.id)}
                        className="p-2 text-white/30 hover:text-amber-400 transition-colors"
                        title="Send for approval"
                      >
                        <Icon.Send />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Modals ── */}
      {templateModal.mode && (
        <TemplateModal
          mode={templateModal.mode}
          initial={templateModal.template}
          onSave={saveTemplate}
          onClose={() => setTemplateModal({ mode: null })}
        />
      )}

      {fillModal && (
        <FillDocumentModal
          template={fillModal}
          onSave={createDocument}
          onClose={() => setFillModal(null)}
        />
      )}

      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          template={previewTemplate}
          onClose={() => setPreviewDoc(null)}
          onSendForApproval={() => sendForApproval(previewDoc.id)}
          onApprove={(sig) => approveDocument(previewDoc.id, sig)}
        />
      )}
    </div>
  );
}
