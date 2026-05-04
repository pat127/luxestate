'use client';

import React, { useState } from 'react';

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
    terms: [
      { id: 1, text: '"Confidential Information" means all information disclosed by one Party to the other relating to Property, the seller, the buyer, or any related negotiations, whether oral, written, electronic or otherwise.' },
      { id: 2, text: 'Both Parties agree to maintain strict confidentiality regarding all information shared under this agreement, including but not limited to client lists, property details, financial data, and business strategies.' },
      { id: 3, text: 'Neither Party shall circumvent the other to directly contact, solicit, or transact with any client, investor, or counterparty introduced through this agreement without prior written consent.' },
      { id: 4, text: 'All introductions made under this agreement shall be protected for the duration specified herein. Any transaction resulting from such introductions shall entitle the introducing party to their agreed commission.' },
      { id: 5, text: 'This agreement shall be governed by and construed in accordance with the laws of the jurisdiction specified above. Any disputes shall be resolved through arbitration in Dubai, UAE.' },
      { id: 6, text: 'Breach of this agreement shall entitle the non-breaching party to seek injunctive relief and damages, including but not limited to lost commissions and legal fees.' },
    ],
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
    terms: [
      { id: 1, text: 'The Buyer agrees to pay the deposit amount specified above within 5 business days of signing this MOU. Failure to do so shall render this agreement null and void.' },
      { id: 2, text: 'The Seller agrees to provide vacant possession of the property on the agreed completion date, free from all encumbrances unless otherwise stated.' },
      { id: 3, text: 'Both parties agree to cooperate fully with the Dubai Land Department (DLD) transfer process and provide all required documentation within the stipulated timeframes.' },
      { id: 4, text: 'In the event the Buyer withdraws from this agreement after paying the deposit, the deposit shall be forfeited to the Seller as liquidated damages.' },
      { id: 5, text: 'In the event the Seller withdraws from this agreement after receiving the deposit, the Seller shall return double the deposit amount to the Buyer as liquidated damages.' },
      { id: 6, text: 'All agency fees and commissions shall be paid by the respective parties as agreed and shall not be deducted from the sale price.' },
    ],
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
    terms: [
      { id: 1, text: 'This Letter of Intent is non-binding and serves as an expression of the Buyer\'s intent to purchase the above-referenced property subject to satisfactory due diligence and formal agreement.' },
      { id: 2, text: 'The Seller agrees to grant the Buyer an exclusivity period as specified above, during which the property shall be taken off the market.' },
      { id: 3, text: 'Both parties agree to negotiate in good faith towards executing a formal Sale and Purchase Agreement (SPA) within the validity period of this LOI.' },
      { id: 4, text: 'This LOI shall expire automatically upon the end of the validity period unless extended in writing by both parties.' },
    ],
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
    terms: [
      { id: 1, text: 'This offer is binding upon acceptance by the Seller and shall constitute a legally enforceable agreement to purchase the above property.' },
      { id: 2, text: 'The Buyer confirms that funds are available and ready to be transferred upon acceptance of this offer.' },
      { id: 3, text: 'This offer shall expire on the date specified above unless accepted in writing by the Seller prior to expiry.' },
      { id: 4, text: 'Upon acceptance, both parties agree to execute a formal MOU/SPA within 5 business days.' },
    ],
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
    terms: [
      { id: 1, text: 'The Seller agrees to sell and the Buyer agrees to purchase the above property at the agreed sale price, subject to the terms and conditions set forth in this agreement.' },
      { id: 2, text: 'Title to the property shall pass to the Buyer upon full payment of the sale price and completion of the DLD transfer process.' },
      { id: 3, text: 'The Seller warrants that the property is free from all encumbrances, liens, and third-party claims as of the transfer date.' },
      { id: 4, text: 'All service charges, utility bills, and municipality fees shall be apportioned between the parties as of the completion date.' },
      { id: 5, text: 'The Buyer shall be responsible for all DLD transfer fees, registration fees, and any applicable taxes unless otherwise agreed in writing.' },
      { id: 6, text: 'In the event of default by either party, the non-defaulting party shall be entitled to terminate this agreement and seek all remedies available under UAE law.' },
      { id: 7, text: 'This agreement shall be governed by the laws of the United Arab Emirates and the parties submit to the exclusive jurisdiction of the Dubai courts.' },
    ],
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
  const refNo = `LX-DOC-${doc.id.toString().padStart(4, '0')}`;
  const isNCNDA = doc.templateId === 'ncnda';
  const isMOU = doc.templateId === 'mou';

  return (
    <div className="bg-white text-gray-900 font-serif" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
      {/* ── Letterhead ── */}
      <div style={{ borderBottom: '3px solid #C9A84C', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Logo / Company */}
          <div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#C9A84C', letterSpacing: '4px', fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>
              COVE ESTATES
            </div>
            <div style={{ fontSize: '9px', color: '#888', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
              Luxury Real Estate · Dubai, UAE
            </div>
            <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px', fontFamily: 'Arial, sans-serif' }}>
              License: {f.party1_license || '1432541'} · ORN: {f.party1_orn || '46855'}
            </div>
            <div style={{ fontSize: '9px', color: '#aaa', fontFamily: 'Arial, sans-serif' }}>
              {f.party1_address || '802, Moosa Tower, Dubai, UAE'}
            </div>
          </div>
          {/* Doc meta */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>{doc.category}</div>
            <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial, sans-serif', marginTop: '4px' }}>Reference No: <strong>{refNo}</strong></div>
            <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial, sans-serif' }}>Date: {fmtDate(f.date || '')}</div>
          </div>
        </div>
      </div>

      {/* ── Document Title ── */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#1a1a1a', lineHeight: 1.6 }}>
          {doc.templateName.toUpperCase()}
        </div>
        <div style={{ width: '60px', height: '2px', background: '#C9A84C', margin: '8px auto 0' }} />
      </div>

      {/* ── Effective Date ── */}
      <p style={{ fontSize: '11px', marginBottom: '16px', lineHeight: 1.8, color: '#333' }}>
        This Agreement is made on <strong>{fmtDate(f.date || '')}</strong> (the &ldquo;Effective Date&rdquo;).
      </p>

      {/* ── BY AND BETWEEN ── */}
      {(isNCNDA || isMOU || doc.templateId === 'spa') && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', borderBottom: '1px solid #e5e0d5', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
            BY AND BETWEEN
          </div>
          {isNCNDA ? (
            <>
              <p style={{ fontSize: '11px', lineHeight: 1.9, marginBottom: '10px', color: '#333' }}>
                <strong>{f.party1_company || 'Cove Estates LLC'}</strong>, a company incorporated in Dubai, United Arab Emirates with license{' '}
                <strong>{f.party1_license || '1432541'}</strong>, ORN no <strong>{f.party1_orn || '46855'}</strong> and office at{' '}
                <strong>{f.party1_address || '802, Moosa Tower, Dubai, UAE'}</strong>{' '}
                (&ldquo;<strong>{f.party1_initials || 'LX'}</strong>&rdquo;), representing the <strong>Buyer</strong>. (First Party)
              </p>
              <p style={{ fontSize: '11px', textAlign: 'center', color: '#888', marginBottom: '10px', fontStyle: 'italic' }}>— and —</p>
              <p style={{ fontSize: '11px', lineHeight: 1.9, color: '#333' }}>
                <strong>{f.party2_company || '[COMPANY]'}</strong>, a company incorporated in Dubai, United Arab Emirates with Trade license{' '}
                <strong>{f.party2_license || '[LICENSE]'}</strong>, ORN <strong>{f.party2_orn || '[ORN]'}</strong> and office at{' '}
                <strong>{f.party2_address || '[ADDRESS]'}</strong>, Dubai, UAE{' '}
                (&ldquo;<strong>{f.party2_initials || '[INITIALS]'}</strong>&rdquo;), representing <strong>Seller</strong>. (Second Party)
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '11px', lineHeight: 1.9, marginBottom: '10px', color: '#333' }}>
                <strong>Buyer:</strong> {f.buyer_name || '___________'}{f.buyer_passport ? ` (Passport/ID: ${f.buyer_passport})` : ''}{f.buyer_nationality ? ` — ${f.buyer_nationality}` : ''}
              </p>
              <p style={{ fontSize: '11px', textAlign: 'center', color: '#888', marginBottom: '10px', fontStyle: 'italic' }}>— and —</p>
              <p style={{ fontSize: '11px', lineHeight: 1.9, color: '#333' }}>
                <strong>Seller:</strong> {f.seller_name || '___________'}{f.seller_passport ? ` (Passport/ID: ${f.seller_passport})` : ''}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── BACKGROUND (NCNDA specific) ── */}
      {isNCNDA && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', borderBottom: '1px solid #e5e0d5', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
            BACKGROUND
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              `The Parties acknowledge that they wish to share information relating to ${f.property_description || 'Plots (listed in appendix "Property").'}.`,
              `${f.party1_company || 'Cove Estates'} is representing the Buyer and ${f.party2_initials || 'the Second Party'} is representing the Seller.`,
              'Both Parties agree to disclose and receive information pertaining to the parties they respectively represent.',
              'Both Parties agree to be retained by their respective clients in terms of fees and agree not to circumvent.',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: '11px', lineHeight: 1.8, marginBottom: '6px', color: '#333', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#C9A84C', fontWeight: 'bold' }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Property Details (non-NCNDA) ── */}
      {!isNCNDA && (f.property_ref || f.property_address) && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', borderBottom: '1px solid #e5e0d5', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
            PROPERTY DETAILS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Property Reference', f.property_ref],
                ['Property Address', f.property_address],
                ['Property Type', f.property_type],
                ['Plot / Unit No.', f.plot_no],
                ['Area', f.area_sqft ? `${f.area_sqft} sq.ft` : undefined],
              ].filter(([, v]) => v).map(([label, value]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid #f0ece4' }}>
                  <td style={{ fontSize: '11px', color: '#666', padding: '6px 0', width: '45%' }}>{label}</td>
                  <td style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', padding: '6px 0' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Financial Details ── */}
      {(f.agreed_price || f.sale_price || f.offer_price) && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', borderBottom: '1px solid #e5e0d5', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
            FINANCIAL TERMS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Agreed Sale Price', f.agreed_price || f.sale_price || f.offer_price, true],
                ['Deposit Amount', f.deposit_amount, true],
                ['DLD Transfer Fee', f.dld_fee, true],
                ['Agency Fee', f.agency_fee, true],
                ['Payment Method', f.payment_method],
                ['Payment Plan', f.payment_plan],
                ['Completion Date', f.completion_date ? fmtDate(f.completion_date) : undefined],
                ['Transfer Date', f.transfer_date ? fmtDate(f.transfer_date) : undefined],
                ['Handover Date', f.handover_date ? fmtDate(f.handover_date) : undefined],
              ].filter(([, v]) => v).map(([label, value, isCurrency]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid #f0ece4' }}>
                  <td style={{ fontSize: '11px', color: '#666', padding: '6px 0', width: '45%' }}>{label}</td>
                  <td style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', padding: '6px 0' }}>
                    {isCurrency && value ? fmtCurrency(value as string) : value as string}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Agreement Duration (NCNDA) ── */}
      {isNCNDA && f.duration && (
        <p style={{ fontSize: '11px', lineHeight: 1.8, marginBottom: '16px', color: '#333' }}>
          This Agreement shall remain in effect for a period of <strong>{f.duration}</strong> from the Effective Date, unless earlier terminated by mutual written consent of both Parties. Governing law: <strong>{f.governing_law || 'Laws of the UAE'}</strong>.
        </p>
      )}

      {/* ── Clauses / Terms ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', borderBottom: '1px solid #e5e0d5', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
          {isNCNDA ? 'CLAUSES' : 'TERMS & CONDITIONS'}
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {doc.terms.map((term, i) => (
            <li key={term.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '11px', lineHeight: 1.8, color: '#333' }}>
              <span style={{ color: '#C9A84C', fontWeight: 'bold', flexShrink: 0, minWidth: '20px' }}>{i + 1}.</span>
              <span>{isNCNDA ? <><strong>{i === 0 ? 'CONFIDENTIAL INFORMATION — ' : i === 1 ? 'NON-DISCLOSURE — ' : i === 2 ? 'NON-CIRCUMVENTION — ' : i === 3 ? 'PROTECTION OF INTRODUCTIONS — ' : i === 4 ? 'GOVERNING LAW — ' : 'REMEDIES — '}</strong></> : null}{term.text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Notes ── */}
      {doc.notes && (
        <div style={{ marginBottom: '20px', background: '#fafaf8', border: '1px solid #e5e0d5', padding: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C', marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>NOTES</div>
          <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.7 }}>{doc.notes}</p>
        </div>
      )}

      {/* ── Signature Blocks ── */}
      <div style={{ marginTop: '36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '12px' }}>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
              {isNCNDA ? 'First Party / Authorised Signatory' : 'Buyer / Authorised Signatory'}
            </div>
            <div style={{ fontSize: '22px', fontStyle: 'italic', color: '#C9A84C', minHeight: '32px', fontFamily: "'Times New Roman', serif" }}>
              {f.party1_signatory || f.buyer_name || ''}
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
              Name: <strong>{f.party1_signatory || f.buyer_name || '___________________'}</strong>
            </div>
            {isNCNDA && <div style={{ fontSize: '10px', color: '#555' }}>Company: <strong>{f.party1_company || '___________________'}</strong></div>}
            <div style={{ fontSize: '10px', color: '#555' }}>Date: {fmtDate(f.date || '')}</div>
          </div>
        </div>
        <div>
          <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '12px' }}>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', marginBottom: '8px' }}>
              {isNCNDA ? 'Second Party / Authorised Signatory' : 'Seller / Authorised Signatory'}
            </div>
            <div style={{ fontSize: '22px', fontStyle: 'italic', color: '#C9A84C', minHeight: '32px', fontFamily: "'Times New Roman', serif" }}>
              {f.party2_signatory || f.seller_name || ''}
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
              Name: <strong>{f.party2_signatory || f.seller_name || '___________________'}</strong>
            </div>
            {isNCNDA && <div style={{ fontSize: '10px', color: '#555' }}>Company: <strong>{f.party2_company || '___________________'}</strong></div>}
            <div style={{ fontSize: '10px', color: '#555' }}>Date: ___________________</div>
          </div>
        </div>
      </div>

      {/* ── CEO Approval Stamp ── */}
      {doc.status === 'Approved' && doc.ceoSignature && (
        <div style={{ marginTop: '28px', border: '2px solid #22c55e', background: '#f0fdf4', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#16a34a', marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
            ✓ CEO APPROVED & E-SIGNED
          </div>
          <div style={{ fontSize: '24px', fontStyle: 'italic', color: '#C9A84C', fontFamily: "'Times New Roman', serif" }}>{doc.ceoSignature}</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>Approved on {doc.approvedAt}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: '36px', paddingTop: '12px', borderTop: '1px solid #e5e0d5', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', color: '#bbb', fontFamily: 'Arial, sans-serif' }}>
          © Cove Estates {new Date().getFullYear()} · Confidential Document · {refNo} · This document is legally binding upon execution by all parties.
        </p>
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
    const refNo = `LX-DOC-${doc.id.toString().padStart(4, '0')}`;
    const f = doc.fields;
    const isNCNDA = doc.templateId === 'ncnda';
    const isMOU = doc.templateId === 'mou';
    win.document.write(`<!DOCTYPE html><html><head><title>${doc.title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Times New Roman', Georgia, serif; color: #1a1a1a; background: #fff; }
      .page { max-width: 800px; margin: 0 auto; padding: 60px 60px 80px; }
      .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #C9A84C; padding-bottom: 20px; margin-bottom: 24px; }
      .logo { font-size: 26px; font-weight: 900; color: #C9A84C; letter-spacing: 4px; font-family: Arial, sans-serif; }
      .doc-title { text-align: center; font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px; }
      .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #C9A84C; border-bottom: 1px solid #e5e0d5; padding-bottom: 4px; margin: 20px 0 12px; font-family: Arial, sans-serif; }
      p { font-size: 11px; line-height: 1.8; margin-bottom: 12px; color: #333; }
      table { width: 100%; border-collapse: collapse; }
      td { font-size: 11px; padding: 6px 0; border-bottom: 1px solid #f0ece4; }
      td:first-child { color: #666; width: 45%; }
      td:last-child { font-weight: 600; }
      .terms-list { list-style: none; }
      .terms-list li { display: flex; gap: 10px; margin-bottom: 10px; font-size: 11px; line-height: 1.8; color: #333; }
      .term-num { color: #C9A84C; font-weight: bold; flex-shrink: 0; min-width: 20px; }
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; }
      .sig-box { border-top: 2px solid #1a1a1a; padding-top: 12px; }
      .sig-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; font-family: Arial, sans-serif; margin-bottom: 8px; }
      .sig-name { font-size: 22px; font-style: italic; color: #C9A84C; min-height: 32px; }
      .sig-detail { font-size: 10px; color: #555; margin-top: 2px; }
      .approved { border: 2px solid #22c55e; background: #f0fdf4; padding: 16px; text-align: center; margin-top: 28px; }
      .footer { text-align: center; margin-top: 36px; padding-top: 12px; border-top: 1px solid #e5e0d5; font-size: 9px; color: #bbb; font-family: Arial, sans-serif; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body><div class="page">
    <div class="letterhead">
      <div>
        <div class="logo">COVE ESTATES</div>
        <div style="font-size:9px;color:#888;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;margin-top:4px">Luxury Real Estate · Dubai, UAE</div>
        <div style="font-size:9px;color:#aaa;font-family:Arial,sans-serif">License: ${f.party1_license || '1432541'} · ORN: ${f.party1_orn || '46855'}</div>
        <div style="font-size:9px;color:#aaa;font-family:Arial,sans-serif">${f.party1_address || '802, Moosa Tower, Dubai, UAE'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;font-weight:bold;color:#333;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">${doc.category}</div>
        <div style="font-size:9px;color:#888;font-family:Arial,sans-serif;margin-top:4px">Reference No: <strong>${refNo}</strong></div>
        <div style="font-size:9px;color:#888;font-family:Arial,sans-serif">Date: ${fmtDate(f.date || '')}</div>
      </div>
    </div>
    <div class="doc-title">${doc.templateName.toUpperCase()}<div style="width:60px;height:2px;background:#C9A84C;margin:8px auto 0"></div></div>
    <p>This Agreement is made on <strong>${fmtDate(f.date || '')}</strong> (the "Effective Date").</p>
    ${(isNCNDA || isMOU) ? `<div class="section-title">BY AND BETWEEN</div>
    ${isNCNDA ? `<p><strong>${f.party1_company || 'Cove Estates LLC'}</strong>, a company incorporated in Dubai, UAE with license <strong>${f.party1_license || '1432541'}</strong>, ORN no <strong>${f.party1_orn || '46855'}</strong> and office at <strong>${f.party1_address || '802, Moosa Tower, Dubai, UAE'}</strong> ("<strong>${f.party1_initials || 'CE'}</strong>"), representing the <strong>Buyer</strong>. (First Party)</p>
    <p style="text-align:center;font-style:italic;color:#888">— and —</p>
    <p><strong>${f.party2_company || '[COMPANY]'}</strong>, a company incorporated in Dubai, UAE with Trade license <strong>${f.party2_license || '[LICENSE]'}</strong>, ORN <strong>${f.party2_orn || '[ORN]'}</strong> and office at <strong>${f.party2_address || '[ADDRESS]'}</strong>, Dubai, UAE ("<strong>${f.party2_initials || '[INITIALS]'}</strong>"), representing <strong>Seller</strong>. (Second Party)</p>` :
    `<p><strong>Buyer:</strong> ${f.buyer_name || '___________'}${f.buyer_passport ? ` (Passport/ID: ${f.buyer_passport})` : ''}${f.buyer_nationality ? ` — ${f.buyer_nationality}` : ''}</p>
    <p style="text-align:center;font-style:italic;color:#888">— and —</p>
    <p><strong>Seller:</strong> ${f.seller_name || '___________'}${f.seller_passport ? ` (Passport/ID: ${f.seller_passport})` : ''}</p>`}` : ''}
    ${isNCNDA ? `<div class="section-title">BACKGROUND</div>
    <ul style="list-style:none;padding:0">
      ${[`The Parties acknowledge that they wish to share information relating to ${f.property_description || 'Plots (listed in appendix "Property").'}.`,
        `${f.party1_company || 'Cove Estates'} is representing the Buyer and ${f.party2_initials || 'the Second Party'} is representing the Seller.`,
        'Both Parties agree to disclose and receive information pertaining to the parties they respectively represent.',
        'Both Parties agree to be retained by their respective clients in terms of fees and agree not to circumvent.']
        .map(item => `<li style="font-size:11px;line-height:1.8;margin-bottom:6px;color:#333;padding-left:16px;position:relative"><span style="position:absolute;left:0;color:#C9A84C;font-weight:bold">•</span>${item}</li>`).join('')}
    </ul>` : ''}
    ${!isNCNDA && (f.property_ref || f.property_address) ? `<div class="section-title">PROPERTY DETAILS</div>
    <table><tbody>
      ${[['Property Reference', f.property_ref], ['Property Address', f.property_address], ['Property Type', f.property_type]].filter(([,v]) => v).map(([l,v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}
    </tbody></table>` : ''}
    ${(f.agreed_price || f.sale_price || f.offer_price) ? `<div class="section-title">FINANCIAL TERMS</div>
    <table><tbody>
      ${[['Agreed Sale Price', fmtCurrency(f.agreed_price || f.sale_price || f.offer_price || '')], ['Deposit Amount', f.deposit_amount ? fmtCurrency(f.deposit_amount) : ''], ['Payment Method', f.payment_method], ['Completion Date', f.completion_date ? fmtDate(f.completion_date) : '']].filter(([,v]) => v).map(([l,v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}
    </tbody></table>` : ''}
    <div class="section-title">${isNCNDA ? 'CLAUSES' : 'TERMS & CONDITIONS'}</div>
    <ol class="terms-list">
      ${doc.terms.map((t, i) => `<li><span class="term-num">${i + 1}.</span><span>${t.text}</span></li>`).join('')}
    </ol>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-label">${isNCNDA ? 'First Party / Authorised Signatory' : 'Buyer / Authorised Signatory'}</div>
        <div class="sig-name">${f.party1_signatory || f.buyer_name || ''}</div>
        <div class="sig-detail">Name: <strong>${f.party1_signatory || f.buyer_name || '___________________'}</strong></div>
        ${isNCNDA ? `<div class="sig-detail">Company: <strong>${f.party1_company || '___________________'}</strong></div>` : ''}
        <div class="sig-detail">Date: ${fmtDate(f.date || '')}</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">${isNCNDA ? 'Second Party / Authorised Signatory' : 'Seller / Authorised Signatory'}</div>
        <div class="sig-name">${f.party2_signatory || f.seller_name || ''}</div>
        <div class="sig-detail">Name: <strong>${f.party2_signatory || f.seller_name || '___________________'}</strong></div>
        ${isNCNDA ? `<div class="sig-detail">Company: <strong>${f.party2_company || '___________________'}</strong></div>` : ''}
        <div class="sig-detail">Date: ___________________</div>
      </div>
    </div>
    ${doc.ceoSignature ? `<div class="approved"><div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#16a34a;margin-bottom:6px;font-family:Arial,sans-serif">✓ CEO APPROVED & E-SIGNED</div><div style="font-size:24px;font-style:italic;color:#C9A84C">${doc.ceoSignature}</div><div style="font-size:10px;color:#888;margin-top:4px;font-family:Arial,sans-serif">Approved on ${doc.approvedAt}</div></div>` : ''}
    <div class="footer">© Cove Estates ${new Date().getFullYear()} · Confidential Document · ${refNo} · This document is legally binding upon execution by all parties.</div>
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
  const [terms, setTerms] = useState<TemplateTerm[]>([...template.terms]);
  const [newTerm, setNewTerm] = useState('');

  const addTerm = () => {
    if (!newTerm.trim()) return;
    setTerms([...terms, { id: Date.now(), text: newTerm.trim() }]);
    setNewTerm('');
  };

  const updateTerm = (id: number, text: string) => setTerms(terms.map((t) => t.id === id ? { ...t, text } : t));
  const removeTerm = (id: number) => setTerms(terms.filter((t) => t.id !== id));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white">Edit Terms — {template.shortName}</h2>
            <p className="text-xs text-white/40 mt-0.5">{template.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">&lt;Ico.X /&gt;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {terms.map((term, i) => (
            <div key={term.id} className="flex gap-3 items-start">
              <span className="text-primary font-bold text-sm mt-2 flex-shrink-0 w-5">{i + 1}.</span>
              <textarea
                value={term.text}
                onChange={(e) => updateTerm(term.id, e.target.value)}
                rows={3}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
              />
              <button onClick={() => removeTerm(term.id)} className="mt-2 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"><Ico.Trash /></button>
            </div>
          ))}
          <div className="flex gap-3 items-start pt-2 border-t border-white/10">
            <span className="text-white/30 font-bold text-sm mt-2 flex-shrink-0 w-5">{terms.length + 1}.</span>
            <textarea
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              rows={3}
              placeholder="Add a new term..."
              className="flex-1 px-3 py-2 bg-white/5 border border-dashed border-white/20 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
            />
            <button onClick={addTerm} disabled={!newTerm.trim()} className="mt-2 w-8 h-8 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors disabled:opacity-30 flex items-center justify-center flex-shrink-0">&lt;Ico.Plus /&gt;</button>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="flex-1 h-9 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Cancel</button>
          <button onClick={() => onSave(terms)} className="flex-1 h-9 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors font-semibold">Save Terms</button>
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
          <p className="text-white/50 text-sm mt-1">Create, manage, and approve legal documents</p>
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
