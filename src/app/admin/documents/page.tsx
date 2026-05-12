'use client';

import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface TemplateTerm {
  id: number;
  text: string;
}

interface TemplateDefinition {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  fields: TemplateField[];
  terms: TemplateTerm[];
  requiresApproval: boolean;
}

type DocStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

interface FilledDocument {
  id: number;
  templateId: string;
  templateName: string;
  shortName: string;
  category: string;
  title: string;
  fields: Record<string, string>;
  notes: string;
  terms: TemplateTerm[];
  status: DocStatus;
  createdAt: string;
  ceoSignature?: string;
  approvedAt?: string;
  submittedBy: string;
}

// ─── Default Templates ────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'ncnda',
    name: 'Non-Circumvention, Non-Disclosure Agreement',
    shortName: 'NCNDA',
    category: 'NDA',
    description: 'Confidentiality and non-circumvention agreement between broker and buyer representative',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'Agreement Date', type: 'date', required: true },
      { key: 'party1_company', label: 'First Party — Company Name', type: 'text', required: true, placeholder: 'e.g. Cove Estates LLC' },
      { key: 'party1_license', label: 'First Party — License No.', type: 'text', required: true, placeholder: 'e.g. 1432541' },
      { key: 'party1_orn', label: 'First Party — ORN', type: 'text', required: true, placeholder: 'e.g. 46855' },
      { key: 'party1_address', label: 'First Party — Office Address', type: 'text', required: true, placeholder: 'e.g. 802, Moosa Tower, Dubai, UAE' },
      { key: 'party1_signatory', label: 'First Party — Authorised Signatory', type: 'text', required: true, placeholder: 'Full name...' },
      { key: 'party1_initials', label: 'First Party — Initials', type: 'text', required: true, placeholder: 'e.g. LX' },
      { key: 'party2_company', label: 'Second Party — Company Name', type: 'text', required: true, placeholder: 'e.g. Investor Corp' },
      { key: 'party2_license', label: 'Second Party — Trade License', type: 'text', required: true, placeholder: 'e.g. 54321' },
      { key: 'party2_orn', label: 'Second Party — ORN', type: 'text', required: false, placeholder: 'e.g. 09876' },
      { key: 'party2_address', label: 'Second Party — Office Address', type: 'text', required: true, placeholder: 'e.g. Abu Dhabi, UAE' },
      { key: 'party2_signatory', label: 'Second Party — Authorised Signatory', type: 'text', required: true, placeholder: 'Full name...' },
      { key: 'party2_initials', label: 'Second Party — Initials', type: 'text', required: true, placeholder: 'e.g. IC' },
      { key: 'property_description', label: 'Property / Plot Description', type: 'text', required: true, placeholder: 'e.g. Plots listed in Appendix A' },
      { key: 'duration', label: 'Agreement Duration', type: 'select', required: true, options: ['1 Year', '2 Years', '3 Years', '5 Years', 'Indefinite'] },
      { key: 'governing_law', label: 'Governing Law', type: 'text', required: true, placeholder: 'e.g. Laws of the UAE' },
    ],
    terms: [],
  },
  {
    id: 'mou',
    name: 'Memorandum of Understanding',
    shortName: 'MOU',
    category: 'Sales Contract',
    description: 'Standard MOU for property transactions between buyer and seller',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'MOU Date', type: 'date', required: true },
      { key: 'buyer_name', label: 'Buyer Full Name', type: 'text', required: true, placeholder: 'Full legal name...' },
      { key: 'buyer_passport', label: 'Buyer Passport / Emirates ID', type: 'text', required: true, placeholder: 'e.g. A1234567' },
      { key: 'buyer_nationality', label: 'Buyer Nationality', type: 'text', required: true, placeholder: 'e.g. British' },
      { key: 'seller_name', label: 'Seller Full Name', type: 'text', required: true, placeholder: 'Full legal name...' },
      { key: 'seller_passport', label: 'Seller Passport / Emirates ID', type: 'text', required: true, placeholder: 'e.g. B7654321' },
      { key: 'property_ref', label: 'Property Reference No.', type: 'text', required: true, placeholder: 'e.g. LX-RES-004' },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true, placeholder: 'Full property address...' },
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office', 'Retail', 'Warehouse'] },
      { key: 'agreed_price', label: 'Agreed Sale Price (AED)', type: 'number', required: true },
      { key: 'deposit_amount', label: 'Deposit Amount (AED)', type: 'number', required: true },
      { key: 'payment_method', label: 'Payment Method', type: 'select', required: true, options: ['Cash', 'Mortgage', 'Installment Plan'] },
      { key: 'completion_date', label: 'Completion Date', type: 'date', required: true },
      { key: 'transfer_date', label: 'Transfer Date', type: 'date', required: true },
      { key: 'agent_name', label: 'Agent Name', type: 'text', required: false, placeholder: 'Handling agent...' },
      { key: 'special_conditions', label: 'Special Conditions', type: 'textarea', required: false, placeholder: 'Any special conditions...' },
    ],
    terms: [],
  },
  {
    id: 'loi',
    name: 'Letter of Intent',
    shortName: 'LOI',
    category: 'Sales Contract',
    description: 'Formal letter of intent to purchase a property',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'buyer_name', label: 'Buyer / Investor Name', type: 'text', required: true, placeholder: 'Full legal name...' },
      { key: 'buyer_company', label: 'Buyer Company (if applicable)', type: 'text', required: false, placeholder: 'Company name...' },
      { key: 'property_ref', label: 'Property Reference', type: 'text', required: true, placeholder: 'e.g. LX-RES-004' },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true, placeholder: 'Full address...' },
      { key: 'offer_price', label: 'Offer Price (AED)', type: 'number', required: true },
      { key: 'validity_period', label: 'LOI Validity Period', type: 'select', required: true, options: ['7 Days', '14 Days', '21 Days', '30 Days'] },
      { key: 'payment_terms', label: 'Proposed Payment Terms', type: 'textarea', required: true, placeholder: 'Describe payment structure...' },
      { key: 'due_diligence_period', label: 'Due Diligence Period (days)', type: 'number', required: false },
      { key: 'agent_name', label: 'Agent Name', type: 'text', required: false },
    ],
    terms: [],
  },
  {
    id: 'offer',
    name: 'Offer Document',
    shortName: 'OFFER',
    category: 'Sales Contract',
    description: 'Formal offer to purchase a property with binding terms',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'Offer Date', type: 'date', required: true },
      { key: 'buyer_name', label: 'Buyer Full Name', type: 'text', required: true, placeholder: 'Full legal name...' },
      { key: 'buyer_passport', label: 'Buyer ID / Passport', type: 'text', required: true },
      { key: 'property_ref', label: 'Property Reference', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'offer_price', label: 'Offer Price (AED)', type: 'number', required: true },
      { key: 'deposit_percentage', label: 'Deposit (%)', type: 'number', required: true },
      { key: 'payment_plan', label: 'Payment Plan', type: 'select', required: true, options: ['Full Cash', '30/70 Plan', '40/60 Plan', '50/50 Plan', 'Mortgage'] },
      { key: 'offer_expiry', label: 'Offer Expiry Date', type: 'date', required: true },
      { key: 'special_requests', label: 'Special Requests / Conditions', type: 'textarea', required: false },
    ],
    terms: [],
  },
  {
    id: 'spa',
    name: 'Sale & Purchase Agreement',
    shortName: 'SPA',
    category: 'Sales Contract',
    description: 'Comprehensive sale and purchase agreement for property transactions',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'Agreement Date', type: 'date', required: true },
      { key: 'buyer_name', label: 'Buyer Full Name', type: 'text', required: true },
      { key: 'buyer_passport', label: 'Buyer Passport / Emirates ID', type: 'text', required: true },
      { key: 'buyer_address', label: 'Buyer Address', type: 'text', required: true },
      { key: 'seller_name', label: 'Seller Full Name', type: 'text', required: true },
      { key: 'seller_passport', label: 'Seller Passport / Emirates ID', type: 'text', required: true },
      { key: 'seller_address', label: 'Seller Address', type: 'text', required: true },
      { key: 'property_ref', label: 'Property Reference', type: 'text', required: true },
      { key: 'property_address', label: 'Property Address', type: 'text', required: true },
      { key: 'plot_no', label: 'Plot / Unit No.', type: 'text', required: true },
      { key: 'area_sqft', label: 'Area (sq.ft)', type: 'number', required: true },
      { key: 'sale_price', label: 'Sale Price (AED)', type: 'number', required: true },
      { key: 'dld_fee', label: 'DLD Transfer Fee (AED)', type: 'number', required: true },
      { key: 'agency_fee', label: 'Agency Fee (AED)', type: 'number', required: false },
      { key: 'completion_date', label: 'Completion Date', type: 'date', required: true },
      { key: 'handover_date', label: 'Handover Date', type: 'date', required: true },
      { key: 'payment_schedule', label: 'Payment Schedule', type: 'textarea', required: true, placeholder: 'Describe payment milestones...' },
      { key: 'special_conditions', label: 'Special Conditions', type: 'textarea', required: false },
    ],
    terms: [],
  },
];

const STATUS_STYLES: Record<DocStatus, string> = {
  Draft: 'bg-white/5 text-white/50 border border-white/10',
  'Pending Approval': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const INITIAL_DOCUMENTS: FilledDocument[] = [
  {
    id: 1,
    templateId: 'ncnda',
    templateName: 'Non-Circumvention, Non-Disclosure Agreement',
    shortName: 'NCNDA',
    category: 'NDA',
    title: 'NCNDA — Cove Estates LLC & Investor Corp — May 2026',
    fields: {
      date: '2026-05-02',
      party1_company: 'Cove Estates LLC',
      party1_license: '1432541',
      party1_orn: '46855',
      party1_address: '802, Moosa Tower, Dubai, UAE',
      party1_signatory: 'Ahmed Al-Rashid',
      party1_initials: 'LX',
      party2_company: 'Investor Corp',
      party2_license: '54321',
      party2_orn: '09876',
      party2_address: 'Abu Dhabi, UAE',
      party2_signatory: 'James Harrington',
      party2_initials: 'IC',
      property_description: 'Plots listed in Appendix A',
      duration: '2 Years',
      governing_law: 'Laws of the UAE',
    },
    notes: '',
    terms: DEFAULT_TEMPLATES[0].terms,
    status: 'Approved',
    createdAt: 'May 2, 2026',
    ceoSignature: 'Ahmed Al-Rashid',
    approvedAt: 'May 2, 2026',
    submittedBy: 'Admin',
  },
  {
    id: 2,
    templateId: 'mou',
    templateName: 'Memorandum of Understanding',
    shortName: 'MOU',
    category: 'Sales Contract',
    title: 'MOU — James Harrington — Meridian Villa — Apr 2026',
    fields: {
      date: '2026-04-28',
      buyer_name: 'James Harrington',
      buyer_passport: 'A1234567',
      buyer_nationality: 'British',
      seller_name: 'Cove Estates LLC',
      seller_passport: 'B7654321',
      property_ref: 'LX-RES-004',
      property_address: 'Meridian Villa, Palm Jumeirah, Dubai',
      property_type: 'Villa',
      agreed_price: '42000000',
      deposit_amount: '4200000',
      payment_method: 'Cash',
      completion_date: '2026-06-30',
      transfer_date: '2026-06-30',
      agent_name: 'Sarah Mitchell',
    },
    notes: '',
    terms: DEFAULT_TEMPLATES[1].terms,
    status: 'Pending Approval',
    createdAt: 'Apr 28, 2026',
    submittedBy: 'Sarah M.',
  },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  Folder: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" /></svg>,
  File: ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>,
  Pen: ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>,
  Print: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>,
  Share: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>,
  Settings: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(val: string) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return 'AED ' + n.toLocaleString('en-US');
}

function fmtDate(val: string) {
  if (!val) return '___________';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return val; }
}

function formatFieldValue(field: TemplateField | undefined, val: string) {
  if (!val) return '—';
  if (!field) return val;
  const lbl = field.label.toLowerCase();
  if (field.type === 'number' && (lbl.includes('price') || lbl.includes('amount') || lbl.includes('fee') || lbl.includes('deposit'))) return fmtCurrency(val);
  if (field.type === 'date') return fmtDate(val);
  return val;
}

function generateRefNo(id: number, shortName: string) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LX/${shortName}/${year}/${month}/${rand}`;
}

// ─── Sophisticated Document Preview (PDF-style) ───────────────────────────────
function DocumentPreviewContent({ doc, template }: { doc: FilledDocument; template?: TemplateDefinition }) {
  const f = doc.fields;
  const refNo = `LX/${doc.shortName}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${doc.id.toString().padStart(4, '0')}`;
  const isNCNDA = doc.templateId === 'ncnda';

  const party1Name = f.party1_company || f.buyer_name || f.buyer_company || '___________________________';
  const party1Sub = isNCNDA
    ? [f.party1_license ? `License No. ${f.party1_license}` : null, f.party1_orn ? `ORN ${f.party1_orn}` : null, f.party1_address || null].filter(Boolean).join('  ·  ')
    : [f.buyer_passport ? `Passport / ID: ${f.buyer_passport}` : null, f.buyer_nationality || null].filter(Boolean).join('  ·  ');

  const party2Name = f.party2_company || f.seller_name || '___________________________';
  const party2Sub = isNCNDA
    ? [f.party2_license ? `License No. ${f.party2_license}` : null, f.party2_orn ? `ORN ${f.party2_orn}` : null, f.party2_address || null].filter(Boolean).join('  ·  ')
    : [f.seller_passport ? `Passport / ID: ${f.seller_passport}` : null].filter(Boolean).join('  ·  ');

  const sig1 = f.party1_signatory || f.buyer_name || '';
  const sig2 = f.party2_signatory || f.seller_name || '';

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", background: '#fff', color: '#1a1a1a' }}>

      {/* ── Reference Strip ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e3d8', paddingBottom: '14px', marginBottom: '40px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#b0a080', fontWeight: 600 }}>
          Cove Estates · Confidential
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: '#b0a080', fontWeight: 600 }}>
          Ref: <span style={{ color: '#8a7040' }}>{refNo}</span>
        </div>
      </div>

      {/* ── Document Title ── */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '7px', letterSpacing: '4px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '14px', fontWeight: 700 }}>
          {doc.category}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '1px', color: '#0f0f0f', lineHeight: 1.3, textTransform: 'uppercase' }}>
          {doc.templateName}
        </div>
        <div style={{ width: '48px', height: '2px', background: '#C9A84C', margin: '16px auto 0' }} />
      </div>

      {/* ── Parties ── */}
      <div style={{ marginBottom: '52px' }}>
        <div style={{ fontSize: '7px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 700, textAlign: 'center', marginBottom: '28px' }}>
          Parties to this Agreement
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '0', alignItems: 'start' }}>
          {/* Party 1 */}
          <div style={{ padding: '20px 24px', background: '#faf9f6', border: '1px solid #ede8dc' }}>
            <div style={{ fontSize: '7px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#b0a080', fontWeight: 700, marginBottom: '10px' }}>
              First Party
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f0f0f', marginBottom: '6px', lineHeight: 1.3 }}>
              {party1Name}
            </div>
            {party1Sub && (
              <div style={{ fontSize: '10px', color: '#888', lineHeight: 1.7 }}>
                {party1Sub}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '28px' }}>
            <div style={{ fontSize: '10px', color: '#C9A84C', fontWeight: 700 }}>&amp;</div>
          </div>

          {/* Party 2 */}
          <div style={{ padding: '20px 24px', background: '#faf9f6', border: '1px solid #ede8dc' }}>
            <div style={{ fontSize: '7px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#b0a080', fontWeight: 700, marginBottom: '10px' }}>
              Second Party
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f0f0f', marginBottom: '6px', lineHeight: 1.3 }}>
              {party2Name}
            </div>
            {party2Sub && (
              <div style={{ fontSize: '10px', color: '#888', lineHeight: 1.7 }}>
                {party2Sub}
              </div>
            )}
          </div>
        </div>

        {f.date && (
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#999' }}>
            Effective Date: <span style={{ color: '#555', fontWeight: 600 }}>{fmtDate(f.date)}</span>
            {f.duration ? <span style={{ marginLeft: '16px' }}>Duration: <span style={{ color: '#555', fontWeight: 600 }}>{f.duration}</span></span> : null}
          </div>
        )}
      </div>

      {/* ── Signature Zone ── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '7px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 700, textAlign: 'center', marginBottom: '28px' }}>
          Authorised Signatures
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Sig 1 */}
          <div>
            <div style={{ minHeight: '56px', borderBottom: '1.5px solid #1a1a1a', marginBottom: '10px', display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
              {sig1 ? (
                <div style={{ fontSize: '26px', fontStyle: 'italic', color: '#C9A84C', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  {sig1}
                </div>
              ) : (
                <div style={{ height: '32px' }} />
              )}
            </div>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
              {isNCNDA ? 'First Party' : 'Buyer'}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#333' }}>
              {sig1 || '___________________________'}
            </div>
            {isNCNDA && f.party1_company && (
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{f.party1_company}</div>
            )}
            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '6px' }}>
              Date: {f.date ? fmtDate(f.date) : '_______________'}
            </div>
          </div>

          {/* Sig 2 */}
          <div>
            <div style={{ minHeight: '56px', borderBottom: '1.5px solid #1a1a1a', marginBottom: '10px', display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
              {sig2 ? (
                <div style={{ fontSize: '26px', fontStyle: 'italic', color: '#C9A84C', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  {sig2}
                </div>
              ) : (
                <div style={{ height: '32px' }} />
              )}
            </div>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
              {isNCNDA ? 'Second Party' : 'Seller'}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#333' }}>
              {sig2 || '___________________________'}
            </div>
            {isNCNDA && f.party2_company && (
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{f.party2_company}</div>
            )}
            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '6px' }}>
              Date: _______________
            </div>
          </div>
        </div>
      </div>

      {/* ── Seal Area ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        <div style={{ border: '1px dashed #d4c9a8', padding: '20px', textAlign: 'center', minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '7px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0b080', fontWeight: 700, marginBottom: '8px' }}>
            Official Seal — First Party
          </div>
          <div style={{ width: '52px', height: '52px', border: '1px dashed #d4c9a8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '8px', color: '#d4c9a8', letterSpacing: '1px' }}>SEAL</div>
          </div>
        </div>
        <div style={{ border: '1px dashed #d4c9a8', padding: '20px', textAlign: 'center', minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '7px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c0b080', fontWeight: 700, marginBottom: '8px' }}>
            Official Seal — Second Party
          </div>
          <div style={{ width: '52px', height: '52px', border: '1px dashed #d4c9a8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '8px', color: '#d4c9a8', letterSpacing: '1px' }}>SEAL</div>
          </div>
        </div>
      </div>

      {/* ── CEO Approval Stamp ── */}
      {doc.status === 'Approved' && doc.ceoSignature && (
        <div style={{ border: '1.5px solid #22c55e', background: '#f0fdf4', padding: '20px', textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#16a34a', marginBottom: '8px' }}>
            ✓ Approved &amp; Executed
          </div>
          <div style={{ fontSize: '28px', fontStyle: 'italic', color: '#C9A84C', fontFamily: 'Georgia, serif' }}>{doc.ceoSignature}</div>
          <div style={{ fontSize: '9px', color: '#888', marginTop: '6px', letterSpacing: '1px' }}>Authorised on {doc.approvedAt}</div>
        </div>
      )}

      {/* ── Footer Rule ── */}
      <div style={{ borderTop: '1px solid #e8e3d8', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '8px', color: '#c0b080', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Confidential · Not for Distribution
        </div>
        <div style={{ fontSize: '8px', color: '#c0b080', letterSpacing: '1px' }}>
          {refNo}
        </div>
      </div>
    </div>
  );
}

// ─── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreview({ doc, template, onClose, onApprove, onPrint, onSendForApproval, isCEO = true }: {
  doc: FilledDocument;
  template?: TemplateDefinition;
  onClose: () => void;
  onApprove?: () => void;
  onPrint?: () => void;
  onSendForApproval?: () => void;
  isCEO?: boolean;
}) {
  const [ceoSig, setCeoSig] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const f = doc.fields;
    const isNCNDA = doc.templateId === 'ncnda';
    const refNo = `LX/${doc.shortName}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${doc.id.toString().padStart(4, '0')}`;

    const party1Name = f.party1_company || f.buyer_name || f.buyer_company || '___________________________';
    const party1Sub = isNCNDA
      ? [f.party1_license ? `License No. ${f.party1_license}` : null, f.party1_orn ? `ORN ${f.party1_orn}` : null, f.party1_address || null].filter(Boolean).join('  ·  ')
      : [f.buyer_passport ? `Passport / ID: ${f.buyer_passport}` : null, f.buyer_nationality || null].filter(Boolean).join('  ·  ');
    const party2Name = f.party2_company || f.seller_name || '___________________________';
    const party2Sub = isNCNDA
      ? [f.party2_license ? `License No. ${f.party2_license}` : null, f.party2_orn ? `ORN ${f.party2_orn}` : null, f.party2_address || null].filter(Boolean).join('  ·  ')
      : [f.seller_passport ? `Passport / ID: ${f.seller_passport}` : null].filter(Boolean).join('  ·  ');
    const sig1 = f.party1_signatory || f.buyer_name || '';
    const sig2 = f.party2_signatory || f.seller_name || '';

    win.document.write(`<!DOCTYPE html><html><head><title>${doc.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #fff; }
      .page { max-width: 760px; margin: 0 auto; padding: 64px 64px 80px; }
      .ref-strip { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e3d8; padding-bottom: 14px; margin-bottom: 40px; }
      .ref-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #b0a080; font-weight: 600; }
      .ref-no { font-size: 9px; letter-spacing: 1.5px; color: #8a7040; font-weight: 600; }
      .title-block { text-align: center; margin-bottom: 48px; }
      .category-label { font-size: 7px; letter-spacing: 4px; text-transform: uppercase; color: #C9A84C; margin-bottom: 14px; font-weight: 700; }
      .doc-title { font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #0f0f0f; text-transform: uppercase; line-height: 1.3; }
      .gold-rule { width: 48px; height: 2px; background: #C9A84C; margin: 16px auto 0; }
      .section-label { font-size: 7px; letter-spacing: 3px; text-transform: uppercase; color: #C9A84C; font-weight: 700; text-align: center; margin-bottom: 28px; }
      .parties-grid { display: grid; grid-template-columns: 1fr 40px 1fr; align-items: start; margin-bottom: 52px; }
      .party-box { padding: 20px 24px; background: #faf9f6; border: 1px solid #ede8dc; }
      .party-role { font-size: 7px; letter-spacing: 2.5px; text-transform: uppercase; color: #b0a080; font-weight: 700; margin-bottom: 10px; }
      .party-name { font-size: 14px; font-weight: 700; color: #0f0f0f; margin-bottom: 6px; line-height: 1.3; }
      .party-sub { font-size: 10px; color: #888; line-height: 1.7; }
      .and-divider { display: flex; align-items: center; justify-content: center; padding-top: 28px; font-size: 10px; color: #C9A84C; font-weight: 700; }
      .effective-date { text-align: center; margin-top: 20px; font-size: 10px; color: #999; }
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
      .sig-line { min-height: 56px; border-bottom: 1.5px solid #1a1a1a; margin-bottom: 10px; display: flex; align-items: flex-end; padding-bottom: 6px; }
      .sig-cursive { font-size: 26px; font-style: italic; color: #C9A84C; font-family: Georgia, serif; line-height: 1; }
      .sig-role { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
      .sig-name { font-size: 11px; font-weight: 600; color: #333; }
      .sig-company { font-size: 10px; color: #888; margin-top: 2px; }
      .sig-date { font-size: 10px; color: #aaa; margin-top: 6px; }
      .seal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
      .seal-box { border: 1px dashed #d4c9a8; padding: 20px; text-align: center; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .seal-label { font-size: 7px; letter-spacing: 2.5px; text-transform: uppercase; color: #c0b080; font-weight: 700; margin-bottom: 8px; }
      .seal-circle { width: 52px; height: 52px; border: 1px dashed #d4c9a8; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .seal-text { font-size: 8px; color: #d4c9a8; letter-spacing: 1px; }
      .approved-stamp { border: 1.5px solid #22c55e; background: #f0fdf4; padding: 20px; text-align: center; margin-bottom: 32px; }
      .approved-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; color: #16a34a; margin-bottom: 8px; }
      .approved-sig { font-size: 28px; font-style: italic; color: #C9A84C; font-family: Georgia, serif; }
      .approved-date { font-size: 9px; color: #888; margin-top: 6px; letter-spacing: 1px; }
      .footer-rule { border-top: 1px solid #e8e3d8; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; }
      .footer-text { font-size: 8px; color: #c0b080; letter-spacing: 1.5px; text-transform: uppercase; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body><div class="page">
      <div class="ref-strip">
        <div class="ref-label">Cove Estates · Confidential</div>
        <div class="ref-no">Ref: ${refNo}</div>
      </div>
      <div class="title-block">
        <div class="category-label">${doc.category}</div>
        <div class="doc-title">${doc.templateName.toUpperCase()}</div>
        <div class="gold-rule"></div>
      </div>
      <div class="section-label">Parties to this Agreement</div>
      <div class="parties-grid">
        <div class="party-box">
          <div class="party-role">First Party</div>
          <div class="party-name">${party1Name}</div>
          ${party1Sub ? `<div class="party-sub">${party1Sub}</div>` : ''}
        </div>
        <div class="and-divider">&amp;</div>
        <div class="party-box">
          <div class="party-role">Second Party</div>
          <div class="party-name">${party2Name}</div>
          ${party2Sub ? `<div class="party-sub">${party2Sub}</div>` : ''}
        </div>
      </div>
      ${f.date ? `<div class="effective-date">Effective Date: <strong>${fmtDate(f.date)}</strong>${f.duration ? `&nbsp;&nbsp;·&nbsp;&nbsp;Duration: <strong>${f.duration}</strong>` : ''}</div>` : ''}
      <div style="margin-top:52px">
        <div class="section-label">Authorised Signatures</div>
        <div class="sig-grid">
          <div>
            <div class="sig-line">${sig1 ? `<div class="sig-cursive">${sig1}</div>` : ''}</div>
            <div class="sig-role">${isNCNDA ? 'First Party' : 'Buyer'}</div>
            <div class="sig-name">${sig1 || '___________________________'}</div>
            ${isNCNDA && f.party1_company ? `<div class="sig-company">${f.party1_company}</div>` : ''}
            <div class="sig-date">Date: ${f.date ? fmtDate(f.date) : '_______________'}</div>
          </div>
          <div>
            <div class="sig-line">${sig2 ? `<div class="sig-cursive">${sig2}</div>` : ''}</div>
            <div class="sig-role">${isNCNDA ? 'Second Party' : 'Seller'}</div>
            <div class="sig-name">${sig2 || '___________________________'}</div>
            ${isNCNDA && f.party2_company ? `<div class="sig-company">${f.party2_company}</div>` : ''}
            <div class="sig-date">Date: _______________</div>
          </div>
        </div>
        <div class="seal-grid">
          <div class="seal-box">
            <div class="seal-label">Official Seal — First Party</div>
            <div class="seal-circle"><div class="seal-text">SEAL</div></div>
          </div>
          <div class="seal-box">
            <div class="seal-label">Official Seal — Second Party</div>
            <div class="seal-circle"><div class="seal-text">SEAL</div></div>
          </div>
        </div>
      </div>
      ${doc.ceoSignature ? `<div class="approved-stamp"><div class="approved-label">✓ Approved &amp; Executed</div><div class="approved-sig">${doc.ceoSignature}</div><div class="approved-date">Authorised on ${doc.approvedAt}</div></div>` : ''}
      <div class="footer-rule">
        <div class="footer-text">Confidential · Not for Distribution</div>
        <div class="footer-text">${refNo}</div>
      </div>
    </div><script>window.onload=function(){window.print();}<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
              <span className="text-primary"><Ico.File size={16} /></span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{doc.shortName} — Document Preview</h2>
              <p className="text-xs text-white/40">{doc.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${STATUS_STYLES[doc.status]}`}>{doc.status}</span>
            <button onClick={onClose} className="text-white/40 hover:text-white ml-2">&lt;Ico.X /&gt;</button>
          </div>
        </div>

        {/* Document Body — white paper */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-2xl mx-auto bg-white shadow-lg px-12 py-10">
            <DocumentPreviewContent doc={doc} template={template} />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#111]">
          <button onClick={onClose} className="h-9 px-4 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Close</button>
          <div className="flex gap-2">
            {doc.status === 'Draft' && onSendForApproval && (
              <button onClick={onSendForApproval} className="h-9 px-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                <Ico.Send /> Send for CEO Approval
              </button>
            )}
            {doc.status === 'Pending Approval' && isCEO && (
              <button onClick={() => setShowSignModal(true)} className="h-9 px-4 text-xs bg-primary text-black rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 font-semibold">
                <Ico.Check /> Review & E-Sign
              </button>
            )}
            {doc.status === 'Approved' && (
              <>
                <button onClick={handlePrint} className="h-9 px-4 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors flex items-center gap-1.5">
                  <Ico.Print /> Print / Save PDF
                </button>
                <button className="h-9 px-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
                  <Ico.Share /> Share
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CEO Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-sm rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">CEO E-Signature</h3>
              <button onClick={() => setShowSignModal(false)} className="text-white/40 hover:text-white"><Ico.X /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-white/50">Type your full name to electronically sign and approve this document.</p>
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">Full Name *</label>
                <input type="text" value={ceoSig} onChange={(e) => setCeoSig(e.target.value)} placeholder="Type full name to sign..." className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
                {ceoSig && <p className="mt-2 text-xl font-serif italic text-primary">{ceoSig}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSignModal(false)} className="flex-1 h-9 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Cancel</button>
                <button
                  disabled={!ceoSig.trim()}
                  onClick={() => { onApprove && onApprove(); setShowSignModal(false); }}
                  className="flex-1 h-9 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-semibold"
                >
                  Approve & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Terms Editor Modal ───────────────────────────────────────────────────────
function TermsEditor({ template, onClose, onSave }: { template: TemplateDefinition; onClose: () => void; onSave: (terms: TemplateTerm[]) => void }) {
  const [rawText, setRawText] = useState<string>(() =>
    template.terms.length > 0 ? template.terms.map((t) => t.text).join('\n\n') : ''
  );
  const [showPreview, setShowPreview] = useState(false);

  // Parse raw text into terms: split by double newline or numbered lines
  const parsedTerms = React.useMemo((): TemplateTerm[] => {
    const blocks = rawText
      .split(/\n{2,}/)
      .map(b => b.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return blocks.map((text, i) => ({ id: i + 1, text }));
  }, [rawText]);

  const handleSave = () => {
    onSave(parsedTerms);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white">Edit Terms — {template.shortName}</h2>
            <p className="text-xs text-white/40 mt-0.5">{template.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border transition-colors ${showPreview ? 'bg-primary/10 border-primary/30 text-primary' : 'border-white/10 text-white/60 hover:text-white'}`}
            >
              <Ico.Eye /> {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white">&lt;Ico.X /&gt;</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-3">
              <p className="text-xs text-white/40">
                Paste or type your terms and clauses below. Separate each clause with a blank line. Numbered prefixes (1. 2. etc.) are optional — they will be added automatically in the document.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={20}
                placeholder={`Paste your terms here...\n\nEach clause separated by a blank line becomes a numbered term.\n\nExample:\n\nConfidential Information means all information disclosed by one Party to the other...\n\nBoth Parties agree to maintain strict confidentiality regarding all information shared...`}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
              />
              <p className="text-xs text-white/30">
                {parsedTerms.length} clause{parsedTerms.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-white/40 mb-4">Preview of how terms will appear in the document:</p>
              {parsedTerms.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No terms to preview. Add content in the Edit tab.</p>
              ) : (
                <ol className="space-y-4 list-none">
                  {parsedTerms.map((term) => (
                    <li key={term.id} className="p-3 bg-white/5 border border-white/10 rounded-md">
                      <span className="text-sm text-white/80 leading-relaxed">{term.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="flex-1 h-9 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            className="flex-1 h-9 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            Save Terms{parsedTerms.length > 0 ? ` (${parsedTerms.length} clause${parsedTerms.length !== 1 ? 's' : ''})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Fill Preview ──────────────────────────────────────────────────────
function FillPreviewModal({ template, fields, notes, title, onClose }: {
  template: TemplateDefinition;
  fields: Record<string, string>;
  notes: string;
  title: string;
  onClose: () => void;
}) {
  const previewDoc: FilledDocument = {
    id: 9999,
    templateId: template.id,
    templateName: template.name,
    shortName: template.shortName,
    category: template.category,
    title: title || template.shortName,
    fields,
    notes,
    terms: template.terms,
    status: 'Draft',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    submittedBy: 'Admin',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400">&lt;Ico.Eye /&gt;</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Document Preview</h2>
              <p className="text-xs text-white/40">Preview before submitting — {template.shortName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">&lt;Ico.X /&gt;</button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-2xl mx-auto bg-white shadow-lg px-12 py-10">
            <DocumentPreviewContent doc={previewDoc} template={template} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#111]">
          <p className="text-xs text-white/40">This is a preview. Return to the form to make changes.</p>
          <button onClick={onClose} className="h-9 px-5 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors font-semibold">Back to Form</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'documents' | 'approvals'>('templates');
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState<TemplateDefinition[]>(DEFAULT_TEMPLATES);
  const [documents, setDocuments] = useState<FilledDocument[]>(INITIAL_DOCUMENTS);

  // Fill modal
  const [fillTemplate, setFillTemplate] = useState<TemplateDefinition | null>(null);
  const [fillTitle, setFillTitle] = useState('');
  const [fillFields, setFillFields] = useState<Record<string, string>>({});
  const [fillNotes, setFillNotes] = useState('');
  const [showFillPreview, setShowFillPreview] = useState(false);

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<FilledDocument | null>(null);

  // Terms editor
  const [termsTemplate, setTermsTemplate] = useState<TemplateDefinition | null>(null);

  const filteredTemplates = templates.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.shortName.toLowerCase().includes(search.toLowerCase()));
  const myDocuments = documents.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.shortName.toLowerCase().includes(search.toLowerCase()));
  const approvalDocs = documents.filter((d) => d.status === 'Pending Approval');

  const openFill = (tpl: TemplateDefinition) => {
    setFillTemplate(tpl);
    setFillTitle(`${tpl.shortName} — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
    setFillFields(Object.fromEntries(tpl.fields.map((f) => [f.key, ''])));
    setFillNotes('');
    setShowFillPreview(false);
  };

  const allRequiredFilled = fillTemplate
    ? fillTemplate.fields.filter((f) => f.required).every((f) => fillFields[f.key]?.trim())
    : false;

  const saveDoc = (status: DocStatus) => {
    if (!fillTemplate) return;
    const doc: FilledDocument = {
      id: Date.now(),
      templateId: fillTemplate.id,
      templateName: fillTemplate.name,
      shortName: fillTemplate.shortName,
      category: fillTemplate.category,
      title: fillTitle || fillTemplate.shortName,
      fields: { ...fillFields },
      notes: fillNotes,
      terms: [...fillTemplate.terms],
      status,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      submittedBy: 'Admin',
    };
    setDocuments([doc, ...documents]);
    setFillTemplate(null);
    setActiveTab(status === 'Pending Approval' ? 'approvals' : 'documents');
  };

  const handleApprove = (docId: number, sig: string) => {
    setDocuments(documents.map((d) =>
      d.id === docId ? { ...d, status: 'Approved' as DocStatus, ceoSignature: sig, approvedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : d
    ));
    if (previewDoc?.id === docId) {
      setPreviewDoc((prev) => prev ? { ...prev, status: 'Approved', ceoSignature: sig, approvedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : null);
    }
  };

  const handleReject = (docId: number) => {
    setDocuments(documents.map((d) => d.id === docId ? { ...d, status: 'Rejected' as DocStatus } : d));
    setPreviewDoc(null);
  };

  const handleSendForApproval = (docId: number) => {
    setDocuments(documents.map((d) => d.id === docId ? { ...d, status: 'Pending Approval' as DocStatus } : d));
    setPreviewDoc(null);
    setActiveTab('approvals');
  };

  const saveTerms = (tplId: string, terms: TemplateTerm[]) => {
    setTemplates(templates.map((t) => t.id === tplId ? { ...t, terms } : t));
    setTermsTemplate(null);
  };

  const getTemplate = (id: string) => templates.find((t) => t.id === id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Center</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {[
          { key: 'templates', label: 'Templates', icon: <Ico.Folder />, count: templates.length },
          { key: 'documents', label: 'My Documents', icon: <Ico.File />, count: myDocuments.length },
          { key: 'approvals', label: 'Approvals', icon: <Ico.Check />, count: approvalDocs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${activeTab === tab.key ? 'bg-primary text-black' : 'bg-white/10 text-white/50'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">&lt;Ico.Search /&gt;</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-9 pr-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
      </div>

      {/* ── Templates Tab ── */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="bg-[#111] border border-white/10 hover:border-primary/30 transition-colors rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-lg flex-shrink-0">
                    <span className="text-primary text-sm font-black">{tpl.shortName.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm leading-tight">{tpl.shortName}</div>
                    <span className="text-[10px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded mt-1 inline-block">{tpl.category}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 mb-3 line-clamp-2">{tpl.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-white/30 mb-4">
                <span>{tpl.fields.length} fields</span>
                <span>·</span>
                <span>{tpl.terms.length} terms</span>
                <span>·</span>
                <span>{tpl.requiresApproval ? 'CEO approval' : 'No approval'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openFill(tpl)} className="flex-1 h-8 text-xs font-semibold bg-primary text-black rounded-md hover:bg-primary/90 transition-colors">
                  Fill Document
                </button>
                <button onClick={() => setTermsTemplate(tpl)} className="h-8 px-3 text-xs border border-white/10 text-white/60 rounded-md hover:bg-white/5 transition-colors flex items-center gap-1" title="Edit Terms">
                  <Ico.Settings /> Terms
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── My Documents Tab ── */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {myDocuments.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">No documents yet. Fill a template to get started.</div>
          ) : myDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-lg hover:border-white/20 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-[10px] font-black">{doc.shortName.slice(0, 3)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{doc.category} · {doc.createdAt} · {doc.submittedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_STYLES[doc.status]}`}>{doc.status}</span>
                <button onClick={() => setPreviewDoc(doc)} className="p-1.5 text-white/40 hover:text-white transition-colors" title="Preview"><Ico.Eye /></button>
                <button onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Ico.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Approvals Tab ── */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          {approvalDocs.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">No documents pending approval.</div>
          ) : approvalDocs.map((doc) => (
            <div key={doc.id} className="p-5 bg-[#111] border border-amber-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Pending Approval</span>
                    <span className="text-xs text-white/40">{doc.category}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{doc.title}</p>
                  <p className="text-xs text-white/40 mt-1">Submitted by {doc.submittedBy} · {doc.createdAt}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setPreviewDoc(doc)} className="h-8 px-3 text-xs border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors flex items-center gap-1.5">
                    <Ico.Eye /> Preview & Sign
                  </button>
                  <button onClick={() => handleReject(doc.id)} className="h-8 px-3 text-xs border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/10 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fill Document Modal ── */}
      {fillTemplate && !showFillPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl">
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-black">{fillTemplate.shortName.slice(0, 3)}</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{fillTemplate.shortName} — {fillTemplate.name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">{fillTemplate.fields.filter((f) => f.required).length} required fields · {fillTemplate.terms.length} terms included</p>
                </div>
              </div>
              <button onClick={() => setFillTemplate(null)} className="text-white/40 hover:text-white ml-4"><Ico.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">Document Title *</label>
                <input type="text" value={fillTitle} onChange={(e) => setFillTitle(e.target.value)} className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50" placeholder="e.g. NCNDA — Client Name — Property" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Fill in Details</h3>
                <div className="space-y-4">
                  {fillTemplate.fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-white/70 block mb-1">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea value={fillFields[field.key] || ''} onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })} rows={3} placeholder={field.placeholder} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none" />
                      ) : field.type === 'select' ? (
                        <select value={fillFields[field.key] || ''} onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })} className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary/50">
                          <option value="">Select...</option>
                          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} value={fillFields[field.key] || ''} onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">Notes (Optional)</label>
                <textarea value={fillNotes} onChange={(e) => setFillNotes(e.target.value)} rows={3} placeholder="Any additional notes..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none" />
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                <p className="text-xs text-white/50"><span className="text-primary font-semibold">{fillTemplate.terms.length} terms</span> from the template will be included. You can edit template terms from the Templates tab.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setFillTemplate(null)} className="h-9 px-4 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Cancel</button>
              <div className="flex gap-2">
                {/* Preview Document Button */}
                <button
                  onClick={() => setShowFillPreview(true)}
                  className="h-9 px-4 text-xs border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                >
                  <Ico.Eye /> Preview Document
                </button>
                <button onClick={() => saveDoc('Draft')} className="h-9 px-4 text-sm border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors">Save as Draft</button>
                <button onClick={() => saveDoc('Pending Approval')} disabled={!allRequiredFilled} className="h-9 px-4 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 font-semibold">
                  <Ico.Send /> Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fill Preview Modal ── */}
      {fillTemplate && showFillPreview && (
        <FillPreviewModal
          template={fillTemplate}
          fields={fillFields}
          notes={fillNotes}
          title={fillTitle}
          onClose={() => setShowFillPreview(false)}
        />
      )}

      {/* ── Document Preview Modal ── */}
      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          template={getTemplate(previewDoc.templateId)}
          onClose={() => setPreviewDoc(null)}
          onApprove={() => handleApprove(previewDoc.id, 'Ahmed Al-Rashid')}
          onSendForApproval={() => handleSendForApproval(previewDoc.id)}
          isCEO={true}
        />
      )}

      {/* ── Terms Editor Modal ── */}
      {termsTemplate && (
        <TermsEditor
          template={termsTemplate}
          onClose={() => setTermsTemplate(null)}
          onSave={(terms) => saveTerms(termsTemplate.id, terms)}
        />
      )}
    </div>
  );
}
