'use client';

import React, { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

type ImportType = 'leads' | 'contacts' | 'properties' | 'projects' | 'blogs';
type ImportStep = 'upload' | 'mapping' | 'validation' | 'confirm' | 'done';

interface ImportConfig {
  label: string;
  icon: string;
  fields: ColumnDef[];
  description: string;
}

interface ColumnDef {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'number' | 'email' | 'select';
}

interface MappingState {
  [csvColumn: string]: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

const importConfigs: Record<ImportType, ImportConfig> = {
  leads: {
    label: 'Leads',
    icon: 'UserPlusIcon',
    description: 'Import leads from CSV. Required fields: Name, Email.',
    fields: [
      { key: 'name', label: 'Full Name', required: true, type: 'text' },
      { key: 'email', label: 'Email Address', required: true, type: 'email' },
      { key: 'phone', label: 'Phone Number', required: false, type: 'text' },
      { key: 'source', label: 'Lead Source', required: false, type: 'select' },
      { key: 'budget', label: 'Budget (AED)', required: false, type: 'number' },
      { key: 'interest', label: 'Property Interest', required: false, type: 'text' },
      { key: 'status', label: 'Status', required: false, type: 'select' },
      { key: 'nationality', label: 'Nationality', required: false, type: 'text' },
      { key: 'notes', label: 'Notes', required: false, type: 'text' },
    ],
  },
  contacts: {
    label: 'Contacts',
    icon: 'UsersIcon',
    description: 'Import contacts from CSV. Required fields: Name, Email.',
    fields: [
      { key: 'name', label: 'Full Name', required: true, type: 'text' },
      { key: 'email', label: 'Email Address', required: true, type: 'email' },
      { key: 'phone', label: 'Phone Number', required: false, type: 'text' },
      { key: 'type', label: 'Contact Type', required: false, type: 'select' },
      { key: 'status', label: 'Status', required: false, type: 'select' },
      { key: 'nationality', label: 'Nationality', required: false, type: 'text' },
      { key: 'whatsapp', label: 'WhatsApp', required: false, type: 'text' },
      { key: 'assigned_agent', label: 'Assigned Agent', required: false, type: 'text' },
    ],
  },
  properties: {
    label: 'Properties',
    icon: 'HomeIcon',
    description: 'Import property listings from CSV. Required fields: Name, Price, Type.',
    fields: [
      { key: 'title', label: 'Property Title', required: true, type: 'text' },
      { key: 'price', label: 'Price (AED)', required: true, type: 'number' },
      { key: 'property_type', label: 'Property Type', required: true, type: 'select' },
      { key: 'listing_type', label: 'Listing Type', required: false, type: 'select' },
      { key: 'location', label: 'Location/Area', required: false, type: 'text' },
      { key: 'community', label: 'Community', required: false, type: 'text' },
      { key: 'bedrooms', label: 'Bedrooms', required: false, type: 'number' },
      { key: 'bathrooms', label: 'Bathrooms', required: false, type: 'number' },
      { key: 'area_sqft', label: 'Area (sq ft)', required: false, type: 'number' },
      { key: 'status', label: 'Status', required: false, type: 'select' },
      { key: 'reference_number', label: 'Reference Number', required: false, type: 'text' },
      { key: 'agent', label: 'Agent Name', required: false, type: 'text' },
    ],
  },
  projects: {
    label: 'Projects',
    icon: 'BuildingOffice2Icon',
    description: 'Import off-plan projects from CSV. Required fields: Name, Developer.',
    fields: [
      { key: 'name', label: 'Project Name', required: true, type: 'text' },
      { key: 'developer', label: 'Developer', required: true, type: 'text' },
      { key: 'location', label: 'Location', required: false, type: 'text' },
      { key: 'type', label: 'Project Type', required: false, type: 'select' },
      { key: 'status', label: 'Status', required: false, type: 'select' },
      { key: 'total_units', label: 'Total Units', required: false, type: 'number' },
      { key: 'starting_price', label: 'Starting Price (AED)', required: false, type: 'number' },
      { key: 'completion', label: 'Completion Date', required: false, type: 'text' },
      { key: 'description', label: 'Description', required: false, type: 'text' },
    ],
  },
  blogs: {
    label: 'Blog Posts',
    icon: 'DocumentDuplicateIcon',
    description: 'Import blog posts from CSV. Required fields: Title, Content.',
    fields: [
      { key: 'title', label: 'Post Title', required: true, type: 'text' },
      { key: 'content', label: 'Content', required: true, type: 'text' },
      { key: 'slug', label: 'URL Slug', required: false, type: 'text' },
      { key: 'category', label: 'Category', required: false, type: 'select' },
      { key: 'author', label: 'Author', required: false, type: 'text' },
      { key: 'status', label: 'Status', required: false, type: 'select' },
      { key: 'publish_date', label: 'Publish Date', required: false, type: 'text' },
      { key: 'tags', label: 'Tags', required: false, type: 'text' },
    ],
  },
};

// Sample CSV data for preview
const sampleParsedData: Record<ImportType, { headers: string[]; rows: string[][] }> = {
  leads: {
    headers: ['Full Name', 'Email', 'Phone', 'Source', 'Budget'],
    rows: [
      ['Ahmed Al Mansouri', 'ahmed@example.com', '+971501234567', 'Website', '2500000'],
      ['Sarah Johnson', 'sarah@example.com', '+971502345678', 'Referral', '5000000'],
      ['Mohammed Al Rashid', 'mohammed@example.com', '+971503456789', 'Social Media', '1200000'],
    ],
  },
  contacts: {
    headers: ['Full Name', 'Email', 'Phone', 'Type', 'Status'],
    rows: [
      ['James Carter', 'james@example.com', '+971504567890', 'Buyer', 'Active'],
      ['Priya Sharma', 'priya@example.com', '+971505678901', 'Investor', 'Active'],
    ],
  },
  properties: {
    headers: ['Property Title', 'Price (AED)', 'Property Type', 'Location', 'Bedrooms', 'Area (sq ft)'],
    rows: [
      ['Luxury Apartment Downtown', '2500000', 'Apartment', 'Downtown Dubai', '2', '1200'],
      ['Palm Villa', '15000000', 'Villa', 'Palm Jumeirah', '5', '8000'],
    ],
  },
  projects: {
    headers: ['Project Name', 'Developer', 'Location', 'Type', 'Total Units', 'Starting Price'],
    rows: [
      ['Horizon Tower', 'Emaar', 'Downtown Dubai', 'Off-Plan', '200', '1500000'],
      ['Marina Heights', 'DAMAC', 'Dubai Marina', 'Off-Plan', '150', '900000'],
    ],
  },
  blogs: {
    headers: ['Post Title', 'Category', 'Author', 'Status', 'Publish Date'],
    rows: [
      ['Dubai Real Estate Market 2025', 'Market Insights', 'Sarah Mitchell', 'Published', '2025-01-15'],
      ['Top 10 Areas to Invest in Dubai', 'Investment', 'James Carter', 'Draft', '2025-02-01'],
    ],
  },
};

function generateCSVTemplate(type: ImportType): string {
  const config = importConfigs[type];
  const headers = config.fields.map((f) => f.label);
  const sampleRow = config.fields.map((f) => {
    if (f.type === 'email') return 'example@email.com';
    if (f.type === 'number') return '1000000';
    if (f.type === 'select') return 'Option1';
    return `Sample ${f.label}`;
  });
  return [headers.join(','), sampleRow.join(',')].join('\n');
}

function downloadCSV(content: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportPage() {
  const [activeType, setActiveType] = useState<ImportType>('leads');
  const [step, setStep] = useState<ImportStep>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [mapping, setMapping] = useState<MappingState>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = importConfigs[activeType];
  const parsedData = sampleParsedData[activeType];

  const handleTypeChange = (type: ImportType) => {
    setActiveType(type);
    setStep('upload');
    setFileName(null);
    setMapping({});
    setValidationErrors([]);
    setImportProgress(0);
  };

  const handleFileSelect = (name: string) => {
    setFileName(name);
    // Auto-map columns by matching names
    const autoMap: MappingState = {};
    parsedData.headers.forEach((header) => {
      const match = config.fields.find((f) =>
        f.label.toLowerCase() === header.toLowerCase() ||
        f.key.toLowerCase() === header.toLowerCase().replace(/\s+/g, '_')
      );
      if (match) autoMap[header] = match.key;
    });
    setMapping(autoMap);
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate(activeType);
    downloadCSV(csv, `${activeType}_import_template.csv`);
  };

  const handleValidate = () => {
    // Simulate validation
    const errors: ValidationError[] = [];
    parsedData.rows.forEach((row, rowIdx) => {
      config.fields.filter((f) => f.required).forEach((field) => {
        const csvCol = Object.keys(mapping).find((k) => mapping[k] === field.key);
        if (csvCol) {
          const colIdx = parsedData.headers.indexOf(csvCol);
          if (colIdx >= 0 && (!row[colIdx] || row[colIdx].trim() === '')) {
            errors.push({ row: rowIdx + 1, column: field.label, message: `${field.label} is required` });
          }
        }
      });
    });
    setValidationErrors(errors);
    setStep('validation');
  };

  const handleImport = () => {
    setImporting(true);
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          setStep('done');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setStep('upload');
    setFileName(null);
    setMapping({});
    setValidationErrors([]);
    setImportProgress(0);
  };

  const stepLabels: { id: ImportStep; label: string; num: number }[] = [
    { id: 'upload', label: 'Upload File', num: 1 },
    { id: 'mapping', label: 'Map Columns', num: 2 },
    { id: 'validation', label: 'Validate', num: 3 },
    { id: 'confirm', label: 'Confirm', num: 4 },
    { id: 'done', label: 'Complete', num: 5 },
  ];

  const stepOrder: ImportStep[] = ['upload', 'mapping', 'validation', 'confirm', 'done'];
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Import data in bulk via CSV files with column mapping and validation</p>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(importConfigs) as ImportType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeType === type ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
          >
            <Icon name={importConfigs[type].icon as any} size={13} />
            {importConfigs[type].label}
          </button>
        ))}
      </div>

      {/* Step Progress */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {stepLabels.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.id ? 'bg-primary text-primary-foreground' :
                currentStepIdx > idx ? 'bg-emerald-500 text-white': 'bg-secondary text-muted-foreground'
              }`}>
                {currentStepIdx > idx ? <Icon name="CheckIcon" size={12} /> : s.num}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${step === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {idx < stepLabels.length - 1 && (
              <div className={`flex-1 h-px mx-3 min-w-[20px] transition-colors ${currentStepIdx > idx ? 'bg-emerald-500' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f.name); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/2'}`}
              >
                {fileName ? (
                  <div>
                    <div className="w-14 h-14 bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
                      <Icon name="CheckCircleIcon" size={28} className="text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{parsedData.rows.length} rows detected · Ready to map columns</p>
                    <button onClick={(e) => { e.stopPropagation(); setFileName(null); setMapping({}); }} className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors">
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="ArrowUpTrayIcon" size={28} className="text-primary" />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <span className="px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                      Browse Files
                    </span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f.name); }} />
              </div>

              {fileName && (
                <div className="bg-card border border-border p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Preview (first 3 rows)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {parsedData.headers.map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-bold text-muted-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.rows.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-foreground whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('mapping')}
                  disabled={!fileName}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Map Columns
                  <Icon name="ArrowRightIcon" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="bg-card border border-border p-5">
                <h3 className="text-sm font-bold text-foreground mb-1">Map CSV Columns to Fields</h3>
                <p className="text-xs text-muted-foreground mb-5">Match each column from your CSV file to the corresponding system field. Required fields are marked with *</p>

                <div className="space-y-3">
                  {parsedData.headers.map((csvCol) => (
                    <div key={csvCol} className="grid grid-cols-2 gap-4 items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{csvCol}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">CSV Column</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="ArrowRightIcon" size={14} className="text-muted-foreground flex-shrink-0" />
                        <select
                          value={mapping[csvCol] || ''}
                          onChange={(e) => setMapping((prev) => ({ ...prev, [csvCol]: e.target.value }))}
                          className="flex-1 bg-[#1a1a1a] border border-[#333] text-sm text-white px-3 py-2 focus:outline-none focus:border-primary/50 appearance-none"
                        >
                          <option value="">— Skip this column —</option>
                          {config.fields.map((f) => (
                            <option key={f.key} value={f.key}>
                              {f.label}{f.required ? ' *' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-semibold">Required fields: </span>
                    {config.fields.filter((f) => f.required).map((f) => f.label).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep('upload')} className="flex items-center gap-2 px-5 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="ArrowLeftIcon" size={14} />Back
                </button>
                <button onClick={handleValidate} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                  Next: Validate
                  <Icon name="ArrowRightIcon" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Validation */}
          {step === 'validation' && (
            <div className="space-y-4">
              <div className="bg-card border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  {validationErrors.length === 0 ? (
                    <>
                      <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                        <Icon name="CheckCircleIcon" size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Validation Passed</p>
                        <p className="text-xs text-muted-foreground">{parsedData.rows.length} rows ready to import</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center flex-shrink-0">
                        <Icon name="ExclamationTriangleIcon" size={20} className="text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{validationErrors.length} Validation Issue{validationErrors.length > 1 ? 's' : ''} Found</p>
                        <p className="text-xs text-muted-foreground">Review and fix issues before importing</p>
                      </div>
                    </>
                  )}
                </div>

                {validationErrors.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-yellow-400/5 border border-yellow-400/20">
                        <Icon name="ExclamationCircleIcon" size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">Row {err.row} · {err.column}</p>
                          <p className="text-xs text-muted-foreground">{err.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left px-3 py-2 font-bold text-muted-foreground">#</th>
                        {parsedData.headers.map((h) => (
                          <th key={h} className="text-left px-3 py-2 font-bold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                        <th className="text-left px-3 py-2 font-bold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.map((row, i) => {
                        const rowErrors = validationErrors.filter((e) => e.row === i + 1);
                        return (
                          <tr key={i} className={`border-b border-border last:border-0 ${rowErrors.length > 0 ? 'bg-yellow-400/5' : ''}`}>
                            <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-foreground whitespace-nowrap">{cell}</td>
                            ))}
                            <td className="px-3 py-2">
                              {rowErrors.length > 0 ? (
                                <span className="text-yellow-400 flex items-center gap-1"><Icon name="ExclamationCircleIcon" size={12} />Warning</span>
                              ) : (
                                <span className="text-emerald-400 flex items-center gap-1"><Icon name="CheckCircleIcon" size={12} />Valid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep('mapping')} className="flex items-center gap-2 px-5 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="ArrowLeftIcon" size={14} />Back
                </button>
                <button onClick={() => setStep('confirm')} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                  Next: Confirm Import
                  <Icon name="ArrowRightIcon" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-card border border-border p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Import Summary</h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: 'Total Rows', value: parsedData.rows.length, color: 'text-foreground' },
                    { label: 'Valid Rows', value: parsedData.rows.length - validationErrors.length, color: 'text-emerald-400' },
                    { label: 'With Warnings', value: validationErrors.length, color: validationErrors.length > 0 ? 'text-yellow-400' : 'text-muted-foreground' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center p-4 bg-secondary/30 border border-border">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Column Mapping Summary</p>
                  {Object.entries(mapping).filter(([, v]) => v).map(([csvCol, fieldKey]) => {
                    const field = config.fields.find((f) => f.key === fieldKey);
                    return (
                      <div key={csvCol} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground">{csvCol}</span>
                        <div className="flex items-center gap-2">
                          <Icon name="ArrowRightIcon" size={11} className="text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{field?.label}</span>
                          {field?.required && <span className="text-[10px] text-primary">Required</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground font-medium">Ready to import <span className="text-primary font-bold">{parsedData.rows.length} {config.label}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">This action will add the records to your system. Existing records will not be affected.</p>
                </div>

                {importing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Importing...</span>
                      <span className="text-foreground font-semibold">{importProgress}%</span>
                    </div>
                    <div className="h-2 bg-secondary overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-200" style={{ width: `${importProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep('validation')} disabled={importing} className="flex items-center gap-2 px-5 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                  <Icon name="ArrowLeftIcon" size={14} />Back
                </button>
                <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-60">
                  {importing ? (
                    <><Icon name="ArrowPathIcon" size={14} className="animate-spin" />Importing...</>
                  ) : (
                    <><Icon name="ArrowUpTrayIcon" size={14} />Confirm & Import</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Done */}
          {step === 'done' && (
            <div className="bg-card border border-border p-10 text-center">
              <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
                <Icon name="CheckCircleIcon" size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Import Complete!</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Successfully imported <span className="text-foreground font-semibold">{parsedData.rows.length} {config.label}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-8">All records have been added to your system.</p>
              <div className="flex justify-center gap-3">
                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="ArrowPathIcon" size={14} />Import More
                </button>
                <button onClick={() => handleTypeChange(activeType)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                  <Icon name="CheckIcon" size={14} />Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* CSV Template Download */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">CSV Template</h3>
            <p className="text-xs text-muted-foreground mb-4">{config.description}</p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary/40 text-xs text-primary hover:bg-primary/10 transition-colors font-semibold"
            >
              <Icon name="ArrowDownTrayIcon" size={13} />
              Download {config.label} Template
            </button>
          </div>

          {/* Field Reference */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Field Reference</h3>
            <div className="space-y-1.5">
              {config.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 flex-shrink-0 ${field.required ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                    <span className="text-xs text-foreground font-medium">{field.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${field.required ? 'text-primary' : 'text-muted-foreground'}`}>
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Import Tips</h3>
            <div className="space-y-2.5">
              {[
                'Download the template to ensure correct column format',
                'UTF-8 encoding is recommended for special characters',
                'Maximum 1,000 rows per import',
                'Duplicate emails will be skipped automatically',
                'Use the column mapping step to match your CSV headers',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
