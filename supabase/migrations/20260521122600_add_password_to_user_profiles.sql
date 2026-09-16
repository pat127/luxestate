-- Add password column to user_profiles for admin reference
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS password TEXT;
