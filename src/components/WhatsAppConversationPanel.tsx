'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

interface WhatsAppMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  message_body: string;
  status: string;
  sent_by_name: string;
  created_at: string;
}

interface WhatsAppConversationPanelProps {
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactType: 'lead' | 'property_owner' | 'contact';
}

export default function WhatsAppConversationPanel({
  contactId,
  contactName,
  contactPhone,
  contactType,
}: WhatsAppConversationPanelProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/history?contactId=${contactId}&limit=30`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleQuickSend = async () => {
    if (!quickMessage.trim() || !contactPhone) return;
    setSendError('');
    setSendSuccess(false);
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [{ id: contactId, name: contactName, phone: contactPhone, type: contactType }],
          message: quickMessage.trim(),
          bulkSendTitle: `Quick message to ${contactName}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSendSuccess(true);
      setQuickMessage('');
      setTimeout(() => setSendSuccess(false), 3000);
      fetchMessages();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'sent' || s === 'delivered' || s === 'read') return 'text-emerald-400';
    if (s === 'failed') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="ChatBubbleLeftRightIcon" size={14} className="text-green-400" />
          <span className="text-xs font-semibold text-foreground">WhatsApp History</span>
        </div>
        <button
          onClick={fetchMessages}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="ArrowPathIcon" size={11} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground">No WhatsApp messages yet</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 text-[11px] leading-relaxed ${
                  m.direction === 'outbound' ?'bg-green-600/20 border border-green-600/30 text-foreground' :'bg-card border border-border text-foreground'
                }`}
              >
                <p>{m.message_body}</p>
                <div className={`flex items-center gap-1 mt-1 ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {m.direction === 'outbound' && (
                    <span className={`text-[10px] ${statusColor(m.status)}`}>• {m.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Send */}
      {contactPhone && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Quick WhatsApp message..."
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleQuickSend()}
              className="flex-1 px-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleQuickSend}
              disabled={sending || !quickMessage.trim()}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1"
            >
              {sending ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="PaperAirplaneIcon" size={13} />
              )}
            </button>
          </div>
          {sendError && <p className="text-[11px] text-red-400">{sendError}</p>}
          {sendSuccess && <p className="text-[11px] text-emerald-400">✓ Message sent successfully</p>}
        </div>
      )}
    </div>
  );
}
