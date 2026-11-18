ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
