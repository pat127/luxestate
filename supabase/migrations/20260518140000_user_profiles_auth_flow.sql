-- ============================================================
-- Migration: User Profiles Auth Flow
-- Adds status, permissions, phone, last_login_at to user_profiles
-- Adds role-based RLS policies and admin helper functions
-- ============================================================

-- 1. Add missing columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- 3. Helper functions (BEFORE RLS policies)

-- Check if current user is super_admin or admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' IN ('super_admin', 'admin')
      OR au.raw_app_meta_data->>'role' IN ('super_admin', 'admin')
    )
  )
$$;

-- Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' = 'super_admin'
      OR au.raw_app_meta_data->>'role' = 'super_admin'
    )
  )
$$;

-- Get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    au.raw_user_meta_data->>'role',
    'agent'
  )
  FROM auth.users au
  WHERE au.id = auth.uid()
  LIMIT 1
$$;

-- 4. Trigger function to create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    'Active',
    COALESCE((NEW.raw_user_meta_data->>'permissions')::jsonb, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.user_profiles.role),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Users can read their own profile
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can read all profiles
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can update all profiles
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Admins can insert profiles
DROP POLICY IF EXISTS "admins_insert_profiles" ON public.user_profiles;
CREATE POLICY "admins_insert_profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- Super admins can delete profiles
DROP POLICY IF EXISTS "super_admins_delete_profiles" ON public.user_profiles;
CREATE POLICY "super_admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin_user());

-- 7. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Seed demo users into auth.users (trigger creates user_profiles)
DO $$
DECLARE
  ceo_uuid UUID := gen_random_uuid();
  admin_uuid UUID := gen_random_uuid();
  marketing_uuid UUID := gen_random_uuid();
  agent_uuid UUID := gen_random_uuid();
BEGIN
  -- CEO / Super Admin
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (ceo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ceo@luxestate.com', crypt('LuxAdmin2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'CEO Admin', 'role', 'super_admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@luxestate.com', crypt('LuxAdmin2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Admin Manager', 'role', 'admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (marketing_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'marketing@luxestate.com', crypt('LuxAdmin2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Marketing Team', 'role', 'marketing'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (agent_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'agent@luxestate.com', crypt('LuxAdmin2024!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Sarah Mitchell', 'role', 'agent'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed users already exist or error: %', SQLERRM;
END $$;
