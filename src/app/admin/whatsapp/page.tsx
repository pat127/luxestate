'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';

interface Recipient {
  id: string;
  name: string;
  phone: string;
  type: 'lead' | 'property_owner';
  project?: string;
  status?: string;
}

interface BulkSend {
  id: string;
  title: string;
  message_body: string;
  recipient_type: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_by_name: string;
  created_at: string;
  completed_at: string | null;
}

interface WhatsAppMessage {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_type: string;
  direction: string;
  message_body: string;
  status: string;
  sent_by_name: string;
  created_at: string;
}

type Tab = 'compose' | 'history';
type RecipientSource = 'leads' | 'property_owners' | 'both';

export default function WhatsAppPage() {
  const supabase = createClient();
  const { currentUser, isRole } = useRole();

  const [tab, setTab] = useState<Tab>('compose');
  const [recipientSource, setRecipientSource] = useState<RecipientSource>('leads');
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchRecipient, setSearchRecipient] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [message, setMessage] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sentCount: number; failedCount: number } | null>(null);
  const [sendError, setSendError] = useState('');
  const [bulkHistory, setBulkHistory] = useState<BulkSend[]>([]);
  const [recentMessages, setRecentMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);

  const canAccess = isRole('super_admin', 'admin', 'marketing');

  const fetchRecipients = useCallback(async () => {
    setLoadingRecipients(true);
    setSelectedIds(new Set());
    const list: Recipient[] = [];

    if (recipientSource === 'leads' || recipientSource === 'both') {
      const { data } = await supabase
        .from('leads')
        .select('id, name, phone, project, status')
        .not('phone', 'is', null)
        .neq('phone', '')
        .order('name');
      if (data) {
        data.forEach((l) => list.push({ id: l.id, name: l.name, phone: l.phone, type: 'lead', project: l.project, status: l.status }));
      }
    }

    if (recipientSource === 'property_owners' || recipientSource === 'both') {
      const { data } = await supabase
        .from('property_owners')
        .select('id, name, mobile, project')
        .not('mobile', 'is', null)
        .neq('mobile', '')
        .order('name');
      if (data) {
        data.forEach((o) => list.push({ id: o.id, name: o.name, phone: o.mobile, type: 'property_owner', project: o.project }));
      }
    }

    setAllRecipients(list);
    // Extract unique projects
    const uniqueProjects = Array.from(new Set(list.map((r) => r.project).filter(Boolean))) as string[];
    setProjects(uniqueProjects);
    setLoadingRecipients(false);
  }, [recipientSource, supabase]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  useEffect(() => {
    let filtered = allRecipients;
    if (searchRecipient) {
      const q = searchRecipient.toLowerCase();
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(q) || r.phone.includes(q));
    }
    if (filterProject !== 'All') {
      filtered = filtered.filter((r) => r.project === filterProject);
    }
    setFilteredRecipients(filtered);
  }, [allRecipients, searchRecipient, filterProject]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data: bulk } = await supabase
      .from('whatsapp_bulk_sends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (bulk) setBulkHistory(bulk);

    const { data: msgs } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (msgs) setRecentMessages(msgs);
    setLoadingHistory(false);
  }, [supabase]);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab, fetchHistory]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map((r) => r.id)));
    }
  };

  const handleSend = async () => {
    if (!message.trim()) { setSendError('Please enter a message.'); return; }
    if (selectedIds.size === 0) { setSendError('Please select at least one recipient.'); return; }
    setSendError('');
    setSendResult(null);
    setSending(true);

    const recipients = allRecipients.filter((r) => selectedIds.has(r.id));

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          message: message.trim(),
          bulkSendTitle: bulkTitle || `Bulk send ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSendResult({ sentCount: data.sentCount, failedCount: data.failedCount });
      setMessage('');
      setBulkTitle('');
      setSelectedIds(new Set());
    } catch (err: any) {
      setSendError(err.message || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'completed' || s === 'sent' || s === 'delivered' || s === 'read') return 'text-emerald-400 bg-emerald-400/10';
    if (s === 'failed') return 'text-red-400 bg-red-400/10';
    if (s === 'in_progress') return 'text-blue-400 bg-blue-400/10';
    return 'text-yellow-400 bg-yellow-400/10';
  };

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Access restricted to Admin, Marketing, and Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">WhatsApp Messaging</h1>
            <p className="text-xs text-muted-foreground">Send bulk messages to Leads & Property Owners</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['compose', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'compose' ? 'Compose & Send' : 'Send History'}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recipient Selection */}
          <div className="space-y-4">
            <div className="bg-card border border-border p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Select Recipients</h2>

              {/* Source filter */}
              <div className="flex gap-2 flex-wrap">
                {(['leads', 'property_owners', 'both'] as RecipientSource[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setRecipientSource(s)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      recipientSource === s
                        ? 'bg-primary/10 border-primary/30 text-primary' :'border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                    }`}
                  >
                    {s === 'leads' ? 'Leads' : s === 'property_owners' ? 'Property Owners' : 'Both'}
                  </button>
                ))}
              </div>

              {/* Search & filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={searchRecipient}
                    onChange={(e) => setSearchRecipient(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                {projects.length > 0 && (
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="px-2 py-2 text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="All">All Projects</option>
                    {projects.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              {/* Select all bar */}
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredRecipients.length > 0 && selectedIds.size === filteredRecipients.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">{filteredRecipients.length} contacts</span>
              </div>

              {/* Recipient list */}
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                {loadingRecipients ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredRecipients.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No contacts found</p>
                ) : (
                  filteredRecipients.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border transition-colors ${
                        selectedIds.has(r.id) ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="w-3.5 h-3.5 accent-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground">{r.phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium ${r.type === 'lead' ? 'text-blue-400 bg-blue-400/10' : 'text-primary bg-primary/10'}`}>
                          {r.type === 'lead' ? 'Lead' : 'Owner'}
                        </span>
                        {r.project && <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{r.project}</span>}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Message Compose */}
          <div className="space-y-4">
            <div className="bg-card border border-border p-4 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Compose Message</h2>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Campaign Title (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Property Launch Outreach"
                  value={bulkTitle}
                  onChange={(e) => setBulkTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={8}
                  placeholder="Type your WhatsApp message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1">{message.length} characters</p>
              </div>

              {/* Summary */}
              <div className="bg-background border border-border p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Recipients selected</span>
                  <span className="font-semibold text-foreground">{selectedIds.size}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Message length</span>
                  <span className="font-semibold text-foreground">{message.length} chars</span>
                </div>
              </div>

              {sendError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <Icon name="ExclamationCircleIcon" size={14} />
                  {sendError}
                </div>
              )}

              {sendResult && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <Icon name="CheckCircleIcon" size={14} />
                  Sent: {sendResult.sentCount} ✓ &nbsp;|&nbsp; Failed: {sendResult.failedCount}
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={sending || selectedIds.size === 0 || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending to {selectedIds.size} contacts...
                  </>
                ) : (
                  <>
                    <Icon name="PaperAirplaneIcon" size={16} />
                    Send WhatsApp to {selectedIds.size} Contact{selectedIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp note */}
            <div className="bg-green-500/5 border border-green-500/20 p-3 flex gap-2">
              <Icon name="InformationCircleIcon" size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Messages are sent via <span className="text-green-400 font-medium">Twilio WhatsApp Business API</span>. 
                Recipients must have WhatsApp installed. Phone numbers should include country code (e.g. +971XXXXXXX).
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-6">
          {/* Bulk Send History */}
          <div className="bg-card border border-border">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Bulk Send History</h2>
              <button onClick={fetchHistory} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Icon name="ArrowPathIcon" size={12} />
                Refresh
              </button>
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bulkHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No bulk sends yet</div>
            ) : (
              <div className="divide-y divide-border">
                {bulkHistory.map((b) => (
                  <div key={b.id} className="px-4 py-3 flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="ChatBubbleLeftRightIcon" size={14} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{b.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium ${statusColor(b.status)}`}>{b.status}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{b.message_body}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span>Total: <span className="text-foreground font-medium">{b.total_recipients}</span></span>
                        <span>Sent: <span className="text-emerald-400 font-medium">{b.sent_count}</span></span>
                        {b.failed_count > 0 && <span>Failed: <span className="text-red-400 font-medium">{b.failed_count}</span></span>}
                        <span>by {b.sent_by_name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Messages Log */}
          <div className="bg-card border border-border">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Message Log</h2>
            </div>
            {recentMessages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No messages logged yet</div>
            ) : (
              <div className="divide-y divide-border">
                {recentMessages.map((m) => (
                  <div key={m.id} className="px-4 py-3 flex items-start gap-3">
                    <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${m.direction === 'inbound' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                      <Icon name={m.direction === 'inbound' ? 'ArrowDownLeftIcon' : 'ArrowUpRightIcon'} size={12} className={m.direction === 'inbound' ? 'text-blue-400' : 'text-green-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-medium text-foreground">{m.contact_name}</p>
                        <span className="text-[10px] text-muted-foreground">{m.contact_phone}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium ${statusColor(m.status)}`}>{m.status}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 ${m.contact_type === 'lead' ? 'text-blue-400 bg-blue-400/10' : 'text-primary bg-primary/10'}`}>
                          {m.contact_type === 'lead' ? 'Lead' : 'Owner'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{m.message_body}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
