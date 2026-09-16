-- Fix user_profiles RLS policies to prevent infinite recursion
-- The previous policies queried user_profiles to check admin role,
-- causing infinite recursion. Use auth.users metadata instead.

-- 1. Drop all existing recursive policies
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "super_admin_manage_all_profiles" ON public.user_profiles;

-- 2. Create a safe admin-check function that reads from auth.users metadata
--    (NOT from user_profiles, to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin_from_metadata()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'role' IN ('super_admin', 'admin')
        OR raw_app_meta_data->>'role' IN ('super_admin', 'admin')
      )
  )
$$;

-- 3. Non-recursive RLS policies for user_profiles

-- Users can read and update their own profile
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can read ALL profiles (uses auth metadata, not user_profiles subquery)
DROP POLICY IF EXISTS "admins_read_all_profiles_v2" ON public.user_profiles;
CREATE POLICY "admins_read_all_profiles_v2"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_from_metadata());

-- Admins can insert new profiles (for admin-created users)
DROP POLICY IF EXISTS "admins_insert_profiles" ON public.user_profiles;
CREATE POLICY "admins_insert_profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_from_metadata());

-- Admins can update any profile
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_from_metadata())
WITH CHECK (public.is_admin_from_metadata());

-- Admins can delete profiles
DROP POLICY IF EXISTS "admins_delete_profiles" ON public.user_profiles;
CREATE POLICY "admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_admin_from_metadata());
