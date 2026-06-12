'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ApprovalRequest {
  id: string;
  itemType: 'property' | 'project';
  itemId: string;
  itemTitle: string;
  itemRef?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByRole: string;
  reviewedByName?: string;
  comments?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export function useApprovalWorkflow() {
  const supabase = createClient();

  const submitForApproval = useCallback(async (params: {
    itemType: 'property' | 'project';
    itemId: string;
    itemTitle: string;
    itemRef?: string;
    submittedBy: string;
    submittedByName: string;
    submittedByEmail: string;
    submittedByRole: string;
  }) => {
    // Check if there's already a pending request for this item
    const { data: existing } = await supabase
      .from('approval_requests')
      .select('id, status')
      .eq('item_type', params.itemType)
      .eq('item_id', params.itemId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return { success: true, requestId: existing.id, alreadyPending: true };
    }

    // Create approval request
    const { data: request, error } = await supabase
      .from('approval_requests')
      .insert({
        item_type: params.itemType,
        item_id: params.itemId,
        item_title: params.itemTitle,
        item_ref: params.itemRef || null,
        status: 'pending',
        submitted_by: params.submittedBy,
        submitted_by_name: params.submittedByName,
        submitted_by_email: params.submittedByEmail,
        submitted_by_role: params.submittedByRole,
      })
      .select('id')
      .single();

    if (error || !request) {
      return { success: false, error: error?.message || 'Failed to submit for approval' };
    }

    // Find CEO/super_admin users to notify
    const { data: ceoUsers } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('role', 'super_admin')
      .eq('status', 'Active');

    if (ceoUsers && ceoUsers.length > 0) {
      // Create in-app notifications for all super_admins
      const notifications = ceoUsers.map((ceo: any) => ({
        recipient_id: ceo.id,
        approval_request_id: request.id,
        type: 'review_requested',
        title: `Approval Required: ${params.itemType === 'project' ? 'Project' : 'Property'}`,
        message: `${params.submittedByName} submitted "${params.itemTitle}" for approval`,
      }));

      await supabase.from('approval_notifications').insert(notifications);

      // Send email notifications to CEO(s)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';
      for (const ceo of ceoUsers) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-approval-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              type: 'review_requested',
              to: ceo.email,
              recipient_name: ceo.full_name || 'CEO',
              item_type: params.itemType,
              item_title: params.itemTitle,
              item_ref: params.itemRef,
              submitted_by_name: params.submittedByName,
              submitted_by_role: params.submittedByRole,
              admin_url: `${siteUrl}/admin/approvals`,
            }),
          });
        } catch {
          // Email failure is non-blocking
        }
      }
    }

    return { success: true, requestId: request.id };
  }, [supabase]);

  const getApprovalStatus = useCallback(async (itemType: 'property' | 'project', itemId: string) => {
    const { data } = await supabase
      .from('approval_requests')
      .select('id, status, comments, reviewed_by_name, reviewed_at, submitted_at')
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  }, [supabase]);

  const approveRequest = useCallback(async (requestId: string, reviewerId: string, reviewerName: string) => {
    const { data: request, error: fetchError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Request not found' };
    }

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_by_name: reviewerName,
        reviewed_at: new Date().toISOString(),
        comments: null,
      })
      .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    // Notify the submitter
    await supabase.from('approval_notifications').insert({
      recipient_id: request.submitted_by,
      approval_request_id: requestId,
      type: 'approved',
      title: `${request.item_type === 'project' ? 'Project' : 'Property'} Approved`,
      message: `"${request.item_title}" has been approved. You can now publish it.`,
    });

    // Send email to submitter
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-approval-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'approved',
          to: request.submitted_by_email,
          recipient_name: request.submitted_by_name,
          item_type: request.item_type,
          item_title: request.item_title,
          item_ref: request.item_ref,
          admin_url: `${siteUrl}/admin/approvals`,
        }),
      });
    } catch {
      // Non-blocking
    }

    return { success: true };
  }, [supabase]);

  const rejectRequest = useCallback(async (requestId: string, reviewerId: string, reviewerName: string, comments: string) => {
    const { data: request, error: fetchError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Request not found' };
    }

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_by_name: reviewerName,
        reviewed_at: new Date().toISOString(),
        comments,
      })
      .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    // Notify the submitter
    await supabase.from('approval_notifications').insert({
      recipient_id: request.submitted_by,
      approval_request_id: requestId,
      type: 'rejected',
      title: `Changes Requested: ${request.item_type === 'project' ? 'Project' : 'Property'}`,
      message: `"${request.item_title}" requires changes. Comments: ${comments}`,
    });

    // Send email to submitter
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-approval-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'rejected',
          to: request.submitted_by_email,
          recipient_name: request.submitted_by_name,
          item_type: request.item_type,
          item_title: request.item_title,
          item_ref: request.item_ref,
          comments,
          admin_url: `${siteUrl}/admin/approvals`,
        }),
      });
    } catch {
      // Non-blocking
    }

    return { success: true };
  }, [supabase]);

  const getUnreadNotificationCount = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from('approval_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    return count || 0;
  }, [supabase]);

  const getNotifications = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('approval_notifications')
      .select('*, approval_requests(item_type, item_id)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  }, [supabase]);

  const markNotificationsRead = useCallback(async (userId: string) => {
    await supabase
      .from('approval_notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);
  }, [supabase]);

  return {
    submitForApproval,
    getApprovalStatus,
    approveRequest,
    rejectRequest,
    getUnreadNotificationCount,
    getNotifications,
    markNotificationsRead,
  };
}
