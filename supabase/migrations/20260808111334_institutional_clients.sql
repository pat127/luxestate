-- Institutional Clients table (super admin only)
CREATE TABLE IF NOT EXISTS public.institutional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Developer',
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  country TEXT,
  city TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institutional_clients_category ON public.institutional_clients(category);
CREATE INDEX IF NOT EXISTS idx_institutional_clients_status ON public.institutional_clients(status);

ALTER TABLE public.institutional_clients ENABLE ROW LEVEL SECURITY;

-- Only super_admin can access institutional clients
-- We use auth metadata role check to avoid recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
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

DROP POLICY IF EXISTS "super_admin_manage_institutional_clients" ON public.institutional_clients;
CREATE POLICY "super_admin_manage_institutional_clients"
ON public.institutional_clients
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Also allow service role (for server-side operations)
DROP POLICY IF EXISTS "service_role_institutional_clients" ON public.institutional_clients;
CREATE POLICY "service_role_institutional_clients"
ON public.institutional_clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_institutional_clients_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_institutional_clients_updated_at ON public.institutional_clients;
CREATE TRIGGER trg_institutional_clients_updated_at
BEFORE UPDATE ON public.institutional_clients
FOR EACH ROW EXECUTE FUNCTION public.set_institutional_clients_updated_at();
