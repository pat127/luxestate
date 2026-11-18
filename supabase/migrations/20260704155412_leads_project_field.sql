-- Add project field to leads table for classifying leads by project enquired
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS project TEXT;
