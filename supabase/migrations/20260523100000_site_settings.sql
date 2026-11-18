-- ─── Site Settings Table ──────────────────────────────────────────────────────
-- Key-value table storing CMS configuration as JSONB blobs.
-- Keys: cms_config (pages/branding), property_fields, communities.
-- Admin edits in /admin/settings are persisted here and read by all visitors.

CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- Seed default rows so upserts always succeed
INSERT INTO public.site_settings (key, data) VALUES ('cms_config', '{}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('property_fields', '[]') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('communities', '[]') ON CONFLICT (key) DO NOTHING;

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Anyone can read site_settings') THEN
    CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can update site_settings') THEN
    CREATE POLICY "Authenticated users can update site_settings" ON public.site_settings FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can insert site_settings') THEN
    CREATE POLICY "Authenticated users can insert site_settings" ON public.site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
