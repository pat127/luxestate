-- Add missing investment_analysis_url column used by the admin project form and landing pages
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS investment_analysis_url TEXT;

-- Refresh PostgREST schema cache so the new column is recognised immediately
NOTIFY pgrst, 'reload schema';
