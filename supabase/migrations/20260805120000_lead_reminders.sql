-- Lead Follow-up Reminder System
-- Creates lead_reminders table and in-app notifications table for follow-up tracking

-- 1. Lead Reminders Table
CREATE TABLE IF NOT EXISTS public.lead_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  lead_name TEXT NOT NULL,
  lead_email TEXT,
  lead_phone TEXT,
  assigned_agent TEXT,
  agent_email TEXT,
  follow_up_date DATE NOT NULL,
  reminder_sent_at TIMESTAMPTZ,
  task_created_at TIMESTAMPTZ,
  last_pushed_at TIMESTAMPTZ,
  push_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending | sent | resolved
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_reminders_lead_id ON public.lead_reminders(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_reminders_follow_up_date ON public.lead_reminders(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_lead_reminders_status ON public.lead_reminders(status);

-- 2. In-App Notifications Table (for follow-up popups in admin)
CREATE TABLE IF NOT EXISTS public.crm_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'follow_up', -- follow_up | task_reminder | general
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  lead_id UUID,
  lead_name TEXT,
  action_url TEXT DEFAULT '/admin/leads',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_notifications_read ON public.crm_notifications(read);
CREATE INDEX IF NOT EXISTS idx_crm_notifications_created_at ON public.crm_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_notifications_lead_id ON public.crm_notifications(lead_id);

-- 3. Enable RLS
ALTER TABLE public.lead_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — authenticated users can read/write (admin CRM)
DROP POLICY IF EXISTS "authenticated_manage_lead_reminders" ON public.lead_reminders;
CREATE POLICY "authenticated_manage_lead_reminders"
ON public.lead_reminders FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_manage_crm_notifications" ON public.crm_notifications;
CREATE POLICY "authenticated_manage_crm_notifications"
ON public.crm_notifications FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Also allow service role (edge functions)
DROP POLICY IF EXISTS "service_role_manage_lead_reminders" ON public.lead_reminders;
CREATE POLICY "service_role_manage_lead_reminders"
ON public.lead_reminders FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_manage_crm_notifications" ON public.crm_notifications;
CREATE POLICY "service_role_manage_crm_notifications"
ON public.crm_notifications FOR ALL TO service_role
USING (true) WITH CHECK (true);
