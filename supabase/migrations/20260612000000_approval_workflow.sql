-- Approval Workflow Migration
-- Tables: approval_requests, approval_notifications

-- ─── approval_requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL, -- 'property' | 'project'
  item_id UUID NOT NULL,
  item_title TEXT NOT NULL,
  item_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  submitted_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  submitted_by_name TEXT NOT NULL DEFAULT '',
  submitted_by_email TEXT NOT NULL DEFAULT '',
  submitted_by_role TEXT NOT NULL DEFAULT '',
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_by_name TEXT,
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_item ON public.approval_requests(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_submitted_by ON public.approval_requests(submitted_by);

-- ─── approval_notifications ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.approval_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  approval_request_id UUID REFERENCES public.approval_requests(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'review_requested' | 'approved' | 'rejected'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient ON public.approval_notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_request ON public.approval_notifications(approval_request_id);

-- ─── Enable RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_notifications ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get current user role from auth metadata ────────────────
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$$;

-- ─── RLS Policies: approval_requests ─────────────────────────────────────────
DROP POLICY IF EXISTS "approval_requests_select" ON public.approval_requests;
CREATE POLICY "approval_requests_select"
ON public.approval_requests
FOR SELECT
TO authenticated
USING (
  submitted_by = auth.uid()
  OR public.get_current_user_role() IN ('super_admin', 'admin')
);

DROP POLICY IF EXISTS "approval_requests_insert" ON public.approval_requests;
CREATE POLICY "approval_requests_insert"
ON public.approval_requests
FOR INSERT
TO authenticated
WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "approval_requests_update" ON public.approval_requests;
CREATE POLICY "approval_requests_update"
ON public.approval_requests
FOR UPDATE
TO authenticated
USING (
  submitted_by = auth.uid()
  OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  submitted_by = auth.uid()
  OR public.get_current_user_role() = 'super_admin'
);

-- ─── RLS Policies: approval_notifications ────────────────────────────────────
DROP POLICY IF EXISTS "approval_notifications_select" ON public.approval_notifications;
CREATE POLICY "approval_notifications_select"
ON public.approval_notifications
FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "approval_notifications_insert" ON public.approval_notifications;
CREATE POLICY "approval_notifications_insert"
ON public.approval_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "approval_notifications_update" ON public.approval_notifications;
CREATE POLICY "approval_notifications_update"
ON public.approval_notifications
FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());
