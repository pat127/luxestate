-- Fix: Allow marketing users to delete property_owners records
-- Root cause: is_superadmin_or_marketing() only checked auth.users metadata,
-- but some users may have their role stored only in user_profiles.role
-- Solution: Also check user_profiles.role as a fallback

-- Drop and recreate the helper function to also check user_profiles
CREATE OR REPLACE FUNCTION public.is_superadmin_or_marketing()
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
      au.raw_user_meta_data->>'role' IN ('super_admin', 'marketing')
      OR au.raw_app_meta_data->>'role' IN ('super_admin', 'marketing')
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('super_admin', 'marketing')
  )
$$;

-- Recreate the main policy to ensure it uses the updated function
DROP POLICY IF EXISTS "superadmin_marketing_manage_property_owners" ON public.property_owners;
CREATE POLICY "superadmin_marketing_manage_property_owners"
ON public.property_owners
FOR ALL
TO authenticated
USING (public.is_superadmin_or_marketing())
WITH CHECK (public.is_superadmin_or_marketing());

-- Recreate the assigned_users view policy to use the updated function
DROP POLICY IF EXISTS "assigned_users_view_property_owners" ON public.property_owners;
CREATE POLICY "assigned_users_view_property_owners"
ON public.property_owners
FOR SELECT
TO authenticated
USING (
  assigned_to_id = auth.uid()
  OR public.is_superadmin_or_marketing()
);
