-- Backfill role into auth.users metadata for existing admin/super_admin users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', up.role)
FROM public.user_profiles up
WHERE auth.users.id = up.id
  AND up.role IN ('super_admin', 'admin');
