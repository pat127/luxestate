-- Add owner and unit details to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS unit_no TEXT,
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_email TEXT,
ADD COLUMN IF NOT EXISTS owner_contact TEXT;
