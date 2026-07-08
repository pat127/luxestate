-- Add campaign field to leads table for linking leads to marketing campaigns
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS campaign TEXT;
