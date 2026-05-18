-- ============================================================
-- Migration: Fix infinite recursion in is_admin_user()
-- Root cause: is_admin_user() queries user_profiles, but
-- user_profiles RLS policies call is_admin_user() → infinite loop.
-- Fix: is_admin_user() must ONLY query auth.users (never user_profiles).
-- Also add service-role-safe insert policy for user creation.
-- ============================================================

-- 1. Fix is_admin_user() to ONLY use auth.users metadata (no recursion)
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

-- 2. Fix is_super_admin_user() similarly (no recursion)
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

-- 3. Re-apply all user_profiles RLS policies using the fixed functions

-- SELECT: users read own profile
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SELECT: admins read all profiles (uses fixed is_admin_user - no recursion)
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- UPDATE: users update own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- UPDATE: admins update all profiles
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- INSERT: admins insert profiles
DROP POLICY IF EXISTS "admins_insert_profiles" ON public.user_profiles;
CREATE POLICY "admins_insert_profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- DELETE: super admins delete profiles
DROP POLICY IF EXISTS "super_admins_delete_profiles" ON public.user_profiles;
CREATE POLICY "super_admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin_user());

-- 4. Ensure all existing auth users have user_profiles rows
--    (backfill using auth.users metadata only)
DO $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status, permissions)
  SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'agent'),
    'Active',
    '{}'::jsonb
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
  )
  AND au.email IS NOT NULL
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Backfilled missing user_profiles rows';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Backfill error (non-fatal): %', SQLERRM;
END $$;
