'use client';

import React, { useState } from 'react';

// ─── Template definitions ────────────────────────────────────────────────────
interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  fieldCode?: string;
}

interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  requiresApproval: boolean;
}

const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'ncnda',
    name: 'CONFIDENTIALITY, NON-DISCLOSURE & NON-CIRCUMVENTION AGREEMENT',
    category: 'NDA',
    description: 'NCNDA with a broker representing seller and Cove representing buyer',
    requiresApproval: true,
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true, fieldCode: '{{date}}' },
      { key: 'company', label: 'Company Name', type: 'text', required: true, placeholder: 'Enter company name...', fieldCode: '{{Company}}' },
      { key: 'license', label: 'License No', type: 'number', required: true, fieldCode: '{{license}}' },
      { key: 'orn', label: 'ORN', type: 'number', required: true, fieldCode: '{{ORN}}' },
      { key: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Enter address...', fieldCode: '{{Address}}' },
      { key: 'coInitials1', label: 'Co Initials', type: 'text', required: true, placeholder: 'Enter co initials...', fieldCode: '{{initials}}' },
      { key: 'coInitials2', label: 'Co Initials', type: 'text', required: true, placeholder: 'Enter co initials...', fieldCode: '{{Initials}}' },
      { key: 'signatory', label: 'Auth Signatory', type: 'text', required: true, placeholder: 'Enter auth signatory...', fieldCode: '{{Signatory}}' },
    ],
  },
  {
    id: 'mou',
    name: 'Memorandum of Understanding (MOU)',
    category: 'Sales Contract',
    description: 'Standard MOU for property transactions between buyer and seller',
    requiresApproval: true,
    fields: [
      { key: 'buyerName', label: 'Buyer Full Name', type: 'text', required: true, placeholder: 'Enter buyer full name...', fieldCode: '{{buyer_name}}' },
      { key: 'sellerName', label: 'Seller Full Name', type: 'text', required: true, placeholder: 'Enter seller full name...', fieldCode: '{{seller_name}}' },
      { key: 'propertyRef', label: 'Property Reference No.', type: 'text', required: true, placeholder: 'e.g. LX-RES-004', fieldCode: '{{property_ref}}' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true, placeholder: 'Enter property address...', fieldCode: '{{property_address}}' },
      { key: 'agreedPrice', label: 'Agreed Price (AED)', type: 'number', required: true, fieldCode: '{{agreed_price}}' },
      { key: 'depositAmount', label: 'Deposit Amount (AED)', type: 'number', required: true, fieldCode: '{{deposit_amount}}' },
      { key: 'completionDate', label: 'Completion Date', type: 'date', required: true, fieldCode: '{{completion_date}}' },
      { key: 'agentName', label: 'Agent Name', type: 'text', required: false, placeholder: 'Enter agent name...', fieldCode: '{{agent_name}}' },
      { key: 'buyerPassport', label: 'Buyer Passport / Emirates ID', type: 'text', required: true, placeholder: 'Enter passport or ID...', fieldCode: '{{buyer_passport}}' },
      { key: 'sellerPassport', label: 'Seller Passport / Emirates ID', type: 'text', required: true, placeholder: 'Enter passport or ID...', fieldCode: '{{seller_passport}}' },
      { key: 'paymentMethod', label: 'Payment Method', type: 'select', required: true, options: ['Cash', 'Mortgage', 'Installment'], fieldCode: '{{payment_method}}' },
      { key: 'mortgageBank', label: 'Mortgage Bank (if applicable)', type: 'text', required: false, placeholder: 'Enter bank name...', fieldCode: '{{mortgage_bank}}' },
      { key: 'transferDate', label: 'Transfer Date', type: 'date', required: true, fieldCode: '{{transfer_date}}' },
      { key: 'agentCommission', label: 'Agent Commission (%)', type: 'number', required: false, fieldCode: '{{agent_commission}}' },
      { key: 'specialConditions', label: 'Special Conditions', type: 'textarea', required: false, placeholder: 'Enter any special conditions...', fieldCode: '{{special_conditions}}' },
    ],
  },
  {
    id: 'tenancy',
    name: 'Tenancy Contract (Ejari)',
    category: 'Rental Agreement',
    description: 'Standard tenancy contract for rental properties in Dubai, compliant with Ejari requirements',
    requiresApproval: true,
    fields: [
      { key: 'tenantName', label: 'Tenant Full Name', type: 'text', required: true, placeholder: 'Enter tenant name...', fieldCode: '{{tenant_name}}' },
      { key: 'landlordName', label: 'Landlord Full Name', type: 'text', required: true, placeholder: 'Enter landlord name...', fieldCode: '{{landlord_name}}' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true, placeholder: 'Enter property address...', fieldCode: '{{property_address}}' },
      { key: 'annualRent', label: 'Annual Rent (AED)', type: 'number', required: true, fieldCode: '{{annual_rent}}' },
      { key: 'startDate', label: 'Lease Start Date', type: 'date', required: true, fieldCode: '{{start_date}}' },
      { key: 'endDate', label: 'Lease End Date', type: 'date', required: true, fieldCode: '{{end_date}}' },
      { key: 'securityDeposit', label: 'Security Deposit (AED)', type: 'number', required: true, fieldCode: '{{security_deposit}}' },
      { key: 'noOfCheques', label: 'Number of Cheques', type: 'number', required: true, fieldCode: '{{no_of_cheques}}' },
      { key: 'tenantPassport', label: 'Tenant Passport / Emirates ID', type: 'text', required: true, placeholder: 'Enter passport or ID...', fieldCode: '{{tenant_passport}}' },
      { key: 'landlordPassport', label: 'Landlord Passport / Emirates ID', type: 'text', required: true, placeholder: 'Enter passport or ID...', fieldCode: '{{landlord_passport}}' },
      { key: 'ejariNo', label: 'Ejari Registration No.', type: 'text', required: false, placeholder: 'Enter Ejari number...', fieldCode: '{{ejari_no}}' },
      { key: 'municipality', label: 'Municipality', type: 'text', required: true, placeholder: 'e.g. Dubai Municipality', fieldCode: '{{municipality}}' },
      { key: 'propertyType', label: 'Property Type', type: 'select', required: true, options: ['Apartment', 'Villa', 'Townhouse', 'Studio', 'Office', 'Retail'], fieldCode: '{{property_type}}' },
      { key: 'furnished', label: 'Furnished Status', type: 'select', required: true, options: ['Furnished', 'Semi-Furnished', 'Unfurnished'], fieldCode: '{{furnished}}' },
      { key: 'agentName', label: 'Agent Name', type: 'text', required: false, placeholder: 'Enter agent name...', fieldCode: '{{agent_name}}' },
      { key: 'agentLicense', label: 'Agent License No.', type: 'text', required: false, placeholder: 'Enter license number...', fieldCode: '{{agent_license}}' },
      { key: 'specialConditions', label: 'Special Conditions', type: 'textarea', required: false, placeholder: 'Enter any special conditions...', fieldCode: '{{special_conditions}}' },
    ],
  },
];

const CATEGORIES = ['All Categories', 'NDA', 'Sales Contract', 'Rental Agreement'];

type DocStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

interface FilledDocument {
  id: number;
  templateId: string;
  templateName: string;
  category: string;
  title: string;
  fields: Record<string, string>;
  notes: string;
  status: DocStatus;
  createdAt: string;
  ceoSignature?: string;
  approvedAt?: string;
  submittedBy: string;
}

const INITIAL_DOCUMENTS: FilledDocument[] = [
  {
    id: 1,
    templateId: 'ncnda',
    templateName: 'CONFIDENTIALITY, NON-DISCLOSURE & NON-CIRCUMVENTION AGREEMENT',
    category: 'NDA',
    title: 'NCNDA - LuxEstate LLC - Investor Corp - May 2026',
    fields: { date: '2026-05-01', company: 'LuxEstate LLC', license: '12345', orn: '67890', address: 'Dubai, UAE', coInitials1: 'LE', coInitials2: 'IC', signatory: 'Ahmed Al-Rashid' },
    notes: '',
    status: 'Approved',
    createdAt: 'May 1, 2026',
    ceoSignature: 'Ahmed Al-Rashid',
    approvedAt: 'May 2, 2026',
    submittedBy: 'Admin',
  },
  {
    id: 2,
    templateId: 'mou',
    templateName: 'Memorandum of Understanding (MOU)',
    category: 'Sales Contract',
    title: 'MoU - James Harrington - Meridian Villa - Apr 2026',
    fields: { buyerName: 'James Harrington', sellerName: 'LuxEstate LLC', propertyRef: 'LX-RES-004', propertyAddress: 'Meridian Villa, Palm Jumeirah', agreedPrice: '42000000', depositAmount: '4200000', completionDate: '2026-06-30', paymentMethod: 'Cash', transferDate: '2026-06-30', buyerPassport: 'A1234567', sellerPassport: 'B7654321' },
    notes: '',
    status: 'Pending Approval',
    createdAt: 'Apr 28, 2026',
    submittedBy: 'Sarah M.',
  },
  {
    id: 3,
    templateId: 'tenancy',
    templateName: 'Tenancy Contract (Ejari)',
    category: 'Rental Agreement',
    title: 'Tenancy - Sofia Al-Rashid - Atlas Tower - Apr 2026',
    fields: { tenantName: 'Sofia Al-Rashid', landlordName: 'LuxEstate LLC', propertyAddress: 'Atlas Tower, DIFC', annualRent: '120000', startDate: '2026-05-01', endDate: '2027-04-30', securityDeposit: '10000', noOfCheques: '4', tenantPassport: 'C9876543', landlordPassport: 'D1234567', municipality: 'Dubai Municipality', propertyType: 'Apartment', furnished: 'Furnished' },
    notes: 'Renewal of existing contract',
    status: 'Draft',
    createdAt: 'Apr 20, 2026',
    submittedBy: 'Omar H.',
  },
];

const STATUS_STYLES: Record<DocStatus, string> = {
  Draft: 'bg-white/5 text-white/50 border border-white/10',
  'Pending Approval': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconFolder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconFileText = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
  </svg>
);
const IconFilePen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
    <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
    <path d="M8 18h1" />
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />
  </svg>
);
const IconFilter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
  </svg>
);
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);
const IconPen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconPrinter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'documents' | 'approvals'>('templates');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [documents, setDocuments] = useState<FilledDocument[]>(INITIAL_DOCUMENTS);

  // New Template modal
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('NDA');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  // Fill Document modal
  const [fillTemplate, setFillTemplate] = useState<TemplateDefinition | null>(null);
  const [fillTitle, setFillTitle] = useState('');
  const [fillFields, setFillFields] = useState<Record<string, string>>({});
  const [fillNotes, setFillNotes] = useState('');
  const [fillPreview, setFillPreview] = useState(false);

  // View Document modal
  const [viewDoc, setViewDoc] = useState<FilledDocument | null>(null);

  // CEO Approval modal
  const [approvalDoc, setApprovalDoc] = useState<FilledDocument | null>(null);
  const [ceoSig, setCeoSig] = useState('');

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchCat = categoryFilter === 'All Categories' || t.category === categoryFilter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const myDocuments = documents.filter((d) => {
    const matchCat = categoryFilter === 'All Categories' || d.category === categoryFilter;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.templateName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const approvalDocs = documents.filter((d) => d.status === 'Pending Approval');

  // ── Fill Document ─────────────────────────────────────────────────────────
  const openFill = (tpl: TemplateDefinition) => {
    setFillTemplate(tpl);
    const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    setFillTitle(`${tpl.name} - ${today}`);
    const init: Record<string, string> = {};
    tpl.fields.forEach((f) => { init[f.key] = ''; });
    setFillFields(init);
    setFillNotes('');
    setFillPreview(false);
  };

  const closeFill = () => { setFillTemplate(null); setFillPreview(false); };

  const allRequiredFilled = fillTemplate
    ? fillTemplate.fields.filter((f) => f.required).every((f) => fillFields[f.key]?.trim())
    : false;

  const handleSaveDraft = () => {
    if (!fillTemplate) return;
    const doc: FilledDocument = {
      id: Date.now(),
      templateId: fillTemplate.id,
      templateName: fillTemplate.name,
      category: fillTemplate.category,
      title: fillTitle || fillTemplate.name,
      fields: { ...fillFields },
      notes: fillNotes,
      status: 'Draft',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      submittedBy: 'Admin',
    };
    setDocuments([doc, ...documents]);
    closeFill();
    setActiveTab('documents');
  };

  const handleSaveSubmit = () => {
    if (!fillTemplate || !allRequiredFilled) return;
    const doc: FilledDocument = {
      id: Date.now(),
      templateId: fillTemplate.id,
      templateName: fillTemplate.name,
      category: fillTemplate.category,
      title: fillTitle || fillTemplate.name,
      fields: { ...fillFields },
      notes: fillNotes,
      status: 'Pending Approval',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      submittedBy: 'Admin',
    };
    setDocuments([doc, ...documents]);
    closeFill();
    setActiveTab('approvals');
  };

  // ── Approval actions ──────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!approvalDoc || !ceoSig.trim()) return;
    setDocuments(documents.map((d) =>
      d.id === approvalDoc.id
        ? { ...d, status: 'Approved' as DocStatus, ceoSignature: ceoSig, approvedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
        : d
    ));
    setApprovalDoc(null);
    setCeoSig('');
  };

  const handleReject = () => {
    if (!approvalDoc) return;
    setDocuments(documents.map((d) => d.id === approvalDoc.id ? { ...d, status: 'Rejected' as DocStatus } : d));
    setApprovalDoc(null);
    setCeoSig('');
  };

  const handleSendForApproval = (doc: FilledDocument) => {
    setDocuments(documents.map((d) => d.id === doc.id ? { ...d, status: 'Pending Approval' as DocStatus } : d));
    setViewDoc(null);
  };

  const handleDeleteDoc = (id: number) => {
    setDocuments(documents.filter((d) => d.id !== id));
    if (viewDoc?.id === id) setViewDoc(null);
  };

  const handlePrint = (doc: FilledDocument) => {
    const tpl = TEMPLATES.find((t) => t.id === doc.templateId);
    const fieldsHtml = Object.entries(doc.fields).map(([key, val]) => {
      const fieldDef = tpl?.fields.find((f) => f.key === key);
      return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee"><span style="color:#666;font-size:13px">${fieldDef?.label || key}</span><span style="font-weight:600;font-size:13px">${val || '—'}</span></div>`;
    }).join('');
    const printContent = `<!DOCTYPE html><html><head><title>${doc.title}</title><style>body{font-family:Georgia,serif;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #C5A47E;padding-bottom:20px;margin-bottom:30px}.logo{font-size:22px;font-weight:bold;color:#C5A47E;letter-spacing:2px}.title{font-size:20px;font-weight:bold;margin-bottom:5px}.section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#C5A47E;border-bottom:1px solid #e5e0d5;padding-bottom:6px;margin-bottom:12px}.esign{background:#f8f6f0;padding:20px;margin-top:30px;border-left:4px solid #C5A47E}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e0d5;font-size:11px;color:#aaa}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><div class="header"><div class="logo">COVE ESTATES</div><div style="text-align:right"><div style="font-size:12px;color:#888">${doc.createdAt}</div></div></div><div class="title">${doc.title}</div><div style="font-size:13px;color:#888;margin-bottom:24px">${doc.category}</div><div class="section-title">Document Fields</div>${fieldsHtml}${doc.ceoSignature ? `<div class="esign"><div class="section-title">CEO E-Signature</div><p style="font-size:20px;font-style:italic;color:#C5A47E;margin:8px 0">${doc.ceoSignature}</p><p style="font-size:12px;color:#888">Approved on ${doc.approvedAt}</p></div>` : ''}<div class="footer">© Cove Estates ${new Date().getFullYear()} · Confidential Document</div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script></body></html>`;
    if (typeof window !== 'undefined') {
      const pw = window.open('', '_blank');
      if (pw) { pw.document.write(printContent); pw.document.close(); }
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-documents">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Center</h1>
          <p className="text-white/50 text-sm mt-1">Manage document templates and filled documents</p>
        </div>
        <button
          onClick={() => setShowNewTemplateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <IconPlus />
          New Template
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg p-1 bg-[#111111] border border-white/10">
          <button
            onClick={() => setActiveTab('templates')}
            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-all ${
              activeTab === 'templates' ? 'bg-primary text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <IconFolder /> Templates
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-all ${
              activeTab === 'documents' ? 'bg-primary text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <IconFileText /> My Documents
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-all relative ${
              activeTab === 'approvals' ? 'bg-primary text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <IconFilePen /> Approvals
            {approvalDocs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {approvalDocs.length}
              </span>
            )}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <IconSearch />
            </span>
            <input
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 pl-10 bg-white/5 border-white/10 text-white"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex h-9 items-center gap-2 px-3 py-2 text-sm rounded-md border bg-white/5 border-white/10 text-white w-[180px] justify-between"
            >
              <span className="flex items-center gap-2">
                <IconFilter />
                {categoryFilter}
              </span>
              <IconChevronDown />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-1 right-0 w-[180px] bg-[#1a1a1a] border border-white/10 rounded-md shadow-lg z-20">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                      categoryFilter === cat ? 'text-primary' : 'text-white/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Templates Tab ─────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="rounded-xl border bg-[#111111] border-white/10 hover:border-primary/30 transition-colors">
                <div className="p-6 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary"><IconFileText size={20} /></span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm leading-tight">{tpl.name}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs border border-white/20 text-white/60 rounded-md">{tpl.category}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-white/50 text-sm mb-4 line-clamp-2">{tpl.description}</p>
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                    <span>{tpl.fields.length} fields</span>
                    <span>•</span>
                    <span>{tpl.requiresApproval ? 'Requires approval' : 'No approval needed'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openFill(tpl)}
                      className="flex-1 h-8 px-3 text-xs font-medium bg-primary text-black rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Fill Document
                    </button>
                    <button className="h-8 px-3 text-xs border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors">
                      <IconPen />
                    </button>
                    <button className="h-8 px-3 text-xs border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/10 transition-colors">
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-3 py-16 text-center text-white/40 text-sm">No templates found</div>
            )}
          </div>
        )}

        {/* ── My Documents Tab ──────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="mt-2">
            {myDocuments.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white/30"><IconFileText size={28} /></span>
                </div>
                <p className="text-white/50 text-sm">No documents yet. Fill a template to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-[#111111] border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary"><IconFileText size={16} /></span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{doc.category} · {doc.createdAt} · {doc.submittedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_STYLES[doc.status]}`}>
                        {doc.status}
                      </span>
                      <button onClick={() => setViewDoc(doc)} className="p-1.5 text-white/40 hover:text-white transition-colors"><IconEye /></button>
                      {doc.status === 'Draft' && (
                        <button onClick={() => handleSendForApproval(doc)} className="p-1.5 text-white/40 hover:text-amber-400 transition-colors"><IconSend /></button>
                      )}
                      {doc.status === 'Approved' && (
                        <button onClick={() => handlePrint(doc)} className="p-1.5 text-white/40 hover:text-blue-400 transition-colors"><IconPrinter /></button>
                      )}
                      <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><IconTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Approvals Tab ─────────────────────────────────────────────── */}
        {activeTab === 'approvals' && (
          <div className="mt-2">
            {approvalDocs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400"><IconCheck /></span>
                </div>
                <p className="text-white/50 text-sm">No documents pending approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvalDocs.map((doc) => (
                  <div key={doc.id} className="p-5 bg-[#111111] border border-amber-500/20 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            Pending Approval
                          </span>
                          <span className="text-xs text-white/40">{doc.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{doc.title}</p>
                        <p className="text-xs text-white/40 mt-1">Submitted by {doc.submittedBy} · {doc.createdAt}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setViewDoc(doc)}
                          className="h-8 px-3 text-xs border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors flex items-center gap-1.5"
                        >
                          <IconEye /> View
                        </button>
                        <button
                          onClick={() => { setApprovalDoc(doc); setCeoSig(''); }}
                          className="h-8 px-3 text-xs bg-primary text-black rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                        >
                          <IconCheck /> Review & Sign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fill Document Modal ─────────────────────────────────────────────── */}
      {fillTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary"><IconFileText size={16} /></span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white leading-tight truncate">{fillTemplate.name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">{fillTemplate.description}</p>
                </div>
              </div>
              <button onClick={closeFill} className="text-white/40 hover:text-white transition-colors flex-shrink-0 ml-4">
                <IconX />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Document title */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={fillTitle}
                  onChange={(e) => setFillTitle(e.target.value)}
                  placeholder="Enter a title for this document (e.g., MOU - Client Name - Property)"
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Fields section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <IconFileText size={14} />
                    Fill in the Details ({fillTemplate.fields.length} fields)
                  </h3>
                  <span className="text-xs text-white/40">
                    {fillTemplate.fields.filter((f) => f.required).length} required
                  </span>
                </div>
                <div className="space-y-4">
                  {fillTemplate.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.fieldCode && (
                        <p className="text-[10px] text-white/30 mb-1">
                          Field: <code className="text-primary/70 font-mono">{field.fieldCode}</code>
                        </p>
                      )}
                      {field.type === 'textarea' ? (
                        <textarea
                          value={fillFields[field.key] || ''}
                          onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })}
                          rows={3}
                          placeholder={field.placeholder || ''}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={fillFields[field.key] || ''}
                          onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })}
                          className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={fillFields[field.key] || ''}
                          onChange={(e) => setFillFields({ ...fillFields, [field.key]: e.target.value })}
                          placeholder={field.placeholder || ''}
                          className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <textarea
                  value={fillNotes}
                  onChange={(e) => setFillNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional notes for this document..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={closeFill} className="h-9 px-4 text-sm border border-white/10 text-white/60 rounded-md hover:text-white hover:border-white/20 transition-colors">
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setFillPreview(!fillPreview)}
                  className="h-9 px-4 text-sm border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors flex items-center gap-1.5"
                >
                  <IconEye /> Preview
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="h-9 px-4 text-sm border border-white/10 text-white rounded-md hover:bg-white/5 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSaveSubmit}
                  disabled={!allRequiredFilled}
                  className="h-9 px-4 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <IconSend /> Save & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Document Modal ─────────────────────────────────────────────── */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white">{viewDoc.title}</h2>
                <p className="text-xs text-white/40 mt-0.5">{viewDoc.category} · {viewDoc.createdAt}</p>
              </div>
              <button onClick={() => setViewDoc(null)} className="text-white/40 hover:text-white transition-colors"><IconX /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Status */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_STYLES[viewDoc.status]}`}>
                  {viewDoc.status}
                </span>
                <span className="text-xs text-white/40">Submitted by {viewDoc.submittedBy}</span>
              </div>
              {/* Fields */}
              <div className="space-y-2 mb-5">
                {Object.entries(viewDoc.fields).map(([key, val]) => {
                  const tpl = TEMPLATES.find((t) => t.id === viewDoc.templateId);
                  const fieldDef = tpl?.fields.find((f) => f.key === key);
                  return (
                    <div key={key} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-white/40">{fieldDef?.label || key}</span>
                      <span className="text-xs text-white font-medium">{val || '—'}</span>
                    </div>
                  );
                })}
              </div>
              {/* Notes */}
              {viewDoc.notes && (
                <div className="mb-5 p-3 bg-white/5 rounded-md">
                  <p className="text-xs text-white/40 mb-1">Notes</p>
                  <p className="text-sm text-white">{viewDoc.notes}</p>
                </div>
              )}
              {/* E-Signature */}
              {viewDoc.status === 'Approved' && viewDoc.ceoSignature ? (
                <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-md mb-4">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">CEO E-Signature</p>
                  <p className="text-xl font-serif italic text-primary">{viewDoc.ceoSignature}</p>
                  <p className="text-xs text-white/40 mt-1">Approved on {viewDoc.approvedAt}</p>
                </div>
              ) : (
                <div className="border border-dashed border-white/10 p-4 rounded-md mb-4 text-center">
                  <p className="text-xs text-white/30">Awaiting CEO e-signature</p>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2">
                {viewDoc.status === 'Draft' && (
                  <button
                    onClick={() => handleSendForApproval(viewDoc)}
                    className="flex-1 h-9 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IconSend /> Send for Approval
                  </button>
                )}
                {viewDoc.status === 'Approved' && (
                  <button
                    onClick={() => { handlePrint(viewDoc); setViewDoc(null); }}
                    className="flex-1 h-9 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IconPrinter /> Print / Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CEO Approval & E-Sign Modal ─────────────────────────────────────── */}
      {approvalDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">CEO Approval & E-Signature</h2>
                <p className="text-xs text-white/40 mt-0.5">{approvalDoc.category} — {approvalDoc.title}</p>
              </div>
              <button onClick={() => setApprovalDoc(null)} className="text-white/40 hover:text-white transition-colors"><IconX /></button>
            </div>
            <div className="p-6">
              {/* Document summary */}
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-md mb-5">
                <p className="text-xs font-semibold text-white mb-2">Document Summary</p>
                {Object.entries(approvalDoc.fields).slice(0, 4).map(([key, val]) => {
                  const tpl = TEMPLATES.find((t) => t.id === approvalDoc.templateId);
                  const fieldDef = tpl?.fields.find((f) => f.key === key);
                  return (
                    <div key={key} className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-white/40">{fieldDef?.label || key}</span>
                      <span className="text-white font-medium">{val || '—'}</span>
                    </div>
                  );
                })}
              </div>
              {/* Signature input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  CEO Full Name (E-Signature) *
                </label>
                <input
                  type="text"
                  value={ceoSig}
                  onChange={(e) => setCeoSig(e.target.value)}
                  placeholder="Type full name to sign"
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
                {ceoSig && (
                  <p className="mt-2 text-xl font-serif italic text-primary">{ceoSig}</p>
                )}
                <p className="text-xs text-white/30 mt-1">By typing your name, you are electronically signing this document.</p>
              </div>
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 h-10 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!ceoSig.trim()}
                  className="flex-1 h-10 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Approve & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Template Modal ──────────────────────────────────────────────── */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">New Template</h2>
              <button onClick={() => setShowNewTemplateModal(false)} className="text-white/40 hover:text-white transition-colors"><IconX /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Template Name *</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Sale & Purchase Agreement"
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option>NDA</option>
                  <option>Sales Contract</option>
                  <option>Rental Agreement</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  rows={3}
                  placeholder="Brief description of this template..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNewTemplateModal(false)} className="flex-1 h-9 text-sm border border-white/10 text-white/60 rounded-md hover:text-white transition-colors">Cancel</button>
                <button
                  onClick={() => setShowNewTemplateModal(false)}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 h-9 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
