'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { useApprovalWorkflow } from '@/hooks/useApprovalWorkflow';

interface ApprovalItem {
  id: string;
  itemType: 'property' | 'project';
  itemId: string;
  itemTitle: string;
  itemRef?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedByName: string;
  submittedByEmail: string;
  submittedByRole: string;
  reviewedByName?: string;
  comments?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const statusColors: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  rejected: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Changes Requested',
};

export default function ApprovalsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { currentUser, isRole } = useRole();
  const { approveRequest, rejectRequest } = useApprovalWorkflow();

  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComments, setRejectComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isCeo = isRole('super_admin');

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from('approval_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (filterStatus !== 'all') {
      query.eq('status', filterStatus);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data.map((r: any) => ({
        id: r.id,
        itemType: r.item_type,
        itemId: r.item_id,
        itemTitle: r.item_title,
        itemRef: r.item_ref,
        status: r.status,
        submittedByName: r.submitted_by_name,
        submittedByEmail: r.submitted_by_email,
        submittedByRole: r.submitted_by_role,
        reviewedByName: r.reviewed_by_name,
        comments: r.comments,
        submittedAt: r.submitted_at,
        reviewedAt: r.reviewed_at,
      })));
    }
    setLoading(false);
  }, [supabase, filterStatus]);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const handleApprove = async (item: ApprovalItem) => {
    setActionLoading(true);
    setActionError(null);
    const result = await approveRequest(item.id, currentUser.id, currentUser.name);
    if (result.success) {
      setSuccessMsg(`"${item.itemTitle}" has been approved. The lister can now publish it.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadApprovals();
    } else {
      setActionError(result.error || 'Failed to approve');
    }
    setActionLoading(false);
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem || !rejectComments.trim()) return;
    setActionLoading(true);
    setActionError(null);
    const result = await rejectRequest(selectedItem.id, currentUser.id, currentUser.name, rejectComments.trim());
    if (result.success) {
      setShowRejectModal(false);
      setRejectComments('');
      setSelectedItem(null);
      setSuccessMsg(`Changes requested for "${selectedItem.itemTitle}". The lister has been notified.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadApprovals();
    } else {
      setActionError(result.error || 'Failed to request changes');
    }
    setActionLoading(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'CEO / Super Admin',
      admin: 'Admin',
      marketing: 'Marketing',
      agent: 'Agent',
    };
    return map[role] || role;
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approval Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isCeo ? 'Review and approve property & project listings' : 'Track your submitted listings'}
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30">
            <Icon name="ClockIcon" size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{pendingCount} Pending</span>
          </div>
        )}
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30">
          <Icon name="CheckCircleIcon" size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">{successMsg}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : s === 'approved' ? 'Approved' : 'Changes Requested'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-border">
          <Icon name="CheckBadgeIcon" size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            {filterStatus === 'pending' ? 'No pending approvals.' : 'No requests found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${item.itemType === 'project' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 'text-primary bg-primary/10 border-primary/30'}`}>
                      {item.itemType === 'project' ? 'Project' : 'Property'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground truncate">{item.itemTitle}</h3>
                  {item.itemRef && (
                    <p className="text-xs text-primary mt-0.5">{item.itemRef}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Icon name="UserIcon" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{item.submittedByName}</span>
                        {' · '}{roleLabel(item.submittedByRole)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon name="ClockIcon" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(item.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Comments (for rejected items) */}
                  {item.status === 'rejected' && item.comments && (
                    <div className="mt-3 px-3 py-2.5 bg-orange-400/5 border border-orange-400/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1">CEO Comments</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.comments}</p>
                    </div>
                  )}

                  {/* Approved by */}
                  {item.status === 'approved' && item.reviewedByName && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Icon name="CheckCircleIcon" size={12} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400">Approved by {item.reviewedByName}</span>
                      {item.reviewedAt && <span className="text-xs text-muted-foreground">· {formatDate(item.reviewedAt)}</span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/admin/${item.itemType === 'project' ? 'projects' : 'properties'}/${item.itemId}`)}
                    className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-xs text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                  >
                    View {item.itemType === 'project' ? 'Project' : 'Property'}
                  </button>

                  {isCeo && item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => { setSelectedItem(item); setShowRejectModal(true); setRejectComments(''); setActionError(null); }}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-orange-400/10 border border-orange-400/30 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        Request Changes
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject / Request Changes Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setShowRejectModal(false); setActionError(null); }} />
          <div className="relative w-full max-w-md bg-[#0f1117] border border-[#2a3040] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Request Changes</h2>
              <button onClick={() => { setShowRejectModal(false); setActionError(null); }} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            <div className="mb-4 px-3 py-2.5 bg-[#1a1a1a] border border-[#333]">
              <p className="text-xs text-[#aaa]">{selectedItem.itemType === 'project' ? 'Project' : 'Property'}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{selectedItem.itemTitle}</p>
              {selectedItem.itemRef && <p className="text-xs text-primary mt-0.5">{selectedItem.itemRef}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#aaa] mb-1.5">
                Comments for {selectedItem.submittedByName} <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder:text-[#555] px-3 py-2 focus:outline-none focus:border-[#c9a84c]/60 resize-none"
                rows={4}
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Describe what changes are needed before this can be approved..."
              />
              <p className="text-[10px] text-[#555] mt-1">These comments will be shared with the lister via in-app notification and email.</p>
            </div>

            {actionError && (
              <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {actionError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setActionError(null); }}
                className="flex-1 py-2.5 border border-[#333] text-xs text-[#aaa] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectComments.trim()}
                className="flex-1 py-2.5 bg-orange-500/20 border border-orange-500/40 text-xs text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 font-bold"
              >
                {actionLoading ? 'Sending...' : 'Send Comments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
