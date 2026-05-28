-- Add form_type column to leads table to distinguish inquiry sources
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS form_type TEXT DEFAULT 'contact';

-- Add index for filtering by form_type
CREATE INDEX IF NOT EXISTS idx_leads_form_type ON public.leads(form_type);

-- Update existing leads that have source 'Website' to have a default form_type
UPDATE public.leads
SET form_type = 'contact'
WHERE form_type IS NULL;
