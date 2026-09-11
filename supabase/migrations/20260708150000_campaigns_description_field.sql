-- Add description column to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS description TEXT;
