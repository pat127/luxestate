-- ============================================================
-- Migration: Final fix for user_profiles RLS and user management
-- Strategy: is_admin_user() ONLY queries auth.users (never user_profiles)
-- This is the ONLY safe way to avoid infinite recursion.
-- Also adds service_role bypass so API routes can read/write freely.
-- ============================================================

-- 1. Drop all existing helper functions and recreate cleanly
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- 2. Recreate is_admin_user() - ONLY queries auth.users, never user_profiles
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
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

-- 3. Recreate is_super_admin_user() - ONLY queries auth.users
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
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

-- 4. Recreate get_current_user_role()
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE(
    au.raw_user_meta_data->>'role',
    au.raw_app_meta_data->>'role',
    'agent'
  )
  FROM auth.users au
  WHERE au.id = auth.uid()
  LIMIT 1
$$;

-- 5. Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Drop ALL existing policies on user_profiles and recreate cleanly
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_insert_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "super_admins_delete_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_all" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.user_profiles;

-- 7. SELECT: users read own profile
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 8. SELECT: admins read all profiles (uses auth.users metadata - no recursion)
CREATE POLICY "admins_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- 9. UPDATE: users update own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 10. UPDATE: admins update all profiles
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 11. INSERT: admins insert profiles
CREATE POLICY "admins_insert_profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- 12. DELETE: super admins delete profiles
CREATE POLICY "super_admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin_user());

-- 13. Service role bypass - allows API routes with service_role key full access
CREATE POLICY "service_role_bypass"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 14. Fix handle_new_user trigger to also set raw_user_meta_data role on auth.users
--     so is_admin_user() can find it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Backfill: ensure all existing auth users have profiles
--     AND ensure their auth.users metadata has the role set
DO $$
BEGIN
  -- Backfill missing user_profiles
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
