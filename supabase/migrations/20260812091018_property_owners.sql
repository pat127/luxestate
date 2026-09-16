-- Property Owners table (superadmin + marketing access)
CREATE TABLE IF NOT EXISTS public.property_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  project TEXT,
  community TEXT,
  building_cluster TEXT,
  unit_number TEXT,
  unit_type TEXT NOT NULL DEFAULT 'Apartment',
  nationality TEXT,
  notes TEXT,
  assigned_to TEXT,
  assigned_to_id UUID,
  created_by TEXT,
  created_by_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_owners_project ON public.property_owners(project);
CREATE INDEX IF NOT EXISTS idx_property_owners_community ON public.property_owners(community);
CREATE INDEX IF NOT EXISTS idx_property_owners_unit_type ON public.property_owners(unit_type);
CREATE INDEX IF NOT EXISTS idx_property_owners_mobile ON public.property_owners(mobile);

ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;

-- Helper: is current user superadmin or marketing?
CREATE OR REPLACE FUNCTION public.is_superadmin_or_marketing()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' IN ('super_admin', 'marketing')
      OR au.raw_app_meta_data->>'role' IN ('super_admin', 'marketing')
    )
  )
$$;

DROP POLICY IF EXISTS "superadmin_marketing_manage_property_owners" ON public.property_owners;
CREATE POLICY "superadmin_marketing_manage_property_owners"
ON public.property_owners
FOR ALL
TO authenticated
USING (public.is_superadmin_or_marketing())
WITH CHECK (public.is_superadmin_or_marketing());

-- Agents/admins can view records assigned to them
DROP POLICY IF EXISTS "assigned_users_view_property_owners" ON public.property_owners;
CREATE POLICY "assigned_users_view_property_owners"
ON public.property_owners
FOR SELECT
TO authenticated
USING (
  assigned_to_id = auth.uid()
  OR public.is_superadmin_or_marketing()
);

DROP POLICY IF EXISTS "service_role_property_owners" ON public.property_owners;
CREATE POLICY "service_role_property_owners"
ON public.property_owners
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_property_owners_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_property_owners_updated_at ON public.property_owners;
CREATE TRIGGER trg_property_owners_updated_at
BEFORE UPDATE ON public.property_owners
FOR EACH ROW EXECUTE FUNCTION public.set_property_owners_updated_at();
