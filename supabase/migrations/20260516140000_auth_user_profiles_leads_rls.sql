-- ============================================================
-- Auth: user_profiles table + role-based RLS for leads
-- ============================================================

-- 1. user_profiles table (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'agent',
  agent_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id    ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role  ON public.user_profiles(role);

-- 2. Trigger: auto-create user_profiles row on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, agent_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    COALESCE(NEW.raw_user_meta_data->>'agent_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow admins/super_admins to read all profiles (for role checks)
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
        au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'marketing')
        OR au.raw_app_meta_data->>'role' IN ('super_admin', 'admin', 'marketing')
      )
  );
$$;

DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_read_all_profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user() OR id = auth.uid());

-- 4. RLS on leads: admins see all, agents see only their assigned leads
--    leads.assigned_agent is a TEXT name; we match against user_profiles.agent_name

CREATE OR REPLACE FUNCTION public.is_agent_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
      AND COALESCE(au.raw_user_meta_data->>'role', 'agent') = 'agent'
      AND COALESCE(au.raw_app_meta_data->>'role', '') != 'super_admin'
      AND COALESCE(au.raw_app_meta_data->>'role', '') != 'admin'
      AND COALESCE(au.raw_app_meta_data->>'role', '') != 'marketing'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_agent_name()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT agent_name FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop existing leads policies and replace with role-aware ones
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_open_access" ON public.leads;
DROP POLICY IF EXISTS "authenticated_full_access_leads" ON public.leads;
DROP POLICY IF EXISTS "agents_view_own_leads" ON public.leads;
DROP POLICY IF EXISTS "admins_full_access_leads" ON public.leads;
DROP POLICY IF EXISTS "agents_update_own_leads" ON public.leads;

-- Admins (super_admin, admin, marketing) have full access
CREATE POLICY "admins_full_access_leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Agents can SELECT only their assigned leads
CREATE POLICY "agents_view_own_leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_admin_user()
    AND assigned_agent = public.get_current_agent_name()
  );

-- Agents can UPDATE only their assigned leads
CREATE POLICY "agents_update_own_leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    NOT public.is_admin_user()
    AND assigned_agent = public.get_current_agent_name()
  )
  WITH CHECK (
    NOT public.is_admin_user()
    AND assigned_agent = public.get_current_agent_name()
  );

-- Public (anon) can still insert leads from the website contact form
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
CREATE POLICY "anon_insert_leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Demo users (super_admin + one agent)
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  agent_uuid UUID := gen_random_uuid();
BEGIN
  -- Super admin
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@coveestates.com', crypt('Admin@2024!', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'CEO Admin', 'role', 'super_admin', 'agent_name', 'CEO Admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Agent (Sarah Mitchell — matches existing leads assigned_agent value)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    agent_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'sarah@coveestates.com', crypt('Agent@2024!', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Sarah Mitchell', 'role', 'agent', 'agent_name', 'Sarah Mitchell'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo user creation skipped: %', SQLERRM;
END $$;
