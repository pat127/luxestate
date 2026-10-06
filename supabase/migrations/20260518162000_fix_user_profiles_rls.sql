-- ============================================================
-- Migration: Fix user_profiles RLS so admins can read all users
-- Root cause: is_admin_user() only checked auth.users metadata,
-- but user_profiles.role is the authoritative source.
-- Fix: Update is_admin_user() to check user_profiles.role directly
-- and ensure all seeded auth users have user_profiles rows.
-- ============================================================

-- 1. Update is_admin_user() to check user_profiles.role
--    (avoids relying solely on raw_user_meta_data which may be stale)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('super_admin', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' IN ('super_admin', 'admin')
      OR au.raw_app_meta_data->>'role' IN ('super_admin', 'admin')
    )
  )
$$;

-- 2. Update is_super_admin_user() similarly
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' = 'super_admin'
      OR au.raw_app_meta_data->>'role' = 'super_admin'
    )
  )
$$;

-- 3. Ensure user_profiles rows exist for ALL auth users
--    (handles case where trigger did not fire for seeded users)
DO $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status, permissions)
  SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', ''),
    COALESCE(au.raw_user_meta_data->>'role', 'agent'),
    'Active',
    '{}'::jsonb
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
  )
  AND au.email IS NOT NULL;

  RAISE NOTICE 'Backfilled missing user_profiles rows for existing auth users';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Backfill error (non-fatal): %', SQLERRM;
END $$;

-- 4. Re-apply RLS policies to ensure they use the updated functions
--    (policies already exist but re-drop/create to be safe)

-- SELECT: users read own
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SELECT: admins read all
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- UPDATE: users update own
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- UPDATE: admins update all
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- INSERT: admins insert
DROP POLICY IF EXISTS "admins_insert_profiles" ON public.user_profiles;
CREATE POLICY "admins_insert_profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- DELETE: super admins delete
DROP POLICY IF EXISTS "super_admins_delete_profiles" ON public.user_profiles;
CREATE POLICY "super_admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin_user());
