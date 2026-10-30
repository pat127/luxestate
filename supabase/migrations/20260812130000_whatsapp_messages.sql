-- WhatsApp Messages & Conversation Logs
-- Stores all outbound/inbound WhatsApp messages per contact for CRM follow-up tracking

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead', 'property_owner', 'contact')),
  contact_id UUID NOT NULL,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  twilio_sid TEXT,
  error_message TEXT,
  sent_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  sent_by_name TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_bulk_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message_body TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('leads', 'property_owners', 'mixed')),
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  sent_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  sent_by_name TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact ON public.whatsapp_messages(contact_id, contact_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_bulk_sends_created ON public.whatsapp_bulk_sends(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_whatsapp_messages_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_messages_updated_at ON public.whatsapp_messages;
CREATE TRIGGER trg_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_messages_updated_at();

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_bulk_sends ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can manage whatsapp_messages
DROP POLICY IF EXISTS "auth_manage_whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "auth_manage_whatsapp_messages"
  ON public.whatsapp_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_manage_whatsapp_bulk_sends" ON public.whatsapp_bulk_sends;
CREATE POLICY "auth_manage_whatsapp_bulk_sends"
  ON public.whatsapp_bulk_sends
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
